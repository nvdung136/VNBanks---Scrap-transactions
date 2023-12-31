//Under developing from Van-Dung NGO (email: nvdung136@gmail.com)
//Original release to github in July of 2023.

const ScrpB = document.getElementById("ScrpB")
var ScrpLst = document.getElementById("scrapinglist")
let DowB;
const Set_B = document.getElementById("_setIcon")
const Set_panel = document.getElementById("setting");
const SnLstDiv = document.getElementById("setting");
const LoaderLine = document.getElementById("loader_line");

Set_B.addEventListener("click", function () {
    if(Set_panel.style.display == 'none') {
        Set_panel.style.display = "block";
    }
    else 
    {
        Set_panel.style.display = "none";
        SnLstDiv.style.height = "fit-content";
    }
})

ScrpB.addEventListener("click", async  function () {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true}); 
    // have to find a better query scheme - problem is the lastFocusedWindow can be shifted to the extension itself
    // upon click on the popup.html
    const SendOrder = await chrome.tabs.sendMessage(tab.id,
        {
            sender: 'popup',
            target: 'content',
            pipelineID: '1',
            string: 'TCB',
        });
    LoaderLine.style.display = "block";
});

chrome.runtime.onMessage.addListener(OnReceive)

async function OnReceive(message) {
    // Return early if this message isn't meant for the background script
    var _Line2Dis="";
    if(message.target !== 'popup') return;
    const DataArray = message.string;
    // with header i = 0 || without header i = 1;
    for(let i=1; i< DataArray.length; i++){
        let WrtLine ='';
        for (let n=0;n<DataArray[i].length;n++){
            WrtLine += `${DataArray[i][n]}|`;
        }
        WrtLine += '\r\n';
        _Line2Dis +=WrtLine;   
    }
    addDownLoad(message._addInfo,_Line2Dis);
}

async function addDownLoad(info,message){
     
    ScrpLst.innerHTML += `<div><h1 class="w3-small" style="font-weight: bold;">${info}</h1></div>`;
    DowB = document.createElement('a');
    DowB.textContent = `download`;
    DowB.href = "#";
    DowB.classList.add("w3-small")
    DowB.addEventListener('click', function Click(){
        downloadURI('data:text/csv;charset=utf-8,' + (message),info);
    });
    ScrpLst.appendChild(DowB);
    LoaderLine.style.display = "none";  
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
  }