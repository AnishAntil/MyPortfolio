// Main script for modern portfolio

document.addEventListener("DOMContentLoaded", function() {
    // Modal Functionality
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    const closeModal = document.getElementById("close-modal");
    const projectImages = document.querySelectorAll(".project-img img");

    projectImages.forEach((image) => {
        image.addEventListener("click", function() {
            modal.style.display = "flex";
            modalImg.src = this.src;
        });
    });

    closeModal.addEventListener("click", function() {
        modal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Navigation active state
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").slice(1) === current) {
                link.classList.add("active");
            }
        });
    });

    // Project Filtering
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            // Remove active class from all buttons
            filterBtns.forEach((filterBtn) => {
                filterBtn.classList.remove("active");
            });

            // Add active class to clicked button
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            projectCards.forEach((card) => {
                if (filterValue === "all") {
                    card.style.display = "block";
                } else if (card.getAttribute("data-category") === filterValue) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    // Dark Mode Toggle
    const themeSwitch = document.querySelector(".theme-switch");
    const darkThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const isDarkMode =
        localStorage.getItem("darkMode") === "true" ||
        (localStorage.getItem("darkMode") === null && darkThemeMediaQuery.matches);

    function applyThemePreference(isDark) {
        if (isDark) {
            document.body.classList.add("dark-mode");
            themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove("dark-mode");
            themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    applyThemePreference(isDarkMode);

    themeSwitch.addEventListener("click", () => {
        const currentlyDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", !currentlyDark);
        applyThemePreference(!currentlyDark);
    });

    // Contact Form Submit
    // Contact Form Submit
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        // Update form action to use FormSubmit service
        contactForm.setAttribute(
            "action",
            "https://formsubmit.co/itskashishverma@gmail.com"
        );
        contactForm.setAttribute("method", "POST");

        // Add a hidden field to prevent spam
        const honeypot = document.createElement("input");
        honeypot.type = "text";
        honeypot.name = "_honey";
        honeypot.style.display = "none";
        contactForm.appendChild(honeypot);

        // Disable default validation message to use your own
        contactForm.addEventListener("submit", function(e) {
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const message = document.getElementById("message").value;

            if (!name || !email || !message) {
                e.preventDefault();
                alert("Please fill out all required fields");
            }
        });
    }
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();

            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: "smooth",
                });
            }
        });
    });

    // Animation on scroll (simple version)
    const animateElements = document.querySelectorAll(".fade-in");

    function checkVisibility() {
        animateElements.forEach((element) => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (elementPosition < screenPosition) {
                element.classList.add("visible");
            }
        });
    }

    if (animateElements.length > 0) {
        window.addEventListener("scroll", checkVisibility);
        checkVisibility(); // Check on initial load
    }
});
// Enhanced JavaScript for portfolio with project sliders and gallery

document.addEventListener("DOMContentLoaded", function() {
    // Initialize project sliders
    initProjectSliders();

    // Modal Functionality
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    const closeModal = document.getElementById("close-modal");
    const projectImages = document.querySelectorAll(".project-img img");

    if (modal && closeModal) {
        projectImages.forEach((image) => {
            image.addEventListener("click", function() {
                modal.style.display = "flex";
                modalImg.src = this.src;
            });
        });

        closeModal.addEventListener("click", function() {
            modal.style.display = "none";
        });

        window.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    // Navigation active state
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").slice(1) === current) {
                link.classList.add("active");
            }
        });
    });

    // Project Filtering
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            // Remove active class from all buttons
            filterBtns.forEach((filterBtn) => {
                filterBtn.classList.remove("active");
            });

            // Add active class to clicked button
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            projectCards.forEach((card) => {
                if (filterValue === "all") {
                    card.style.display = "block";
                } else if (card.getAttribute("data-category") === filterValue) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    // Dark Mode Toggle
    document.addEventListener("DOMContentLoaded", function() {
        // Dark Mode Toggle
        const themeSwitch = document.querySelector(".theme-switch");
        console.log("Theme switch found:", themeSwitch); // Debug log

        if (themeSwitch) {
            const darkThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const isDarkMode =
                localStorage.getItem("darkMode") === "true" ||
                (localStorage.getItem("darkMode") === null && darkThemeMediaQuery.matches);

            function applyThemePreference(isDark) {
                console.log("Applying theme:", isDark ? "dark" : "light"); // Debug log
                if (isDark) {
                    document.body.classList.add("dark-mode");
                    themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
                } else {
                    document.body.classList.remove("dark-mode");
                    themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
                }
            }

            applyThemePreference(isDarkMode);

            themeSwitch.addEventListener("click", () => {
                console.log("Theme switch clicked"); // Debug log
                const currentlyDark = document.body.classList.contains("dark-mode");
                localStorage.setItem("darkMode", !currentlyDark);
                applyThemePreference(!currentlyDark);
            });
        } else {
            console.error("Theme switch element not found!");
        }
    });
    // Contact Form Submit
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", function(e) {
            e.preventDefault();

            // Here you would normally send the form data to a server
            // For demonstration purposes, we'll just show an alert

            const formData = new FormData(contactForm);
            const formValues = Object.fromEntries(formData.entries());

            // Simple validation
            if (!formValues.name || !formValues.email || !formValues.message) {
                alert("Please fill out all required fields");
                return;
            }

            alert("Thanks for your message! I'll get back to you soon.");
            contactForm.reset();
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();

            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: "smooth",
                });
            }
        });
    });

    // Animation on scroll
    const animateElements = document.querySelectorAll(".fade-in");

    function checkVisibility() {
        animateElements.forEach((element) => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (elementPosition < screenPosition) {
                element.classList.add("visible");
            }
        });
    }

    if (animateElements.length > 0) {
        window.addEventListener("scroll", checkVisibility);
        checkVisibility(); // Check on initial load
    }

    // Initialize project gallery
    initProjectGallery();
});

