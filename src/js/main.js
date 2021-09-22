/* swiper-initialization-start */

const swiper = new Swiper('.swiper', {
  // Optional parameters
  direction: 'horizontal',
  loop: true,
  
  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
    type: 'bullets',
    clickable: true,
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  }
});

/* swiper-initialization-end */

/* yandex-maps-config-start */

let center = [55.578981069177374,38.202771000000006];

function init() {
	let map = new ymaps.Map('contacts-map', {
		center: center,
		zoom: 17
	});

	map.controls.remove('geolocationControl'); 
  map.controls.remove('searchControl'); 
  map.controls.remove('trafficControl'); 
  map.controls.remove('typeSelector'); 
  map.controls.remove('fullscreenControl'); 
  map.controls.remove('zoomControl'); 
  map.controls.remove('rulerControl'); 
  map.behaviors.disable(['scrollZoom']); 
}

ymaps.ready(init);

/* yandex-maps-config-end */

/* burger-menu-toggle-start */

let button = document.querySelector('.burger-button');
let menu = document.querySelector('.burger-menu');
let closeButton = document.querySelector('.burger-menu__close-button');
let closeLinks = document.querySelectorAll('.burger-menu__list-link');

button.addEventListener('click', e => {
  menu.classList.add('burger-menu_active');
  console.log('button is worked');
  event.stopPropagation();
})

closeButton.addEventListener('click', e => {
  menu.classList.remove('burger-menu_active');
  console.log('closeButton is worked');
})

closeLinks.forEach(function (entry) {
  entry.addEventListener("click", function (event){
    menu.classList.remove('burger-menu_active');
    console.log('closeLink is worked');
  });
});

document.addEventListener('click', e => {    
    if (e.target !== menu && !menu.contains(e.target) && e.target !== button && menu.classList.contains('burger-menu_active')) {
        menu.classList.remove('burger-menu_active');
        console.log('target is worked');
    }
})

/* burger-menu-toggle-end */

/* smooth-scroll-polyfill-settings-start */

var scroll = new SmoothScroll('a[href*="#"]', {
  speed: 150
});

/* smooth-scroll-polyfill-settings-end */
