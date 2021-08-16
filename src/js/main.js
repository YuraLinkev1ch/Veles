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
    event.preventDefault();
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