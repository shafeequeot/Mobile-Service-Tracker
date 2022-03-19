const { ipcRenderer } = require("electron");
const calculateHelpers = require("../config/js/calculateHelpers");
const commonNames = require("../config/js/commonNames");
var $ = require('jquery');
var dt = require('datatables.net')();
let toDay = calculateHelpers.dateFormat(new Date())
let routeId
btnCancel.onclick = evt = () => {
    // evt.preventDefault();
    window.close()
}


//   save or update the data to db on save button click

btnSave.onclick = evt => {

    evt.preventDefault();

    // updating datas
    if (txtSave.textContent == "Update") {
        if (txtRoute.value === '') {
            formResult.classList.add('Error')
            formResult.textContent = "Route name is manditory"
            btnSaveLoader.classList.remove('loader')
            txtSave.textContent = "Update"
            txtRoute.focus()

        } else {
            btnSave.disabled = true
            let updateThis = {
                tableName: `${commonNames.saleRoute}`,
                setContent: [

                    `'Sale_Route' = '${txtRoute.value}',
                    'Sl_No' = '${txtOther.value}'
                   
                    `
                ],

                where: `id` + ` = '${routeId}'`
            }

            ipcRenderer.invoke("UpdateToDb", updateThis).then(() => {
                formResult.classList.remove('Error')
                formResult.classList.add('success')
                formResult.textContent = "All data has been updated!"
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                purchaseForm.reset()
                txtRoute.focus()
                btnSave.disabled = false
                
                   tableList()
            })
        }

    } else {

        // saving datas
        txtSave.textContent = "Saving.."
        btnSaveLoader.classList.add('loader')

        if (txtRoute.value === '') {
            formResult.classList.add('Error')
            formResult.textContent = "Route name is manditory"
            btnSaveLoader.classList.remove('loader')
            txtSave.textContent = "Save"
            txtRoute.focus()

        } else {
            btnSave.disabled = true
            let saveThisDetials = {
                tableName: commonNames.saleRoute,
                tableContent: {
                    Created_Date: '"' + toDay + '"',
                    Sale_Route: '"' + txtRoute.value + '"',
                    Sl_No: '"' + txtOther.value + '"'
                }
            }


            ipcRenderer.invoke("SaveToDb", saveThisDetials).then((newCompanyID) => {

                formResult.classList.remove('Error')
                formResult.classList.add('success')
                formResult.textContent = "All data has been saved!"
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                purchaseForm.reset()
                btnSave.disabled = false
                tableList()

            }).catch((err) => {

                btnSave.disabled = false

                formResult.classList.add('Error')
                formResult.classList.remove('success')
                formResult.textContent = 'Could not save.. ' + err
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                btnSave.disabled = false
            })

        }

    }
}





tableList()

// data table 

function tableList() {

    let serviceList = {
        tableName: commonNames.saleRoute,
        tableData: `*`,
        where: `id = id ORDER BY id DESC`

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

                { data: 'Sale_Route' },
                { data: 'Sl_No' },

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

                routeId = id
                let fetchSingQuery = {
                    tableName: commonNames.saleRoute,
                    tableData: "*",
                    where: "`id` = '" + id + "'"
                }

                ipcRenderer.invoke("fetchFromDb", fetchSingQuery).then((gotDetials) => {
                    console.log(gotDetials)
                    txtRoute.value = gotDetials.Sale_Route
                    txtOther.value = gotDetials.Sl_No
                    txtSave.textContent = "Update"

                })
            }

        });

    })
}
