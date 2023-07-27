//Under developing from Van-Dung NGO (email: nvdung136@gmail.com)
//Original release to github in July of 2023.

chrome.runtime.onMessage.addListener(OnReceive)
const TCB_Scrp_string = ['techcom-account-transaction-history','techcom-account-statement']

  async function OnReceive(request)
  {
    let _KeyStr;
    if(request.target !== 'content') return;
    switch (request.string){
      case 'TCB':
        _KeyStr = TCB_Scrp_string;
    }
    let load = await autoLoadMore();
    for (let i=0; i<_KeyStr.length; i++){
      var Scraped = document.querySelector(_KeyStr[i]);
      if(Scraped !== null){
        var HTML_Scraped =  Scraped.innerHTML;
        SendOrder(_KeyStr[i],HTML_Scraped);
        return;
      }
    }
  }


  async function SendOrder(Scrp_type,receivedMess)
  {
    const response = await chrome.runtime.sendMessage({
      sender: 'content',
      target: 'background',
      pipelineID: '2',
      string: receivedMess,
      _addInfo: Scrp_type,
    });
    return;
  }

  async function autoLoadMore (){
    var _BuEle = document.querySelector("bb-load-button-ui");
    var _Bu = (_BuEle!==null) ? _BuEle.querySelector("button") : null;
    while(_BuEle !== null){
      _Bu.click();
      await sleep(1000);
      _BuEle = document.querySelector("bb-load-button-ui");
      _Bu = (_BuEle!==null) ? _BuEle.querySelector("button") : null;
    }
    return 'done';
  }
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }