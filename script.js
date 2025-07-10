// grab elements
const navLinks   = document.querySelector('.nav-links');
const menuToggle = document.getElementById('menu-toggle');

// MOBILE MENU toggle
if (menuToggle && navLinks) {

  // MOBILE MENU toggle
  menuToggle.addEventListener('click', (e) => {
    navLinks.classList.toggle('show-menu');
    // Stop this click from immediately closing the menu
    e.stopPropagation();
  });

  // ensure menu resets on resize (Your existing code - GOOD!)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove('show-menu');
    }
  });

  // close menu when a link is clicked (Your existing code - GOOD!)
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('show-menu')) {
        navLinks.classList.remove('show-menu');
      }
    });
  });

  // Logic to close the menu when clicking away
  document.addEventListener('click', (e) => {
    // Check if the menu is open AND if the click was NOT on the menu toggle button
    if (navLinks.classList.contains('show-menu') && !menuToggle.contains(e.target)) {
      // Check if the click was outside the menu itself
      if (!navLinks.contains(e.target)) {
        navLinks.classList.remove('show-menu');
      }
    }
  });

}