// Function to initialize project sliders
function initProjectSliders() {
    const projectSliders = document.querySelectorAll(".project-slider");

    projectSliders.forEach((slider) => {
        const sliderInner = slider.querySelector(".project-slider-inner");
        const slides = sliderInner.querySelectorAll("img");
        const prevBtn = slider.querySelector(".slider-prev");
        const nextBtn = slider.querySelector(".slider-next");
        const dotsContainer = slider.querySelector(".slider-dots");

        // Skip if there's only one slide
        if (slides.length <= 1) {
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
            return;
        }

        // Set the width of the slider inner
        sliderInner.style.width = `${slides.length * 100}%`;

        // Create dots
        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement("button");
            dot.classList.add("slider-dot");
            if (i === 0) dot.classList.add("active");
            dot.setAttribute("data-index", i);
            dotsContainer.appendChild(dot);

            // Add click event to dots
            dot.addEventListener("click", () => {
                goToSlide(i);
            });
        }

        let currentIndex = 0;

        // Function to go to a specific slide
        function goToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            currentIndex = index;

            // Update slider position
            sliderInner.style.transform = `translateX(-${
        currentIndex * (100 / slides.length)
      }%)`;

            // Update dots
            const dots = dotsContainer.querySelectorAll(".slider-dot");
            dots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        }

        // Add click events to prev/next buttons
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                goToSlide(currentIndex - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                goToSlide(currentIndex + 1);
            });
        }

        // Automatic slider (optional)
        let sliderInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);

        // Pause slider on hover
        slider.addEventListener("mouseenter", () => {
            clearInterval(sliderInterval);
        });

        slider.addEventListener("mouseleave", () => {
            sliderInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 5000);
        });
    });
}

