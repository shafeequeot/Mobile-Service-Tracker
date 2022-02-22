const { ipcRenderer } = require("electron")
const calculateHelpers = require("../config/js/calculateHelpers")
const commonNames = require("../config/js/commonNames")



btnCancel.onclick = evt =()=>{
    window.close()
}

ipcRenderer.on('gotID', (key, serviceId) => {
let serviceQuery = {
    tableName: commonNames.services +" , " + commonNames.purchase + ' , ' + commonNames.serviceAgent + ' , ' + commonNames.saleRoute,
    tableData: `'${commonNames.services}'.'id' , '${commonNames.services}'.'Created_Date' , '${commonNames.services}'.'Stock', '${commonNames.serviceAgent}'.'Company_Name' as Service_Agent, '${commonNames.purchase}'.'Brand_Name', '${commonNames.purchase}'.'Model_No', '${commonNames.serviceAgent}'.'Company_Name' , '${commonNames.saleRoute}'.'Sale_Route' , '${commonNames.services}'.'Other', '${commonNames.services}'.'Status'`,
    where: `'${commonNames.purchase}'.'IMEI' = ${commonNames.services}.'Stock' AND ${commonNames.services}.'Service_Agent' = ${commonNames.serviceAgent}.'id' AND ${commonNames.services}.'Sale_Route' = ${commonNames.saleRoute}.'id' AND ${commonNames.services}.'id' = ${serviceId}`
}
    ipcRenderer.invoke("fetchFromDb", serviceQuery).then((serviceDetials) => {

        document.getElementById('phoneName').innerHTML = serviceDetials.Brand_Name + ' ' + serviceDetials.Model_No
        document.getElementById('phoneIMEI').innerHTML = serviceDetials.Stock 
        document.getElementById('serviceAgent').innerHTML = serviceDetials.Service_Agent
        document.getElementById('saleRoute').innerHTML = serviceDetials.Sale_Route
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
        tableData: `'id' , 'Created_Date' , 'Serv_Req', 'Status'`,
        where: `Serv_Req = ${serviceId}`

    }

    ipcRenderer.invoke("fetchAllDataFromDb", statusDateHistory).then((statusHist) => {
        statusHist.forEach((statusElements, idx) => {
            
            console.log(statusElements.id)
            
          
    //         calculateHelpers.serviceStatus(Element.Status).then((result) => {
    //             const promoContent = `
    //                 <div class="card">
    //     <div class="flexGroup">
    //         <h3 id="Staff:" class="col-1">${Element.result}</h3>
    //     </div>
       
    //     <div class="flexGroup">
    //         <div class="col-1"><span class="AuxGray">Created on ${Element.Created_Date}</span></div>
           
    //         </div>
    //     </div>
    // </div>
    //               `;

    //             // Append newyly created card promoElement to the container
    //             divServiceHistory.innerHTML += promoContent;
    //             // Construct card content
    //         })
        })
    })
}