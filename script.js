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

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks.classList.contains('show-menu')) {
      navLinks.classList.remove('show-menu');
    }
  });
});
