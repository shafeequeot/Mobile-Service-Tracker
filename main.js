const { app, BrowserWindow, ipcMain, nativeTheme, dialog, ipcRenderer } = require('electron')
const path = require('path')
const sqlite3 = require('sqlite3')
var db = new sqlite3.Database(path.join(app.getPath('userData'), '\DB/dataBase.db'))
let modal
 
let MainWindow
function createWindow () {
   MainWindow = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 700,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
    }
  })

  MainWindow.loadFile('index.html')

// Window.localStorage.dbPath =  "path.join(app.getPath('userData'), '\DB/dataBase.sql')"
// database location to Renderer

// send user data path to render page
ipcMain.handle('userDataPath', async(e, sav) => {
    return path.join(app.getPath('userData'), '\DB/dataBase.db')
})




//  dark  mode start 
ipcMain.handle('dark-mode:toggle', () => {

  if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
  } else {
      nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:currentTheme', (evnt, theme) => {
  if (theme == 'Dark') nativeTheme.themeSource = 'dark'
  else nativeTheme.themeSource = 'light'
})

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'dark'
})
 
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


// creating sub window function



const createSubWindow = (htmlFile, parentWindow, width, height, arg, id) => {
 modal = new BrowserWindow({
      width: width,
      height: height,
      modal: true,
      resizable: false,
      icon: path.join(__dirname + '/public/auxwall/logos/favicon.png'),
      parent: parentWindow,
      frame: false,
      // show: false,
      webPreferences: {
          contextIsolation: false,
          nodeIntegration: true,
          additionalArguments: [arg]
      }
  })

  modal.loadFile(htmlFile).then(res=>{
    if (id) modal.webContents.send('gotID', id)  
  })



  return modal;



}


// opan new window if requested
var custWindow = {}

ipcMain.handle("createNewWindow", async(event, custWindow) => {

    Page = path.join(__dirname, custWindow.Page)

    createSubWindow(Page, MainWindow, parseInt(custWindow.Width), parseInt(custWindow.Height), custWindow.arg, custWindow.id);
})





// save to Database start
ipcMain.handle('SaveToDb', async(event, SaveToDb) => {

  return new Promise((resolve, reject) => {



      svTableDataHead = Object.keys(SaveToDb.tableContent)
      svTableDataContent = Object.values(SaveToDb.tableContent)
      svtableName = Object.values(SaveToDb)
      db.serialize(function() {
        
        db.run(`INSERT INTO  ${svtableName[0]} (${svTableDataHead.toString()}) VALUES (${svTableDataContent.toString()})`, function(err) {
  
            if (err) {
                reject(err)
            } else {
  
                resolve(this.lastID)
            }
  
        })
      })
           
  })

})


// dialog boxes 
// show error message
ipcMain.handle("showMeError", async(event, message) => {
  return new Promise((res, rej) => {

      dialog.showMessageBox(message.message).then((PRESSED) => {
          res(PRESSED)
          if (PRESSED.response == 0 && message.quit)

              app.quit()
      })
  })

})




// fetch all data from Database start
ipcMain.handle('fetchAllDataFromDb', async(event, userRequest) => {
  let sql = ''
  return new Promise((resolve, reject) => {
      sql = `SELECT ${userRequest.tableData}  FROM ${userRequest.tableName} WHERE ${userRequest.where}`
   
          db.serialize(async function() {
              await db.all(sql, [], (err, row) => {
                  if (err) reject(err)

                  else resolve(row)
              })
          })

     
  })
})

// fetch data from Database start
ipcMain.handle('fetchFromDb', async(event, userRequestingData) => {

  return new Promise((resolve, reject) => {
 
      let whereCondition = ''
      if (userRequestingData.where) whereCondition = 'WHERE ' + userRequestingData.where
      sql = `SELECT ${userRequestingData.tableData}  FROM ${userRequestingData.tableName} ${whereCondition}`
      // console.log(sql)    
      db.serialize(function() {
              db.parallelize(function() {
                  db.get(sql, [], (err, row) => {
                      if (err) reject(err)

                      else resolve(row)
                      // db.close()
                  })
              })
          })
  })
})


// update data in Database start 




ipcMain.handle('UpdateToDb', async(event, SaveToDb) => {

  return new Promise((resolve, reject) => {
               db.serialize(function() {
              db.exec(`UPDATE "${SaveToDb.tableName}" SET ${SaveToDb.setContent.toString()} WHERE ${SaveToDb.where};`, (err) => {
                  if (err) {
                      reject(err)
                  } else {
                      resolve('Updated!')
                  }
              })
          })
  })
})


// delete data from database 


ipcMain.handle('DeleteFromDb', async(event, Db) => {

  return new Promise((resolve, reject) => {

     
          db.serialize(function() {

              db.exec(`DELETE FROM "${Db.tableName}"  WHERE ${Db.where};`, (err) => {

                  if (err) {
                      reject(err)
                  } else {

                      resolve('Deleted!')
                  }

              })
          })


     
  })

})



// let know updations main page

ipcMain.handle('somthingUpdated', () => {

  MainWindow.webContents.send('somethingUpdated')
})