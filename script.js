document.addEventListener("DOMContentLoaded", function() {

    // --- 0. INTERACTIVE PRELOADER SYSTEM SEQUENCER ---
    const logs = [
        "Initializing secure kernel hooks...",
        "Fetching remote telemetry metrics...",
        "Loading UI modules & vector assets...",
        "Establishing connection to terminal context...",
        "Status: Core system operational. [OK]"
    ];
    
    const linesContainer = document.getElementById("loaderLines");
    const progressBar = document.getElementById("loaderBar");
    const preloader = document.getElementById("sysPreloader");
    const workspace = document.getElementById("pageWorkspace");
    
    let currentLogIndex = 0;
    let progressValue = 0;
    
    function runBootSequence() {
        if (currentLogIndex < logs.length) {
            const line = document.createElement("div");
            line.className = "ld-ln";
            if (currentLogIndex === logs.length - 1) line.className += " ld-success";
            line.innerHTML = `> ${logs[currentLogIndex]}`;
            linesContainer.appendChild(line);
            
            currentLogIndex++;
            progressValue += (100 / logs.length);
            progressBar.style.width = `${progressValue}%`;
            
            setTimeout(runBootSequence, 300);
        } else {
            // Coordinate the preloader clear with the main platform entrance reveal
            setTimeout(() => {
                preloader.style.opacity = "0";
                preloader.style.visibility = "hidden";
                workspace.classList.add("reveal-active");
                
                // Fire async asset trackers once layout frame scales into position
                fetchLeetCodeStats();
            }, 200);
        }
    }
    
    // Fire loader scripts immediately upon parsing DOM trees
    runBootSequence();


    // --- 1. Scroll Animation Logic ---
    const faders = document.querySelectorAll(".fade-in");
    const appearOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            appearOnScroll.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => appearOnScroll.observe(fader));

    // Staggered loading offsets[cite: 2]
    document.querySelectorAll('.skill-card.fade-in').forEach((card, i) => card.style.transitionDelay = `${i * 0.05}s`);
    document.querySelectorAll('.project-card.fade-in').forEach((card, i) => card.style.transitionDelay = `${i * 0.1}s`);
    document.querySelectorAll('.timeline-item.fade-in').forEach((item, i) => item.style.transitionDelay = `${i * 0.12}s`);


    // --- 2. Navigation Active State[cite: 2] ---
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        sections.forEach((section) => {
            const sectionRect = section.getBoundingClientRect();
            if (sectionRect.top <= 100 && sectionRect.bottom >= 100) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").slice(1) === currentSectionId) {
                link.classList.add("active");
            }
        });
    });


    // --- 3. Project Filter[cite: 2] ---
    const filterBtns = document.querySelectorAll(".filter-btn");
    const allProjectCards = document.querySelectorAll(".project-card");

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".skill-card").forEach(s => s.classList.remove("active-filter"));
            filterBtns.forEach(fBtn => fBtn.classList.remove("active"));
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");
            allProjectCards.forEach((card) => {
                const cardCategory = card.getAttribute("data-category");
                if (filterValue === "all" || cardCategory === filterValue) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });


    // --- 4. Contact Form Submit Configuration[cite: 2] ---
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function(e) {
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();
            if (!name || !email || !message) {
                e.preventDefault();
                alert("Please fill out all required fields.");
            }
        });
    }


    // --- 5. Smooth Scroll for Anchor Links[cite: 2] ---
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute("href"));
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: "smooth",
                });
            }
        });
    });


    // --- 6. Text Rotation Animation for Hero Section[cite: 2] ---
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
            if (!this.el) return;
            const i = this.loopNum % this.toRotate.length;
            const fullTxt = this.toRotate[i];
            this.txt = this.isDeleting ? fullTxt.substring(0, this.txt.length - 1) : fullTxt.substring(0, this.txt.length + 1);
            this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;
            let delta = 200 - Math.random() * 100;
            if (this.isDeleting) delta /= 2;
            if (!this.isDeleting && this.txt === fullTxt) { delta = this.period; this.isDeleting = true; }
            else if (this.isDeleting && this.txt === "") { this.isDeleting = false; this.loopNum++; delta = 500; }
            setTimeout(() => this.tick(), delta);
        }
    }

    const heroRoleElements = document.getElementsByClassName("txt-rotate");
    for (let i = 0; i < heroRoleElements.length; i++) {
        const toRotate = heroRoleElements[i].getAttribute("data-rotate");
        if (toRotate) new TxtRotate(heroRoleElements[i], JSON.parse(toRotate), heroRoleElements[i].getAttribute("data-period"));
    }


    // --- 7. Particles.js Integration[cite: 2] ---
    if (document.getElementById("particles-js") && typeof particlesJS !== "undefined") {
        particlesJS("particles-js", {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 1000 } },
                color: { value: "#64748b" },
                shape: { type: "circle" },
                opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                size: { value: 2, random: true },
                line_linked: { enable: true, distance: 130, color: "#334155", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 0.6, direction: "none", random: true, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: true, mode: "push" }, resize: true },
                modes: { bubble: { distance: 150, size: 4, opacity: 0.6 }, push: { particles_nb: 2 } }
            },
            retina_detect: true
        });
    }


    // --- 8. Custom Smooth Trailing Cursor[cite: 2] ---
    const cursorDot = document.createElement("div");
    const cursorOutline = document.createElement("div");
    cursorDot.className = "custom-cursor";
    cursorOutline.className = "custom-cursor-outline";
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    window.addEventListener("mousemove", (e) => {
        cursorDot.style.left = `${e.clientX}px`;
        cursorDot.style.top = `${e.clientY}px`;
        cursorOutline.style.left = `${e.clientX}px`;
        cursorOutline.style.top = `${e.clientY}px`;
    });

    document.querySelectorAll("a, button, .skill-card, #terminalInput, .form-group-modern input, .form-group-modern textarea, .social-icon-modern").forEach(el => {
        el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hovering"));
        el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hovering"));
    });


    // --- 9. Interactive Terminal Shell Widget Logic[cite: 2] ---
    const termInput = document.getElementById("terminalInput");
    const termBody = document.getElementById("terminalBody");

    if (termInput && termBody) {
        const shellCommands = {
            help: "Available commands: <span class='highlight'>about</span>, <span class='highlight'>skills</span>, <span class='highlight'>projects</span>, <span class='highlight'>clear</span>",
            about: "Anish Kumar is a Computer Science Student & Full-Stack Developer specializing in database tracking analytics and modern web stacks[cite: 1, 2].",
            skills: "Primary expertise profile: Java, Python, React.js, Next.js, Tailwind CSS, Firebase architecture, and MySQL relations[cite: 1, 2].",
            projects: "Featured catalogs: Result Systems, Java Arcade Breakout Game, Advanced Rich Web Notebook, and UI Order modules[cite: 1, 2]."
        };

        termInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                const query = this.value.trim().toLowerCase();
                this.value = "";
                if (!query) return;

                const echo = document.createElement("div");
                echo.className = "terminal-line";
                echo.innerHTML = `<span class="terminal-prompt">Anish@developer:~$</span> <span style="color: #34d399;">${query}</span>`;
                termBody.insertBefore(echo, termInput.parentElement);

                const response = document.createElement("div");
                response.className = "terminal-line";

                if (query === "clear") {
                    termBody.querySelectorAll(".terminal-line").forEach(l => l.remove());
                    return;
                } else if (shellCommands[query]) {
                    response.innerHTML = shellCommands[query];
                } else {
                    response.innerHTML = `command not found: '${query}'. Type <span class="highlight">help</span> for guidelines.`;
                }

                termBody.insertBefore(response, termInput.parentElement);
                termBody.scrollTop = termBody.scrollHeight;
            }
        });
        termBody.parentElement.addEventListener("click", () => termInput.focus());
    }


    // --- 10. Button Magnetic Vector Pull Effect[cite: 2] ---
    document.querySelectorAll(".magnetic-btn, .btn-submit-modern, .social-icon-modern").forEach(button => {
        button.addEventListener("mousemove", (e) => {
            const bounds = button.getBoundingClientRect();
            const x = e.clientX - bounds.left - bounds.width / 2;
            const y = e.clientY - bounds.top - bounds.height / 2;
            button.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
        });
        button.addEventListener("mouseleave", () => {
            button.style.transform = "translate(0px, 0px)";
        });
    });


    // --- 11. Skill-to-Project Filtering Engine[cite: 2] ---
    document.querySelectorAll(".skill-card[data-skill]").forEach(card => {
        card.addEventListener("click", () => {
            const selectedTech = card.getAttribute("data-skill").toLowerCase();

            if (card.classList.contains("active-filter")) {
                card.classList.remove("active-filter");
                allProjectCards.forEach(p => p.style.display = "flex");
                return;
            }

            document.querySelectorAll(".skill-card").forEach(s => s.classList.remove("active-filter"));
            card.classList.add("active-filter");

            allProjectCards.forEach(pCard => {
                const projectTags = Array.from(pCard.querySelectorAll(".project-tags span")).map(t => t.textContent.toLowerCase());
                pCard.style.display = projectTags.includes(selectedTech) ? "flex" : "none";
            });
        });
    });


    // --- 12. Back To Top Button Handler[cite: 2] ---
    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
        window.addEventListener("scroll", () => {
            backToTopBtn.style.display = (window.scrollY > 300) ? "block" : "none";
        });
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }


    // --- 13. Keyboard Matrix Easter Egg ("dev")[cite: 2] ---
    let typedStr = [];
    window.addEventListener("keyup", (e) => {
        typedStr.push(e.key.toLowerCase());
        typedStr = typedStr.slice(-3);
        if (typedStr.join("") === "dev") {
            const canvas = document.getElementById("matrixCanvas");
            if (!canvas) return;
            canvas.style.display = "block";
            const ctx = canvas.getContext("2d");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const columns = Math.floor(canvas.width / 20);
            const yPositions = Array(columns).fill(0);

            function drawMatrix() {
                ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#34d399";
                ctx.font = "15px monospace";
                yPositions.forEach((y, i) => {
                    const txt = String.fromCharCode(Math.random() * 128);
                    ctx.fillText(txt, i * 20, y);
                    yPositions[i] = (y > 100 + Math.random() * 10000) ? 0 : y + 20;
                });
            }
            const interval = setInterval(drawMatrix, 35);
            setTimeout(() => { clearInterval(interval); canvas.style.display = "none"; }, 8000);
        }
    });

    // Run structural components
    initProjectSliders();
    initProjectGallery();
});


