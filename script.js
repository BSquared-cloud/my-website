const navLinks = document.querySelector('.nav-links');
const menuToggle = document.createElement('button');

menuToggle.textContent = '☰';
menuToggle.style.display = 'none';
menuToggle.style.position = 'absolute';
menuToggle.style.top = '1rem';
menuToggle.style.right = '1rem';
menuToggle.style.zIndex = '1000';

document.querySelector('nav').appendChild(menuToggle);

menuToggle.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    navLinks.style.display = 'flex';
  } else {
    navLinks.style.display = 'none';
  }
});