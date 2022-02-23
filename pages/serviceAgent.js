const { ipcRenderer } = require("electron");
const calculateHelpers = require("../config/js/calculateHelpers");
const commonNames = require("../config/js/commonNames");
var $ = require('jquery');
var dt = require('datatables.net')();
let tableEditor, agentId
let toDay = calculateHelpers.dateFormat(new Date())
btnCancel.onclick = evt = () => {
    window.close()
}

//   save or update the data to db on save button click

btnSave.onclick = evt => {

    evt.preventDefault();
    if (txtSave.textContent == "Update") {
        // updating datas 
        txtSave.textContent = "Updating.."
        btnSaveLoader.classList.add('loader')

        if (txtAgent.value === '0') {
            formResult.classList.add('Error')
            formResult.textContent = "Select sales route"
            btnSaveLoader.classList.remove('loader')
            txtSave.textContent = "Save"
            txtAgent.focus()
        } else {
            btnSave.disabled = true
            let updateThis = {
                tableName: `${commonNames.serviceAgent}`,
                setContent: [

                    `'Company_Name' = '${txtAgent.value}',
                    'Contact_Person' = '${txtPerson.value}',
                    'Location' = '${txtLocation.value}',
                    'Contact' = '${txtPhone.value}'
                    `
                ],

                where: `id` + ` = '${agentId}'`
            }

            ipcRenderer.invoke("UpdateToDb", updateThis).then(() => {
                formResult.classList.remove('Error')
                formResult.classList.add('success')
                formResult.textContent = "All data has been updated!"
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                purchaseForm.reset()
                txtAgent.focus()
                btnSave.disabled = false
                
                   tableList()
            })
        }
    } else {
        //  saving datas 

        if (txtAgent.value === '') {
            formResult.classList.add('Error')
            formResult.textContent = "Agent name is manditory"
            btnSaveLoader.classList.remove('loader')
            txtSave.textContent = "Save"
            txtAgent.focus()

        } else {
            txtSave.textContent = "Saving.."
            btnSaveLoader.classList.add('loader')

            if (txtAgent.value === '') {
                formResult.classList.add('Error')
                formResult.textContent = "Agent name is manditory"
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                txtAgent.focus()

            } else {

                btnSave.disabled = true
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
                    btnSave.disabled = false
                   
                    tableList()

                }).catch((err) => {

                    btnSave.disabled = false

                    formResult.classList.add('Error')
                    formResult.classList.remove('success')
                    formResult.textContent = 'Could not save.. try again ' + err
                    btnSaveLoader.classList.remove('loader')
                    txtSave.textContent = "Save"
                    btnSave.disabled = false
                })
            }
        }
    }
}




// data table
tableList()


function tableList() {

    let serviceList = {
        tableName: commonNames.serviceAgent,
        tableData: `*`,
        where: `id = id ORDER BY id ASC`

    }



    ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {
        
        // data table work start
        tableEditor = $('#serviceAgent').DataTable({
            dom: "Brtip",
            data: Data,
            destroy: true,
            rowId: "id",
            "pageLength": 5,
            columns: [

                { data: 'Company_Name' },
                { data: 'Contact' },
                { data: 'Contact_Person' },
                { data: 'Location' },
            ],
            select: 'true',
        })
       
        $('#serviceAgent').on('click', 'tr', function () {
            // Get the rows id value
            var id = tableEditor.row(this).id();
            // Filter for only numbers
            // Transform to numeric value
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            }
            else {
                tableEditor.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }
            if (id) {

                agentId = id
                let fetchSingQuery = {
                    tableName: commonNames.serviceAgent,
                    tableData: "*",
                    where: "`id` = '" + id + "'"
                }

                ipcRenderer.invoke("fetchFromDb", fetchSingQuery).then((gotDetials) => {
                    console.log(gotDetials)
                    txtAgent.value = gotDetials.Company_Name
                    txtPerson.value = gotDetials.Contact_Person
                    txtPhone.value = gotDetials.Contact
                    txtLocation.value = gotDetials.Location
                    txtSave.textContent = "Update"

                })
            }

        });
       
    })
}

