const { ipcRenderer } = require("electron")
const commonNames = require("../config/js/commonNames")
var $ = require('jquery');
var dt = require('datatables.net')();
btnCancel.onclick = evt = () => {
  window.close()
}




ServiceList()


function ServiceList() {

  let serviceList = {
    tableName: commonNames.purchase,
    tableData: `*`,
    where: `id = id`

  }



  ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {

    // data table work start


    let tableEditor = $('#inventoryList').DataTable({
      dom: "Bfrtip",
      data: Data,
      rowId: "id",
      destroy: true,
      "columnDefs" : [{"targets":0, "type":"date"}],
      "order": [[ 0, "desc" ]],
      columns: [

        { data: 'Created_Date' },
        { data: 'Supplier_Name' },
        {
          data: null, render: function (data, type, row) {
            // Combine the first and last names into a single table field
            return data.Brand_Name + ' ' + data.Model_No;
          }
        },

        { data: 'IMEI' },
        { data: 'Inv_No' },
        { data: 'Other' },
        {
          data: null,
          className: "dt-center editor-delete",
          defaultContent: '<i class="link fa fa-edit"/>',
          orderable: false
        }
      ],
      select: 'true',
    })


    


  })

}

$('#inventoryList').on('click', 'td.editor-delete', function (e) {
  e.preventDefault();


  let dialogMessage = {
    message: {
      type: 'error',
      buttons: ["No", "Edit"],
      message: "Are your sure to edit?",
      title: "Are you sure?",
      cancelId: '0'
    },
    quit: false
  }
  ipcRenderer.invoke("showMeError", dialogMessage).then((confirmed) => {
    console.log(confirmed)
    if (confirmed.response==1) {

     window.location = `./purchase.html?id= ${$(this).closest('tr')[0].id}`
      // ServiceList()

    }
  })


});