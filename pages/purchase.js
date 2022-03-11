const { ipcRenderer, BrowserWindow } = require("electron");
const calculateHelpers = require("../config/js/calculateHelpers");
const commonNames = require("../config/js/commonNames");

let productID
btnCancel.onclick = evt = ()=>{
    
if(btnCancel.textContent == "Go Back") window.location = 'InventoryList.html'
else window.close()
}

let toDay = calculateHelpers.dateFormat(new Date())
urlParams = new URLSearchParams(window.location.search);
productID = urlParams.get('id')


if(productID){
    let serviceList = {
        tableName: commonNames.purchase,
        tableData: `*`,
        where: `id = ${productID}`
    
      }
    
    
    
      ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {
          console.log(Data)


        txtSupplier.value = Data[0].Supplier_Name
        txtManufacture.value = Data[0].Brand_Name
        txtModelNo.value = Data[0].Model_No
        txtIMEI.value = Data[0].IMEI
        txtInvNo.value = Data[0].Inv_No
        txtOtherDesc.value = Data[0].Other
          
        txtSave.textContent = "Update"
        btnCancel.textContent = "Go Back"
      })
    
}

//   save or update the data to db on save button click

btnSave.onclick = evt => {
    
    evt.preventDefault();
  let = saveBtnText = txtSave.textContent

    if (txtManufacture.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "Brand name is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = saveBtnText
        txtManufacture.focus()
    } else if (txtModelNo.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "Model No. is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = saveBtnText
        txtModelNo.focus()
    } else if (txtIMEI.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "IMEI Code is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = saveBtnText
        txtIMEI.focus()
    }else {
console.log(btnSave.textContent)
if (btnSave.textContent == "Update  "){
// update existing data
    txtSave.textContent = "Updating.."
    btnSaveLoader.classList.add('loader')

    btnSave.disabled =  true
  

    let updateThisPurchase = {
        tableName: `${commonNames.purchase}`,
        setContent: [

            `'Supplier_Name' = '${txtSupplier.value}',
                'Brand_Name' = '${txtManufacture.value}',
                'Model_No' = '${txtModelNo.value}',
                'IMEI' = '${txtIMEI.value}',
                'Inv_No' = '${txtInvNo.value}',
                'Other' = '${txtOtherDesc.value}'
                `
        ],

        where: `id` + ` = '${productID}'`
    }
    
   
    ipcRenderer.invoke("UpdateToDb", updateThisPurchase).then(() => {


            formResult.classList.remove('Error')
            formResult.classList.add('success')
            formResult.textContent = "All data has been updated!"
            btnSaveLoader.classList.remove('loader')
            txtSave.textContent = "Save"
            txtSupplier.focus()
            formReset()
            btnSave.disabled =  false

           
        }).catch((err)=>{
           
            btnSave.disabled =  false
            
            formResult.classList.add('Error')
            formResult.classList.remove('success')
            if(toString(err).search('purchases.IMEI') < 0) {
                formResult.textContent = 'IMEI code is duplicate, type other IMEI' 
                txtIMEI.focus()
            }
                else formResult.textContent = 'Could not complete' + err
            // formResult.textContent = 'data note saved ' + err
            btnSaveLoader.classList.remove('loader')
            txtSave.textContent = "Update"
            btnSave.disabled =  false
        })


} else{
    txtSave.textContent = "Saving.."
    btnSaveLoader.classList.add('loader')

    btnSave.disabled =  true
    let purchaseDetials = {
        tableName: commonNames.purchase,
        tableContent: {
            Created_Date: '"' + toDay + '"',
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
            txtSupplier.focus()
            formReset()
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
}


     




function formReset(){
txtSupplier.value = ""
txtManufacture.value = ""
txtModelNo.value  = ""
txtIMEI.value = ""
txtInvNo.value  = ""
txtOtherDesc.value = ""
    
}