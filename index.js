const { ipcRenderer } = require('electron')
// const bootstrap = require('bootstrap')

window.localStorage.Theme ? document.getElementById("toggle-dark-mode").innerHTML = window.localStorage.Theme : document.getElementById("toggle-dark-mode").innerHTML = "Dark"
document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
 
  const isDarkMode = await ipcRenderer.invoke('dark-mode:toggle')
  // document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
  window.localStorage.Theme = isDarkMode ? 'Dark'  : 'Light'
 
    
    document.getElementById("toggle-dark-mode").innerHTML = window.localStorage.Theme;
  
})


var circle = document.querySelector('circle');
var radius = circle.r.baseVal.value;
var circumference = radius * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;

function setProgress(percent) {
  const offset = circumference - percent / 100 * circumference;
  circle.style.strokeDashoffset = offset;
}

const input = 55
setProgress(input);

// input.addEventListener('change', function(e) {
//   if (input.value < 101 && input.value > -1) {
//     setProgress(input.value);
//   }  
// })





