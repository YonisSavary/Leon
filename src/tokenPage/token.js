const fs = require("fs")
const jquery = require("jquery")
const { ipcRenderer } = require("electron")

const inputTokenSection = "#inputTokenSection"
const loadingSection    = "#loadingSection"
const okButton          = "#okButton";
const tokenInput        = "#tokenInput";
const stateSpan         = "#stateSpan";

let userToken = "";
//fEVRDfGKToFUfcjHifdaDfSKIUZNSbYHvquDaOsV

async function checkToken (){
    jquery(stateSpan).text("Fetching Discogs to check...")
    jquery(okButton).hide()
    jquery(stateSpan).fadeIn()
    console.log("Fetching...")
    let url = "https://api.discogs.com/database/search?q=Nirvana&per_page=1&token="
    let fullUrl = url + jquery(tokenInput).val();
    // Sometimes Discogs API return an error message
    // Sometimes An Exception is thrown (error 401)
    try
    {
        let res = await fetch(fullUrl).then(res => res.json())
        console.log(res);
        if (res["results"])
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    catch(e)
    {
        return false;
    }
}

async function saveToken (){
    let isValid = await checkToken();
    if( isValid == true)
    {
        jquery(stateSpan).css("color", "green")
        jquery(stateSpan).text("Valid Token ! please wait...")
        fs.writeFileSync("api.json", JSON.stringify({
            token: jquery(tokenInput).val()
        }))
        userToken = jquery(tokenInput).val();
        endWindow()
    }
    else
    {
        jquery(stateSpan).css("color", "red")
        jquery(stateSpan).text("Invalid Token !")
        jquery(okButton).fadeIn()
    }
}

const buildInputMenu = ()=>{
    jquery(loadingSection).fadeOut(200)
    setTimeout(()=>{jquery(inputTokenSection).fadeIn(200)}, 200);
    jquery(okButton).on("click", saveToken)
}

const endWindow = ()=>{
    ipcRenderer.send("token-register", userToken)
    jquery("body").fadeOut(200)
    setTimeout(()=>{
        window.location.href= `file://${__dirname}/../tagsPage/tags.html`;
    }, 200);
    
}

if (fs.existsSync("api.json")) 
{
    console.log("api.json exists")
    let config = JSON.parse(fs.readFileSync("api.json").toString());
    console.log(config)
    if (!config["token"])
    {
        buildInputMenu()
    }
    else 
    {
        userToken = config["token"];
        setTimeout(endWindow, 1000);
    }
}
else 
{
    console.log("api.json does not exists")
    buildInputMenu()
}