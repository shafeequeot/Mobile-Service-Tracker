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
          defaultContent: '<i class="fa fa-trash"/>',
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
      buttons: ["Dont Delete", "Delete", "No"],
      message: "Are your sure to delete? Can't revert back",
      title: "Are you sure?"
    },
    quit: false
  }
  ipcRenderer.invoke("showMeError", dialogMessage).then((confirmed) => {
    console.log(confirmed)
    if (confirmed.response==1) {

      let deleteQuery = {
        tableName: `${commonNames.purchase}`,
        where: `id = ${$(this).closest('tr')[0].id}`
      }

      ipcRenderer.invoke("DeleteFromDb", deleteQuery).then((id) => {

        console.log(`has been Deleted!` + id)
        ServiceList()
      })

    }
  })


});