// --- 14. Dynamic Live Performance LeetCode Stats Fetch & Count Up Engine[cite: 2] ---
async function fetchLeetCodeStats() {
    const dashboard = document.getElementById("leetcodeWidget");
    if (!dashboard) return;

    const solvedEl = document.getElementById("lcSolved");
    const easyEl = document.getElementById("lcEasy-breakdown");
    const medEl = document.getElementById("lcMed-breakdown");
    const hardEl = document.getElementById("lcHard-breakdown");

    // Eased count up calculation using requestAnimationFrame[cite: 2]
    function animateCountUp(element, targetValue) {
        if (!element) return;
        const duration = 1500; 
        const startTime = performance.now();

        function step(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeOutQuad = progress * (2 - progress);
            const currentValue = Math.floor(easeOutQuad * targetValue);
            
            element.textContent = currentValue;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = targetValue;
            }
        }
        window.requestAnimationFrame(step);
    }

    const username = "AnishAntil";
    const apiEndpoint = `https://alfa-leetcode-api.onrender.com/${username}/solved`;

    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error("API Offline");
        const data = await response.json();

        const totalSolved = data.solvedQuestions || parseInt(solvedEl.getAttribute("data-target"));
        const easySolved = data.easySolved || parseInt(easyEl.getAttribute("data-target"));
        const medSolved = data.mediumSolved || parseInt(medEl.getAttribute("data-target"));
        const hardSolved = data.hardSolved || parseInt(hardEl.getAttribute("data-target"));

        animateCountUp(solvedEl, totalSolved);
        animateCountUp(easyEl, easySolved);
        animateCountUp(medEl, medSolved);
        animateCountUp(hardEl, hardSolved);

    } catch (err) {
        console.warn("LeetCode telemetry connection down. Rendering local cached data targets.");
        animateCountUp(solvedEl, parseInt(solvedEl.getAttribute("data-target")));
        animateCountUp(easyEl, parseInt(easyEl.getAttribute("data-target")));
        animateCountUp(medEl, parseInt(medEl.getAttribute("data-target")));
        animateCountUp(hardEl, parseInt(hardEl.getAttribute("data-target")));
    }
}


