const { ipcRenderer } = require('electron')
const dataBase = require('./config/js/dbConfig')
let status

var $ = require('jquery');
const commonNames = require('./config/js/commonNames');
const calculateHelpers = require('./config/js/calculateHelpers');
var dt = require('datatables.net')();

// const bootstrap = require('bootstrap')

window.localStorage.Theme == 'Dark' ? document.getElementById("toggle-dark-mode").innerHTML = 'Light' : document.getElementById("toggle-dark-mode").innerHTML = "Dark"
document.getElementById('toggle-dark-mode').addEventListener('click', async () => {

  const isDarkMode = await ipcRenderer.invoke('dark-mode:toggle')
  // document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
  window.localStorage.Theme = isDarkMode ? 'Dark' : 'Light'


  document.getElementById("toggle-dark-mode").innerHTML = isDarkMode ? 'Light' : 'Dark';

})





rdStock.onclick = evt = () => {
  openThisPage = { Page: "/pages/purchase.html", Parent: "MainWindow", Width: "800", Height: "700" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}


rdPurchaseList.onclick = evt = () => {
  openThisPage = { Page: "/pages/InventoryList.html", Parent: "MainWindow", Width: "800", Height: "700" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdSalesRoute.onclick = evt = () => {
  openThisPage = { Page: "/pages/salesRoute.html", Parent: "MainWindow", Width: "700", Height: "600" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdAgent.onclick = evt = () => {
  openThisPage = { Page: "/pages/serviceAgent.html", Parent: "MainWindow", Width: "800", Height: "700" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdService.onclick = evt = () => {
  openThisPage = { Page: "/pages/newService.html", Parent: "MainWindow", Width: "800", Height: "600" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdReport.onclick = evt = () => {
  openThisPage = { Page: "/pages/Reports.html", Parent: "MainWindow", Width: "800", Height: "600" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

rdSettings.onclick = evt = () => {
  openThisPage = { Page: "/pages/settings.html", Parent: "MainWindow", Width: "800", Height: "580" }
  ipcRenderer.invoke('createNewWindow', openThisPage)
}

ServiceList()


function ServiceList() {

  let serviceList = {
    tableName: commonNames.services + " , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute,
    tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'Stock' , '${commonNames.services}'.'CSR_No' , '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route', '${commonNames.services}'.'Status'`,
    where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id'`

  }



  ipcRenderer.invoke("fetchAllDataFromDb", serviceList).then((Data) => {



    // data table work start


    let tableEditor = $('#serviceList').DataTable({
      dom: "Bfrtip",
      data: Data,
      rowId: "id",
      destroy: true,
      columns: [

        { data: 'Created_Date' },
        {
          data: null, render: function (data, type, row) {
            // Combine the first and last names into a single table field
            return data.Brand_Name + ' ' + data.Model_No;
          }
        },
        { data: 'Stock' },
        { data: 'CSR_No' },
        { data: 'Company_Name' },
        { data: 'Sale_Route' },
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
        },
      ],
      select: 'true',
    })

    $('#serviceList').on('click', 'tr', function () {
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

        let dialogMessage = {
          message: {
            type: 'question',
            buttons: ["Close", "Update", "View Detials"],
            message: "Do you wish to",
            title: "View or Update?"
          },
          quit: false
        }
        ipcRenderer.invoke("showMeError", dialogMessage).then((confirmed) => {
          if (confirmed.response == 1) {
            openThisPage = { Page: `/pages/newService.html`, Parent: "MainWindow", Width: "800", Height: "600", id: id }
            ipcRenderer.invoke('createNewWindow', openThisPage).then((par, res) => {

            })

          } else if (confirmed.response == 2) {
            openThisPage = { Page: `/pages/viewServiceStatus.html`, Parent: "MainWindow", Width: "800", Height: "600", id: id }
            ipcRenderer.invoke('createNewWindow', openThisPage)
          }
        })


      }
    })



//  change circle if service arrived too long

Data.forEach(element => {
  // console.log(element)
  if(element.Status != 4 && element.Status != 5 ){

    if (calculateHelpers.getNoOfDays(new Date(element.Created_Date),  new Date()) < 12) {
      
    }
  }
});


  })

}

rdService.classList.add('redCircle')

// updating circle detials
function circleDetials(Circle, input) {


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
  sum(case when Status = 5 then 1 else 0 end) as Dead,-- only count status 0

  count(*) as totals`,
  where: "`id` = `id`"
}

function updateCircle() {

  ipcRenderer.invoke("fetchFromDb", fetchSingQuery).then((gotDetials) => {
    let serviceStock = ((gotDetials.RcFromClnt + gotDetials.GotFromService) / gotDetials.totals) * 100
    circleDetials('crlTotalStock', serviceStock)
    let serviceCount = ((gotDetials.GaveToService) / gotDetials.totals) * 100
    circleDetials('crlTotalService', serviceCount)
    let completedCount = (gotDetials.Delivered / gotDetials.totals) * 100
    circleDetials('crlTotalDone', completedCount)
    let deadCount = (gotDetials.Dead / gotDetials.totals) * 100
    circleDetials('crlTotalDead', deadCount)
    lblTotalStock.innerHTML = gotDetials.RcFromClnt + gotDetials.GotFromService
    lblTotalService.innerHTML = gotDetials.GaveToService
    lblTotalDone.innerHTML = gotDetials.Delivered

    lblTotalDead.innerHTML = gotDetials.Dead
  })
}

updateCircle()

ipcRenderer.on('somethingUpdated', () => {
  updateCircle()
  ServiceList()
})




// customize menu
// window.addEventListener('contextmenu', (e) => {
//   e.preventDefault()
//   ipcRenderer.send('show-context-menu')
// })

// ipcRenderer.on('context-menu-command', (e, command) => {
//   const template = [
//         {
//           label: 'Menu Item 1',
//           click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
//         },
//         { type: 'separator' },
//         { label: 'Menu Item 2', type: 'checkbox', checked: true }
//       ]
//       const menu = Menu.buildFromTemplate(template)
//       menu.popup(BrowserWindow.fromWebContents(event.sender))
// })

