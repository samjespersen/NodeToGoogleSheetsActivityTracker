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

    if(args.length == 2) {
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

    if(args.length == 3) {
        const dateTime = getDateTime();
        const newRow = await sheet.addRow({ Date: dateTime.date, Task: args[2], Type: '', Notes: '', Start: dateTime.time, End: '' });
        console.log(newRow._rawData);
        return;
    }




    
}





function getDateTime() {
    let date = new Date().toLocaleString().split(', ');
    let time = date[1];
    date = date[0];
    return { date, time }
}