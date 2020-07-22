const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./client_secret.json");
require("dotenv").config();

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

	if (arguments[0] === "-h" || arguments[0] === "-help") {
		console.log(`
		
	(no arguments)
		fetches the latest row

	-view [int] || -v [int]
		fetches the last [int] rows

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
	if (arguments[0].slice(0, 1) !== "-") {
		const dateTime = getDateTime();
		let first = arguments.shift();

		rowObj.Task = first;
		rowObj.Date = dateTime.date;
		rowObj.Start = dateTime.time;
		rowObj.Index = -1;
	}


	for (let i = 0; i < arguments.length; i++) {
		const arr = arguments[i]
		const arr2 = arguments[i + 1];

		if (arr.slice(0, 1) !== '-') {
			console.log(`Error: ${arr} is not a command. Use -h or -help for a list of acceptable commands.`);
			return;
		}

		//CHECK FOR MISSING ARGUMENTS
		if (!arr2 || arr2.slice(0, 1) === '-') {
			printErrorMsg(arr, arr2 ? arr2 : null)
			return;
		}

		switch (arr) {
			case "-select":
			case "-s":
				if (rowObj.Index === -1) {
					console.log("Selection error. Cannot select row when creating a new one.");
					return;
				}

				if (typeof Number(arr2) === "number" && Number(arr2).toLocaleString() !== "NaN") {
					rowObj.Index = Number(arr2);
				} else {
					printErrorMsg(arr, arr2);
					return;
				}

				break;

			case "-task":
			case "-t":
				if (typeof arr2 === 'string') {
					rowObj.Task = arr2;
				} else {
					printErrorMsg(arr, arr2);
					return;
				}
				break;
			case "-type":
			case "-y":
				if (typeof arr2 === 'string') {
					rowObj.Type = arr2;
				} else {
					printErrorMsg(arr, arr2);
					return;
				}
				break;
			case "-date":
			case "-d":
				let date = new Date(arr2);
				if (date.toString() === "Invalid Date") {
					printErrorMsg(arr, arr2);
					return;
				} else {
					rowObj.Date = getDateTime(arr2).date;
				}
				break;
			case "-begin":
			case "-b":
				let begin = new Date(`04/20/1969 ${arr2}`);
				if (begin.toString() === "Invalid Date") {
					printErrorMsg(arr, arr2);
					return;
				} else {
					rowObj.Start = getDateTime(begin).time;
				}
				break;
			case "-end":
			case "-e":
				let end = new Date(`04/20/1969 ${arr2}`);
				if (end.toString() === "Invalid Date") {
					printErrorMsg(arr, arr2);
					return;
				} else {
					rowObj.End = getDateTime(end).time;
				}
			default:
				break;
		}

		i++;
	}


	console.log(rowObj);
}











// //FIRST WITH NO FURTHER ARGS
// if (first && !args.length) {
// 	const [row] = await fetchRows(sheet, 1);
// 	const dateTime = getDateTime();

// 	//ends old row
// 	if (row && !row.End) {
// 		row.End = dateTime.time;
// 		await row.save();
// 	}

// 	//adds new row
// 	const newRow = await sheet.addRow({
// 		Date: dateTime.date,
// 		Task: first,
// 		Type: "",
// 		Start: dateTime.time,
// 		End: "",
// 	});

// 	printString([newRow]);
// 	return;
// }

// let selectedRow = 0;

// if (first)





// 	if (args.length > 1) {
// 		if (args[0] == "-d") {
// 			if (args.length == 2) {
// 				const num = Math.round(Number(args[1]));

// 				if (typeof num !== "NaN") {
// 					const row = await fetchRows(sheet, num);
// 					printString(row);
// 				} else {
// 					console.log(
// 						"Error: please enter a number. Example: '-d 3' will fetch the three most recent entries"
// 					);
// 				}
// 			} else {
// 				console.log(`Error: expected 2 arguments, but received ${args.length}`);
// 			}
// 		}

// 		if (args[0] == "-c") {
// 			if (args[1] === "end") {
// 				const row = await fetchRows(sheet, 1);
// 				if (args.length === 2) {
// 					const dateTime = getDateTime();
// 					if (!row[0].End) {
// 						row[0].End = dateTime.time;
// 						await row[0].save();
// 					} else {
// 						console.log("Current row already has an ending time set.");
// 					}
// 				}

// 				if (args.length === 3) {
// 					const time = getDateTime(args[2]).time;
// 					console.log(time);
// 					if (!row[0].End) {
// 						row[0].End = getDateTime(args[2]).time;
// 						await row[0].save();
// 					} else {
// 						console.log("Current row already has an ending time set.");
// 					}
// 				}
// 			}
// 		}


// 	}
// }

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
	let str = "";

	if (rows.length == 1) {
		headers.forEach((header) => {
			const cell = rows[0][header] ? rows[0][header] : "\t";
			str += `${header}:\t ${cell}\n`;
		});
	} else {
		headers.forEach((header) => {
			str += `${header}\t\t  `;
		});

		str += `\n${"-".repeat(100)}\n`;

		rows.forEach((row) => {
			headers.forEach((header) => {
				const cell = row[header] ? row[header] : "\t";
				str += `${cell}\t  `;
			});

			str += `\n${"-".repeat(100)}\n`;
		});
	}

	console.log(str);
}

async function fetchRows(sheet, num) {
	return await sheet.getRows({ offset: sheet.rowCount - (num + 1) });
}

function printErrorMsg(arr, arr2) {
	if (!arr2) {
		console.log(`Error: missing argument to ${arr}.`);
		return;
	}

	switch (arr) {
		case '-v':
		case '-view':
		case '-s':
		case '-select':
			console.log(`Error: argument following ${arr} must be a whole number`);
			break;
		case '-t':
		case '-task':
		case '-y':
		case '-type':
			console.log((`Error: argument following ${arr} must be a string surrounded by quotes.`));
			break;
		case '-d':
		case '-date':
			console.log(`Error: ${arr2} is not a valid date. Expected: 'MM/DD/YYY'`);
			break;
		case '-b':
		case '-begin':
		case '-e':
		case '-end':
			console.log(`Error: ${arr2} is not a valid time. Expected: 'HH:MM AM/PM'`);
			break;
	}
}