const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const path = require('path')
const sqlite3 = require('sqlite3')
var db = new sqlite3.Database(path.join(app.getPath('userData'), '\DB/dataBase.db'))
  
 
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



const createSubWindow = (htmlFile, parentWindow, width, height, arg) => {
  let modal = new BrowserWindow({
      width: width,
      height: height,
      modal: true,
      resizable: false,
      icon: path.join(__dirname + '/public/auxwall/logos/favicon.png'),
      parent: parentWindow,
      frame: false,
      webPreferences: {
          contextIsolation: false,
          nodeIntegration: true,
          additionalArguments: [arg]
      }
  })

  modal.loadFile(htmlFile)



  return modal;

}


// opan new window if requested
var custWindow = {}

ipcMain.handle("createNewWindow", async(event, custWindow) => {

    Page = path.join(__dirname, custWindow.Page)

    createSubWindow(Page, MainWindow, parseInt(custWindow.Width), parseInt(custWindow.Height), custWindow.arg);
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
