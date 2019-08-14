const express = require('express');
const os = require('os');
const router = express.Router();
const mysql = require('../mysqlconnection');
const bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
  
router.get('/api/getUsername', (req, res, next) => {
    res.send({ username: os.userInfo().username });
});
 
router.post('/api/getData', (req, res) => {
    mysql.query("select * from transactionlist where name =?",[req.body.name],(err, rows) => {
        if (!err) {
            console.log('getdata!');
            console.log(rows);
            res.send(rows);
        } else {
            console.log(`query error : ${err}`);
            res.send(err);
        }
    });
}); 

router.post('/api/getFile', (req, res) => {
    mysql.query(`select * from ${req.body.name}`,(err, rows) => {
        if (!err) {
            console.log('getfile!');
            console.log(rows);
            res.send(rows);
        } else {
            console.log(`query error : ${err}`);
            res.send(err);
        }
    });
}); 

router.post('/api/getFilename', (req, res) => {
    mysql.query(`select * from filename`,(err, rows) => {
        if (!err) {
            console.log('getfilename!');
            console.log(rows);
            res.send(rows);
        } else {
            console.log(`query error : ${err}`);
            res.send(err);
        }
    });
});

router.post('/api/setData', (req, res) => {
    console.log(req.body);
    var tx = req.body;
    var sql = "INSERT INTO transactionlist (id, name, time, txinfo,filename,data,txnum) VALUES ?";
    var values = [
      [,tx.name,tx.time,tx.txinfo,tx.filename,tx.data,tx.txnum],
    ];    
    mysql.query(sql,[values],function(error,result){
        if(error){
            throw error;
        }
        console.log(result);
    });
}); 
  
module.exports = router;
