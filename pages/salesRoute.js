const { ipcRenderer } = require("electron");
const calculateHelpers = require("../config/js/calculateHelpers");
const commonNames = require("../config/js/commonNames");
let toDay = calculateHelpers.dateFormat(new Date())

btnCancel.onclick = evt = ()=>{
    // evt.preventDefault();
    window.close()
}


//   save or update the data to db on save button click

btnSave.onclick = evt => {
    
    evt.preventDefault();
    txtSave.textContent = "Saving.."
    btnSaveLoader.classList.add('loader')






    if (txtRoute.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "Route name is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        txtRoute.focus()
    
    }else {
        btnSave.disabled =  true
        let saveThisDetials = {
            tableName: commonNames.saleRoute,
            tableContent: {
                Created_Date: '"' + toDay + '"',
                Sale_Route: '"' + txtRoute.value + '"',
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
                btnSave.disabled =  false

               
            }).catch((err)=>{
               
                btnSave.disabled =  false
                
                formResult.classList.add('Error')
                formResult.classList.remove('success')
                formResult.textContent = 'Could not save.. ' + err
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                btnSave.disabled =  false
            })



    }
}


     




