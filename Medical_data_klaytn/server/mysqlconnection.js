const mysql = require('mysql');
const connection = mysql.createPool({
host: 'localhost',
port: 3306,
user: 'root',
password: 'wkddud151',
database: 'klaytn_medical'
});
 
module.exports=connection;