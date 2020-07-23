const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./client_secret.json");
require("dotenv").config();

const commands = ["-v", "-view", "-h", "-help", "-s", "-select", "-t", "-task", "-y", "-type", "-d", "-date", "-b", "-begin", "-e", "-end", "-i", "-insert", "-r", "-remove"];


main(process.argv.slice(2));

async function main(arguments) {
	const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
	await doc.useServiceAccountAuth(creds);
	await doc.loadInfo();
	const sheet = doc.sheetsByIndex[0];

	// FETCH LATEST ROW
	if (!arguments.length) {
		const row = await fetchRows(sheet, 1);
		printString(row);
		return;
	}

	//HELP

	if (arguments.some(arg => arg === "-h" || arg === "-help")) {

		if (arguments.length > 1) {
			console.log(`Error: -h and -help cannot be used with other parameters.`);
			return;
		}

		console.log(`
		
	(no arguments)
		fetches the latest row

	-view [int] || -v [int]
		fetches the last [int] rows

	-insert [int] || -i [int]
		inserts a row at index [int]

	-remove [int] || -r [int]
		deletes the row at index [int]

	'string as the first argument' [any number of further arguments]
		makes new row with string as type
		automatically selected, all further arguments will apply to it
	
	-select [int] || -s [int]
		selects a row. if not specified, row[0] is selected
		
	-task 'string' || -t 'string'
		sets task on selected row
		
	-type 'string' || -y 'string'
		sets type on selected row

	-date 'string' || -d 'string'
		sets date on selected row
		
	-begin 'string' || -b 'string'
		sets start timestamp for selected row
		
	-end 'string' || -e 'string'
		sets stop timestamp for selected row
	
	-help || -h
		console logs this manpage`);

		return;
	}

	//VIEW

	if (arguments.some(arg => arg === "-v" || arg === "-view")) {

		if (arguments.length > 2) {
			console.log(`Error: -v and -view cannot be used with other parameters.`);
			return;
		}

		if (arguments.length === 1) {
			const row = await fetchRows(sheet);
			printString(row);
			return;
		}

		if (arguments.length === 2) {
			const num = Math.round(Number(arguments[1]));
			if (Number.isInteger(num) && num > 0) {
				const row = await fetchRows(sheet, num);
				printString(row);
				return;
			} else {
				console.log(`Error: argument following -v or -view must be a positive integer.`);
				return;
			}

		}
	}

	//add support for -remove and -insert

	//CONSTRUCT ROW OBJECT
	const rowObj = {
		Index: null,
		Date: null,
		Task: null,
		Type: null,
		Start: null,
		End: null,
	}

	//CHECK FOR INITIAL TASK STRING

	//add support for task and type to be two strings next to each other

	if (arguments[0].slice(0, 1) !== "-") {
		const dateTime = getDateTime();
		let first = arguments.shift();

		//assign row data
		rowObj.Task = first;
		rowObj.Date = dateTime.date;
		rowObj.Start = dateTime.time;
		rowObj.Index = 0;
	}


	//MAIN LOOP
	for (let i = 0; i < arguments.length; i++) {
		const arr = arguments[i]
		const arr2 = arguments[i + 1];

		//check for missing arguments

		if (!commands.some(arg => arg === arr)) {
			console.log(`Error: ${arr} is not a command. Use -h or -help for a list of acceptable commands.`);
			return;
		}

		if (!arr2) {
			console.log(`Error: missing argument to ${arr}.`);
			return;
		}

		switch (arr) {
			case "-select":
			case "-s":
				if (rowObj.Index === 0) {

					if (rowObj.Task) {
						console.log("Error: Cannot select row when creating a new one.");
						return;
					}

					console.log('Error: argument following -s and -select must be a positive integer');
					return;
				}

				if (typeof Number(arr2) === "number" && Number(arr2).toLocaleString() !== "NaN") {
					rowObj.Index = Number(arr2);
				} else {
					console.log(`Error: argument following ${arr} must be a whole number`);
					return;
				}

				break;

			case "-task":
			case "-t":
				if (typeof arr2 === 'string') {
					rowObj.Task = arr2;
				} else {
					console.log((`Error: argument following ${arr} must be a string surrounded by quotes.`));
					return;
				}
				break;
			case "-type":
			case "-y":
				if (typeof arr2 === 'string') {
					rowObj.Type = arr2;
				} else {
					console.log((`Error: argument following ${arr} must be a string surrounded by quotes.`));
					return;
				}
				break;
			case "-date":
			case "-d":
				let date = new Date(arr2);
				if (date.toString() === "Invalid Date") {
					console.log(`Error: ${arr2} is not a valid date. Expected: 'MM/DD/YYY'`);
					return;
				} else {
					rowObj.Date = getDateTime(arr2).date;
				}
				break;
			case "-begin":
			case "-b":
				let begin = new Date(`04/20/1969 ${arr2}`);
				if (begin.toString() === "Invalid Date") {
					console.log(`Error: ${arr2} is not a valid time. Expected: 'HH:MM AM/PM'`);
					return;
				} else {
					rowObj.Start = getDateTime(begin).time;
				}
				break;
			case "-end":
			case "-e":
				let end = new Date(`04/20/1969 ${arr2}`);
				if (end.toString() === "Invalid Date") {
					console.log(`Error: ${arr2} is not a valid time. Expected: 'HH:MM AM/PM'`);
					return;
				} else {
					rowObj.End = getDateTime(end).time;
				}
				break;
		}

		i++;
	}


	//MAKE ROW DATA OBJ
	const rowData = {};

	Object.keys(rowObj).forEach(key => {
		if (rowObj[key]) {
			rowData[key] = rowObj[key];
		} else {
			rowData[key] = "";
		}
	})

	delete rowData.Index;

	//ADD NEW ROW
	if (rowObj.Index === 0) {

		const [row] = await fetchRows(sheet, 1);
		const dateTime = getDateTime();

		//ends old row
		if (row && !row.End) {
			row.End = dateTime.time;
			await row.save();
		}

		//adds new row
		const newRow = await sheet.addRow(rowData);

		printString([newRow]);
		return;

		//EDITS OLD ROW
	} else {
		const [row] = await fetchRows(sheet, rowObj.Index);

		Object.keys(rowData).forEach(key => {
			if (rowData[key]) row[key] = rowData[key];
		})

		await row.save();
		printString([row]);
		return;
	}

}


//FUNCTIONS

function getDateTime(dateString = null) {
	let date;

	if (dateString) {
		date = new Date(dateString).toLocaleString().split(", ");
	} else {
		date = new Date().toLocaleString().split(", ");
	}

	let time = date[1];
	date = date[0];
	return { date, time };
}

function printString(rows) {
	const headers = rows[0]._sheet.headerValues;
	let str = '';

	headers.pop();

	str += `\n${"-".repeat(100)}\n`;

	let index = rows.length;
	rows.forEach((row) => {
		str += `${index}    ${row.Task} \n     `
		headers.forEach((header) => {
			const cell = row[header] ? row[header] : "\t";
			str += `${cell}\t\t`;
		});

		str += `\n${"-".repeat(100)}\n`;
		index--;
	});

	console.log(str);
}

async function fetchRows(sheet, num) {
	return await sheet.getRows({ offset: sheet.rowCount - (num + 1) });
}