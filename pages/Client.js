const { ipcRenderer } = require("electron")
const commonNames = require("../config/js/commonNames")

btnCancel.onclick = evt = ()=>{
    window.close()
}


// display all sales route in compobox

let salesRouteQuery = {
    tableName: commonNames.saleRoute,
    tableData: `id, Sale_Route`,
    where: ` id = id ORDER BY "id" DESC`
}

ipcRenderer.invoke("fetchAllDataFromDb", salesRouteQuery).then((supllierList) => {
    txtRoute.textContent = ''
    txtRoute.add(new Option('Add New Route', '0'))
    supllierList.forEach((element, idx) => {
        
        txtRoute.add(new Option(element.Sale_Route, element.id))
    })
})



// add new sales route if not available

txtRoute.onchange = evt = (selected) => {
    if (txtRoute.options[txtRoute.selectedIndex].value == 0) {
       let dialogMessage = {
            message: {
                type: 'warning',
                buttons: ["Yes", "No"],
                message: "Do you really want to Create new supplier?",
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




//   save or update the data to db on save button click

btnSave.onclick = evt => {
    
    evt.preventDefault();
    txtSave.textContent = "Saving.."
    btnSaveLoader.classList.add('loader')


    if (txtClient.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "Client name is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        txtClient.focus()
    
    }else  if (txtRoute.value === '0') {
        formResult.classList.add('Error')
        formResult.textContent = "Select sale route"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        txtRoute.focus()
    }
        else {
        btnSave.disabled =  true
        let saveThisDetials = {
            tableName: commonNames.client,
            tableContent: {
                Created_Date: '"' + new Date() + '"',
                Client_Name: '"' + txtClient.value + '"',
                Sale_Route: '"' + txtRoute.value + '"',
                Location: '"' + txtLocation.value + '"',
                Contact: '"' + txtContactNo.value + '"',
                Other: '"' + txtOther.value + '"'
            }
        }
        
       
            ipcRenderer.invoke("SaveToDb", saveThisDetials).then((newCompanyID) => {

                formResult.classList.remove('Error')
                formResult.classList.add('success')
                formResult.textContent = "All data has been saved!"
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                purchaseForm.reset()
                txtClient.focus()
                btnSave.disabled =  false

               
            }).catch((err)=>{
               
                btnSave.disabled =  false
                
                formResult.classList.add('Error')
                formResult.classList.remove('success')
                formResult.textContent = 'Could not save.. try again ' + err
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                btnSave.disabled =  false
            })


    }
}


     
