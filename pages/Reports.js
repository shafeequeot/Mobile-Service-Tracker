var $ = require('jquery');
var dt = require('datatables.net')();


btnCancel.onclick = ()=>{
    window.close()
}





 // data table work start
 tableEditor = $('#CSRTable').DataTable({
    dom: "Brtip",
    "pageLength": 5,
    // data: Data,
    // destroy: true,
    // rowId: "id",
    // "pageLength": 5,
    // columns: [

    //     { data: 'Sale_Route' },
    //     { data: 'Other' },

    // ],
    // select: 'true',
})