// grab elements
const navLinks   = document.querySelector('.nav-links');
const menuToggle = document.getElementById('menu-toggle');

// MOBILE MENU toggle
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show-menu');
});

// ensure menu resets on resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    navLinks.classList.remove('show-menu');
  }
});
