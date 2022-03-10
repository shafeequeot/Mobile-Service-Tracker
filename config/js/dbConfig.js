const sqlite3 = require('sqlite3')
const fs = require('fs-extra')
const commonNames = require('./commonNames')

     

// createing database file if not exist

fs.ensureFile(window.localStorage.dbPath).then(()=>{
 
  try {
    let path = window.localStorage.dbPath
 
    var db = new sqlite3.Database(path)
  
    db.serialize(function() {
  
        // Queries for creating tables.

  
  
        db.exec('CREATE TABLE IF NOT EXISTS ' + commonNames.purchase + ' ("id"  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"Created_Date" datetime,"Supplier_Name" int,"Brand_Name" text,"Model_No" text,"IMEI" TEXT NOT NULL UNIQUE, "Inv_No" TEXT,"Other" text);')
        db.exec('CREATE TABLE IF NOT EXISTS ' + commonNames.client + '("id"  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"Created_Date" datetime, "Client_Name" TEXT, "Sale_Route" INT,"Location" TEXT,"Contact" INT,"Other" TEXT);')
        db.exec('CREATE TABLE IF NOT EXISTS ' + commonNames.saleRoute + '("id"  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"Created_Date" datetime, "Sale_Route" TEXT, "Other" TEXT);')
        db.exec('CREATE TABLE IF NOT EXISTS ' + commonNames.serviceAgent + '("id"  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"Created_Date" datetime, "Company_Name" TEXT, "Contact_Person" TEXT,"Location" TEXT,"Contact" INT);')
        db.exec('CREATE TABLE IF NOT EXISTS ' + commonNames.services + '("id"  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"Created_Date" datetime, "Stock" INT, "CSR_No" INT, "Sale_Route" INT,"Service_Agent" INT,"Status" INT,"Other" TEXT);')
        db.exec('CREATE TABLE IF NOT EXISTS ' + commonNames.serviceStatus + '("id"  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"Created_Date" datetime, "Serv_Req" INT, "Status" INT, "Description" TEXT);')

        
        // res(true)
    });
  } catch (err) {
  
    alert("Database path error: AX101 " + err)
  }

}).catch(err => {
  console.error(err)
})
 



