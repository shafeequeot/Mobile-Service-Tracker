const { ipcRenderer } = require("electron")
const commonNames = require("../config/js/commonNames")
var $ = require('jquery');
const calculateHelpers = require("../config/js/calculateHelpers");
var dt = require('datatables.net')();
btnCancel.onclick = evt = () => {
  window.close()
}


ipcRenderer.on('gotID', (key, filters) => {
    
  let serviceList = {
    tableName: commonNames.services + " , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute,
    tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'Stock' , '${commonNames.services}'.'CSR_No' , '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route', '${commonNames.services}'.'Status'`,
    where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id' AND ${filters}`



  }



  ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {
    console.log(Data)

    // data table 
    let tableEditor = $('#serviceList').DataTable({
        dom: "Bfrtip",
        data: Data,
        rowId: "id",
        destroy: true,
        columns: [
            { 
                // data: '' 

                data: null, render: function (data, type, row) {

                    days = calculateHelpers.getNoOfDays(new Date(data.Created_Date),   new Date())
                   return data.Created_Date +" (" + days +" Days ago)"
                  }

            },
          { data: 'CSR_No' },
          { data: 'Sale_Route' },
          { data: 'Stock' },
          { data: 'Company_Name' },
          {
            data: null, render: function (data, type, row) {

                if (data.Status == 1) {
                  status = 'Processing'
                } else if (data.Status == 2) {
                  status = 'Service'
                } else if (data.Status == 3) {
                  status = 'Ready'
                } else if (data.Status == 4) {
                  status = '<span class="Success">Delivered <i class="fa-solid fa-check"></i> </span>'
                } else status = '<span class="Error">Dead  </span>'
                return "<strong>" + status + "</strong>"
              }
          }
        ],
        select: 'true',
      })
  })
})







