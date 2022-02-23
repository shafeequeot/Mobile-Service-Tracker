const { ipcRenderer } = require("electron")
const commonNames = require("../config/js/commonNames")
var $ = require('jquery');
var dt = require('datatables.net')();
btnCancel.onclick = evt = () => {
    window.close()
}




ServiceList()


function ServiceList(){

  let serviceList = {
    tableName:  commonNames.purchase ,
    tableData: `*`,
    where: `id = id`

}



ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {
    
  // data table work start
  
  
  let tableEditor =    $('#inventoryList').DataTable({
    dom: "Bfrtip",
        data: Data,
        rowId: "id",
        columns: [
          
          { data: 'Created_Date' },
          { data: 'Supplier_Name' },
          { data: null, render: function ( data, type, row ) {
            // Combine the first and last names into a single table field
            return data.Brand_Name+' '+data.Model_No;
        } }, 
        
          { data: 'IMEI' },
          { data: 'Inv_No' },
          { data: 'Other'},
      ],
      select: 'true',
         })

         $('#inventoryList').on( 'click', 'tr', function () {
          // Get the rows id value
          var id = tableEditor.row( this ).id();
          // Filter for only numbers
          // Transform to numeric value
          if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
          tableEditor.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
          if(id){

            let dialogMessage = {
              message: {
                  type: 'warning',
                  buttons: ["Update", "View"],
                  message: "Do you wish to View or Update?",
                  title: "View or Update?"
              },
              quit: false
          }
          ipcRenderer.invoke("showMeError", dialogMessage).then((confirmed) => {
            console.log(confirmed)  
            if (!confirmed.response){
              openThisPage = { Page: `/pages/newService.html`, Parent: "MainWindow", Width: "800", Height: "600", id: id }
              ipcRenderer.invoke('createNewWindow', openThisPage).then((par, res)=>{
        
              })

              }else{
                openThisPage = { Page: `/pages/viewServiceStatus.html`, Parent: "MainWindow", Width: "800", Height: "600", id: id }
                ipcRenderer.invoke('createNewWindow', openThisPage)
              }
            })
          
          
          }
        });
})

}
