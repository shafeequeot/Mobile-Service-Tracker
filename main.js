const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const path = require('path')
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