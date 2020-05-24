const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client_secret.json');
require('dotenv').config();

const args = process.argv.slice(2);
main(args);

async function main(args) {
    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
    await doc.useServiceAccountAuth(creds)
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    if(!args.length) {

        const row = await fetchRows(sheet, 1);
        printString(row);

        //add total time elapsed 
    }

    if(args.length == 1) {
        const row = await fetchRows(sheet, 1);
        const dateTime = getDateTime();
        
        if(args[0].slice(0,1) !== '-') {
            
            //set previous row's end time
            row[0].End = dateTime.time;
            await row[0].save();

            //adds new row
            const newRow = await sheet.addRow({ Date: dateTime.date, Task: args[0], Type: '', Notes: '', Start: dateTime.time, End: '' });

            printString([newRow]);

        } else { console.log("Error: Expected more than one argument.") }
       
    }

    if(args.length > 1) {

        if(args[0] == '-d') {
            
            if(args.length == 2) {
                const num = Math.round(Number(args[1]));
               
                if (typeof num !== "NaN") {
                    const row = await fetchRows(sheet, num);
                    printString(row);

                } else { console.log("Error: please enter a number. Example: '-d 3' will fetch the three most recent entries"); }

            } else { console.log(`Error: expected 2 arguments, but received ${args.length}`); }
        }

        if(args[0] == '-c') {
            if(args.length == 2) {

            }

        }


        /*

        -c: select current row
            stop: sets end time
            delete: deletes current row
            copy: copies current row
            setDate 
                -d 
                STRING
            setTask 
                STRING
            setType 
                STRING
            setStart 
                -t
                STRING
            setEnd 
                -t
                STRING
            setNotes 
                STRING

        -i: manually insert row
            [   
            -d insert date || STRING,
            STRING,
            STRING,
            -t insert time || STRING
            -t insert time || STRING   
            


        */
    }



}





function getDateTime(dateString = null) {

    let date;

    if(dateString){
        date = new Date(dateString).toLocaleString().split(', ');
    } else {
        date = new Date().toLocaleString().split(', ');
    }

    let time = date[1];
    date = date[0];
    return { date, time }
}

function printString(rows) {
    const headers = rows[0]._sheet.headerValues;
    let str = '';

    if(rows.length == 1){
        headers.forEach(header => {
            const cell = rows[0][header] ? rows[0][header] : '\t';
            str += `${header}:\t ${cell}\n`;
        });
    } else {
        headers.forEach(header => {
            str+=`${header}\t\t| `;
        })

        str += `\n${'-'.repeat(100)}\n`;

        rows.forEach(row => {
            headers.forEach(header => {
                const cell = row[header] ? row[header] : '\t';
                str += `${cell}\t| `;
            });

            str += `\n${'-'.repeat(100)}\n`;
        })
    }

    console.log(str);
}

async function fetchRows(sheet, num){
    return await sheet.getRows({ offset: sheet.rowCount - (num + 1) });
}