// Function to initialize project gallery
function initProjectGallery() {
    const galleryModal = document.querySelector(".project-gallery-modal");
    const galleryButtons = document.querySelectorAll(".view-gallery");
    const galleryContainer = document.querySelector(".gallery-container");
    const galleryTitle = document.querySelector(".gallery-title");
    const galleryClose = document.querySelector(".gallery-close");
    const galleryPrev = document.querySelector(".gallery-prev");
    const galleryNext = document.querySelector(".gallery-next");
    const galleryDots = document.querySelector(".gallery-dots");

    if (!galleryModal || !galleryContainer) return;

    let currentProject = "";
    let currentSlideIndex = 0;
    let slides = [];

    // Project image mappings
    const projectImages = {
        doctor: [{
                src: "images/LANDING DOC.png",
                alt: "Doctor Appointment Booking Homepage",
            },
            {
                src: "images/LANDING DOC2.png",
                alt: "Doctor Appointment Booking Homepage",
            },
            {
                src: "images/doctorr.jpg",
                alt: "Doctor Interface"
            },
            {
                src: "images/doctor.png",
                alt: "Doctor Dashboard"
            },
            {
                src: "images/admin.png",
                alt: "Admin Dashboard"
            },
        ],
        noteapp: [{
                src: "images/notepad.jpg",
                alt: "NoteApp Interface"
            },
            {
                src: "images/notepad sample.png",
                alt: "NoteApp Sample"
            },
            {
                src: "images/notepad smaple2.png",
                alt: "NoteApp Features"
            },
            {
                src: "images/noteapp.jpg",
                alt: "NoteApp Interface"
            },
        ],
        todo: [{
                src: "images/todo home.png",
                alt: "TO-DO List App Home"
            },
            {
                src: "images/todo sample2.png",
                alt: "TO-DO List Interface"
            },
        ],
        ui: [{
                src: "images/ui sample.png",
                alt: "Interactive UI Sample 1"
            },
            {
                src: "images/ui sample2.png",
                alt: "Interactive UI Sample 2"
            },
        ],
    };

    // Project titles mapping
    const projectTitles = {
        doctor: "Doctor Appointment Booking",
        noteapp: "NoteApp - Java Desktop Application",
        todo: "TO-DO List Web Application",
        ui: "Interactive UI Components",
    };

    // Open gallery modal
    galleryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const projectId = button.getAttribute("data-project");
            openGallery(projectId);
        });
    });

    // Close gallery modal
    galleryClose.addEventListener("click", () => {
        galleryModal.style.display = "none";
        document.body.style.overflow = "auto";
    });

    window.addEventListener("click", (e) => {
        if (e.target === galleryModal) {
            galleryModal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });

    // Function to open gallery
    function openGallery(projectId) {
        if (!projectImages[projectId]) return;

        currentProject = projectId;
        currentSlideIndex = 0;
        slides = projectImages[projectId];

        // Update gallery title
        galleryTitle.textContent = projectTitles[projectId] || "Project Gallery";

        // Clear gallery container
        galleryContainer.innerHTML = "";
        galleryDots.innerHTML = "";

        // Create slides
        slides.forEach((slide, index) => {
            const slideDiv = document.createElement("div");
            slideDiv.classList.add("gallery-slide");
            if (index === 0) slideDiv.classList.add("active");

            const img = document.createElement("img");
            img.src = slide.src;
            img.alt = slide.alt || "Project Image";

            slideDiv.appendChild(img);
            galleryContainer.appendChild(slideDiv);

            // Create dot
            const dot = document.createElement("button");
            dot.classList.add("gallery-dot");
            if (index === 0) dot.classList.add("active");
            dot.setAttribute("data-index", index);
            galleryDots.appendChild(dot);

            // Add click event to dot
            dot.addEventListener("click", () => {
                goToSlide(index);
            });
        });

        // Show modal
        galleryModal.style.display = "flex";
        document.body.style.overflow = "hidden"; // Prevent scrolling

        // Add navigation events
        galleryPrev.addEventListener("click", prevSlide);
        galleryNext.addEventListener("click", nextSlide);

        // Add keyboard navigation
        document.addEventListener("keydown", handleKeyDown);
    }

    // Function to go to a specific slide
    function goToSlide(index) {
        if (!slides.length) return;

        // Handle index bounds
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        currentSlideIndex = index;

        // Update slides
        const gallerySlides = galleryContainer.querySelectorAll(".gallery-slide");
        gallerySlides.forEach((slide, i) => {
            if (i === currentSlideIndex) {
                slide.classList.add("active");
            } else {
                slide.classList.remove("active");
            }
        });

        // Update dots
        const dots = galleryDots.querySelectorAll(".gallery-dot");
        dots.forEach((dot, i) => {
            if (i === currentSlideIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    // Next slide function
    function nextSlide() {
        goToSlide(currentSlideIndex + 1);
    }

    // Previous slide function
    function prevSlide() {
        goToSlide(currentSlideIndex - 1);
    }

    // Handle keyboard navigation
    function handleKeyDown(e) {
        if (!galleryModal.style.display || galleryModal.style.display === "none")
            return;

        if (e.key === "ArrowLeft") {
            prevSlide();
        } else if (e.key === "ArrowRight") {
            nextSlide();
        } else if (e.key === "Escape") {
            galleryModal.style.display = "none";
            document.body.style.overflow = "auto";
            document.removeEventListener("keydown", handleKeyDown);
        }
    }
}
// Text Rotation Animation for Hero Section
class TxtRotate {
    constructor(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = "";
        this.tick();
        this.isDeleting = false;
    }

    tick() {
        const i = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;

        let delta = 200 - Math.random() * 100;

        if (this.isDeleting) {
            delta /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === "") {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        setTimeout(() => {
            this.tick();
        }, delta);
    }
}

// Initialize text rotation when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    const elements = document.getElementsByClassName("txt-rotate");
    for (let i = 0; i < elements.length; i++) {
        const toRotate = elements[i].getAttribute("data-rotate");
        const period = elements[i].getAttribute("data-period");
        if (toRotate) {
            new TxtRotate(elements[i], JSON.parse(toRotate), period);
        }
    }

    // Inject CSS for cursor
    const css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML =
        ".txt-rotate > .wrap { border-right: 0.08em solid var(--primary-color) }";
    document.body.appendChild(css);
});

// Add particles.js for background effect
document.addEventListener("DOMContentLoaded", function() {
    const particlesContainer = document.getElementById("particles-js");

    if (particlesContainer && typeof particlesJS !== "undefined") {
        particlesJS("particles-js", {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800,
                    },
                },
                color: {
                    value: "#3b82f6",
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000",
                    },
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                    },
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                    },
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#3b82f6",
                    opacity: 0.4,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: false,
                    },
                },
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab",
                    },
                    onclick: {
                        enable: true,
                        mode: "push",
                    },
                    resize: true,
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1,
                        },
                    },
                    push: {
                        particles_nb: 4,
                    },
                },
            },
            retina_detect: true,
        });
    }
});
// Improved Auto Image Slider Script

