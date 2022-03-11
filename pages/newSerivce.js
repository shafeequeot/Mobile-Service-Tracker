const { ipcRenderer } = require("electron")
const calculateHelpers = require("../config/js/calculateHelpers")
const commonNames = require("../config/js/commonNames")
let serviceId, currentStatus, saveNewUpdates, newStatus
let toDay = calculateHelpers.dateFormat(new Date())
btnCancel.onclick = evt = () => {
    ipcRenderer.invoke('somthingUpdated').then(() => {

        window.close()
    })
}
txtDate.value = calculateHelpers.datePickerFormat(new Date())

// bring detials to compobox

function biringtoCompoBox() {
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

    Promise.all([ipcRenderer.invoke("fetchAllDataFromDb", salesRouteQuery), ipcRenderer.invoke("fetchAllDataFromDb", serviceAgentQuery)]).then((List) => {
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
            if (!confirmed.response) {
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
            if (!confirmed.response) {
                openThisPage = { Page: `pages/serviceAgent.html`, Parent: "MainWindow", Width: "700", Height: "650" }
                ipcRenderer.invoke('createNewWindow', openThisPage)
                window.close()
            }
        })

    }
}


// check product with IMEI number 
txtIMEI.onchange = evt = (selected) => {
    let fetchPhoneQuery = {
        tableName: commonNames.purchase,
        tableData: "id, `Brand_Name`, `Model_No`, `Supplier_Name`, `IMEI`",
        where: "`IMEI` = '" + txtIMEI.value + "'"
    }

    ipcRenderer.invoke("fetchFromDb", fetchPhoneQuery).then((Mobile) => {
        if (Mobile) {
            txtBrand.value = Mobile.Brand_Name + " " + Mobile.Model_No
            txtSupplier.value = Mobile.Supplier_Name
            btnSave.disabled = false
        } else {




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
                txtIMEI.focus()
                txtBrand.value = ""
                txtSupplier.value = ""
                btnSave.disabled = true
            })



        }

    })
}



//   save or update the data to db on save button click

