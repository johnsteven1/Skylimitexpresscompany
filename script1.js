let currentSlide = 0;

const slides = document.querySelectorAll(".testimonial-slide");
const dotsContainer = document.getElementById("testimonialDots");

// Create dots
slides.forEach((_, i) => {
    let dot = document.createElement("span");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll(".dot");

// Show slide function
function goToSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.display = i === index ? "block" : "none";
    });

    dots.forEach(dot => dot.classList.remove("active"));
    dots[index].classList.add("active");

    currentSlide = index;
}

// Auto slide
setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
}, 4000);

// Start with the first slide
goToSlide(0);
