module.exports = {

    dateFormat: (date) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
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