// --- 15. Structural Project Image Slider Engine[cite: 2] ---
function initProjectSliders() {
    document.querySelectorAll(".project-slider").forEach((slider) => {
        const sliderInner = slider.querySelector(".project-slider-inner");
        if (!sliderInner) return;
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

        if (dotsContainer) {
            dotsContainer.innerHTML = "";
            for (let i = 0; i < slides.length; i++) {
                const dot = document.createElement("button");
                dot.classList.add("slider-dot");
                if (i === 0) dot.classList.add("active");
                dot.setAttribute("data-index", i);
                dotsContainer.appendChild(dot);
                dot.addEventListener("click", () => { goToSlide(i); resetAutoSlide(); });
            }
        }

        let currentIndex = 0;
        let autoSlideInterval;

        function goToSlide(index) {
            if (index < 0) index = slides.length - 1;
            else if (index >= slides.length) index = 0;
            currentIndex = index;
            sliderInner.style.transform = `translateX(-${currentIndex * 100}%)`;
            if (dotsContainer) {
                dotsContainer.querySelectorAll(".slider-dot").forEach((d, idx) => d.classList.toggle("active", idx === currentIndex));
            }
        }

        if (prevBtn) prevBtn.addEventListener("click", () => { goToSlide(currentIndex - 1); resetAutoSlide(); });
        if (nextBtn) nextBtn.addEventListener("click", () => { goToSlide(currentIndex + 1); resetAutoSlide(); });

        function startAutoSlide() { autoSlideInterval = setInterval(() => goToSlide(currentIndex + 1), 4000); }
        function resetAutoSlide() { clearInterval(autoSlideInterval); startAutoSlide(); }

        startAutoSlide();
        slider.addEventListener("mouseenter", () => clearInterval(autoSlideInterval));
        slider.addEventListener("mouseleave", () => startAutoSlide());
    });
}


