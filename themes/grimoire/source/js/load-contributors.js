var xhr = new XMLHttpRequest();
xhr.open("GET", "/contributors.json");
xhr.send();
xhr.addEventListener('load', function () {
  var response = JSON.parse(xhr.responseText);
  for (var type in response) {
    var typeContent = response[type];
    var typeContainer = document.createElement('div');
    var typeHeader = document.createElement('h3');
    typeHeader.innerText = type;
    typeContainer.className = "contributors-type-container";
    var avatarsContainer = document.createElement('div');
    avatarsContainer.className = 'contributors-avatar-container';
    typeContainer.appendChild(typeHeader);
    typeContainer.appendChild(avatarsContainer);
    for (var name in typeContent) {
      var userContent = typeContent[name];
      var avatar = document.createElement('div');
      var img = document.createElement('img');
      var sn = document.createElement('a');
      avatar.setAttribute('class', 'wrap');
      img.setAttribute('src', userContent.img);
      sn.innerText = name;
      sn.setAttribute('class', 'screen-name');
      sn.setAttribute('href', "https://github.com/" + name);
      sn.setAttribute('target', '_blank');
      avatar.appendChild(img);
      avatar.appendChild(sn);
      avatarsContainer.appendChild(avatar);
    }
    document.getElementById("contributors-container-root").appendChild(typeContainer);
  }
});
var devtoolOpened = false;
function openDevtool() {
  if (!devtoolOpened) {
    var scTag = document.createElement("script");
    scTag.src = "https://unpkg.com/grimoirejs-inspector@1.0.19/dist/devtool.browser.js";
    document.body.appendChild(scTag);
    var devtoolWrap = document.querySelector(".devtool-wrap");
    devtoolWrap.style.height = "300px";
    devtoolOpened = true;
  }
}

gr(() => {
  const w = document.body.clientWidth;
  gr("#top")("goml").setAttribute("width", Math.min(800, w));
});