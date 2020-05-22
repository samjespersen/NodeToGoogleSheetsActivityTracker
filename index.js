const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client_secret.json');
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const args = process.argv;
require('dotenv').config();

main(args);

async function main(args) {
    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
    await doc.useServiceAccountAuth(creds)
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    if(args.length < 3) {
        const rows = await sheet.getRows({ offset: sheet.rowCount - 2 });
        const headers = sheet.headerValues;

        let str = '';
        rows.forEach(row => {
            headers.forEach(header => {
                const cell = row[header] ? row[header] : '';
                str += `${header}:\t\t ${cell}\n`;
            })
        })

        console.log(str);
        return;
    }

    console.log(args);

}