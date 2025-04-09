// Función para mostrar/ocultar información adicional
function toggleInfo(id) {
  const infoBox = document.getElementById(id);
  if (infoBox.style.display === "block") {
    infoBox.style.display = "none";
  } else {
    infoBox.style.display = "block";
  }
}

// Variables para el carrusel
let currentSlide = 0;
const items = document.querySelectorAll('.carousel-item');
const itemCount = items.length;
const itemsToShow = 3;

// Inicializar carrusel
function initCarousel() {
  for (let i = 0; i < itemCount; i++) {
    if (i < itemsToShow) {
      items[i].style.display = 'block';
    } else {
      items[i].style.display = 'none';
    }
  }
}

// Mover carrusel
function moveCarousel(direction) {
  currentSlide = (currentSlide + direction) % (itemCount - itemsToShow + 1);
  if (currentSlide < 0) currentSlide = itemCount - itemsToShow;
  
  for (let i = 0; i < itemCount; i++) {
    if (i >= currentSlide && i < currentSlide + itemsToShow) {
      items[i].style.display = 'block';
    } else {
      items[i].style.display = 'none';
    }
  }
}

// Navbar fijo al hacer scroll
window.onscroll = function() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    document.getElementById("navbar").classList.add("fixed");
  } else {
    document.getElementById("navbar").classList.remove("fixed");
  }
};

// Manejar envío del formulario
document.getElementById('contacto-form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Aquí puedes agregar código para procesar el formulario
  // Por ejemplo, enviar los datos a un servidor
  
  alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
  this.reset();
});

// Hamburger menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    console.log('Hamburger menu found');
  }
  
  // Toggle menu on hamburger click
  hamburger.addEventListener('click', function() {
    console.log('Hamburger clicked');
    this.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  
  // Close menu when clicking on a nav link
  const navLinksItems = navLinks.querySelectorAll('.nav-links a');
  navLinksItems.forEach(item => {
    item.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
  
  // Initialize carousel
  initCarousel();
});
