function getHash(str){
var hash = 0, i, chr;
 if (str.length === 0) return hash;
 for (i = 0; i < str.length; i++) {
   chr   = str.charCodeAt(i);
   hash  = ((hash << 5) - hash) + chr;
   hash |= 0; // Convert to 32bit integer
 }
 return hash;
}

function getLanguages(){
  return window.navigator.languages || [
            window.navigator.language ||
            window.navigator.userLanguage ||
            window.navigator.browserLanguage
    ];
}

function isAcceptableLanguage(lang){
  for(var i = 0; i < getLanguages().length; i++){
    var lc = getLanguages()[i];
    if(lc.indexOf(lang) > -1){
      return true;
    }
  }
  return false;
}

function isAcceptable(condition){
  for(var i = 0; i < condition.length; i++){
    var cond = condition[i];
    var args = cond.split(":");
    switch(args[0]){
      case "lang":
        if(!isAcceptableLanguage(args[1]))return false;
      break;
    }
  }
  return true;
}

function isClosed(message){
  if(Cookies.get(getHash(message)+"") === "closed"){
    return true;
  }
  return false;
}

function checkExpire(dateText){
  if(Date.parse(dateText) > Date.now()){
    return false;
  }
  return true;
}

function insertBaloon(message){
  var insertTarget = document.getElementById("baloons");
  var baloon = document.createElement("div");
  baloon.className = "baloon";
  var messageContainer = document.createElement("div");
  messageContainer.className = "baloon-message";
  messageContainer.innerHTML = markdown.toHTML(message);
  baloon.appendChild(messageContainer);
  var closer = document.createElement("p");
  closer.innerText = "×";
  closer.className = "baloon-closer";
  closer.addEventListener("click",function(){
    insertTarget.removeChild(baloon);
    Cookies.set(getHash(message)+"","closed");
  });
  baloon.appendChild(closer);
  insertTarget.appendChild(baloon);
}

function showBaloon(){
  var xhr = new XMLHttpRequest();
  xhr.open("GET","/notification.json");
  xhr.send();
  xhr.addEventListener("load",function(){
    var notifications = JSON.parse(xhr.responseText).notifications;
    notifications = notifications.filter(n=>isAcceptable(n.condition))
                                 .filter(n=>!isClosed(n.message))
                                 .filter(n=>!checkExpire(n.expire))
    notifications.forEach(n=>insertBaloon(n.message));
  });

}

showBaloon();
