// db.js
const mysql = require('mysql2');

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: '34.42.102.24',    // Database host
    user: 'goriders',         // MySQL user
    password: 'Goride@2142',         // MySQL password (make sure to set this properly)
    database: 'goriders_db' // Your MySQL database name
});

// Connect to the MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

module.exports = db;