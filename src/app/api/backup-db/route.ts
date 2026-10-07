import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID!, serviceAccountAuth);
    await doc.loadInfo(); 

    // Fetch data from supabase
    const { data: users } = await supabase.from('profiles').select('*');
    const { data: projects } = await supabase.from('projects').select('*');
    const { data: transactions } = await supabase.from('transactions').select('*');
    
    // Helper function to sync a table to a specific sheet
    const syncTable = async (title: string, data: any[]) => {
      if (!data || data.length === 0) return;
      
      let sheet = doc.sheetsByTitle[title];
      const headers = Object.keys(data[0]);
      
      if (!sheet) {
        // Create new sheet if it doesn't exist
        sheet = await doc.addSheet({ headerValues: headers, title });
      } else {
        // Clear existing data and rewrite
        await sheet.clear();
        await sheet.setHeaderRow(headers);
      }
      
      // Prepare rows
      const rows = data.map(item => {
        const row: any = {};
        for (const key of headers) {
          row[key] = typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key];
        }
        return row;
      });
      
      await sheet.addRows(rows);
    };

    await syncTable('Users Backup', users || []);
    await syncTable('Projects Backup', projects || []);
    await syncTable('Transactions Backup', transactions || []);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Backup Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
