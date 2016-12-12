var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.github.com/repos/GrimoireGL/GrimoireJS/contributors');
xhr.setRequestHeader('Content-Type', 'application/vnd.github.v3+json');
xhr.send();
xhr.addEventListener('load', function() {
  JSON.parse(xhr.responseText).forEach(function(v) {
    var avatar = document.createElement('div');
    var img = document.createElement('img');
    var sn = document.createElement('a');
    avatar.setAttribute('class', 'wrap');
    img.setAttribute('src', v.avatar_url);
    sn.innerText = v.login;
    sn.setAttribute('class', 'screen-name');
    sn.setAttribute('href', v.html_url);
    sn.setAttribute('target', '_blank');
    avatar.appendChild(img);
    avatar.appendChild(sn);
    document.querySelectorAll('#avatars')[0].appendChild(avatar);
  });
});
