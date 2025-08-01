document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Scroll Animation Logic (Using IntersectionObserver) ---
    // Select all elements that should animate on scroll
    const faders = document.querySelectorAll(".fade-in");

    // Options for the IntersectionObserver
    const appearOptions = {
        threshold: 0.2, // When 20% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Triggers slightly before element is fully in view
    };

    // Callback function when an observed element intersects the viewport
    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return; // Not in view, do nothing
            } else {
                entry.target.classList.add('visible'); // Add 'visible' class to trigger animation
                appearOnScroll.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, appearOptions);

    // Observe each element with the 'fade-in' class
    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // Optional: Add staggered transition delays for elements within sections
    // This makes them animate one after another for a nicer effect.
    const skillCards = document.querySelectorAll('.skill-card.fade-in');
    skillCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.05}s`; // 50ms delay per card
    });

    const projectCards = document.querySelectorAll('.project-card.fade-in');
    projectCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`; // 100ms delay per card
    });

    const timelineItems = document.querySelectorAll('.timeline-item.fade-in');
    timelineItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.12}s`; // 120ms delay per item
    });


    // --- 2. Navigation Active State ---
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let currentSectionId = "";

        sections.forEach((section) => {
            // Get the position of the section relative to the viewport
            const sectionRect = section.getBoundingClientRect();
            // Check if the top of the section is within a certain range
            // (e.g., between the top of the viewport and 100px below the top)
            if (sectionRect.top <= 100 && sectionRect.bottom >= 100) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            // Check if the link's href matches the current section's ID
            if (link.getAttribute("href").slice(1) === currentSectionId) {
                link.classList.add("active");
            }
        });
    });


    // --- 3. Project Filtering ---
    const filterBtns = document.querySelectorAll(".filter-btn");
    const allProjectCards = document.querySelectorAll(".project-card"); // Renamed to avoid conflict

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((filterBtn) => {
                filterBtn.classList.remove("active");
            });
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            allProjectCards.forEach((card) => { // Use allProjectCards here
                const cardCategory = card.getAttribute("data-category");
                if (filterValue === "all" || cardCategory === filterValue) {
                    card.style.display = "flex"; // Use flex to maintain card layout
                } else {
                    card.style.display = "none";
                }
            });
        });
    });


    // --- 4. Dark Mode Toggle ---
    const themeSwitch = document.querySelector(".theme-switch");

    if (themeSwitch) {
        const darkThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        // Function to apply theme
        function applyThemePreference(isDark) {
            if (isDark) {
                document.body.classList.add("dark-mode");
                themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                document.body.classList.remove("dark-mode");
                themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }

        // Get initial theme preference
        const isDarkMode = localStorage.getItem("darkMode") === "true" ||
            (localStorage.getItem("darkMode") === null && darkThemeMediaQuery.matches);

        // Apply theme on initial load
        applyThemePreference(isDarkMode);

        // Add click listener for theme switch
        themeSwitch.addEventListener("click", () => {
            const currentlyDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("darkMode", !currentlyDark); // Save preference
            applyThemePreference(!currentlyDark); // Apply new preference
        });
    }


    // --- 5. Contact Form Submit (using FormSubmit.co) ---
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        // FormSubmit.co action for your email
        contactForm.setAttribute("action", "https://formsubmit.co/anishantil01@gmail.com");
        contactForm.setAttribute("method", "POST");

        // Add honeypot for spam prevention (hidden field)
        const honeypot = document.createElement("input");
        honeypot.type = "text";
        honeypot.name = "_honey";
        honeypot.style.display = "none";
        contactForm.appendChild(honeypot);

        // Disable reCAPTCHA (optional, if you handle spam another way)
        const disableRecaptcha = document.createElement("input");
        disableRecaptcha.type = "hidden";
        disableRecaptcha.name = "_captcha";
        disableRecaptcha.value = "false";
        contactForm.appendChild(disableRecaptcha);

        // Add a redirect URL after submission (optional)
        const redirectUrl = document.createElement("input");
        redirectUrl.type = "hidden";
        redirectUrl.name = "_next";
        redirectUrl.value = window.location.origin + "/thank-you.html"; // Or just your homepage
        contactForm.appendChild(redirectUrl);

        // Client-side validation
        contactForm.addEventListener("submit", function(e) {
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();

            if (!name || !email || !message) {
                e.preventDefault(); // Prevent default submission
                alert("Please fill out all required fields (Name, Email, Message).");
            }
            // Add more robust email validation if needed
        });
    }


    // --- 6. Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();

            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Adjust scroll position to account for fixed header
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // 80px is approx. navbar height
                    behavior: "smooth",
                });
            }
        });
    });


    // --- 7. Text Rotation Animation for Hero Section ---
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

    const heroRoleElements = document.getElementsByClassName("txt-rotate");
    for (let i = 0; i < heroRoleElements.length; i++) {
        const toRotate = heroRoleElements[i].getAttribute("data-rotate");
        const period = heroRoleElements[i].getAttribute("data-period");
        if (toRotate) {
            new TxtRotate(heroRoleElements[i], JSON.parse(toRotate), period);
        }
    }

    // Inject CSS for cursor (ensure it's only once)
    const existingCursorStyle = document.getElementById('txt-rotate-cursor-style');
    if (!existingCursorStyle) {
        const css = document.createElement("style");
        css.type = "text/css";
        css.id = "txt-rotate-cursor-style"; // Give it an ID to prevent duplicates
        css.innerHTML = ".txt-rotate > .wrap { border-right: 0.08em solid var(--primary-color) }";
        document.body.appendChild(css);
    }


    // --- 8. Particles.js for Background Effect (requires particles.js library) ---
    // Make sure you have <script src="path/to/particles.min.js"></script> in your HTML
    // and a div like <div id="particles-js"></div> where you want them.
    const particlesContainer = document.getElementById("particles-js");

    if (particlesContainer && typeof particlesJS !== "undefined") {
        particlesJS("particles-js", {
            particles: {
                number: {
                    value: 60, // Slightly fewer particles
                    density: {
                        enable: true,
                        value_area: 1000, // Larger area, less dense appearance
                    },
                },
                color: {
                    value: "#cccccc", // Light grey
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000",
                    },
                },
                opacity: {
                    value: 0.6, // Slightly more opaque
                    random: true, // Random opacity for a more natural look
                    anim: {
                        enable: true, // Enable animation for subtle fading
                        speed: 1, // Slow fading
                        opacity_min: 0.1,
                        sync: false,
                    },
                },
                size: {
                    value: 2.5, // Smaller particles
                    random: true,
                    anim: {
                        enable: false, // No animation on size
                    },
                },
                line_linked: {
                    enable: true,
                    distance: 120, // Shorter lines, less "connected" look
                    color: "#e0e0e0", // Lighter grey for lines
                    opacity: 0.5, // Subtle lines
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 0.8, // Slower movement
                    direction: "none",
                    random: true, // Random direction for a natural dust/snow look
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
                        mode: "bubble", // Change hover mode to bubble
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
                    bubble: { // Configuration for bubble mode
                        distance: 200,
                        size: 6,
                        duration: 2,
                        opacity: 0.8,
                        speed: 3,
                    },
                    push: {
                        particles_nb: 2, // Fewer particles pushed on click
                    },
                },
            },
            retina_detect: true,
        });
    }


    // --- 9. Project Sliders Initialization ---
    // This is now called directly inside the DOMContentLoaded.
    initProjectSliders(); // Call the function to set up all sliders


    // --- 10. Project Gallery Initialization ---
    // This is also called directly inside the DOMContentLoaded.
    initProjectGallery(); // Call the function to set up the gallery


    // --- Removed (Original simple modal functionality, replaced by gallery) ---
    // const modal = document.getElementById("modal");
    // const modalImg = document.getElementById("modal-img");
    // const closeModal = document.getElementById("close-modal");
    // const projectImages = document.querySelectorAll(".project-img img");
    // (This part seems to be for a simple image modal, which is now handled by initProjectGallery)
    // If you need a separate simple image modal for images NOT in the project gallery,
    // you'll need to re-add this carefully and ensure unique IDs.
});


// --- Helper Functions (defined outside DOMContentLoaded to be callable) ---

// Function to initialize all project sliders on the page
function initProjectSliders() {
    const projectSliders = document.querySelectorAll(".project-slider");

    projectSliders.forEach((slider) => {
        const sliderInner = slider.querySelector(".project-slider-inner");
        const slides = sliderInner.querySelectorAll("img");
        const prevBtn = slider.querySelector(".slider-prev");
        const nextBtn = slider.querySelector(".slider-next");
        const dotsContainer = slider.querySelector(".slider-dots");

        if (slides.length <= 1) {
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
            if (dotsContainer) dotsContainer.style.display = "none";
            return;
        }

        // --- CORRECTED SLIDER LOGIC ---
        // We no longer set the inner width based on slide count, as CSS handles it with flexbox.
        // We also rely on the transform property to move the images.

        // Create dots and add click listeners
        if (dotsContainer) {
            for (let i = 0; i < slides.length; i++) {
                const dot = document.createElement("button");
                dot.classList.add("slider-dot");
                if (i === 0) dot.classList.add("active");
                dot.setAttribute("data-index", i);
                dotsContainer.appendChild(dot);
                dot.addEventListener("click", () => {
                    goToSlide(i);
                    resetAutoSlide();
                });
            }
        }


        let currentIndex = 0;
        let autoSlideInterval;

        // Function to go to a specific slide
        function goToSlide(index) {
            if (index < 0) {
                index = slides.length - 1;
            } else if (index >= slides.length) {
                index = 0;
            }

            currentIndex = index;
            // The transform now shifts by 100% of the single image's width.
            sliderInner.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Update dots active state
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll(".slider-dot");
                dots.forEach((dot, i) => {
                    dot.classList.toggle("active", i === currentIndex);
                });
            }
        }

        // Add event listeners for navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                goToSlide(currentIndex - 1);
                resetAutoSlide();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                goToSlide(currentIndex + 1);
                resetAutoSlide();
            });
        }

        // Auto slide functions
        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 4000); // Change slide every 4 seconds
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        startAutoSlide(); // Start auto-sliding on load

        // Pause/resume auto-sliding on hover
        slider.addEventListener("mouseenter", () => clearInterval(autoSlideInterval));
        slider.addEventListener("mouseleave", () => startAutoSlide());

        // Swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener("touchend", (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                goToSlide(currentIndex + 1);
                resetAutoSlide();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                goToSlide(currentIndex - 1);
                resetAutoSlide();
            }
        }, { passive: true });
    });
}

// Function to initialize the project gallery modal
function initProjectGallery() {
    const galleryModal = document.querySelector(".project-gallery-modal");
    // Look for buttons that specifically trigger the gallery, e.g., with class 'view-gallery-btn'
    const galleryButtons = document.querySelectorAll(".project-links button.btn-link"); // Target the specific button
    const galleryContainer = document.querySelector(".gallery-container");
    const galleryTitle = document.querySelector(".gallery-title");
    const galleryClose = document.querySelector(".gallery-close");
    const galleryPrev = document.querySelector(".gallery-prev");
    const galleryNext = document.querySelector(".gallery-next");
    const galleryDots = document.querySelector(".gallery-dots");

    if (!galleryModal || !galleryContainer) {
        console.warn("Project gallery modal or container not found. Gallery features might not work.");
        return;
    }

    let currentProjectImages = []; // Stores images for the currently open project
    let currentGalleryIndex = 0;

    // Define project image mappings directly in JS or fetch from data attributes
    const projectImageMap = {
        // Ensure these IDs match your project card IDs in HTML
        "srms-project": [
            { src: "images/SRMS1.png", alt: "STUDENT RESULT MANAGEMENT SYSTEM Screenshot 1" },
            { src: "images/SRMS2.png", alt: "STUDENT RESULT MANAGEMENT SYSTEM Screenshot 2" },
            { src: "images/SRMS3.png", alt: "MANAGE STUDENT" },
            { src: "images/SRMS4.png", alt: "CREATE STUDENT CLASS" },
            { src: "images/SRMS5.png", alt: "MANAGE CLASSES" },
            { src: "images/SRMS6.png", alt: "STUDENT RESULT" },
        ],
        "breakout-game": [
            { src: "images/BBG4.jpg", alt: "BREAK OUT BALL GAME Screenshot 1" },
            { src: "images/BBG1.jpg", alt: "Game START" },
            { src: "images/BBG2.jpg", alt: "ONGOING" },
            { src: "images/BBG5.jpg", alt: "ER MODEL" },
            { src: "images/BBG6.jpg", alt: "GAME OVER" },
        ],
        "note-app": [ // This is the 'noteapp' project from your old script
            { src: "images/AN1.png", alt: "NoteApp Interface" },
            { src: "images/AN2.png", alt: "Tags Feature" },
            { src: "images/AN3.png", alt: "NoteApp Features" },
            { src: "images/AN4.png", alt: "Example" },
            { src: "images/AN5.png", alt: "Notes Created" },
        ],
        "todo-app": [ // This is the 'todo' project from your old script
            { src: "images/TDL1.png", alt: "TO-DO List Login Page" },
            { src: "images/TDL2.png", alt: "TO-DO List" },
            { src: "images/TDL3.png", alt: "TO-DO List Active Task" },
            { src: "images/TDL4.png", alt: "TO-DO List Completed Task" },
        ],
        "ui-components": [ // This is the 'ui' project from your old script
            { src: "images/ui sample.png", alt: "Interactive UI Sample 1" },
            { src: "images/ui sample2.png", alt: "Interactive UI Sample 2" },
        ],
    };

    // Project titles mapping
    const projectTitleMap = {
        "srms-project": "Student Result Management System",
        "breakout-game": "Break Out Ball Game",
        "note-app": "Advanced Notes App - Java Desktop Application",
        "todo-app": "TO-DO List Web Application",
        "ui-components": "Interactive UI Components",
    };


    // Event listener for all "View Gallery" buttons
    galleryButtons.forEach((button) => {
        // Ensure this button is indeed meant for gallery, perhaps by checking its text or another attribute
        if (button.textContent.includes("View Gallery")) {
            button.addEventListener("click", () => {
                // Get the ID of the parent project card
                const projectCard = button.closest(".project-card");
                const projectId = projectCard ? projectCard.id : null;

                if (projectId && projectImageMap[projectId]) {
                    currentProjectImages = projectImageMap[projectId];
                    galleryTitle.textContent = projectTitleMap[projectId] || "Project Gallery";
                    openGallery(currentProjectImages);
                } else {
                    console.warn(`No gallery data found for project ID: ${projectId}`);
                }
            });
        }
    });

    // Function to open the gallery modal with given images
    function openGallery(images) {
        currentProjectImages = images;
        currentGalleryIndex = 0;

        galleryContainer.innerHTML = "";
        galleryDots.innerHTML = "";

        if (images.length === 0) {
            console.warn("No images to display in the gallery.");
            return;
        }

        images.forEach((imgData, index) => {
            const slideDiv = document.createElement("div");
            slideDiv.classList.add("gallery-slide");
            if (index === 0) slideDiv.classList.add("active");

            const img = document.createElement("img");
            img.src = imgData.src;
            img.alt = imgData.alt || "Project Image";

            slideDiv.appendChild(img);
            galleryContainer.appendChild(slideDiv);

            const dot = document.createElement("button");
            dot.classList.add("gallery-dot");
            if (index === 0) dot.classList.add("active");
            dot.setAttribute("data-index", index);
            galleryDots.appendChild(dot);
            dot.addEventListener("click", () => {
                goToGallerySlide(index);
            });
        });

        goToGallerySlide(currentGalleryIndex); // Ensure first slide is active
        galleryModal.style.display = "flex";
        document.body.style.overflow = "hidden"; // Prevent background scrolling
        document.addEventListener("keydown", handleGalleryKeyDown); // Add keydown listener when modal opens
    }

    // Function to navigate to a specific gallery slide
    function goToGallerySlide(index) {
        if (!currentProjectImages.length) return;

        if (index < 0) index = currentProjectImages.length - 1;
        if (index >= currentProjectImages.length) index = 0;

        currentGalleryIndex = index;

        const slides = galleryContainer.querySelectorAll(".gallery-slide");
        const dots = galleryDots.querySelectorAll(".gallery-dot");

        slides.forEach((slide, i) => slide.classList.toggle("active", i === currentGalleryIndex));
        dots.forEach((dot, i) => dot.classList.toggle("active", i === currentGalleryIndex));
    }

    // Navigation for gallery modal
    if (galleryPrev) {
        galleryPrev.addEventListener("click", () => goToGallerySlide(currentGalleryIndex - 1));
    }
    if (galleryNext) {
        galleryNext.addEventListener("click", () => goToGallerySlide(currentGalleryIndex + 1));
    }

    // Close gallery modal listeners
    if (galleryClose) {
        galleryClose.addEventListener("click", () => {
            galleryModal.style.display = "none";
            document.body.style.overflow = "auto";
            document.removeEventListener("keydown", handleGalleryKeyDown); // Remove keydown listener
        });
    }

    if (galleryModal) {
        galleryModal.addEventListener("click", (e) => {
            if (e.target === galleryModal) {
                galleryModal.style.display = "none";
                document.body.style.overflow = "auto";
                document.removeEventListener("keydown", handleGalleryKeyDown); // Remove keydown listener
            }
        });
    }

    // Keyboard navigation for gallery
    function handleGalleryKeyDown(e) {
        // Only respond if the gallery modal is currently open
        if (!galleryModal.style.display || galleryModal.style.display === "none") {
            return;
        }

        if (e.key === "ArrowLeft") {
            goToGallerySlide(currentGalleryIndex - 1);
        } else if (e.key === "ArrowRight") {
            goToGallerySlide(currentGalleryIndex + 1);
        } else if (e.key === "Escape") {
            galleryModal.style.display = "none";
            document.body.style.overflow = "auto";
            document.removeEventListener("keydown", handleGalleryKeyDown); // Ensure it's removed on escape
        }
    }
}
