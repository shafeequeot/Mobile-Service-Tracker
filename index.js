const { ipcRenderer } = require('electron')
const dataBase = require('./config/js/dbConfig')

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


var circle = document.getElementById('crlTotalStock');
var radius = circle.r.baseVal.value;
var circumference = radius * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;

function setProgress(percent) {
  const offset = circumference - percent / 100 * circumference;
  circle.style.strokeDashoffset = offset;
}


// dataBase.then((res)=>{
//   alert('okey')
// })

const input = 55
setProgress(input);

// input.addEventListener('change', function(e) {
//   if (input.value < 101 && input.value > -1) {
//     setProgress(input.value);
//   }  
// })


rdStock.onclick = evt = () =>{
  openThisPage = { Page: "/pages/purchase.html", Parent: "MainWindow", Width: "800", Height: "700" }
    ipcRenderer.invoke('createNewWindow', openThisPage)
}


rdSalesMen.onclick = evt = () =>{
  openThisPage = { Page: "/pages/Client.html", Parent: "MainWindow", Width: "800", Height: "700" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdSalesRoute.onclick = evt = () =>{
  openThisPage = { Page: "/pages/salesRoute.html", Parent: "MainWindow", Width: "700", Height: "500" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdAgent.onclick = evt = () =>{
  openThisPage = { Page: "/pages/serviceAgent.html", Parent: "MainWindow", Width: "800", Height: "700" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdService.onclick = evt = () =>{
  openThisPage = { Page: "/pages/newService.html", Parent: "MainWindow", Width: "800", Height: "570" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}






function ServiceList(){

  let serviceList = {
    tableName: commonNames.services +" , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute,
    tableData: `'${commonNames.services}'.'id' ,'${commonNames.services}'.'Created_Date' , '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route', '${commonNames.services}'.'Status'`,
    where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'Sale_Route'`

}


ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((membData) => {})


  $(document).ready( function () {
    var data = [
        [
            "Tiger Nixon",
            "System Architect",
            "Edinburgh",
            "5421",
            "2011/04/25",
            "$3,120"
        ],
        [
            "Garrett Winters",
            "Director",
            "Edinburgh",
            "8422",
            "2011/07/25",
            "$5,300"
        ]
    ]






      $('#table_id').DataTable({
        data: data,
         });
    
    } );


}


// data table work start
