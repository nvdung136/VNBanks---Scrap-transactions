//Under developing from Van-Dung NGO (email: nvdung136@gmail.com)
//Original release to github in July of 2023.

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';


chrome.runtime.onMessage.addListener(OnReceive);

async function OnReceive(message) {
  // Target check
  if (message.target !== 'background') return;
  
  // Message pipeline check 
  switch(message.pipelineID){
    case '2':
      { 
        console.log(message.pipelineID);
        // console.log(message.string);
        sendMessageToOffscreenDocument(message.string,message._addInfo);
        break;
      }
    case '4':
      {
        console.log(message._addInfo);
        // console.log(message.string);
        closeOffscreenDocument();
        //refinedata
        SendMess('popup','5',message.string,message._addInfo)
        break;
      }
    }
  }

async function sendMessageToOffscreenDocument(data,classification) {
  // Initating offscreen Document if yet to be existing
  if (!(await hasDocument())) {
    console.log('checked_no_offScreen');
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: 'Parse DOM'
    });
    console.log('created');
  }

  // Send mess to offscreen
  console.log('Available_offScreen');
  SendMess('offscreen','3',data,classification)
  console.log('sent');
}


  async function SendMess(Target,PipelineID,Mess,classification)
  {
    const SendOrder = await chrome.runtime.sendMessage({
      sender: 'background',
      target: Target,
      pipelineID: PipelineID,
      string: Mess,
      _addInfo: classification,
    });
  }



//support functions
async function closeOffscreenDocument() {
  if (!(await hasDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
  console.log("closed")
}

async function hasDocument() {
  // Check all windows controlled by the service worker if one of them is the offscreen document
  const matchedClients = await clients.matchAll();
  for (const client of matchedClients) {
    if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
      return true;
    }
  }
  return false;
}
