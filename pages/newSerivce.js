const { ipcRenderer } = require("electron")
const calculateHelpers = require("../config/js/calculateHelpers")
const commonNames = require("../config/js/commonNames")
let toDay = calculateHelpers.dateFormat(new Date())
btnCancel.onclick = evt = ()=>{
    window.close()
}


// bring detials to compobox

function biringtoCompoBox(){
    let salesRouteQuery = {
        tableName: commonNames.saleRoute,
        tableData: `id, Sale_Route`,
        where: ` id = id ORDER BY "id" DESC`
    }
    

    let serviceAgentQuery = {
        tableName: commonNames.serviceAgent,
        tableData: `id, Company_Name`,
        where: ` id = id ORDER BY "id" DESC`
    }

   Promise.all([ipcRenderer.invoke("fetchAllDataFromDb", salesRouteQuery),ipcRenderer.invoke("fetchAllDataFromDb", serviceAgentQuery)]).then((List) => {
        txtRoute.textContent = ''
        txtRoute.add(new Option('Add New Route', '0'))
        List[0].forEach((element, idx) => {
            
            txtRoute.add(new Option(element.Sale_Route, element.id))
        })

        txtServiceAgent.textContent = ''
        txtServiceAgent.add(new Option('Add New Agent', '0'))
        List[1].forEach((element, idx) => {
            
            txtServiceAgent.add(new Option(element.Company_Name, element.id))
        })

    })
}

biringtoCompoBox()




// add new sales route & agent if not available

txtRoute.onchange = evt = (selected) => {
    if (txtRoute.options[txtRoute.selectedIndex].value == 0) {
       let dialogMessage = {
            message: {
                type: 'warning',
                buttons: ["Yes", "No"],
                message: "Do you wish to Create new route?",
                title: "Are you sure?"
            },
            quit: false
        }
        ipcRenderer.invoke("showMeError", dialogMessage).then((confirmed) => {
            if (!confirmed.response){
                openThisPage = { Page: `pages/salesRoute.html`, Parent: "MainWindow", Width: "700", Height: "650" }
                ipcRenderer.invoke('createNewWindow', openThisPage)  
                window.close()
            } 
        })

    }
}

txtServiceAgent.onchange = evt = (selected) => {
    if (txtServiceAgent.options[txtServiceAgent.selectedIndex].value == 0) {
       let dialogMessage = {
            message: {
                type: 'warning',
                buttons: ["Yes", "No"],
                message: "Do you wish to Create new agent?",
                title: "Are you sure?"
            },
            quit: false
        }
        ipcRenderer.invoke("showMeError", dialogMessage).then((confirmed) => {
            if (!confirmed.response){
                openThisPage = { Page: `pages/serviceAgent.html`, Parent: "MainWindow", Width: "700", Height: "650" }
                ipcRenderer.invoke('createNewWindow', openThisPage)  
                window.close()
            } 
        })

    }
}


// check product with IMEI number 
txtIMEI.onchange = evt = (selected)=>{
    let fetchPhoneQuery = {
        tableName: commonNames.purchase,
        tableData: "id, `Brand_Name`, `Model_No`, `IMEI`",
        where: "`IMEI` = '" + txtIMEI.value +"'"
    }
    
    ipcRenderer.invoke("fetchFromDb", fetchPhoneQuery).then((Mobile) => {
console.log(Mobile)
if (Mobile){
    txtBrand.value = Mobile.Brand_Name
    txtModelNo.value = Mobile.Model_No
    btnSave.disabled =  false
}else{

    
    
    
    let dialogMessage = {
        message: {
            type: 'error',
            buttons: ["OK"],
            message: "This mobile not found",
            title: "Not found"
        },
        quit: false
    }
    ipcRenderer.invoke("showMeError", dialogMessage).then((confirmed) => {
        txtBrand.value = ""
        txtModelNo.value = "" 
        txtIMEI.focus()
        btnSave.disabled =  true
    })



} 

    })
}



//   save or update the data to db on save button click

btnSave.onclick = evt => {
    
    evt.preventDefault();
    txtSave.textContent = "Saving.."
    btnSaveLoader.classList.add('loader')

    if (txtIMEI.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "IMEI code is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        txtIMEI.focus()
    } else if (txtRoute.value === '0') {
        formResult.classList.add('Error')
        formResult.textContent = "Select sales route"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        txtRoute.focus()
    } else if (txtServiceAgent.value === '0') {
        formResult.classList.add('Error')
        formResult.textContent = "Select service agent"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        txtServiceAgent.focus()
    }else {
        btnSave.disabled =  true
        let ServiceReqDetials = {
            tableName: commonNames.services,
            tableContent: {
             
                Created_Date: '"' + toDay + '"',
                Stock: '"' + txtIMEI.value + '"',
                Sale_Route: '"' + txtRoute.value + '"',
                Service_Agent: '"' + txtServiceAgent.value + '"',
                Status: '1',
                Other: '"' + txtOtherDesc.value + '"', 
            }
        }
        
       
            ipcRenderer.invoke("SaveToDb", ServiceReqDetials).then((newCompanyID) => {

                formResult.classList.remove('Error')
                formResult.classList.add('success')
                formResult.textContent = "All data has been saved!"
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                txtIMEI.focus()
                purchaseForm.reset()
                btnSave.disabled =  false

               
            }).catch((err)=>{
               
                btnSave.disabled =  false
                
                formResult.classList.add('Error')
                formResult.classList.remove('success')
                formResult.textContent = 'Could not complete ' + err
                // formResult.textContent = 'data note saved ' + err
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                btnSave.disabled =  false
            })



    }
}

