# Installation


* follow the [Getting Started with Splout SQL](http://sploutsql.com/gettingstarted.html) to put some data into Splout
* pull this repo  
* cd to repo
* npm install
* maybe change the routing configuration at /scripts/web-server.js (at the end of file) to point to the Splout server 
* node ./scripts/web-server.js
* browse to http://localhost:9099/app/index.html

# Usage

* Type in your queries on the left with Tablespace, Partition Key and SQL Query. Execute it with **Execute Query**. 
* In general, the textbox **SQL Queries** can have one SQL query per line. The queries are executed in parallel and are added as data to the graphs (as long they can show more than one data).
* The SQL queries must have the columns "x" and "y" used for the graph axes.
* Select the check box **Update Table on Execute Query** to put the next executed query into the table on the right, once.
* Click on a table row to put a statement to the left side and press **Execute Query** to execute the query.
* the text box **Queries as JSON** contains a serialized version of the query table. You can send the JSON via email. If you receive a JSON, paste it into the right textbox and press the **put into table** button. 
* File /app/demoSQL.json contains some test SQL statements. If the file is there, it get loaded automatically to the table. 


Have fun


