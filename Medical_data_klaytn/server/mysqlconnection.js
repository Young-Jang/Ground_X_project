const mysql = require('mysql');
const connection = mysql.createPool({
port: 3306,
user: 'root',
password: 'klaytn111',
database: 'klaytn_medical'
});
 
module.exports=connection;