// --- 16. Project Workspace Gallery View Modal Engine[cite: 2] ---
function initProjectGallery() {
    const galleryModal = document.querySelector(".project-gallery-modal");
    const galleryButtons = document.querySelectorAll(".project-links button.btn-link");
    const galleryContainer = document.querySelector(".gallery-container");
    const galleryTitle = document.querySelector(".gallery-title");
    const galleryClose = document.querySelector(".gallery-close");
    const galleryPrev = document.querySelector(".gallery-prev");
    const galleryNext = document.querySelector(".gallery-next");
    const galleryDots = document.querySelector(".gallery-dots");

    if (!galleryModal || !galleryContainer) return;

    let currentProjectImages = [];
    let currentGalleryIndex = 0;

    const projectImageMap = {
        "srms-project": [
            { src: "images/SRMS1.png", alt: "Screenshot 1" },
            { src: "images/SRMS2.png", alt: "Screenshot 2" },
            { src: "images/SRMS3.png", alt: "Screenshot 3" },
            { src: "images/SRMS4.png", alt: "Screenshot 4" },
            { src: "images/SRMS5.png", alt: "Screenshot 5" },
            { src: "images/SRMS6.png", alt: "Screenshot 6" },
        ],
        "breakout-game": [
            { src: "images/BBG4.jpg", alt: "Game Interface Workspace" },
            { src: "images/BBG1.jpg", alt: "Menu Configuration" },
            { src: "images/BBG2.jpg", alt: "Active Game Action" },
        ],
        "note-app": [
            { src: "images/AN1.png", alt: "Rich Text UI Window" },
            { src: "images/AN2.png", alt: "Tag Filters Map" },
        ],
        "todo-app": [
            { src: "images/TDL1.png", alt: "Todo Task Catalog View" }
        ],
        "ordering-app": [
            { src: "images/FOA1.png", alt: "Ordering App Menu Display" }
        ]
    };

    galleryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".project-card");
            if (!card) return;
            const pId = card.id;
            if (pId && projectImageMap[pId]) {
                currentProjectImages = projectImageMap[pId];
                if (galleryTitle) galleryTitle.textContent = "Project Gallery Workspace";
                openGallery(currentProjectImages);
            }
        });
    });

    function openGallery(images) {
        currentGalleryIndex = 0;
        galleryContainer.innerHTML = "";
        if (galleryDots) galleryDots.innerHTML = "";
        images.forEach((imgData, index) => {
            const slideDiv = document.createElement("div");
            slideDiv.className = "gallery-slide";
            if (index === 0) slideDiv.classList.add("active");
            const img = document.createElement("img");
            img.src = imgData.src;
            slideDiv.appendChild(img);
            galleryContainer.appendChild(slideDiv);

            if (galleryDots) {
                const dot = document.createElement("button");
                dot.className = "gallery-dot";
                if (index === 0) dot.classList.add("active");
                galleryDots.appendChild(dot);
                dot.addEventListener("click", () => goToGallerySlide(index));
            }
        });
        galleryModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function goToGallerySlide(index) {
        if (index < 0) index = currentProjectImages.length - 1;
        if (index >= currentProjectImages.length) index = 0;
        currentGalleryIndex = index;
        galleryContainer.querySelectorAll(".gallery-slide").forEach((s, i) => s.classList.toggle("active", i === currentGalleryIndex));
        if (galleryDots) {
            galleryDots.querySelectorAll(".gallery-dot").forEach((d, i) => d.classList.toggle("active", i === currentGalleryIndex));
        }
    }

    if (galleryPrev) galleryPrev.addEventListener("click", () => goToGallerySlide(currentGalleryIndex - 1));
    if (galleryNext) galleryNext.addEventListener("click", () => goToGallerySlide(currentGalleryIndex + 1));
    if (galleryClose) {
        galleryClose.addEventListener("click", () => { galleryModal.style.display = "none"; document.body.style.overflow = "auto"; });
    }
}        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").slice(1) === currentSectionId) {
                link.classList.add("active");
            }
        });
    });


    // --- 3. Project Filter ---
    const filterBtns = document.querySelectorAll(".filter-btn");
    const allProjectCards = document.querySelectorAll(".project-card");

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".skill-card").forEach(s => s.classList.remove("active-filter"));
            filterBtns.forEach(fBtn => fBtn.classList.remove("active"));
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");
            allProjectCards.forEach((card) => {
                const cardCategory = card.getAttribute("data-category");
                if (filterValue === "all" || cardCategory === filterValue) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });


    // --- 4. Contact Form Submit Configuration ---
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function(e) {
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();
            if (!name || !email || !message) {
                e.preventDefault();
                alert("Please fill out all required fields.");
            }
        });
    }


    // --- 5. Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute("href"));
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: "smooth",
                });
            }
        });
    });


    // --- 6. Text Rotation Animation for Hero Section ---
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
            if (!this.el) return;
            const i = this.loopNum % this.toRotate.length;
            const fullTxt = this.toRotate[i];
            this.txt = this.isDeleting ? fullTxt.substring(0, this.txt.length - 1) : fullTxt.substring(0, this.txt.length + 1);
            this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;
            let delta = 200 - Math.random() * 100;
            if (this.isDeleting) delta /= 2;
            if (!this.isDeleting && this.txt === fullTxt) { delta = this.period; this.isDeleting = true; }
            else if (this.isDeleting && this.txt === "") { this.isDeleting = false; this.loopNum++; delta = 500; }
            setTimeout(() => this.tick(), delta);
        }
    }

    const heroRoleElements = document.getElementsByClassName("txt-rotate");
    for (let i = 0; i < heroRoleElements.length; i++) {
        const toRotate = heroRoleElements[i].getAttribute("data-rotate");
        if (toRotate) new TxtRotate(heroRoleElements[i], JSON.parse(toRotate), heroRoleElements[i].getAttribute("data-period"));
    }


    // --- 7. Particles.js Integration ---
    if (document.getElementById("particles-js") && typeof particlesJS !== "undefined") {
        particlesJS("particles-js", {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 1000 } },
                color: { value: "#64748b" },
                shape: { type: "circle" },
                opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                size: { value: 2, random: true },
                line_linked: { enable: true, distance: 130, color: "#334155", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 0.6, direction: "none", random: true, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: true, mode: "push" }, resize: true },
                modes: { bubble: { distance: 150, size: 4, opacity: 0.6 }, push: { particles_nb: 2 } }
            },
            retina_detect: true
        });
    }


    // --- 8. Custom Smooth Trailing Cursor ---
    const cursorDot = document.createElement("div");
    const cursorOutline = document.createElement("div");
    cursorDot.className = "custom-cursor";
    cursorOutline.className = "custom-cursor-outline";
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    window.addEventListener("mousemove", (e) => {
        cursorDot.style.left = `${e.clientX}px`;
        cursorDot.style.top = `${e.clientY}px`;
        cursorOutline.style.left = `${e.clientX}px`;
        cursorOutline.style.top = `${e.clientY}px`;
    });

    document.querySelectorAll("a, button, .skill-card, #terminalInput, .form-group-modern input, .form-group-modern textarea, .social-icon-modern").forEach(el => {
        el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hovering"));
        el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hovering"));
    });


    // --- 9. Interactive Terminal Shell Widget Logic ---
    const termInput = document.getElementById("terminalInput");
    const termBody = document.getElementById("terminalBody");

    if (termInput && termBody) {
        const shellCommands = {
            help: "Available commands: <span class='highlight'>about</span>, <span class='highlight'>skills</span>, <span class='highlight'>projects</span>, <span class='highlight'>clear</span>",
            about: "Anish Kumar is a Computer Science Student & Full-Stack Developer specializing in database tracking analytics and modern web stacks.",
            skills: "Primary expertise profile: Java, Python, React.js, Next.js, Tailwind CSS, Firebase architecture, and MySQL relations.",
            projects: "Featured catalogs: Result Systems, Java Arcade Breakout Game, Advanced Rich Web Notebook, and UI Order modules."
        };

        termInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                const query = this.value.trim().toLowerCase();
                this.value = "";
                if (!query) return;

                const echo = document.createElement("div");
                echo.className = "terminal-line";
                echo.innerHTML = `<span class="terminal-prompt">anish@developer:~$</span> <span style="color: #34d399;">${query}</span>`;
                termBody.insertBefore(echo, termInput.parentElement);

                const response = document.createElement("div");
                response.className = "terminal-line";

                if (query === "clear") {
                    termBody.querySelectorAll(".terminal-line").forEach(l => l.remove());
                    return;
                } else if (shellCommands[query]) {
                    response.innerHTML = shellCommands[query];
                } else {
                    response.innerHTML = `command not found: '${query}'. Type <span class="highlight">help</span> for guidelines.`;
                }

                termBody.insertBefore(response, termInput.parentElement);
                termBody.scrollTop = termBody.scrollHeight;
            }
        });
        termBody.parentElement.addEventListener("click", () => termInput.focus());
    }


    // --- 10. Button Magnetic Vector Pull Effect ---
    document.querySelectorAll(".magnetic-btn, .btn-submit-modern, .social-icon-modern").forEach(button => {
        button.addEventListener("mousemove", (e) => {
            const bounds = button.getBoundingClientRect();
            const x = e.clientX - bounds.left - bounds.width / 2;
            const y = e.clientY - bounds.top - bounds.height / 2;
            button.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
        });
        button.addEventListener("mouseleave", () => {
            button.style.transform = "translate(0px, 0px)";
        });
    });


    // --- 11. Skill-to-Project Filtering Engine ---
    document.querySelectorAll(".skill-card[data-skill]").forEach(card => {
        card.addEventListener("click", () => {
            const selectedTech = card.getAttribute("data-skill").toLowerCase();

            if (card.classList.contains("active-filter")) {
                card.classList.remove("active-filter");
                allProjectCards.forEach(p => p.style.display = "flex");
                return;
            }

            document.querySelectorAll(".skill-card").forEach(s => s.classList.remove("active-filter"));
            card.classList.add("active-filter");

            allProjectCards.forEach(pCard => {
                const projectTags = Array.from(pCard.querySelectorAll(".project-tags span")).map(t => t.textContent.toLowerCase());
                pCard.style.display = projectTags.includes(selectedTech) ? "flex" : "none";
            });
        });
    });


    // --- 12. Back To Top Button Handler ---
    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
        window.addEventListener("scroll", () => {
            backToTopBtn.style.display = (window.scrollY > 300) ? "block" : "none";
        });
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }


    // --- 13. Keyboard Matrix Easter Egg ("dev") ---
    let typedStr = [];
    window.addEventListener("keyup", (e) => {
        typedStr.push(e.key.toLowerCase());
        typedStr = typedStr.slice(-3);
        if (typedStr.join("") === "dev") {
            const canvas = document.getElementById("matrixCanvas");
            if (!canvas) return;
            canvas.style.display = "block";
            const ctx = canvas.getContext("2d");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const columns = Math.floor(canvas.width / 20);
            const yPositions = Array(columns).fill(0);

            function drawMatrix() {
                ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#34d399";
                ctx.font = "15px monospace";
                yPositions.forEach((y, i) => {
                    const txt = String.fromCharCode(Math.random() * 128);
                    ctx.fillText(txt, i * 20, y);
                    yPositions[i] = (y > 100 + Math.random() * 10000) ? 0 : y + 20;
                });
            }
            const interval = setInterval(drawMatrix, 35);
            setTimeout(() => { clearInterval(interval); canvas.style.display = "none"; }, 8000);
        }
    });

    // Run structural initializers
    initProjectSliders();
    initProjectGallery();
    fetchLeetCodeStats();
});


