const { ipcRenderer } = require("electron")
const jquery = require("jquery")

let userToken = "";
let globalTags = {};
let tags = {};

let searchButton = document.querySelector("#searchButton")
let releaseName  = document.querySelector("#releaseName")
let resultsSection = document.querySelector("#resultsSection")
let confirmSection = document.querySelector("#confirmSection")

/**
 * Util function, filter a array with this one, 
 * and it keep only distincts items
 * @param {*} value 
 * @param {*} index 
 * @param {*} self 
 */
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function getArtistName(strArtist){
    return strArtist.replace(/ +\({1}[0-9]{1,}\){1}/gi,"")
}

/**
 * Build a Discogs API Url for search
 * Needed Parameters : token
 * @param {*} config 
 */
function buildSearchUrl(config){
    let URLParameter = [];
    Object.keys(config).forEach( key => {
        URLParameter.push(`${key}=${encodeURI(config[key])}`)
    })
    let options = URLParameter.join("&")
    return `https://api.discogs.com/database/search?${options}`;
}

function search(){
    console.log("Searching for " + releaseName.value)
    if (releaseName.value != "")
    {
        resultsSection.innerHTML = "";
        let url = buildSearchUrl({
            release_title: releaseName.value,
            token: userToken,
            per_page:40
        });
        console.log("---------------------------------------")
        console.log(`Fetching ${url}...`)
        jquery(resultsSection).show()
        resultsSection.innerHTML = "<h2>Recherche...</h2>";
        fetch(url)
        .then(res => res.json())
        .then(getMasterURLS)
        .then(buildMasterList)
    }
}

/**
 * Given a search results, this function
 * return all of the unique master_url
 * @param {*} data 
 */
function getMasterURLS(data){
    resultsSection.innerHTML = "";
    console.log("Filtering Master URLS...")
    let masterList = []
    data.results.forEach(release=>{
        masterList.push(release.master_url)
    });
    masterList = masterList.filter(onlyUnique);
    return masterList;
}

/**
 * Function called for each master releases found 
 * it fetch its content and build a section for 
 * the gui
 * @param {*} masterURL 
 */
async function fetchMasterAndBuild(masterURL){
    if (masterURL == null) return ;
    console.log(`Fetching for ${masterURL}...`)
    fetch(`${masterURL}?token=${userToken}`)
    .then(res => res.json())
    .then(data => {
        globalTags[data.id] = data;
        // Tranform 'Artist (number)' (given by Discogs) into 'Artist'
        let artistName = getArtistName(data.artists[0].name)
        resultsSection.innerHTML += `
            <div class="flex-row align-center clickable fading button" onclick="chooseTags(${data.id})">
                <img class="icon" src="${data.images[0].resource_url}">
                <h2 class="clickable">
                    ${getArtistName(data.artists[0].name)} - ${data.title}
                </h2>
            </div>
        `
    })
}

/**
 * Function triggered by a click on a master section
 * This function build the 'specificTags' variable which
 * contain the main informations we need, and build a 
 * section with these 
 * @param {*} e 
 */
function chooseTags(e)
{
    let dtags = globalTags[e];
    console.log(dtags)
    
    tags.cover = dtags.images[0].resource_url || "";
    tags.genre = dtags.genres[0] || "Inconnu";
    tags.artist = getArtistName(dtags.artists[0].name) || "Inconnu";
    tags.year = dtags.year || "2000";
    tags.tracklist = dtags.tracklist.map( track => track.title )
    tags.title = dtags.title;

    specificsTags = tags
    document.querySelector("#tagsCover").setAttribute("src", tags.cover);
    document.querySelector("#tagsTitle").innerHTML = tags.title
    document.querySelector("#tagsArtist").innerHTML = tags.artist
    document.querySelector("#tagsGenre").innerHTML = tags.genre
    document.querySelector("#tagsYear").innerHTML = tags.year
    document.querySelector("#tagsTracklist").innerHTML = `
        <li>
            ${tags.tracklist.join("</li><li>")}
        </li>
    `
    jquery(searchSection).fadeOut(200)
    setTimeout(()=>{jquery(confirmSection).fadeIn(200)}, 200);
}

/**
 * Either build every master's sections by calling
 * 'fetchMasterAndBuild()', or print a message saying
 * there's no results :(
 * @param {*} masterURL 
 */
function buildMasterList(masterURL){
    console.log("Building URLS...")
    masterURL.forEach(fetchMasterAndBuild)
    if (masterURL.length == 0)
    {
        resultsSection.innerHTML = "<h2>Sorry ! No Results ...</h2>";
    }
}


/**
 * Function triggered by clicking on the validate button
 * (created by chooseTags function)
 * it clear the screen (at least the search section and 
 * fullfill the progressbar )
 */
function validate(){
    globalTags = undefined;
    ipcRenderer.send("tags-register", tags);
    jquery("body").fadeOut(200);
    setTimeout(()=>{ ipcRenderer.send("next") }, 200)
}

function cancel(){
    jquery(confirmSection).fadeOut(200)
    setTimeout(()=>{jquery(searchSection).fadeIn(200)}, 200);
}

ipcRenderer.on("token-give", (event, args)=>{
    console.log("received token : " + args)
    userToken = args;
})

ipcRenderer.send("token-ask");

searchButton.onclick = search;