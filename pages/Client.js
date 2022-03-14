const { ipcRenderer } = require("electron")
const calculateHelpers = require("../config/js/calculateHelpers")
const commonNames = require("../config/js/commonNames")
var $ = require('jquery');
var dt = require('datatables.net')();
let toDay = calculateHelpers.dateFormat(new Date())

btnCancel.onclick = evt = ()=>{
    window.close()
}


// display all sales route in compobox

let salesRouteQuery = {
    tableName: commonNames.saleRoute,
    tableData: `id, Sale_Route`,
    where: ` id = id ORDER BY "id" DESC`
}

ipcRenderer.invoke("fetchAllDataFromDb", salesRouteQuery).then((supllierList) => {
    txtRoute.textContent = ''
    txtRoute.add(new Option('Add New Route', '0'))
    supllierList.forEach((element, idx) => {
        
        txtRoute.add(new Option(element.Sale_Route, element.id))
    })
})



// add new sales route if not available

txtRoute.onchange = evt = (selected) => {
    if (txtRoute.options[txtRoute.selectedIndex].value == 0) {
       let dialogMessage = {
            message: {
                type: 'warning',
                buttons: ["Yes", "No"],
                message: "Do you really want to Create new supplier?",
                title: "Are you sure?"
            },
            quit: false
        }
        ipcRenderer.invoke("showMeError", dialogMessage).then((confirmed) => {
            if (!confirmed.response){
                openThisPage = { Page: `pages/salesRoute.html`, Parent: "MainWindow", Width: "700", Height: "650" }
                ipcRenderer.invoke('createNewWindow', openThisPage)  
                window.close()
            } 
        })

    }
}




//   save or update the data to db on save button click

btnSave.onclick = evt => {
    evt.preventDefault();
    if (txtClient.value === '') {
        formResult.classList.add('Error')
        formResult.textContent = "Client name is manditory"
        btnSaveLoader.classList.remove('loader')
        txtClient.focus()
    
    }else  if (txtRoute.value === '0') {
        formResult.classList.add('Error')
        formResult.textContent = "Select sale route"
        btnSaveLoader.classList.remove('loader')
        txtRoute.focus()
    } else if(txtSave.textContent === "Update"){
    // updating datas

    btnSave.disabled = true
    let updateThis = {
        tableName: `${commonNames.client}`,
        setContent: [

            `'Client_Name' = '${txtClient.value}',
            'Sale_Route' = '${txtRoute.value}',
            'Location' = '${txtLocation.value}',
            'Contact_Person' = '${txtContactPerson.value}',
            'Contact' = '${txtContactNo.value}',
            'Other' = '${txtOther.value}'

            `
        ],

        where: `id` + ` = '${routeId}'`
    }

    ipcRenderer.invoke("UpdateToDb", updateThis).then(() => {
        formResult.classList.remove('Error')
        formResult.classList.add('success')
        formResult.textContent = "All data has been updated!"
        btnSaveLoader.classList.remove('loader')
        txtSave.textContent = "Save"
        purchaseForm.reset()
        txtRoute.focus()
        btnSave.disabled = false
        
        clientList()
    })

}else{

    // saving datas 
    txtSave.textContent = "Saving.."
    btnSaveLoader.classList.add('loader')

        btnSave.disabled =  true
        let saveThisDetials = {
            tableName: commonNames.client,
            tableContent: {
                Created_Date: '"' + toDay + '"',
                Client_Name: '"' + txtClient.value + '"',
                Sale_Route: '"' + txtRoute.value + '"',
                Location: '"' + txtLocation.value + '"',
                Contact: '"' + txtContactNo.value + '"',
                Other: '"' + txtOther.value + '"',
                Contact_Person: '"' + txtContactPerson.value + '"'
            }
        }
        
       
            ipcRenderer.invoke("SaveToDb", saveThisDetials).then((newCompanyID) => {

                formResult.classList.remove('Error')
                formResult.classList.add('success')
                formResult.textContent = "All data has been saved!"
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                purchaseForm.reset()
                txtClient.focus()
                btnSave.disabled =  false
                clientList()
               
            }).catch((err)=>{
               
                btnSave.disabled =  false
                
                formResult.classList.add('Error')
                formResult.classList.remove('success')
                formResult.textContent = 'Could not save.. try again ' + err
                btnSaveLoader.classList.remove('loader')
                txtSave.textContent = "Save"
                btnSave.disabled =  false
            })
}
    
}

clientList()
     
// bring all data to data table
function clientList() {

    let clientList = {
      tableName: commonNames.client + ", " + commonNames.saleRoute,
      tableData: `'${commonNames.client}'.'Client_Name', '${commonNames.client}'.'Contact', '${commonNames.client}'.'Contact_Person' , 
      '${commonNames.client}'.'Created_Date', '${commonNames.client}'.'Location' , '${commonNames.client}'.'Other', '${commonNames.saleRoute}'.'Sale_Route' , '${commonNames.client}'.'id'`,
      where: `${commonNames.client}.Sale_Route = ${commonNames.saleRoute}.id`
  
    }
  
  
  
    ipcRenderer.invoke("fetchAllDataFromDb", clientList).then((Cleints) => {
  console.log(Cleints)
      // data table work start
    
      let tableEditor = $('#tblClientList').DataTable({
        dom: "Bfrtip",
        "pageLength": 5,
        data: Cleints,
        rowId: "id",
        destroy: true,
        columns: [
  
          { data: 'Client_Name' },
          { data: 'Sale_Route' },
          { data: 'Location' }, 
          { data: 'Contact_Person' },
          { data: 'Contact' },
          { data: 'Other' },
          
        ],
        select: 'true',
      })
  
  
      
      $('#tblClientList').on('click', 'tr', function () {
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
    
            routeId = id
            let fetchSingQuery = {
                tableName: commonNames.client,
                tableData: "*",
                where: "`id` = '" + id + "'"
            }
    
            ipcRenderer.invoke("fetchFromDb", fetchSingQuery).then((gotDetials) => {
                console.log(gotDetials)
                txtClient.value = gotDetials.Client_Name
                 txtRoute.value = gotDetials.Sale_Route
                txtContactNo.value = gotDetials.Contact
               txtOther.value = gotDetials.Other
               txtLocation.value = gotDetials.Location

                txtContactPerson.value = gotDetials.Contact_Person
                txtSave.textContent = "Update"
    
            })
        }
    
    })
  
    })

    
  
  }
  
  
  function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  }