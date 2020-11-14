const jquery = require("jquery");
const { ipcRenderer } = require("electron");
const NodeID3 = require("node-id3");
const fs = require("fs")
// Used to download the album cover
const {promisify} = require('util');
const stream = require('stream');
const got = require("got");
const { dir } = require("console");
const pipeline = promisify(stream.pipeline);

let logsSection = document.querySelector("#logsSection");

let tags = {};
let assoc = {};
let files = [];
let token = "";

function log(logstr){
    logsSection.innerHTML += logstr + "\n"
}

async function validate(){
    let pathAssoc = {};
    files.forEach(elem =>{
        pathAssoc[elem.name] = elem.path;
    });

    fs.mkdir("tmp", ()=>{});

    log("Downloading Album cover...")
    await pipeline(
        got.stream(tags.cover),
        fs.createWriteStream("tmp/cover.png")
    );
     
    Object.keys(assoc).forEach( (file,i) =>{
        log("Applying tags to " + file + "...");
        let path = pathAssoc[file];
        
        let fileTags = {
            title: assoc[file],
            artist: tags.artist,
            album: tags.title,
            genre: tags.genre,
            APIC: "tmp/cover.png",
            TRCK: (i+1)
        }
        const succ = NodeID3.write(fileTags, path)

        let directory = path.substr(0, path.lastIndexOf("\\")) + "\\";
        let extension = path.substr(path.lastIndexOf("."), path.length);
        let twoDigitIndex = ("0" + i).slice(-2) ;
        let newName = directory + twoDigitIndex + " " + assoc[file] + extension;
        fs.rename(path, newName, ()=>{});
    })

    fs.unlinkSync("tmp/cover.png");
    fs.rmdirSync("tmp");

    log("Finished !")
    alert("Finished ! Thanks You For Using Leon !")
}

function displayTags(){
    console.log(tags, assoc)
    document.querySelector("#tagsCover").setAttribute("src", tags.cover);
    document.querySelector("#tagsTitle").innerHTML = tags.title
    document.querySelector("#tagsArtist").innerHTML = tags.artist
    document.querySelector("#tagsGenre").innerHTML = tags.genre
    document.querySelector("#tagsYear").innerHTML = tags.year
    let assocHtml = `<tr>
        <th>Transform</th>
        <th>=></th>
        <th>Into</th>
    </tr>
    `;
    Object.keys(assoc).forEach(key =>{
        assocHtml += `
            <tr>
                <td>${key}</td>
                <td>=></td>
                <td>${assoc[key]}</td>
            </tr>
        `
    });
    
    document.querySelector("#tagsTracklist").innerHTML = assocHtml 
}

ipcRenderer.on("tags-give", (evt, args)=>{
    tags = args
})

ipcRenderer.on("assoc-give", (evt, args)=>{
    assoc = args
})

ipcRenderer.on("files-give", (evt, args)=>{
    files = args
})

ipcRenderer.send("tags-ask")
ipcRenderer.send("assoc-ask")
ipcRenderer.send("files-ask")
setTimeout(displayTags, 50)