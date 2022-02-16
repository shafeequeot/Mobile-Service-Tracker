const { ipcRenderer } = require("electron");
const commonNames = require("../config/js/commonNames");


btnCancel.onclick = evt = ()=>{
    window.close()
}


//   save or update the data to db on save button click

btnSave.onclick = evt => {
    
    evt.preventDefault();
    txtSave.textContent = "Saving.."
    btnSaveLoader.classList.add('loader')






    if (txtManufacture.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "Brand name is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        txtManufacture.focus()
    } else if (txtModelNo.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "Model No. is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        txtModelNo.focus()
    } else if (txtIMEI.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "IMEI Code is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        txtIMEI.focus()
    }else {
        btnSave.disabled =  true
        let purchaseDetials = {
            tableName: commonNames.purchase,
            tableContent: {
                Created_Date: '"' + new Date() + '"',
                Supplier_Name: '"' + txtSupplier.value + '"',
                Brand_Name: '"' + txtManufacture.value + '"',
                Model_No: '"' + txtModelNo.value + '"',
                IMEI: '"' + txtIMEI.value + '"',
                Inv_No: '"' + txtInvNo.value + '"',
                Other: '"' + txtOtherDesc.value + '"',
                
            }
        }
        
       
            ipcRenderer.invoke("SaveToDb", purchaseDetials).then((newCompanyID) => {

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
                if(toString(err).search('purchases.IMEI') < 0) {
                    formResult.textContent = 'IMEI code is duplicate, type other IMEI' 
                    txtIMEI.focus()
                }
                    else formResult.textContent = 'Could not save ' + err
                // formResult.textContent = 'data note saved ' + err
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                btnSave.disabled =  false
            })



    }
}


     




