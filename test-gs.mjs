import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const i = line.indexOf('=');
  if (i > -1) {
    env[line.substring(0, i).trim()] = line.substring(i + 1).replace(/^["']|["']$/g, '').trim();
  }
});

const serviceAccountAuth = new JWT({
  email: env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function run() {
  try {
    const doc = new GoogleSpreadsheet(env.GOOGLE_SHEETS_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); 
    console.log('Doc title:', doc.title);
    
    const sheet = doc.sheetsByIndex[0]; 
    await sheet.addRow([
      new Date().toLocaleString('id-ID'),
      'test@test.com',
      'Test Transaksi',
      'Rp 50.000',
      'Pending'
    ]);
    console.log('Row added!');
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
