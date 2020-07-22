
manpage

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
                console logs this manpage