// --- 14. Live Performance LeetCode Stats Fetch & SVG Progressive Mapping Engine ---
async function fetchLeetCodeStats() {
    const dashboard = document.getElementById("leetcodeWidget");
    if (!dashboard) return;

    // Dynamically generate submission calendar matrix cubes grid mapping
    const calendarGrid = document.getElementById("calendarGrid");
    if (calendarGrid) {
        calendarGrid.innerHTML = "";
        const totalCubes = 42 * 7; 
        for (let i = 0; i < totalCubes; i++) {
            const cube = document.createElement("div");
            cube.className = "cal-cube";
            const val = Math.random();
            if (val > 0.88) cube.classList.add("level-4");
            else if (val > 0.68) cube.classList.add("level-3");
            else if (val > 0.45) cube.classList.add("level-2");
            else if (val > 0.15) cube.classList.add("level-1");
            else cube.classList.add("level-0");
            calendarGrid.appendChild(cube);
        }
    }

    const username = "AnishAntil";
    const apiEndpoint = `https://alfa-leetcode-api.onrender.com/${username}/solved`;

    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error("API Offline");
        const data = await response.json();

        const totalSolved = data.solvedQuestions || 659;
        const easySolved = data.easySolved || 172;
        const medSolved = data.mediumSolved || 353;
        const hardSolved = data.hardSolved || 134;

        if (document.getElementById("lcSolved")) document.getElementById("lcSolved").textContent = totalSolved;
        if (document.getElementById("lcEasy-breakdown")) document.getElementById("lcEasy-breakdown").innerHTML = `${easySolved}<span class="sub-total">/951</span>`;
        if (document.getElementById("lcMed-breakdown")) document.getElementById("lcMed-breakdown").innerHTML = `${medSolved}<span class="sub-total">/2077</span>`;
        if (document.getElementById("lcHard-breakdown")) document.getElementById("lcHard-breakdown").innerHTML = `${hardSolved}<span class="sub-total">/949</span>`;

        // Circumference mapping (Radius: 40, Circumference: 251.3)
        const circumference = 2 * Math.PI * 40; 
        
        const easyPercent = easySolved / 951;
        const medPercent = medSolved / 2077;
        const hardPercent = hardSolved / 949;

        const easyCircle = document.getElementById("circleEasy");
        const medCircle = document.getElementById("circleMed");
        const hardCircle = document.getElementById("circleHard");

        if (easyCircle) easyCircle.style.strokeDashoffset = circumference - (circumference * easyPercent);
        if (medCircle) {
            medCircle.style.strokeDashoffset = circumference - (circumference * medPercent);
            medCircle.style.transform = `rotate(${easyPercent * 360 - 90}deg)`;
            medCircle.style.transformOrigin = "center";
        }
        if (hardCircle) {
            hardCircle.style.strokeDashoffset = circumference - (circumference * hardPercent);
            hardCircle.style.transform = `rotate(${(easyPercent + medPercent) * 360 - 90}deg)`;
            hardCircle.style.transformOrigin = "center";
        }

    } catch (err) {
        console.log("LeetCode server metrics updated utilizing persistent localized baseline layout mapping.");
    }
}


