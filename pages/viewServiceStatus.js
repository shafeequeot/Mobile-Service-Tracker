const { ipcRenderer } = require("electron")
const calculateHelpers = require("../config/js/calculateHelpers")
const commonNames = require("../config/js/commonNames")



btnCancel.onclick = evt =()=>{
    window.close()
}

ipcRenderer.on('gotID', (key, serviceId) => {
let serviceQuery = {
    tableName: commonNames.services +" , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute + ' , ' + commonNames.client,
    tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'Stock', '${commonNames.services}'.'CSR_No', '${commonNames.serviceAgent}'.'Company_Name' as Service_Agent, '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.client}'.'Client_Name', '${commonNames.client}'.'Location', '${commonNames.client}'.'Contact','${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route' , '${commonNames.services}'.'Other', '${commonNames.services}'.'Status'`,
    where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id' AND ${commonNames.services}.'id' = ${serviceId} AND '${commonNames.client}'.'id' = '${commonNames.services}'.'Client'`
}
    ipcRenderer.invoke("fetchFromDb", serviceQuery).then((serviceDetials) => {


clientName.innerHTML = serviceDetials.Client_Name
lblContact.innerHTML = serviceDetials.Contact
lblRoute.innerHTML = serviceDetials.Sale_Route
lblAddress.innerHTML = serviceDetials.Location
lblAgent.innerHTML = serviceDetials.Service_Agent
tblCSR.innerHTML = serviceDetials.CSR_No
tblModel.innerHTML = serviceDetials.Brand_Name + ' ' + serviceDetials.Model_No
tblIMEI.innerHTML = serviceDetials.Stock
tblRemarks.innerHTML = serviceDetials.Other
        
   
          calculateHelpers.serviceStatus(serviceDetials.Status).then((res)=>{
            document.getElementById('currentStatus').innerHTML = res
        }) 
        
        
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
        
        statusHist.forEach((statusElements, idx) => {
            lblDate.innerHTML = statusElements.Created_Date
            lblReason.innerHTML = "Reason: " + statusElements.Description
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



// print rejection report

btnRej.onclick = evt = ()=>{
    currentStatus.innerHTML = "Rejected"
    window.print()
}