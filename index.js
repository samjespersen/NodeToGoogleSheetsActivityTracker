const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client_secret.json');
require('dotenv').config();

const args = process.argv;
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