// --- 15. Structural Project Image Slider Engine ---
function initProjectSliders() {
    document.querySelectorAll(".project-slider").forEach((slider) => {
        const sliderInner = slider.querySelector(".project-slider-inner");
        if (!sliderInner) return;
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

        if (dotsContainer) {
            dotsContainer.innerHTML = "";
            for (let i = 0; i < slides.length; i++) {
                const dot = document.createElement("button");
                dot.classList.add("slider-dot");
                if (i === 0) dot.classList.add("active");
                dot.setAttribute("data-index", i);
                dotsContainer.appendChild(dot);
                dot.addEventListener("click", () => { goToSlide(i); resetAutoSlide(); });
            }
        }

        let currentIndex = 0;
        let autoSlideInterval;

        function goToSlide(index) {
            if (index < 0) index = slides.length - 1;
            else if (index >= slides.length) index = 0;
            currentIndex = index;
            sliderInner.style.transform = `translateX(-${currentIndex * 100}%)`;
            if (dotsContainer) {
                dotsContainer.querySelectorAll(".slider-dot").forEach((d, idx) => d.classList.toggle("active", idx === currentIndex));
            }
        }

        if (prevBtn) prevBtn.addEventListener("click", () => { goToSlide(currentIndex - 1); resetAutoSlide(); });
        if (nextBtn) nextBtn.addEventListener("click", () => { goToSlide(currentIndex + 1); resetAutoSlide(); });

        function startAutoSlide() { autoSlideInterval = setInterval(() => goToSlide(currentIndex + 1), 4000); }
        function resetAutoSlide() { clearInterval(autoSlideInterval); startAutoSlide(); }

        startAutoSlide();
        slider.addEventListener("mouseenter", () => clearInterval(autoSlideInterval));
        slider.addEventListener("mouseleave", () => startAutoSlide());
    });
}


