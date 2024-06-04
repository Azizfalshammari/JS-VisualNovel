// Creates the HTML and inserts it into the document
function insertHTML(){
    return `
        <div id='mainbox'>
            <div id='spritebox' class='rightalign'>
                <img src=''>
            </div>
            <div id='namebox'>
                <span>Loading...</span>
            </div>
            <div id='textbox'>
                <p>Loading...</p>
                <div id='optionsbox'></div>
            </div>
        </div>
    `;
}

/* **SUPER IMPORTANT**  PUT THE URL OF THE JSON FILE WHERE YOU INSERTED ALL YOUR DATA HERE !! */
const vnData = 'https://665855e85c3617052647fe40.mockapi.io/VN';
const htmlData = insertHTML();
// Inserts the HTML before the script tag
document.getElementById('VisualNovelEngine').insertAdjacentHTML("beforebegin", htmlData);

// Creates constants based off of the HTML created
const textbox = document.querySelector("#textbox p");
const optionsbox = document.querySelector('#optionsbox');
const namebox = document.querySelector("#namebox span")
const spritebox = document.querySelector("#spritebox img");
const mainbox = document.querySelector('#mainbox');

// Other variables we will be using later on
let json, to;

// Tracks what "Page Number" the user is on
var pageNum = 0;
var currentPage;

async function grabData() {
    // Load the data
    try {
        const resp = await fetch(vnData);
        if (!resp.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await resp.json();
        json = data[0];  // Since the JSON is an array, we access the first element
        
        // Check if the expected structure exists
        if (!json.Scene1 || !json.Scene1.PAGES) {
            throw new Error('Invalid JSON structure');
        }

        currentPage = Object.keys(json.Scene1.PAGES)[pageNum];
        
        // Initialize the data 
        initialize(json);
        handleOptions(json);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Initializes the data & also handles page turning 
function initialize(data){
    // Cleans it all
    spritebox.src = '';
    namebox.innerText = '';
    textbox.innerText = ''; 
    
    // Changes appropriate HTML elements to the new attributes based on the data given when page turns/ program is initialized
    spritebox.src = data.Characters[data.Scene1.PAGES[currentPage].Character][data.Scene1.PAGES[currentPage].Sprite];
    namebox.innerText = data.Scene1.PAGES[currentPage].Character;
    textbox.innerText = data.Scene1.PAGES[currentPage].PageText; 
    mainbox.style.backgroundImage = "url(" + data.Scene1.Background + ")"; 
}

function handleOptions(data){
    // Cleans it out
    optionsbox.innerHTML = "";

    if(data.Scene1.PAGES[currentPage].hasOwnProperty('Options')){
        var o = data.Scene1.PAGES[currentPage].Options;
        var str = Object.keys(o).forEach(k => {
            const row = document.createElement('div');
            row.innerHTML = `${k}`
            optionsbox.appendChild(row);
            row.addEventListener('click', () => { 
                currentPage = (o[k]);
                pageNum = Object.keys(json.Scene1.PAGES).indexOf(currentPage);
                initialize(json); 
                optionsbox.innerHTML = "";
            });
        });
    }
}

function checkPage(data){
    if(data.Scene1.PAGES[currentPage].hasOwnProperty('Options')) return false;
    if(data.Scene1.PAGES[currentPage].hasOwnProperty('NextPage')) {
        if(data.Scene1.PAGES[currentPage].NextPage == "End") return false;
    }
    return true;
}

// Handles page turning when right or left arrow key is pressed 
document.addEventListener('keydown', (e) => {
    if(!json) return;
    if(e.key == "ArrowRight" && checkPage(json)){
        if(json.Scene1.PAGES[currentPage].hasOwnProperty('NextPage')){
            currentPage = json.Scene1.PAGES[currentPage].NextPage;
        } else {
            pageNum++;
            currentPage = Object.keys(json.Scene1.PAGES)[pageNum];
        }
        initialize(json);
        handleOptions(json);
    } else return;
});

// Grabs the json data from the server
grabData();
