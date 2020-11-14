const jquery = require("jquery");
const { ipcRenderer } = require("electron");

let fl = [];
let fileSelect = document.querySelector("#fileSelect")
let fileListSection = document.querySelector("#fileListSection")
let fileListHtml = document.querySelector("#fileListHtml")

function cancel(){
    ipcRenderer.send("previous");
}

function listFiles(){
    let fileListTemp = fileSelect.files;
    for (let i=0; i<fileListTemp.length; i++){
        fl.push({ 
            "name":fileListTemp[i].name,
            "path":fileListTemp[i].path 
        })
    }
    fl = fl.filter(elem => elem.name.indexOf(".mp3") != -1 );
    fileListHtml.innerHTML = `
        <li>${fl.map(elem => elem.name).join("</li><li>")}</li>
    `
    jquery(".onlyWithFiles").fadeIn(200);
}

function confirm()
{
    ipcRenderer.send("files-register", fl);
    jquery("body").fadeOut(200)
    setTimeout(()=>{ ipcRenderer.send("next"); }, 200);
}

jquery(".onlyWithFiles").hide();
fileSelect.onchange = listFiles