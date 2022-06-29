const { ipcRenderer } = require('electron');
var $ = require('jquery');
const  Tabulator  = require('tabulator-tables');

const calculateHelpers = require('../config/js/calculateHelpers');
const commonNames = require('../config/js/commonNames');
var dt = require('datatables.net')();
let tableEditor, serviceList

btnCancel.onclick = () => {
    window.close()
}

var table


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

    let serviceClientQuery = {
        tableName: commonNames.client,
        tableData: `id, Client_Name`,
        where: ` id = id ORDER BY "id" DESC`
    }

    Promise.all([ipcRenderer.invoke("fetchAllDataFromDb", salesRouteQuery), ipcRenderer.invoke("fetchAllDataFromDb", serviceAgentQuery),
    ipcRenderer.invoke("fetchAllDataFromDb", serviceClientQuery)]).then((List) => {

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

        txtClient.textContent = ''
        txtClient.add(new Option('Select Client', '0'))
        List[2].forEach((element, idx) => {
            txtClient.add(new Option(element.Client_Name, element.id))
        })

    })
}



biringtoCompoBox()



btnCSRSearch.onclick = () => {

    let month = dtCSRMonth.value.split(' - ')
    if (dtCSRMonth.value) month = `AND  '${commonNames.services}'.'Created_Date' BETWEEN DATE('${calculateHelpers.datePickerFormat(month[0])}') AND DATE('${calculateHelpers.datePickerFormat(month[1])}')`
    else month = ''
    serviceList = {
        tableName: commonNames.services + " , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute + ' , ' + commonNames.client,
        tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'CSR_No' , '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.client}'.'Client_Name', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route', '${commonNames.services}'.'Status'`,
        where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id' AND  ${commonNames.client}.'id' = ${commonNames.services}.'Client' AND '${commonNames.services}'.'CSR_No' = ${txtCSRNo.value ? txtCSRNo.value : 0} ${month}`

    }

    let processing = 0, completed = 0, deadPhone = 0, count = 0
    ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {
        //    console.log(Data.length)
        if (Data.length == 0) {
            lblCSRNo.innerHTML = "N/a "
            lblSalesRoute.innerHTML = "N/a "

            lblProcessing.innerHTML = "N/a"
            lblCompleted.innerHTML = "N/a"
            lblTotalDevice.innerHTML = "N/a"
            lblDead.innerHTML = "N/a"
        } else {


            Data.forEach((singData, ind) => {
                lblCSRNo.innerHTML = singData.CSR_No + " "
                lblSalesRoute.innerHTML = singData.Sale_Route + " "
                if (singData.Status == 1) processing += 1
                else if (singData.Status == 2) processing += 1
                else if (singData.Status == 3) processing += 1
                lblProcessing.innerHTML = processing
                lblCompleted.innerHTML = singData.Status == 4 ? completed += 1 : completed
                lblTotalDevice.innerHTML = count += 1
                lblDead.innerHTML = singData.Status == 5 ? deadPhone += 1 : deadPhone
            })
        }
        // data table 1
        loadTable(Data)

    })


}



// service agent search 

btnAgentSearch.onclick = () => {
    let month = dtAgentMonth.value.split(' - ')
    if (dtAgentMonth.value) month = `AND  '${commonNames.services}'.'Created_Date' BETWEEN DATE('${calculateHelpers.datePickerFormat(month[0])}') AND DATE('${calculateHelpers.datePickerFormat(month[1])}')`
    else month = ''
     serviceList = {
        tableName: commonNames.services + " , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute + ' , ' + commonNames.client,
        tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'CSR_No' , '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.client}'.'Client_Name', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route', '${commonNames.services}'.'Status'`,
        where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id' AND  ${commonNames.client}.'id' = ${commonNames.services}.'Client' AND '${commonNames.services}'.'Service_Agent' = ${txtServiceAgent.value ? txtServiceAgent.value : 0} ${month}`

    }

    let processing = 0, completed = 0, deadPhone = 0, count = 0
    ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {
        //    console.log(Data.length)
        if (Data.length == 0) {
            lblCSRNo.innerHTML = "N/a "
            lblSalesRoute.innerHTML = "N/a "

            lblProcessing.innerHTML = "N/a"
            lblCompleted.innerHTML = "N/a"
            lblTotalDevice.innerHTML = "N/a"
            lblDead.innerHTML = "N/a"
        } else {

            lblfilterType.innerHTML = "Agent Name"
            Data.forEach((singData, ind) => {
                lblCSRNo.innerHTML = singData.Company_Name + " "
                lblSalesRoute.innerHTML = singData.Sale_Route + " "
                if (singData.Status == 1) processing += 1
                else if (singData.Status == 2) processing += 1
                else if (singData.Status == 3) processing += 1
                lblProcessing.innerHTML = processing
                lblCompleted.innerHTML = singData.Status == 4 ? completed += 1 : completed
                lblTotalDevice.innerHTML = count += 1
                lblDead.innerHTML = singData.Status == 5 ? deadPhone += 1 : deadPhone
            })
        }
        // data table 1
        loadTable(Data)
    })


}