document.addEventListener("DOMContentLoaded", function() {
    // Initialize all project sliders
    initProjectSliders();
});

function initProjectSliders() {
    const projectSliders = document.querySelectorAll(".project-slider");

    projectSliders.forEach((slider) => {
        const sliderInner = slider.querySelector(".project-slider-inner");
        const slides = sliderInner.querySelectorAll("img");
        const prevBtn = slider.querySelector(".slider-prev");
        const nextBtn = slider.querySelector(".slider-next");
        const dotsContainer = slider.querySelector(".slider-dots");

        // Skip if there's only one slide
        if (slides.length <= 1) {
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
            return;
        }

        // Set the width of the slider inner
        sliderInner.style.width = `${slides.length * 100}%`;

        // Position each slide
        slides.forEach((slide, index) => {
            slide.style.flex = `0 0 ${100 / slides.length}%`;
        });

        // Create dots
        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement("button");
            dot.classList.add("slider-dot");
            if (i === 0) dot.classList.add("active");
            dot.setAttribute("data-index", i);
            dotsContainer.appendChild(dot);

            // Add click event to dots
            dot.addEventListener("click", () => {
                goToSlide(i);
                resetAutoSlide(); // Reset timer when manually navigating
            });
        }

        let currentIndex = 0;
        let autoSlideInterval;

        // Function to go to a specific slide
        function goToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            currentIndex = index;

            // Update slider position
            sliderInner.style.transform = `translateX(-${
        currentIndex * (100 / slides.length)
      }%)`;

            // Update dots
            const dots = dotsContainer.querySelectorAll(".slider-dot");
            dots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        }

        // Add click events to prev/next buttons
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                goToSlide(currentIndex - 1);
                resetAutoSlide(); // Reset timer when manually navigating
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                goToSlide(currentIndex + 1);
                resetAutoSlide(); // Reset timer when manually navigating
            });
        }

        // Function to start auto sliding
        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 4000); // Change slide every 4 seconds
        }

        // Function to reset auto slide timer
        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        // Start auto sliding
        startAutoSlide();

        // Pause auto sliding on hover
        slider.addEventListener("mouseenter", () => {
            clearInterval(autoSlideInterval);
        });

        // Resume auto sliding when mouse leaves
        slider.addEventListener("mouseleave", () => {
            startAutoSlide();
        });

        // Add swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener(
            "touchstart",
            (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, {
                passive: true
            }
        );

        slider.addEventListener(
            "touchend",
            (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, {
                passive: true
            }
        );

        function handleSwipe() {
            const swipeThreshold = 50; // Minimum distance for a swipe

            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - go to next slide
                goToSlide(currentIndex + 1);
                resetAutoSlide();
            }

            if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - go to previous slide
                goToSlide(currentIndex - 1);
                resetAutoSlide();
            }
        }
    });
}