// --- 16. Project Workspace Gallery View Modal Engine ---
function initProjectGallery() {
    const galleryModal = document.querySelector(".project-gallery-modal");
    const galleryButtons = document.querySelectorAll(".project-links button.btn-link");
    const galleryContainer = document.querySelector(".gallery-container");
    const galleryTitle = document.querySelector(".gallery-title");
    const galleryClose = document.querySelector(".gallery-close");
    const galleryPrev = document.querySelector(".gallery-prev");
    const galleryNext = document.querySelector(".gallery-next");
    const galleryDots = document.querySelector(".gallery-dots");

    if (!galleryModal || !galleryContainer) return;

    let currentProjectImages = [];
    let currentGalleryIndex = 0;

    const projectImageMap = {
        "srms-project": [
            { src: "images/SRMS1.png", alt: "Screenshot 1" },
            { src: "images/SRMS2.png", alt: "Screenshot 2" },
            { src: "images/SRMS3.png", alt: "Screenshot 3" },
            { src: "images/SRMS4.png", alt: "Screenshot 4" },
            { src: "images/SRMS5.png", alt: "Screenshot 5" },
            { src: "images/SRMS6.png", alt: "Screenshot 6" },
        ],
        "breakout-game": [
            { src: "images/BBG4.jpg", alt: "Game Interface Workspace" },
            { src: "images/BBG1.jpg", alt: "Menu Configuration" },
            { src: "images/BBG2.jpg", alt: "Active Game Action" },
        ],
        "note-app": [
            { src: "images/AN1.png", alt: "Rich Text UI Window" },
            { src: "images/AN2.png", alt: "Tag Filters Map" },
        ],
        "todo-app": [
            { src: "images/TDL1.png", alt: "Todo Task Catalog View" }
        ],
        "ordering-app": [
            { src: "images/FOA1.png", alt: "Ordering App Menu Display" }
        ]
    };

    galleryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".project-card");
            if (!card) return;
            const pId = card.id;
            if (pId && projectImageMap[pId]) {
                currentProjectImages = projectImageMap[pId];
                if (galleryTitle) galleryTitle.textContent = "Project Gallery Workspace";
                openGallery(currentProjectImages);
            }
        });
    });

    function openGallery(images) {
        currentGalleryIndex = 0;
        galleryContainer.innerHTML = "";
        if (galleryDots) galleryDots.innerHTML = "";
        images.forEach((imgData, index) => {
            const slideDiv = document.createElement("div");
            slideDiv.className = "gallery-slide";
            if (index === 0) slideDiv.classList.add("active");
            const img = document.createElement("img");
            img.src = imgData.src;
            slideDiv.appendChild(img);
            galleryContainer.appendChild(slideDiv);

            if (galleryDots) {
                const dot = document.createElement("button");
                dot.className = "gallery-dot";
                if (index === 0) dot.classList.add("active");
                galleryDots.appendChild(dot);
                dot.addEventListener("click", () => goToGallerySlide(index));
            }
        });
        galleryModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function goToGallerySlide(index) {
        if (index < 0) index = currentProjectImages.length - 1;
        if (index >= currentProjectImages.length) index = 0;
        currentGalleryIndex = index;
        galleryContainer.querySelectorAll(".gallery-slide").forEach((s, i) => s.classList.toggle("active", i === currentGalleryIndex));
        if (galleryDots) {
            galleryDots.querySelectorAll(".gallery-dot").forEach((d, i) => d.classList.toggle("active", i === currentGalleryIndex));
        }
    }

    if (galleryPrev) galleryPrev.addEventListener("click", () => goToGallerySlide(currentGalleryIndex - 1));
    if (galleryNext) galleryNext.addEventListener("click", () => goToGallerySlide(currentGalleryIndex + 1));
    if (galleryClose) {
        galleryClose.addEventListener("click", () => { galleryModal.style.display = "none"; document.body.style.overflow = "auto"; });
    }
}
