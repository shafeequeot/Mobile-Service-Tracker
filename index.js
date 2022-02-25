const { ipcRenderer } = require('electron')
const dataBase = require('./config/js/dbConfig')
let status 

var $  = require( 'jquery' );
const commonNames = require('./config/js/commonNames');
var dt = require( 'datatables.net' )();

// const bootstrap = require('bootstrap')

window.localStorage.Theme ? document.getElementById("toggle-dark-mode").innerHTML = window.localStorage.Theme : document.getElementById("toggle-dark-mode").innerHTML = "Dark"
document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
 
  const isDarkMode = await ipcRenderer.invoke('dark-mode:toggle')
  // document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
  window.localStorage.Theme = isDarkMode ? 'Dark'  : 'Light'
 
    
    document.getElementById("toggle-dark-mode").innerHTML = window.localStorage.Theme;
  
})





rdStock.onclick = evt = () =>{
  openThisPage = { Page: "/pages/purchase.html", Parent: "MainWindow", Width: "800", Height: "700" }
    ipcRenderer.invoke('createNewWindow', openThisPage)
}


rdPurchaseList.onclick = evt = () =>{
  openThisPage = { Page: "/pages/InventoryList.html", Parent: "MainWindow", Width: "800", Height: "700" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdSalesRoute.onclick = evt = () =>{
  openThisPage = { Page: "/pages/salesRoute.html", Parent: "MainWindow", Width: "700", Height: "600" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdAgent.onclick = evt = () =>{
  openThisPage = { Page: "/pages/serviceAgent.html", Parent: "MainWindow", Width: "800", Height: "700" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdService.onclick = evt = () =>{
  openThisPage = { Page: "/pages/newService.html", Parent: "MainWindow", Width: "800", Height: "600" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}



ServiceList()


function ServiceList(){

  let serviceList = {
    tableName: commonNames.services +" , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute,
    tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route', '${commonNames.services}'.'Status'`,
    where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id'`

}



ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {
    
  // data table work start
  
  
  let tableEditor =    $('#serviceList').DataTable({
    dom: "Bfrtip",
        data: Data,
        rowId: "id",
        destroy: true,
        columns: [
          
          { data: 'Created_Date' },
          { data: null, render: function ( data, type, row ) {
            // Combine the first and last names into a single table field
            return data.Brand_Name+' '+data.Model_No;
        } }, 
          { data: 'Company_Name' },
          { data: 'Sale_Route' },
          { data: null, render: function (data, type, row){
            
 if (data.Status == 1 )  {
   status = 'Processing'
} else if (data.Status == 2 ) 
{status = 'Service'
} else if (data.Status == 3) {
  status = 'Completed'
} else status = 'Delivered'
 return status
          } },
      ],
      select: 'true',
         })

         $('#serviceList').on( 'click', 'tr', function () {
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



// updating circle detials
function circleDetials(Circle, input){


  var circle = document.getElementById(Circle);
  var radius = circle.r.baseVal.value;
  var circumference = radius * 2 * Math.PI;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = `${circumference}`;
  
  function setProgress(percent) {
    const offset = circumference - percent / 100 * circumference;
    circle.style.strokeDashoffset = offset;
  }
  
  
 
  
  setProgress(input);
  
 



}









let fetchSingQuery = {
  tableName: commonNames.services,
  tableData: `sum(case when Status = 1 then 1 else 0 end) as RcFromClnt,  
  sum(case when Status = 2 then 1 else 0 end) as GaveToService,-- only count status 0
  sum(case when Status = 3 then 1 else 0 end) as GotFromService,-- only count status 0
  sum(case when Status = 4 then 1 else 0 end) as Delivered,-- only count status 0
  count(*) as totals`,
  where: "`id` = `id`"
}

function updateCircle(){

  ipcRenderer.invoke("fetchFromDb", fetchSingQuery).then((gotDetials) => {
    circleDetials('crlTotalStock','100')
  let serviceCount = ( (gotDetials.RcFromClnt + gotDetials.GaveToService + gotDetials.GotFromService) / gotDetials.totals )*100
  circleDetials('crlTotalService',serviceCount)
  let completedCount = ( gotDetials.Delivered / gotDetials.totals )*100
  circleDetials('crlTotalDone',completedCount)
    console.log(gotDetials)
    lblTotalStock.innerHTML = gotDetials.totals
    lblTotalService.innerHTML = gotDetials.RcFromClnt + gotDetials.GaveToService + gotDetials.GotFromService
    lblTotalDone.innerHTML = gotDetials.Delivered
  })
}

updateCircle()

ipcRenderer.on('somethingUpdated',()=>{
  updateCircle()
  ServiceList()
})




// customize menu
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  ipcRenderer.send('show-context-menu')
})

ipcRenderer.on('context-menu-command', (e, command) => {
  // ...
})

// main
ipcMain.on('show-context-menu', (event) => {
  const template = [
    {
      label: 'Menu Item 1',
      click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
    },
    { type: 'separator' },
    { label: 'Menu Item 2', type: 'checkbox', checked: true }
  ]
  const menu = Menu.buildFromTemplate(template)
  menu.popup(BrowserWindow.fromWebContents(event.sender))
})