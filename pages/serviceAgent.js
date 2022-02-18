const { ipcRenderer } = require("electron");
const calculateHelpers = require("../config/js/calculateHelpers");
const commonNames = require("../config/js/commonNames");
let toDay = calculateHelpers.dateFormat(new Date())
btnCancel.onclick = evt = ()=>{
    window.close()
}

//   save or update the data to db on save button click

btnSave.onclick = evt => {
    
    evt.preventDefault();
    txtSave.textContent = "Saving.."
    btnSaveLoader.classList.add('loader')


    if (txtAgent.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "Agent name is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        txtAgent.focus()
    
    }
        else {
        btnSave.disabled =  true
        let saveThisDetials = {
            tableName: commonNames.serviceAgent,
            tableContent: {
                Created_Date: '"' + toDay + '"',
                Company_Name: '"' + txtAgent.value + '"',
                Contact_Person: '"' + txtPerson.value + '"',
                Location: '"' + txtLocation.value + '"',
                Contact: '"' + txtPhone.value + '"',
        
            }
        }
        
       
            ipcRenderer.invoke("SaveToDb", saveThisDetials).then((newCompanyID) => {

                formResult.classList.remove('Error')
                formResult.classList.add('success')
                formResult.textContent = "All data has been saved!"
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                purchaseForm.reset()
                txtAgent.focus()
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