btnSave.onclick = evt => {


    // get new status
    if (document.getElementsByName('ckSteps')[0].checked) newStatus = 1 
    else newStatus = undefined
    if (document.getElementsByName('ckSteps')[1].checked) newStatus = 2
    if (document.getElementsByName('ckSteps')[2].checked) newStatus = 3
    if (document.getElementsByName('ckSteps')[3].checked) newStatus = 4
    if (document.getElementsByName('ckSteps')[4].checked) newStatus = 5
    console.log(newStatus)
    evt.preventDefault();
let saveButtonName = txtSave.textContent
    if (txtIMEI.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "IMEI code is manditory"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = saveButtonName
        txtIMEI.focus()
    } else if (txtRoute.value === '0') {
        formResult.classList.add('Error')
        formResult.textContent = "Select sales route"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = saveButtonName
        txtRoute.focus()
    } else if (txtCSR.value == '') {
        formResult.classList.add('Error')
        formResult.textContent = "Enter CSR Number"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = saveButtonName
        txtCSR.focus()
    } else if (txtServiceAgent.value == '0') {
        formResult.classList.add('Error')
        formResult.textContent = "Select Service Agent"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = saveButtonName
        txtServiceAgent.focus()
    } else if (newStatus == undefined) {
        formResult.classList.add('Error')
        formResult.textContent = "Select current status"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = saveButtonName

    } else {
        if (txtSave.textContent == "Update") {

            // updating existing requests 

            txtSave.textContent = "Updating.."
            btnSaveLoader.classList.add('loader')

            btnSave.disabled = true
            let updateThis = {
                tableName: `${commonNames.services}`,
                setContent: [

                    `'Sale_Route' = '${txtRoute.value}',
                        'Service_Agent' = '${txtServiceAgent.value}',
                        'Status' = '${newStatus}',
                        'Other' = '${txtOtherDesc.value}',
                        'CSR_No' = '${txtCSR.value}'
                        `
                ],

                where: `id` + ` = '${serviceId}'`
            }

            ipcRenderer.invoke("UpdateToDb", updateThis).then(() => {

                if (currentStatus != newStatus) {
                    saveNewUpdates = {
                        tableName: commonNames.serviceStatus,
                        tableContent: {

                            Created_Date: '"' + toDay + '"',
                            Serv_Req: '"' + serviceId + '"',
                            Status: '"' + newStatus + '"',
                            Description: '"' + txtStatusDesc.value + '"'
                        }
                    }
                    ipcRenderer.invoke("SaveToDb", saveNewUpdates)
                }

                formResult.classList.remove('Error')
                formResult.classList.add('success')
                formResult.textContent = "All data has been saved!"
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Updated"



            }).catch((err) => {

                btnSave.disabled = false

                formResult.classList.add('Error')
                formResult.classList.remove('success')
                formResult.textContent = 'Could not complete ' + err
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Update"
                btnSave.disabled = false
            })
        } else {



            // saving new data 
            txtSave.textContent = "Saving.."
            btnSaveLoader.classList.add('loader')
            btnSave.disabled = true
            let ServiceReqDetials = {
                tableName: commonNames.services,
                tableContent: {

                    Created_Date: '"' + calculateHelpers.dateFormat(txtDate.value) + '"',
                    Stock: '"' + txtIMEI.value + '"',
                    Sale_Route: '"' + txtRoute.value + '"',
                    Service_Agent: '"' + txtServiceAgent.value + '"',
                    Status: `"${newStatus}"`,
                    Other: '"' + txtOtherDesc.value + '"',
                    CSR_No: '"' + txtCSR.value + '"'
                }
            }
        

            ipcRenderer.invoke("SaveToDb", ServiceReqDetials).then((newServiceID) => {

                saveNewUpdates = {
                    tableName: commonNames.serviceStatus,
                    tableContent: {

                        Created_Date: '"' + toDay + '"',
                        Serv_Req: '"' + newServiceID + '"',
                        Status: '"' + newStatus + '"'

                    }
                }
                ipcRenderer.invoke("SaveToDb", saveNewUpdates)

                formResult.classList.remove('Error')
                formResult.classList.add('success')
                formResult.textContent = "All data has been saved!"
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                txtIMEI.focus()
                purchaseForm.reset()
                btnSave.disabled = false


            }).catch((err) => {

                btnSave.disabled = false

                formResult.classList.add('Error')
                formResult.classList.remove('success')
                formResult.textContent = 'Could not complete ' + err
                // formResult.textContent = 'data note saved ' + err
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                btnSave.disabled = false
            })

        }
        }

    }

    ipcRenderer.on('gotID', (key, res) => {
        serviceId = res
        txtSave.textContent = "Update"
        txtIMEI.disabled = true
        txtDate.disabled = true


        // fetch selected item detials 

        let fetchQuery = {
            tableName: commonNames.services + " , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute,
            tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'Stock', '${commonNames.services}'.'CSR_No', '${commonNames.services}'.'Service_Agent', '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Supplier_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.services}'.'Sale_Route' , '${commonNames.services}'.'Other', '${commonNames.services}'.'Status'`,
            where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id' AND ${commonNames.services}.'id' = ${serviceId}`

        }

        ipcRenderer.invoke("fetchFromDb", fetchQuery).then((Mobile) => {
            if (Mobile) {
                txtIMEI.value = Mobile.Stock
                txtCSR.value = Mobile.CSR_No
                txtBrand.value = Mobile.Brand_Name + " " + Mobile.Model_No
                txtSupplier.value = Mobile.Supplier_Name
                txtRoute.value = Mobile.Sale_Route
                txtServiceAgent.value = Mobile.Service_Agent
                txtOtherDesc.value = Mobile.Other
                currentStatus = Mobile.Status
                if (currentStatus == 1) {
                    ckCollect.checked = true}
                if (currentStatus == 2) {
                    ckHandover.checked = true; ckCollect.checked = true
                    ckCollect.disabled = true
                }
                if (currentStatus == 3) {
                    ckHandover.checked = true; ckCollect.checked = true ; ckReceived.checked = true
                    ckHandover.disabled = true; ckCollect.disabled = true}
                if (currentStatus == 4) {
                    ckHandover.checked = true; ckCollect.checked = true; ckReceived.checked = true; ckDelivered.checked = true
                    ckCollect.disabled = true; ckHandover.disabled = true; ckReceived.disabled = true}
                if (currentStatus == 5) {
                     ckDead.checked = true; ckCollect.checked = false
                    ckCollect.disabled = true; ckHandover.disabled = true; ckReceived.disabled = true; ckDelivered.disabled = false}

                // txtStatus.value = currentStatus
            }

        })



    })




    ckDead.onclick = () => {
        ckDead.checked ? divDeadReason.classList.remove('hideMe') : divDeadReason.classList.add('hideMe')

    }

    ckDelivered.onclick = () => {
        ckDelivered.checked ? divDeadReason.classList.remove('hideMe') : divDeadReason.classList.add('hideMe')

    }
    