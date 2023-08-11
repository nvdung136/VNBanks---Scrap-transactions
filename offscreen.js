//Under developing from Van-Dung NGO (email: nvdung136@gmail.com)
//Original release to github in July of 2023.

chrome.runtime.onMessage.addListener(OnReceive);

var keyWords = [];

// This function performs basic filtering and error checking on messages before
// dispatching the message to a more specific message handler.
async function OnReceive(message) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== 'offscreen') return false;
  else {
    keyWords = init_keyW_lst(message._addInfo);
    const [ParsedRes,period] = await ParsingHTML2String(message.string); 
    SendMess(ParsedRes,period);
  }
  return;
}

function init_keyW_lst(Clas_name){
  switch (Clas_name){
    case 'techcom-account-transaction-history':
      return ['techcom-transaction-history-list','TECHCOM-ACCOUNT-TRANSACTION-HISTORY-ITEM',"section-leading","account-transaction-history-item__content"
      ,"account-balance__amount","visible","amount--outgoing","info__name","info__message"];
      
    case 'techcom-account-statement':
      return ['techcom-account-statement-list','TECHCOM-ACCOUNT-STATEMENT-ITEM',"current-account-detail__section-leading","account-statement-item__content"
      ,"account-balance__amount","visible","account-statement-item__content__amount__outgoing","typo-default-semi-bold","bb-ellipsis--line-clamp"];
  }
}

async function SendMess(data,period) {
  const SendOrder = await chrome.runtime.sendMessage({
    sender: 'offscreen',
    target: 'background',
    pipelineID: '4',
    string: data,
    _addInfo: period
  });
}

async function ParsingHTML2String(MessString){
    const parser = new DOMParser();
    const ParsDoc = parser.parseFromString(MessString, 'text/html'); 
    const TransList = ParsDoc.getElementsByTagName(keyWords[0]);
    var SpawnChilds = TransList[0].children;
    let ArrayString,period = ValidateEle(SpawnChilds);
    return ArrayString,period
  } 

function ValidateEle(ListEle){
  var TR = {date : '1999-01-01',
    Amount  : 'N/A',
    Sinfo   : 'N/A',
    Info    : 'N/A',
    Balance : 'N/A'};
  const ReturnArray = [['date','amount','purpose','info','balance']];
  for (Elem of ListEle){
    switch (Elem.tagName){
      case keyWords[1]:
        [TR.Amount,TR.Balance,TR.Sinfo,TR.Info]  = ItemParsing(Elem);
        let Ary = [TR.date.toString(),TR.Amount.toString(),TR.Sinfo.toString(),TR.Info.toString(),TR.Balance.toString()]
        ReturnArray.push(Ary);
        break;  
      case 'DIV':
        if(Elem.classList.contains(keyWords[2])) 
        TR.date = DateUpdate(Elem);
      break;
      }
  }
  const period = `TCB_${TR.date.toString()} to ${ReturnArray[1][0]}`
  return [ReturnArray,period];
}

function DateUpdate(DateSection){
  const dateString = DateSection.textContent.trim();
  if(dateString.match('Today') || dateString.match('nay'))
  {
    return find_date(0);
  }
  if(dateString.match('Yesterday') || dateString.match('qua'))
  {
    return find_date(1);
  }
  if(dateString.indexOf(" ") !== -1) 
  {
      const dayApart = dateString.slice(0,dateString.indexOf(" "));
      return find_date(dayApart-1);
  }
  else 
  //Temporary re-format dateString
    if(dateString.match('/')) return format_date(dateString);
    else return dateString;
}

function format_date(dayInput){
  let subStr = dayInput.split("/");
  let ReturnDate = `${subStr[2]}-${subStr[1]}-${subStr[0]}`;
  return ReturnDate;
}

function find_date(daysApart){
  const date = new Date();

  let day = date.getDate();
  let month = (date.getMonth() + 1) > 10 ? (date.getMonth() + 1) : '0'+ (date.getMonth() + 1);
  let year = date.getFullYear();
  let day2find = day - daysApart;
  //Refine the over-the-month date
  if(day2find <= 0)
  {
    month = date.getMonth()-1;
    day2find = new Date(year,month,0).getDate() + day2find;
    month = date.getMonth() > 10 ? (date.getMonth() + 1) : '0'+ (date.getMonth() + 1);
  }
  day2find = (day2find<10)? `0${day2find}` : `${day2find}`;
  let returnDate = `${year}-${month}-${day2find}`;
  return returnDate;
}

function ItemParsing(Item)
{
  const _Content = Item.getElementsByClassName(keyWords[3]);
  
  
  //Transaction amount and balance
  const _Balance = _Content[0].getElementsByClassName(keyWords[4]);
  const _Direction = _Content[0].getElementsByClassName(keyWords[5]);
  const Amount = (_Direction[0].classList.contains(keyWords[6])) ? ('-' + _Balance[0].textContent) : (_Balance[0].textContent);
  const Balance = _Balance[2].textContent;
  //Transaction Sinfo and info
  const _infoName = _Content[0].getElementsByClassName(keyWords[7]);
  const _infoMessage = _Content[0].getElementsByClassName(keyWords[8]);
  const Sinfo = _infoName[0].textContent.trim();
  const Info = _infoMessage[0].textContent.trim()
  return  [Amount,Balance,Sinfo,Info];
}

