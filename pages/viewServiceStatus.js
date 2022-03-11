const { ipcRenderer } = require("electron")
const calculateHelpers = require("../config/js/calculateHelpers")
const commonNames = require("../config/js/commonNames")



btnCancel.onclick = evt =()=>{
    window.close()
}

ipcRenderer.on('gotID', (key, serviceId) => {
let serviceQuery = {
    tableName: commonNames.services +" , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute,
    tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'Stock', '${commonNames.services}'.'CSR_No', '${commonNames.serviceAgent}'.'Company_Name' as Service_Agent, '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route' , '${commonNames.services}'.'Other', '${commonNames.services}'.'Status'`,
    where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id' AND ${commonNames.services}.'id' = ${serviceId}`
}
    ipcRenderer.invoke("fetchFromDb", serviceQuery).then((serviceDetials) => {

        document.getElementById('phoneName').innerHTML = serviceDetials.Brand_Name + ' ' + serviceDetials.Model_No
        document.getElementById('phoneIMEI').innerHTML = serviceDetials.Stock 
        document.getElementById('serviceAgent').innerHTML = serviceDetials.Service_Agent
        document.getElementById('saleRoute').innerHTML = serviceDetials.Sale_Route
        document.getElementById('CSRNo').innerHTML = serviceDetials.CSR_No
          calculateHelpers.serviceStatus(serviceDetials.Status).then((res)=>{
            document.getElementById('currentStatus').innerHTML = res
        }) 
        document.getElementById('description').innerHTML = serviceDetials.Other
        
        bringPromotionDetials(serviceId)
    })

})



function bringPromotionDetials(serviceId) {

// bring status history
    let statusDateHistory = {
        tableName: commonNames.serviceStatus ,
        tableData: `*`,
        where: `"Serv_Req" = "${serviceId}" ORDER BY 'Created_Date' DESC`

    }
let eachStatus
    ipcRenderer.invoke("fetchAllDataFromDb", statusDateHistory).then((statusHist) => {
        console.log(statusHist)
        statusHist.forEach((statusElements, idx) => {
        
       if (statusElements.Status == 1) eachStatus = 'Received for Repair'
       else if (statusElements.Status == 2) eachStatus = 'Given to repair center'
       else if (statusElements.Status == 3) eachStatus = 'Received from rapair Center'
       else if (statusElements.Status == 4) eachStatus = 'Delivered to client' 
       else if (statusElements.Status == 5) eachStatus = 'Device is Dead' 

       else eachStatus = 'Not recorded' 
                const promoContent = `
                    <div class="card">
        <div class="flexGroup">
            <h3 id="Staff:" class="col-1">${eachStatus}</h3>
            
        </div>
      <div><span class="Error">${statusElements.Description? statusElements.Description : ""}</span></div>
   
        
            <div class="col-1"><span class="AuxGray">Dated on ${statusElements.Created_Date}</span></div>
           
        </div>
    </div>
                  `;

                // Append newyly created card promoElement to the container
                divServiceHistory.innerHTML += promoContent;
                // Construct card content
           
        })
    })
}