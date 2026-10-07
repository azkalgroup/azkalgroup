import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { time, contact, type, amount, status } = await req.json();

    // Pastikan environment variables tersedia
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY || !process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      throw new Error("Kredensial Google Sheets belum dikonfigurasi di .env");
    }

    // Format private key dengan benar (mengubah \\n menjadi \n)
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');

    // Inisialisasi Auth JWT
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    // Koneksi ke Spreadsheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); // loads document properties and worksheets
    
    const sheet = doc.sheetsByIndex[0]; // Ambil sheet pertama
    
    // Tambahkan baris baru
    await sheet.addRow([
      time,
      contact,
      type,
      `Rp ${amount.toLocaleString('id-ID')}`,
      status
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Google Sheets Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
