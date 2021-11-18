import { OAuth2Client } from 'google-auth-library';
import { google, sheets_v4 } from 'googleapis';
import fs from 'fs';
import { zipObject } from 'lodash';

const SHEET_ID = '1MMbsvDfu59OY9YBEAfHhFJ6O8vRTllNFgMrX7RBZuyI';

const OUTPUT = 'out';

const SHEET_GROUPS = {
  items: [
    'Villager Catchphrases',
    'Event Names',
    'HHA Situations',
    'HHA themes',
    'HHA Sets',
    'Fashion Themes',
    'Special NPCs',
    'Item Pattern Names',
    'Item Pattern Types',
    'Item Variant Names',
    'Item Variant Types'
  ],
};

export async function main(auth: OAuth2Client) {
  const sheets = google.sheets({ version: 'v4', auth });

  for (const [key, sheetNames] of Object.entries(SHEET_GROUPS)) {
    console.log(`Loading ${key}`);

    let data = await loadData(sheets, sheetNames);
    writeJSON(`./out/${OUTPUT}.json`, data);
  }
}

export async function loadData(
  sheets: sheets_v4.Sheets,
  sheetNames: string[],
) {
  let data = [];

  for (const sheetName of sheetNames) {

    console.log(`正在處理 ${sheetName}`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: sheetName,
      valueRenderOption: 'FORMULA',
    });

    const [header, ...rows] = response.data.values!;
    for (const row of rows) {
      data.push({ SourceSheet: sheetName, ...zipObject(header, row) });
    }
  }

  return data;
}


function readJSON(filename: string) {
  const rawFileString = fs.readFileSync(filename).toString();
  return JSON.parse(rawFileString);
}

function writeJSON(filename: string, json: any) {
  fs.writeFileSync(filename, JSON.stringify(json, null, 2));
}
