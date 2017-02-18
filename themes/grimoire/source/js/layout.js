document.addEventListener('DOMContentLoaded', function() {
  var marginComputedStyle = window.getComputedStyle(document.querySelector('#content'), '');
  var marginTop = parseFloat(marginComputedStyle.marginTop.slice(0, -2)) + parseFloat(marginComputedStyle.paddingTop.slice(0, -2));
  var h1Arr = Array.from(document.querySelectorAll('h1')).filter(function(v) {
    return v.id !== 'content-title';
  });
  var subMenu = h1Arr.map(function(v) {
    return createSubMenu(v, marginTop);
  });

  // add submenu in sidebar
  var elm = document.createElement('ul');
  elm.setAttribute('class', 'sub-menu');
  subMenu.forEach(function(v) {
    elm.appendChild(v);
  });
  document.querySelector('#list .active').appendChild(elm);

  // update submenu
  updateSubMenuActive(h1Arr, subMenu, marginTop);
  window.addEventListener('scroll', function() {
    updateSubMenuActive(h1Arr, subMenu, marginTop);
  });
  window.addEventListener('resize', function() {
    updateSubMenuActive(h1Arr, subMenu, marginTop);
  });

  // override title anchor link
  Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).forEach(function(v) {
    if (v.id !== 'content-title') {
      v.querySelector('a').addEventListener('click', function(e) {
        e.preventDefault();
        window.scroll(0, v.offsetTop - marginTop);
      });
    }
  });

  // initial anchor scroll fix
  var hash = document.location.hash;
  var href = document.location.href;
  if (hash !== '') {
    document.location.hash = '';
    window.addEventListener('load', function() {
      window.scroll(0, document.querySelector(hash).offsetTop - marginTop);
      history.replaceState(null, null, href);
    });
  }

  // activate humburger button
  var el = document.querySelectorAll('.hamburger');
  var sidebar = document.querySelector('#sidebar');
  var menu = document.querySelector('#menu-wrap');
  for (var i = 0; i < el.length; i++) {
    el[i].addEventListener('click', function() {
      this.classList.toggle('active');
      sidebar.classList.toggle('active');
      menu.classList.toggle('active');
    }, false);
  }
});

function createSubMenu(h1, marginTop) {
  var li = document.createElement('li');
  var a = document.createElement('a');
  a.innerText = h1.innerText;
  a.setAttribute('href', '#' + h1.id);
  a.addEventListener('click', function(e) {
    e.preventDefault();
    document.location.hash = h1.id;
    window.scroll(0, h1.offsetTop - marginTop);
  });
  li.appendChild(a);
  return li;
}

function updateSubMenuActive(h1Arr, subMenu, marginTop) {
  var top = document.body.scrollTop;
  for (var i = h1Arr.length - 1; i >= 0; i--) {
    if (h1Arr[i].offsetTop - marginTop - 10 < top) {
      if (subMenu[i].className !== 'active') {
        removeSubMenuActive();
        subMenu[i].setAttribute('class', 'active');
      }
      return;
    }
  }
  removeSubMenuActive();
}

function removeSubMenuActive() {
  var active = document.querySelector('#list .sub-menu .active');
  if (active) {
    active.setAttribute('class', '');
  }
}
