const fs = require('fs-extra')
module.exports = {

    dateFormat: (date) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }, datePickerFormat: (date) => {
         mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join("-");
    },
    getNoOfDays: (date1, date2)=>{
        var Difference_In_Time = date2.getTime() - date1.getTime();
  
// To calculate the no. of days between two dates
var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            return Math.round(Difference_In_Days - 1)
        
        
       
    },
    serviceStatus: (status)=>{
        return new Promise((res, rej)=>{
             if(status ==1){
                 res('Processing')
             }else if (status ==2){
                res('Service')
             } else if (status ==3){
                res('Ready')
             }else if (status ==4){
                res('Delivered')
             }else if (status ==5){
                res('Dead')
             } else{
                 rej('Wrong data')
             }
        })
    },
    dbPath: ()=>{
        return new Promise((res, rej)=>{
           
                let dbConfigPath =  window.localStorage.dbConfigPath
                fs.readJSON(dbConfigPath).then(gotPath =>{
                res(gotPath)

            })
        })
    }
}