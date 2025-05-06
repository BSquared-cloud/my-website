// grab elements
const navLinks   = document.querySelector('.nav-links');
const menuToggle = document.getElementById('menu-toggle');
const themeToggle = document.getElementById('theme-toggle');

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

// set theme helper
function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
}

// INIT theme
const saved = localStorage.getItem('theme') || 'light';
setTheme(saved);

// THEME toggle
themeToggle.addEventListener('click', () => {
  const now = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  setTheme(now === 'light' ? 'dark' : 'light');
});
