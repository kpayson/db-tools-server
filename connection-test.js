const mysql = require('mysql');
// const mysql = require('mysql2');

// Login into cloud foundry
// cf login -a api.fr.cloud.gov --sso

// Set up ssh tunnel
// cf ssh -L 63306:cg-aws-broker-prodrj5hgmxlvrne7av.ci7nkegdizyy.us-gov-west-1.rds.amazonaws.com:3306 labshare-auth-dev-0

var connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 63306,
    user: 'urxsv0iz9xh8s3la',
    password: 'pozakt00x3ejpdtookdqvgnmh',
    database: 'labshare-0'
  });

//   var connection = mysql.createConnection({
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     password: '',
//     database: 'labshare'
//   });
   
   
  connection.connect((err)=>{
    if (err) {
        console.log(err);
        throw err;
    };
    connection.query('SELECT * FROM `Tenant`', function (error, results, fields) {
        if (error) {
            console.log(error);
            throw error;
        };
        console.log('The solution is: ', results[0].solution);
      });
  });
   
//   connection.query('SELECT * FROM `Tenant`', function (error, results, fields) {
//     if (error) {
//         console.log(error);
//         throw error;
//     };
//     console.log('The solution is: ', results[0].solution);
 // });