const jquery = require("jquery")
const { ipcRenderer } = require("electron")

let filesList = document.querySelector("#filesList");
let tagsList = document.querySelector("#tagsList");
let confirmButton = document.querySelector("#confirmButton");

let tags = {}
let files = []

function buildTagsList(){
    tagsList.innerHTML =`
        <li>${tags.tracklist.join("</li><li>")}</li>
    `;
    jquery(tagsList).sortable()
}

function buildFilesList(){
    filesList.innerHTML =`
        <li>${files.map(elem => elem.name).join("</li><li>")}</li>
    `;
    jquery(filesList).sortable()
}

function buildAndValidate(){
    let files = [];
    let tags = [];
    let assoc = {};

    let filesHTML = document.querySelectorAll("#filesList li")
    for(let i=0; i<filesHTML.length; i++) files.push(filesHTML[i].innerText)
    let tagsHTML = document.querySelectorAll("#tagsList li");
    for(let i=0; i<tagsHTML.length; i++) tags.push(tagsHTML[i].innerText)
    
    if (tags.length > files.length) tags = tags.slice(0, files.length)

    for (let i=0; i<files.length; i++){
        assoc[files[i]] = tags[i] || files[i];
    }

    ipcRenderer.send("assoc-register", assoc)
    jquery("body").fadeOut(200);
    setTimeout(()=>{ ipcRenderer.send("next")}, 200);
}

function cancel(){
    ipcRenderer.send("previous");
}

ipcRenderer.on("tags-give", (event, args)=>{
    console.log("received tags");
    tags = args
    buildTagsList()
})

ipcRenderer.on("files-give", (event, args)=>{
    console.log("received files");
    files = args
    buildFilesList()
})

ipcRenderer.send("tags-ask");
ipcRenderer.send("files-ask");

confirmButton.onclick = buildAndValidate