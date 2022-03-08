module.exports = {

    dateFormat: (date) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        })
    }, datePickerFormat: (date) => {
         mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join("-");
    },
    serviceStatus: (status)=>{
        return new Promise((res, rej)=>{
             if(status ==1){
                 res('Processing')
             }else if (status ==2){
                res('Service')
             } else if (status ==3){
                res('Completed')
             }else if (status ==4){
                res('Delivered')
             } else{
                 rej('Wrong data')
             }
        })
    }
}