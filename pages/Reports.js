const { ipcRenderer } = require('electron');
var $ = require('jquery');
const calculateHelpers = require('../config/js/calculateHelpers');
const commonNames = require('../config/js/commonNames');
var dt = require('datatables.net')();
let tableEditor

btnCancel.onclick = ()=>{
    window.close()
}

btnPrint.onclick = () =>{
    window.print()
}


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
        txtRoute.add(new Option('Select route', '0'))
        List[0].forEach((element, idx) => {

            txtRoute.add(new Option(element.Sale_Route, element.id))
        })

        txtServiceAgent.textContent = ''
        txtServiceAgent.add(new Option('Select Agent', '0'))
        List[1].forEach((element, idx) => {

            txtServiceAgent.add(new Option(element.Company_Name, element.id))
        })

    })
}


    
    biringtoCompoBox()



btnCSRSearch.onclick = () =>{
    let month = dtCSRMonth.value.split('-')
     if (dtCSRMonth.value) month = `AND  '${commonNames.services}'.'Created_Date' likE '%${month[1]}/${month[0]}%'`
     else month = ''
    let serviceList = {
        tableName: commonNames.services +" , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute,
        tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'CSR_No' , '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route', '${commonNames.services}'.'Status'`,
        where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id' AND '${commonNames.services}'.'CSR_No' = ${txtCSRNo.value ? txtCSRNo.value : 0} ${month}`
    
    }
    
    let processing = 0, completed = 0, deadPhone = 0, count = 0
    ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {
       

Data.forEach((singData,ind)=>{
    console.log(singData)
    lblCSRNo.innerHTML = singData.CSR_No + " "
    lblSalesRoute.innerHTML = singData.Sale_Route + " "
     if (singData.Status==1) processing += 1
     else if (singData.Status==2) processing += 1
     else if (singData.Status==3) processing += 1
     lblProcessing.innerHTML = processing
    lblCompleted.innerHTML = singData.Status == 4 ? completed += 1 : completed
    lblTotalDevice.innerHTML = count +=1
    lblDead.innerHTML = singData.Status == 5 ? deadPhone += 1 : deadPhone
})

        // data table 1
     tableEditor = $('#CSRTable').DataTable({
        dom: "Brtip",
        "pageLength": 6,
        data: Data,
        destroy: true,
        rowId: "id",
        columns: [
          
            { data: 'Created_Date' },
            { data: null, render: function ( data, type, row ) {
              // Combine the first and last names into a single table field
              return data.Brand_Name+' '+data.Model_No;
          } }, 
          { data: 'CSR_No' },
  
            { data: 'Company_Name' },
            { data: 'Sale_Route' },
            { data: null, render: function (data, type, row){
              
   if (data.Status == 1 )  {
     status = 'Processing'
  } else if (data.Status == 2 ) 
  {status = 'Service'
  } else if (data.Status == 3) {
    status = 'Completed'
  } else if (data.Status == 4) {
    status = '<span class="Success">Delivered <i class="fa-solid fa-check"></i> </span>'
  } else status = '<span class="Error">Dead  </span>'
   return "<strong>" + status + "</strong>"
            } },
        ],
        select: 'true',
        fixedHeader: true,
        "bAutoWidth": false,
    })
})


}




 