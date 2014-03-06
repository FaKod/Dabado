# Usage

* pull repo  
* cd to repo
* npm install
* maybe change the routing configuration at /scripts/web-server.js (at the end of file) to point to the Splout server 
* node ./scripts/web-server.js
* browse to http://localhost:9099/app/index.html

File /app/demoSQL.json contains some test SQL statements. 

* If the file is there, it get loaded automatically to the table. Or
* Copy and paste them into the right textbox and press the **put into table** button. 
 
This fills the table with demo SQL statements. Click on a table row to put a statement to the left side and press **Execute Query** to execute the query.



Selecting the check box **Update Table on Execute Query** puts (one time) the next executed query into the table.

In general, the textbox **SQL Queries** can have one SQL query per line. The queries are executed in parallel and are added as data to the graphs (as long they can show more than one data).

The SQL queries must have the columns "x" and "y" used for the graph axes. 



Have fun


