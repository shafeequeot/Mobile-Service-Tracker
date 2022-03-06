const { ipcRenderer } = require('electron')
let XLSX = require('xlsx')
const calculateHelpers = require('../config/js/calculateHelpers')
const commonNames = require('../config/js/commonNames')
const fsextra = require('fs-extra')

btnCancel.onclick=()=>{
    window.close()
}


btnImport.onclick = ()=>{

    const dgProp = {
        Prop: {
            properties: ['openFile', 'promptToCreate'],
            title: "Select Excel sheet",
            filters: [{ name: '*', extensions: ['xlsx'] }],
            message: "Select a excel sheet"
        }
    }


    if(txtImport.innerHTML == 'Import Data'){

        let workbook = XLSX.readFile(importResult.innerHTML)
        // tables Sheet1
        let cells = workbook.Sheets['Sheet1'];
    
     cells = XLSX.utils.sheet_to_json( workbook.Sheets['Sheet1'])
     
    //  console.log(cells)
    btnImport.disabled =  true
cells.forEach(element => {
    
       

         let purchaseDetials = {
            tableName: commonNames.purchase,
            tableContent: {
                Created_Date: '"' + calculateHelpers.dateFormat(Date()) + '"',
                Supplier_Name: '"' + element.Supplier_Name + '"',
                Brand_Name: '"' + element.Brand_Name + '"',
                Model_No: '"' + element.Model_No  + '"',
                IMEI: '"' + element.IMEI  + '"',
                Inv_No: '"' + element.Inv_No  + '"',
                Other: '"' + element.Other  + '"',
                
            }
        }
        
       
            ipcRenderer.invoke("SaveToDb", purchaseDetials).then((newCompanyID) => {

                importResult.classList.remove('error')
                importResult.classList.add('success')
                importResult.textContent = "All data has been saved!"
                btnImport.classList.remove('loader')
                btnImport.textContent = "Importing.."
              
                

               
            }).catch((err)=>{
               
                
                importResult.classList.add('Error')
                importResult.classList.remove('success')
                importResult.textContent = 'Could not save ' + err
                // formResult.textContent = 'data note saved ' + err
                btnSaveLoader.classList.remove('loader')
                
            })

     });

    }else if(txtImport.innerHTML == "Choose file"){
        ipcRenderer.invoke('selectFile', dgProp).then(res=>{
            importResult.innerHTML = res.filePaths[0]
            txtImport.innerHTML = "Import Data"
        })
    }

   
}

if(!window.localStorage.dbBackup){
    txtDBBackup.innerHTML = 'Choose Location'
        }else  lblBackup.innerHTML = window.localStorage.dbBackup

btnDBBackup.onclick = () =>{
    // <div id="txtDBBackup">Backup now</div>
    if(txtDBBackup.innerHTML == 'Choose Location'){
       setBackupLocation()
            }else{
                fsextra.copyFile(window.localStorage.dbPath, window.localStorage.dbBackup+"/backup.db").then(err=>{
                    lblBackup.innerHTML = err? err : 'Backup completed'
                })
            }
   
}

function setBackupLocation(){
    const dgProp2 = {
        Prop: {
            properties: ['openDirectory', 'promptToCreate'],
            title: "Select backup location",
            filters: [{  }],
            message: "Choose backup location"
        }
    }

    ipcRenderer.invoke('selectFile', dgProp2).then(res=>{
        lblBackup.innerHTML = res.filePaths[0]
        window.localStorage.dbBackup = res.filePaths[0]
        txtDBBackup.innerHTML = "Backup Now"
    })
}

lblNewLocation.onclick = () =>{
    setBackupLocation()
}