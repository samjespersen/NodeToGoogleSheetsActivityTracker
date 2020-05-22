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
        const row = await sheet.getRows({ offset: sheet.rowCount - 2 });
        const headers = sheet.headerValues;

        let str = '';
        headers.forEach(header => {
            const cell = row[0][header] ? row[0][header] : '';
            str += `${header}:\t ${cell}\n`;
        });

        //add total time elapsed 

        console.log(str);
        return;
    }

    console.log(args);

}