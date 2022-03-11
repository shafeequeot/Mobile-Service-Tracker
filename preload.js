


// All of the Node.js APIs are available in the preload process.

const { ipcRenderer} = require("electron")
const path = require('path')


// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })

if (!window.localStorage.dbPath){
  ipcRenderer.invoke("userDataPath").then((gotDataPath) => {
      window.localStorage.dbPath =  path.join(gotDataPath, 'DB','dataBase.db')
      window.localStorage.dbConfigPath = path.join(gotDataPath, 'DB','dbConfig.json')
  })
}

// set darkmode if prevouse used darkmode
if(window.localStorage.Theme == 'Dark'){
ipcRenderer.invoke('dark-mode:toggle').then((res)=>{
  // window.localStorage.Theme ='Dark'  : 'Light'
})
}