// Sales route filter
btnSalesSearch.onclick = () => {
    let month = dtSalesMonth.value.split(' - ')
    if (dtSalesMonth.value) month = `AND  '${commonNames.services}'.'Created_Date' BETWEEN DATE('${calculateHelpers.datePickerFormat(month[0])}') AND DATE('${calculateHelpers.datePickerFormat(month[1])}')`
    else month = ''
     serviceList = {
        tableName: commonNames.services + " , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute + ' , ' + commonNames.client,
        tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'CSR_No' , '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.client}'.'Client_Name', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route', '${commonNames.services}'.'Status'`,
        where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id' AND  ${commonNames.client}.'id' = ${commonNames.services}.'Client' AND '${commonNames.services}'.'Sale_Route' = ${txtRoute.value ? txtRoute.value : 0} ${month}`

    }

    let processing = 0, completed = 0, deadPhone = 0, count = 0
    ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {
           console.log(Data)
        if (Data.length == 0) {
            resetForm()
        } else {

            lblfilterType.innerHTML = "Sales Route"
            Data.forEach((singData, ind) => {
                lblCSRNo.innerHTML = singData.Sale_Route + " "
                lblSalesRoute.innerHTML = singData.Sale_Route + " "
                if (singData.Status == 1) processing += 1
                else if (singData.Status == 2) processing += 1
                else if (singData.Status == 3) processing += 1
                lblProcessing.innerHTML = processing
                lblCompleted.innerHTML = singData.Status == 4 ? completed += 1 : completed
                lblTotalDevice.innerHTML = count += 1
                lblDead.innerHTML = singData.Status == 5 ? deadPhone += 1 : deadPhone
            })
        }
        // data table 1
        loadTable(Data)
        // hide pagination while print
    })


}


// cleint filter report search
txtClientSearch.onclick = evt = ()=>{

    let month = txtClientDate.value.split(' - ')
    if (txtClientDate.value) month = `AND  '${commonNames.services}'.'Created_Date' BETWEEN DATE('${calculateHelpers.datePickerFormat(month[0])}') AND DATE('${calculateHelpers.datePickerFormat(month[1])}')`
    else month = ''
   let  serviceList = {
        tableName: commonNames.services + " , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute  + ' , ' + commonNames.client, 
        tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'CSR_No' , '${commonNames.purchase}'.'Brand_Name','${commonNames.client}'.'Client_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route', '${commonNames.services}'.'Status'`,
        where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id' AND  ${commonNames.client}.'id' = ${commonNames.services}.'Client' AND '${commonNames.services}'.'Client' = ${txtClient.value ? txtClient.value : 0} ${month}`
        
    }


    let processing = 0, completed = 0, deadPhone = 0, count = 0
    ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {
        if (Data.length == 0) {
            lblCSRNo.innerHTML = " "
            lblSalesRoute.innerHTML = "N/a "
            
            lblProcessing.innerHTML = "N/a"
            lblCompleted.innerHTML = "N/a"
            lblTotalDevice.innerHTML = "N/a"
            lblDead.innerHTML = "N/a"
        } else {

            lblfilterType.innerHTML = ""
            Data.forEach((singData, ind) => {
                lblCSRNo.innerHTML =  " "
                lblSalesRoute.innerHTML = singData.Sale_Route + " "
                if (singData.Status == 1) processing += 1
                else if (singData.Status == 2) processing += 1
                else if (singData.Status == 3) processing += 1
                lblProcessing.innerHTML = processing
                lblCompleted.innerHTML = singData.Status == 4 ? completed += 1 : completed
                lblTotalDevice.innerHTML = count += 1
                lblDead.innerHTML = singData.Status == 5 ? deadPhone += 1 : deadPhone
            })
        }
        // data table 1
        
        loadTable(Data)
        // hide pagination while print
        
    })

}


// create data table
function loadTable(Data){
    const productName = function(value, data){
        return data.Brand_Name + ' ' + data.Model_No
    }

    const checkStatus = function(cell){
        let Status = cell.getValue()
        if (Status == 1) {
            status = 'Processing'
        } else if (Status == 2) {
            status = 'Service'
        } else if (Status == 3) {
            status = 'Completed'
        } else if (Status == 4) {
            status = '<span class="Success">Delivered <i class="fa-solid fa-check"></i> </span>'
        } else status = '<span class="Error">Dead  </span>'
        return "<strong>" + status + "</strong>"
    }
     table = new Tabulator("#reportTable", {
        data:Data, //assign data to table
        layout:"fitColumns", //fit columns to width of table (optional)
        groupBy: "Brand_Name"  
        ,
        printAsHtml:true,
        columns:[ //Define Table Columns
            {title:"Item", field:"Brand_Name", mutator:productName, width:150},
            {title:"CSR No", field:"CSR_No"},
            {title:"Company Name", field:"Company_Name"},
            {title:"Sale Route", field:"Sale_Route", sorter:"date", hozAlign:"center"},
            {title:"Client", field:"Client_Name", sorter:"string", hozAlign:"center"},
            {title:"Status", field:"Status", sorter:"number",formatter:checkStatus, hozAlign:"center"},
        ],
   });
}




// date filter configrations
$(function() {
    $('input[name="txtClientDate"], input[name="dtSalesMonth"], input[name="dtAgentMonth"], input[name="dtCSRMonth"]').daterangepicker({
      opens: 'center',
      startDate: moment().startOf('month'),
      endDate: moment().endOf('month'),
      autoApply: true
    });

    
  });


  

  tab1.onclick = evt = ()=>{
    resetForm()
      lblfilterType.textContent = "CSR No."
  }

  tab2.onclick = evt = ()=>{
    resetForm()
    lblfilterType.textContent = "Agent"
}

tab3.onclick = evt = ()=>{
    resetForm()
    lblfilterType.textContent = "Route"
}

tab4.onclick = evt = ()=>{
   resetForm()
}



function resetForm(){
    lblCSRNo.innerHTML = " "
    lblSalesRoute.innerHTML = ""
    lblfilterType.textContent = ""
    lblProcessing.innerHTML = ""
    lblCompleted.innerHTML = ""
    lblTotalDevice.innerHTML = ""
    lblDead.innerHTML = ""
    reportTable.innerHTML =""
}

btnPrint.onclick = () => {
    table.print(false, true)
}