document.addEventListener("DOMContentLoaded", function() {

    // --- 0. GRAND ENTRANCE SEQUENCER ---
    const introSplash = document.getElementById("introSplash");
    const workspace = document.getElementById("pageWorkspace");
    const heroImage = document.querySelector(".hero-image");
    const introReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function revealContent() {
        workspace.classList.add("reveal-active");
        if (heroImage) {
            heroImage.classList.add("img-reveal");

            // The shape's pop-in keyframe holds its final transform value
            // indefinitely (fill-mode: both), which would otherwise block
            // the hover "flatten" transition from ever taking effect. Once
            // the one-time entrance finishes, hand control back to the
            // plain transition so hovering stays smooth.
            const shape = heroImage.querySelector(".hero-image-shape");
            if (shape) {
                shape.addEventListener("animationend", function onEntranceDone(e) {
                    if (e.animationName === "shapeEntrance") {
                        shape.style.animation = "none";
                        shape.removeEventListener("animationend", onEntranceDone);
                    }
                });
            }
        }
    }

    if (introReducedMotion || !introSplash) {
        // Skip the theatrics entirely for folks who've asked for reduced motion.
        if (introSplash) introSplash.classList.add("intro-hidden");
        revealContent();
        fetchLeetCodeStats();
        startLeetCodePolling();
    } else {
        document.body.style.overflow = "hidden";

        // Phase 1 (0 - 900ms): the "AK" logo halves draw in on each curtain.
        // Phase 2 (~900ms): bring the real content up to its resting state
        // while it's still hidden behind the curtains.
        setTimeout(revealContent, 900);

        // Phase 3 (~1500ms): pull the curtains apart to reveal the fully
        // settled page, timed with a shockwave pulse at the seam.
        setTimeout(() => {
            introSplash.classList.add("curtain-open", "shock-active");
            document.body.style.overflow = "";
            fetchLeetCodeStats();
            startLeetCodePolling();
        }, 1500);

        // Phase 4: once the curtains are fully offscreen, drop the splash
        // from the render tree so it can't intercept clicks or scrolling.
        setTimeout(() => {
            introSplash.classList.add("intro-hidden");
        }, 2800);
    }

    // Pause live-sync polling when the tab is hidden, resync immediately when it's back
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopLeetCodePolling();
        } else {
            fetchLeetCodeStats();
            startLeetCodePolling();
        }
    });


    // --- 1. Scroll Animation Logic ---

    // Give timeline items a left/right slide that matches their alternating
    // layout, project cards a zig-zag entrance, and skill cards a punchy pop-in.
    document.querySelectorAll('.timeline-item.fade-in').forEach((item, i) => {
        item.classList.remove('fade-in');
        item.classList.add(i % 2 === 0 ? 'fade-right' : 'fade-left');
    });
    document.querySelectorAll('.project-card.fade-in').forEach((card, i) => {
        card.classList.remove('fade-in');
        card.classList.add(i % 2 === 0 ? 'fade-left' : 'fade-right');
    });
    document.querySelectorAll('.skill-card.fade-in').forEach(card => {
        card.classList.remove('fade-in');
        card.classList.add('fade-pop');
    });

    const faders = document.querySelectorAll(".fade-in, .fade-left, .fade-right, .fade-pop");
    const appearOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add('visible');
            // Drop the promoted compositing layer once the reveal transition
            // actually finishes, so we're not holding onto it for content
            // that's done animating and just sitting on the page.
            el.addEventListener('transitionend', () => el.classList.remove('will-animate'), { once: true });
            appearOnScroll.unobserve(entry.target);
        });
    }, appearOptions);

    // Tag every fader with `.will-animate` *before* observing it — this is
    // what gives it a cheap, dedicated compositing layer for the moment it
    // actually animates in, without permanently promoting elements that have
    // already settled (see the `.will-animate` rule in style.css).
    faders.forEach(fader => {
        fader.classList.add('will-animate');
        appearOnScroll.observe(fader);
    });

    // Staggered loading offsets[cite: 2]
    document.querySelectorAll('.skill-card.fade-pop').forEach((card, i) => card.style.transitionDelay = `${i * 0.06}s`);
    document.querySelectorAll('.project-card.fade-left, .project-card.fade-right').forEach((card, i) => card.style.transitionDelay = `${i * 0.12}s`);
    document.querySelectorAll('.timeline-item.fade-left, .timeline-item.fade-right').forEach((item, i) => item.style.transitionDelay = `${i * 0.15}s`);

    // Generic stagger for everything still plain ".fade-in" (hero copy lines,
    // contact items, footer columns, etc.) — group by immediate parent so
    // siblings inside the same block cascade in together, capped so a long
    // list doesn't end up with an absurd multi-second delay tail.
    const staggerGroups = new Map();
    document.querySelectorAll('.fade-in').forEach((el) => {
        const parent = el.parentElement;
        const index = staggerGroups.get(parent) || 0;
        el.style.transitionDelay = `${Math.min(index, 6) * 0.08}s`;
        staggerGroups.set(parent, index + 1);
    });


    // --- 2. Navigation Scroll-Spy (IntersectionObserver-based) ---
    // More efficient and more accurate than measuring getBoundingClientRect()
    // on every scroll tick: the browser only notifies us when a section's
    // visibility relative to the viewport actually changes.
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    function setActiveNavLink(sectionId) {
        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href").slice(1) === sectionId);
        });
    }

    if (sections.length && navLinks.length) {
        // Treat a section as "active" once it occupies the band just below
        // the fixed header, roughly centered in the remaining viewport.
        const scrollSpy = new IntersectionObserver((entries) => {
            // Multiple sections can report simultaneously near boundaries;
            // pick whichever has the greatest intersection ratio right now.
            const mostVisible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (mostVisible) setActiveNavLink(mostVisible.target.id);
        }, {
            rootMargin: "-80px 0px -55% 0px",
            threshold: [0.1, 0.25, 0.5, 0.75]
        });

        sections.forEach(section => scrollSpy.observe(section));
    }


    // --- 2b. Scroll-progress bar + scroll-direction tracking ---
    // Single rAF-throttled scroll handler drives both: the thin fixed bar at
    // the top of the viewport, and a body-level class that flips whenever the
    // user reverses scroll direction (used by the direction-aware reveal CSS).
    const scrollProgressBar = document.getElementById("scrollProgressBar");
    let lastScrollY = window.scrollY;
    let scrollTicking = false;

    function updateScrollEffects() {
        const currentScrollY = window.scrollY;

        if (scrollProgressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? Math.min(currentScrollY / docHeight, 1) : 0;
            scrollProgressBar.style.transform = `scaleX(${progress})`;
        }

        if (currentScrollY > lastScrollY + 2) {
            document.body.classList.add("scrolling-down");
            document.body.classList.remove("scrolling-up");
        } else if (currentScrollY < lastScrollY - 2) {
            document.body.classList.add("scrolling-up");
            document.body.classList.remove("scrolling-down");
        }
        lastScrollY = currentScrollY;
        scrollTicking = false;
    }

    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            requestAnimationFrame(updateScrollEffects);
            scrollTicking = true;
        }
    }, { passive: true });

    updateScrollEffects(); // set initial state on load (e.g. after a refresh mid-page)


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
    // Skipped entirely on small/mobile viewports and when the user prefers
    // reduced motion — a continuously-animating canvas of 50 linked
    // particles is pure overhead on a phone and provides little visual
    // payoff at that size anyway.
    const isSmallViewport = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (document.getElementById("particles-js") && typeof particlesJS !== "undefined" && !isSmallViewport && !prefersReducedMotion) {
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


    // --- 8. Custom Smooth Trailing Cursor (dot + lagging outer ring) ---
    // Only wire this up on devices with a real mouse — touch/coarse pointers
    // get no benefit from it and it'd otherwise leave a ghost cursor pinned
    // at the last touch point.
    const supportsFineCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (supportsFineCursor) {
        const cursorDot = document.createElement("div");
        const cursorOutline = document.createElement("div");
        cursorDot.className = "custom-cursor";
        cursorOutline.className = "custom-cursor-outline";
        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorOutline);

        // Target = true pointer position (updated instantly on every mousemove).
        // Rendered = the outline's current on-screen position, eased toward the
        // target a little each frame — that easing gap is what reads as "lag".
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let ringX = targetX;
        let ringY = targetY;
        const LAG_FACTOR = 0.16; // lower = laggier ring, higher = snappier

        window.addEventListener("mousemove", (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            // Dot tracks the pointer with zero lag.
            cursorDot.style.left = `${targetX}px`;
            cursorDot.style.top = `${targetY}px`;
        }, { passive: true });

        function animateCursorRing() {
            ringX += (targetX - ringX) * LAG_FACTOR;
            ringY += (targetY - ringY) * LAG_FACTOR;
            cursorOutline.style.left = `${ringX}px`;
            cursorOutline.style.top = `${ringY}px`;
            requestAnimationFrame(animateCursorRing);
        }
        requestAnimationFrame(animateCursorRing);

        // Standard scale-up over links/buttons/inputs.
        document.querySelectorAll("a, button, #terminalInput, .form-group-modern input, .form-group-modern textarea, .social-icon-modern").forEach(el => {
            el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hovering"));
            el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hovering"));
        });

        // Bigger, more deliberate scale-up specifically over cards, so the
        // ring visually "frames" the card rather than just nudging bigger.
        document.querySelectorAll(".skill-card, .project-card, .contact-item, .timeline-content").forEach(el => {
            el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hovering-card"));
            el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hovering-card"));
        });
    }


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
        let magTicking = false;
        let magLastEvent = null;

        button.addEventListener("mousemove", (e) => {
            magLastEvent = e;
            if (magTicking) return;
            magTicking = true;
            requestAnimationFrame(() => {
                const bounds = button.getBoundingClientRect();
                const x = magLastEvent.clientX - bounds.left - bounds.width / 2;
                const y = magLastEvent.clientY - bounds.top - bounds.height / 2;
                button.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
                magTicking = false;
            });
        }, { passive: true });
        button.addEventListener("mouseleave", () => {
            button.style.transform = "translate(0px, 0px)";
        }, { passive: true });
    });


    // --- 10b. Subtle 3D Tilt Effect (project cards + skill cards) ---
    // Perspective/rotation transform driven by mouse position within the
    // card, capped to a small max angle so it reads as "premium subtlety"
    // rather than a gimmick. Skipped entirely on touch/coarse pointers,
    // where there's no hover position to drive it anyway.
    function initTiltEffect(selector, options = {}) {
        const maxTilt = options.maxTilt ?? 8;      // degrees, capped
        const scale = options.scale ?? 1.03;
        const perspective = options.perspective ?? 800;

        if (!supportsFineCursor) return; // reuse the same fine-pointer check as the cursor

        document.querySelectorAll(selector).forEach((card) => {
            let ticking = false;
            let lastEvent = null;

            card.addEventListener("mousemove", (e) => {
                lastEvent = e;
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    const bounds = card.getBoundingClientRect();
                    const px = (lastEvent.clientX - bounds.left) / bounds.width;  // 0 -> 1 across the card
                    const py = (lastEvent.clientY - bounds.top) / bounds.height;  // 0 -> 1 down the card

                    // Center-relative offset (-0.5 -> 0.5), inverted on the X axis
                    // because rotating around the X axis tilts the *top* toward
                    // you when the pointer is near the bottom, and vice versa.
                    const rotateX = (0.5 - py) * (maxTilt * 2);
                    const rotateY = (px - 0.5) * (maxTilt * 2);

                    card.classList.add("tilt-active");
                    card.style.transform =
                        `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale}) translateY(-12px)`;
                    ticking = false;
                });
            }, { passive: true });

            card.addEventListener("mouseleave", () => {
                // Let the card's own CSS transition (re-enabled once
                // .tilt-active is a no-op for `transform`) ease it flat again.
                card.classList.remove("tilt-active");
                card.style.transform = "";
            }, { passive: true });
        });
    }

    initTiltEffect(".project-card", { maxTilt: 6, scale: 1.03 });
    initTiltEffect(".skill-card", { maxTilt: 10, scale: 1.08 });


    // --- 10c. Button Ripple / Glow-Trail Click Micro-Interaction ---
    function initButtonRipple(selector) {
        document.querySelectorAll(selector).forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const bounds = btn.getBoundingClientRect();
                const ripple = document.createElement("span");
                ripple.className = "btn-ripple";

                // Size the ripple so it always fully covers the button from
                // whichever corner the click landed nearest to.
                const size = Math.max(bounds.width, bounds.height) * 2.2;
                ripple.style.width = `${size}px`;
                ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - bounds.left}px`;
                ripple.style.top = `${e.clientY - bounds.top}px`;

                btn.appendChild(ripple);
                ripple.addEventListener("animationend", () => ripple.remove());
                // Safety-net cleanup in case animationend doesn't fire (e.g. element removed mid-animation)
                setTimeout(() => ripple.remove(), 800);
            });
        });
    }

    initButtonRipple(".btn-primary, .btn-secondary, .btn-submit-modern");


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
    // Disabled on small/mobile viewports: the canvas rain is a fairly heavy
    // per-frame fill+draw loop, and phones rarely have hardware keyboards to
    // type the trigger on anyway.
    let typedStr = [];
    window.addEventListener("keyup", (e) => {
        if (window.innerWidth <= 768) return;

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
const LEETCODE_REFRESH_MS = 5 * 60 * 1000; // 5 minutes — considerate default for a free, rate-limited API
const LEETCODE_RATE_LIMIT_COOLDOWN_MS = 60 * 60 * 1000; // back off for 1 hour when rate-limited
let leetCodeFetchInFlight = false;
let leetCodePollTimer = null;
let leetCodeCooldownTimer = null;
let lcLastSyncAt = null;   // timestamp (ms) of the last successful sync
let lcSyncFailed = false;  // true while the most recent attempt failed
let lcRateLimited = false; // true while we're deliberately backing off from a 429

function startLeetCodePolling() {
    stopLeetCodePolling();
    if (lcRateLimited) return; // don't resume normal polling mid-cooldown
    leetCodePollTimer = setInterval(fetchLeetCodeStats, LEETCODE_REFRESH_MS);
}

function stopLeetCodePolling() {
    if (leetCodePollTimer) {
        clearInterval(leetCodePollTimer);
        leetCodePollTimer = null;
    }
}

// If the API tells us we're rate-limited, stop hammering it entirely and
// wait out a full cooldown window before trying again — repeatedly retrying
// every few seconds only makes the block last longer.
function enterRateLimitCooldown() {
    lcRateLimited = true;
    stopLeetCodePolling();
    if (leetCodeCooldownTimer) clearTimeout(leetCodeCooldownTimer);
    leetCodeCooldownTimer = setTimeout(() => {
        lcRateLimited = false;
        fetchLeetCodeStats();
        startLeetCodePolling();
    }, LEETCODE_RATE_LIMIT_COOLDOWN_MS);
    updateSyncStatusDisplay();
}

// Ticks every second so you can visually confirm the widget is alive even on
// polls where the underlying LeetCode numbers happen not to change.
function updateSyncStatusDisplay() {
    const syncStatusEl = document.getElementById("lcSyncStatus");
    if (!syncStatusEl) return;

    if (lcRateLimited) {
        syncStatusEl.textContent = "Rate limited — retrying in ~1h";
        return;
    }
    if (lcSyncFailed) {
        syncStatusEl.textContent = "Sync failed — retrying soon";
        return;
    }
    if (!lcLastSyncAt) {
        syncStatusEl.textContent = "Live Sync";
        return;
    }
    const secs = Math.floor((Date.now() - lcLastSyncAt) / 1000);
    if (secs < 5) syncStatusEl.textContent = "Synced just now";
    else if (secs < 60) syncStatusEl.textContent = `Synced ${secs}s ago`;
    else syncStatusEl.textContent = `Synced ${Math.floor(secs / 60)}m ago`;
}
setInterval(updateSyncStatusDisplay, 1000);

async function fetchLeetCodeStats() {
    const dashboard = document.getElementById("leetcodeWidget");
    if (!dashboard) return;
    if (leetCodeFetchInFlight) return; // never let two syncs race each other
    leetCodeFetchInFlight = true;

    const solvedEl = document.getElementById("lcSolved");
    const easyEl = document.getElementById("lcEasy-breakdown");
    const medEl = document.getElementById("lcMed-breakdown");
    const hardEl = document.getElementById("lcHard-breakdown");

    // Eased transition from whatever is currently on screen to the new value,
    // so a periodic refresh doesn't reset the counters back to 0 every time.
    function animateCountUp(element, targetValue) {
        if (!element) return;
        const startValue = parseInt(element.textContent, 10) || 0;
        if (startValue === targetValue) return;

        const duration = 1200;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeOutQuad = progress * (2 - progress);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuad);
            element.textContent = currentValue;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = targetValue;
            }
        }
        window.requestAnimationFrame(step);
    }

    function flashUpdated() {
        dashboard.classList.add("lc-just-updated");
        setTimeout(() => dashboard.classList.remove("lc-just-updated"), 800);
    }

    function applyFallbackIfEmpty() {
        // Only fall back to the hard-coded targets if nothing has ever loaded yet,
        // so a temporary blip during a later poll doesn't wipe out real numbers.
        if ((parseInt(solvedEl.textContent, 10) || 0) === 0) {
            animateCountUp(solvedEl, parseInt(solvedEl.getAttribute("data-target"), 10));
            animateCountUp(easyEl, parseInt(easyEl.getAttribute("data-target"), 10));
            animateCountUp(medEl, parseInt(medEl.getAttribute("data-target"), 10));
            animateCountUp(hardEl, parseInt(hardEl.getAttribute("data-target"), 10));
        }
    }

    const username = "AnishAntil";
    const apiEndpoint = `https://alfa-leetcode-api.onrender.com/${username}/solved`;

    try {
        const response = await fetch(apiEndpoint, { cache: "no-store" });
        const rawText = await response.text();

        if (response.status === 429 || /too many request/i.test(rawText)) {
            throw Object.assign(new Error(`Rate limited: ${rawText.slice(0, 200)}`), { isRateLimit: true });
        }
        if (!response.ok) {
            throw new Error(`API responded with HTTP ${response.status}: ${rawText.slice(0, 200)}`);
        }

        let data;
        try {
            data = JSON.parse(rawText);
        } catch {
            throw new Error(`API returned non-JSON body: ${rawText.slice(0, 200)}`);
        }

        const easySolved = data.easySolved ?? parseInt(easyEl.getAttribute("data-target"), 10);
        const medSolved = data.mediumSolved ?? parseInt(medEl.getAttribute("data-target"), 10);
        const hardSolved = data.hardSolved ?? parseInt(hardEl.getAttribute("data-target"), 10);

        // The API's own "solvedQuestions" total has been observed to lag behind
        // its own easy/medium/hard breakdown, so derive the total from the
        // breakdown (which the API keeps accurate) rather than trusting it directly.
        const breakdownTotal = easySolved + medSolved + hardSolved;
        const apiTotal = data.solvedQuestions;
        const totalSolved = Number.isFinite(breakdownTotal) && breakdownTotal > 0
            ? breakdownTotal
            : (apiTotal ?? parseInt(solvedEl.getAttribute("data-target"), 10));

        if (apiTotal !== undefined && apiTotal !== totalSolved) {
            console.warn(`[LeetCode widget] API's own total (${apiTotal}) disagreed with its easy+medium+hard breakdown (${breakdownTotal}) — using the breakdown sum.`);
        }
        if (apiTotal === undefined) {
            console.warn("[LeetCode widget] response is missing 'solvedQuestions' — using the breakdown sum instead. Full response:", data);
        }

        const hasChanged = [
            [solvedEl, totalSolved],
            [easyEl, easySolved],
            [medEl, medSolved],
            [hardEl, hardSolved],
        ].some(([el, val]) => (parseInt(el.textContent, 10) || 0) !== val);

        animateCountUp(solvedEl, totalSolved);
        animateCountUp(easyEl, easySolved);
        animateCountUp(medEl, medSolved);
        animateCountUp(hardEl, hardSolved);

        if (hasChanged) flashUpdated();

        lcLastSyncAt = Date.now();
        lcSyncFailed = false;
        lcRateLimited = false;
        updateSyncStatusDisplay();

        // Surface it for easy manual verification from the browser console too
        console.info("[LeetCode widget] synced OK:", { totalSolved, easySolved, medSolved, hardSolved, rawResponse: data, at: new Date().toISOString() });

    } catch (err) {
        if (err && err.isRateLimit) {
            console.warn("[LeetCode widget] rate-limited by the API — backing off for 1 hour instead of retrying repeatedly:", err.message);
            enterRateLimitCooldown();
            applyFallbackIfEmpty();
            leetCodeFetchInFlight = false;
            return;
        }
        console.warn("[LeetCode widget] sync failed, keeping last known values:", err);
        lcSyncFailed = true;
        updateSyncStatusDisplay();
        applyFallbackIfEmpty();
    } finally {
        leetCodeFetchInFlight = false;
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
            img.loading = "lazy";
            img.decoding = "async";
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
}    } else {
        document.body.style.overflow = "hidden";

        // Phase 1 (0 - 900ms): the "AK" logo halves draw in on each curtain.
        // Phase 2 (~900ms): bring the real content up to its resting state
        // while it's still hidden behind the curtains.
        setTimeout(revealContent, 900);

        // Phase 3 (~1500ms): pull the curtains apart to reveal the fully
        // settled page, timed with a shockwave pulse at the seam.
        setTimeout(() => {
            introSplash.classList.add("curtain-open", "shock-active");
            document.body.style.overflow = "";
            fetchLeetCodeStats();
            startLeetCodePolling();
        }, 1500);

        // Phase 4: once the curtains are fully offscreen, drop the splash
        // from the render tree so it can't intercept clicks or scrolling.
        setTimeout(() => {
            introSplash.classList.add("intro-hidden");
        }, 2800);
    }

    // Pause live-sync polling when the tab is hidden, resync immediately when it's back
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopLeetCodePolling();
        } else {
            fetchLeetCodeStats();
            startLeetCodePolling();
        }
    });


    // --- 1. Scroll Animation Logic ---

    // Give timeline items a left/right slide that matches their alternating
    // layout, project cards a zig-zag entrance, and skill cards a punchy pop-in.
    document.querySelectorAll('.timeline-item.fade-in').forEach((item, i) => {
        item.classList.remove('fade-in');
        item.classList.add(i % 2 === 0 ? 'fade-right' : 'fade-left');
    });
    document.querySelectorAll('.project-card.fade-in').forEach((card, i) => {
        card.classList.remove('fade-in');
        card.classList.add(i % 2 === 0 ? 'fade-left' : 'fade-right');
    });
    document.querySelectorAll('.skill-card.fade-in').forEach(card => {
        card.classList.remove('fade-in');
        card.classList.add('fade-pop');
    });

    const faders = document.querySelectorAll(".fade-in, .fade-left, .fade-right, .fade-pop");
    const appearOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add('visible');
            // Drop the promoted compositing layer once the reveal transition
            // actually finishes, so we're not holding onto it for content
            // that's done animating and just sitting on the page.
            el.addEventListener('transitionend', () => el.classList.remove('will-animate'), { once: true });
            appearOnScroll.unobserve(entry.target);
        });
    }, appearOptions);

    // Tag every fader with `.will-animate` *before* observing it — this is
    // what gives it a cheap, dedicated compositing layer for the moment it
    // actually animates in, without permanently promoting elements that have
    // already settled (see the `.will-animate` rule in style.css).
    faders.forEach(fader => {
        fader.classList.add('will-animate');
        appearOnScroll.observe(fader);
    });

    // Staggered loading offsets[cite: 2]
    document.querySelectorAll('.skill-card.fade-pop').forEach((card, i) => card.style.transitionDelay = `${i * 0.06}s`);
    document.querySelectorAll('.project-card.fade-left, .project-card.fade-right').forEach((card, i) => card.style.transitionDelay = `${i * 0.12}s`);
    document.querySelectorAll('.timeline-item.fade-left, .timeline-item.fade-right').forEach((item, i) => item.style.transitionDelay = `${i * 0.15}s`);

    // Generic stagger for everything still plain ".fade-in" (hero copy lines,
    // contact items, footer columns, etc.) — group by immediate parent so
    // siblings inside the same block cascade in together, capped so a long
    // list doesn't end up with an absurd multi-second delay tail.
    const staggerGroups = new Map();
    document.querySelectorAll('.fade-in').forEach((el) => {
        const parent = el.parentElement;
        const index = staggerGroups.get(parent) || 0;
        el.style.transitionDelay = `${Math.min(index, 6) * 0.08}s`;
        staggerGroups.set(parent, index + 1);
    });


    // --- 2. Navigation Scroll-Spy (IntersectionObserver-based) ---
    // More efficient and more accurate than measuring getBoundingClientRect()
    // on every scroll tick: the browser only notifies us when a section's
    // visibility relative to the viewport actually changes.
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    function setActiveNavLink(sectionId) {
        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href").slice(1) === sectionId);
        });
    }

    if (sections.length && navLinks.length) {
        // Treat a section as "active" once it occupies the band just below
        // the fixed header, roughly centered in the remaining viewport.
        const scrollSpy = new IntersectionObserver((entries) => {
            // Multiple sections can report simultaneously near boundaries;
            // pick whichever has the greatest intersection ratio right now.
            const mostVisible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (mostVisible) setActiveNavLink(mostVisible.target.id);
        }, {
            rootMargin: "-80px 0px -55% 0px",
            threshold: [0.1, 0.25, 0.5, 0.75]
        });

        sections.forEach(section => scrollSpy.observe(section));
    }


    // --- 2b. Scroll-progress bar + scroll-direction tracking ---
    // Single rAF-throttled scroll handler drives both: the thin fixed bar at
    // the top of the viewport, and a body-level class that flips whenever the
    // user reverses scroll direction (used by the direction-aware reveal CSS).
    const scrollProgressBar = document.getElementById("scrollProgressBar");
    let lastScrollY = window.scrollY;
    let scrollTicking = false;

    function updateScrollEffects() {
        const currentScrollY = window.scrollY;

        if (scrollProgressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? Math.min(currentScrollY / docHeight, 1) : 0;
            scrollProgressBar.style.transform = `scaleX(${progress})`;
        }

        if (currentScrollY > lastScrollY + 2) {
            document.body.classList.add("scrolling-down");
            document.body.classList.remove("scrolling-up");
        } else if (currentScrollY < lastScrollY - 2) {
            document.body.classList.add("scrolling-up");
            document.body.classList.remove("scrolling-down");
        }
        lastScrollY = currentScrollY;
        scrollTicking = false;
    }

    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            requestAnimationFrame(updateScrollEffects);
            scrollTicking = true;
        }
    }, { passive: true });

    updateScrollEffects(); // set initial state on load (e.g. after a refresh mid-page)


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
    // Skipped entirely on small/mobile viewports and when the user prefers
    // reduced motion — a continuously-animating canvas of 50 linked
    // particles is pure overhead on a phone and provides little visual
    // payoff at that size anyway.
    const isSmallViewport = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (document.getElementById("particles-js") && typeof particlesJS !== "undefined" && !isSmallViewport && !prefersReducedMotion) {
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


    // --- 8. Custom Smooth Trailing Cursor (dot + lagging outer ring) ---
    // Only wire this up on devices with a real mouse — touch/coarse pointers
    // get no benefit from it and it'd otherwise leave a ghost cursor pinned
    // at the last touch point.
    const supportsFineCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (supportsFineCursor) {
        const cursorDot = document.createElement("div");
        const cursorOutline = document.createElement("div");
        cursorDot.className = "custom-cursor";
        cursorOutline.className = "custom-cursor-outline";
        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorOutline);

        // Target = true pointer position (updated instantly on every mousemove).
        // Rendered = the outline's current on-screen position, eased toward the
        // target a little each frame — that easing gap is what reads as "lag".
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let ringX = targetX;
        let ringY = targetY;
        const LAG_FACTOR = 0.16; // lower = laggier ring, higher = snappier

        window.addEventListener("mousemove", (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            // Dot tracks the pointer with zero lag.
            cursorDot.style.left = `${targetX}px`;
            cursorDot.style.top = `${targetY}px`;
        }, { passive: true });

        function animateCursorRing() {
            ringX += (targetX - ringX) * LAG_FACTOR;
            ringY += (targetY - ringY) * LAG_FACTOR;
            cursorOutline.style.left = `${ringX}px`;
            cursorOutline.style.top = `${ringY}px`;
            requestAnimationFrame(animateCursorRing);
        }
        requestAnimationFrame(animateCursorRing);

        // Standard scale-up over links/buttons/inputs.
        document.querySelectorAll("a, button, #terminalInput, .form-group-modern input, .form-group-modern textarea, .social-icon-modern").forEach(el => {
            el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hovering"));
            el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hovering"));
        });

        // Bigger, more deliberate scale-up specifically over cards, so the
        // ring visually "frames" the card rather than just nudging bigger.
        document.querySelectorAll(".skill-card, .project-card, .contact-item, .timeline-content").forEach(el => {
            el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hovering-card"));
            el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hovering-card"));
        });
    }


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
        let magTicking = false;
        let magLastEvent = null;

        button.addEventListener("mousemove", (e) => {
            magLastEvent = e;
            if (magTicking) return;
            magTicking = true;
            requestAnimationFrame(() => {
                const bounds = button.getBoundingClientRect();
                const x = magLastEvent.clientX - bounds.left - bounds.width / 2;
                const y = magLastEvent.clientY - bounds.top - bounds.height / 2;
                button.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
                magTicking = false;
            });
        }, { passive: true });
        button.addEventListener("mouseleave", () => {
            button.style.transform = "translate(0px, 0px)";
        }, { passive: true });
    });


    // --- 10b. Subtle 3D Tilt Effect (project cards + skill cards) ---
    // Perspective/rotation transform driven by mouse position within the
    // card, capped to a small max angle so it reads as "premium subtlety"
    // rather than a gimmick. Skipped entirely on touch/coarse pointers,
    // where there's no hover position to drive it anyway.
    function initTiltEffect(selector, options = {}) {
        const maxTilt = options.maxTilt ?? 8;      // degrees, capped
        const scale = options.scale ?? 1.03;
        const perspective = options.perspective ?? 800;

        if (!supportsFineCursor) return; // reuse the same fine-pointer check as the cursor

        document.querySelectorAll(selector).forEach((card) => {
            let ticking = false;
            let lastEvent = null;

            card.addEventListener("mousemove", (e) => {
                lastEvent = e;
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    const bounds = card.getBoundingClientRect();
                    const px = (lastEvent.clientX - bounds.left) / bounds.width;  // 0 -> 1 across the card
                    const py = (lastEvent.clientY - bounds.top) / bounds.height;  // 0 -> 1 down the card

                    // Center-relative offset (-0.5 -> 0.5), inverted on the X axis
                    // because rotating around the X axis tilts the *top* toward
                    // you when the pointer is near the bottom, and vice versa.
                    const rotateX = (0.5 - py) * (maxTilt * 2);
                    const rotateY = (px - 0.5) * (maxTilt * 2);

                    card.classList.add("tilt-active");
                    card.style.transform =
                        `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale}) translateY(-12px)`;
                    ticking = false;
                });
            }, { passive: true });

            card.addEventListener("mouseleave", () => {
                // Let the card's own CSS transition (re-enabled once
                // .tilt-active is a no-op for `transform`) ease it flat again.
                card.classList.remove("tilt-active");
                card.style.transform = "";
            }, { passive: true });
        });
    }

    initTiltEffect(".project-card", { maxTilt: 6, scale: 1.03 });
    initTiltEffect(".skill-card", { maxTilt: 10, scale: 1.08 });


    // --- 10c. Button Ripple / Glow-Trail Click Micro-Interaction ---
    function initButtonRipple(selector) {
        document.querySelectorAll(selector).forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const bounds = btn.getBoundingClientRect();
                const ripple = document.createElement("span");
                ripple.className = "btn-ripple";

                // Size the ripple so it always fully covers the button from
                // whichever corner the click landed nearest to.
                const size = Math.max(bounds.width, bounds.height) * 2.2;
                ripple.style.width = `${size}px`;
                ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - bounds.left}px`;
                ripple.style.top = `${e.clientY - bounds.top}px`;

                btn.appendChild(ripple);
                ripple.addEventListener("animationend", () => ripple.remove());
                // Safety-net cleanup in case animationend doesn't fire (e.g. element removed mid-animation)
                setTimeout(() => ripple.remove(), 800);
            });
        });
    }

    initButtonRipple(".btn-primary, .btn-secondary, .btn-submit-modern");


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
    // Disabled on small/mobile viewports: the canvas rain is a fairly heavy
    // per-frame fill+draw loop, and phones rarely have hardware keyboards to
    // type the trigger on anyway.
    let typedStr = [];
    window.addEventListener("keyup", (e) => {
        if (window.innerWidth <= 768) return;

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
const LEETCODE_REFRESH_MS = 5 * 60 * 1000; // 5 minutes — considerate default for a free, rate-limited API
const LEETCODE_RATE_LIMIT_COOLDOWN_MS = 60 * 60 * 1000; // back off for 1 hour when rate-limited
let leetCodeFetchInFlight = false;
let leetCodePollTimer = null;
let leetCodeCooldownTimer = null;
let lcLastSyncAt = null;   // timestamp (ms) of the last successful sync
let lcSyncFailed = false;  // true while the most recent attempt failed
let lcRateLimited = false; // true while we're deliberately backing off from a 429

function startLeetCodePolling() {
    stopLeetCodePolling();
    if (lcRateLimited) return; // don't resume normal polling mid-cooldown
    leetCodePollTimer = setInterval(fetchLeetCodeStats, LEETCODE_REFRESH_MS);
}

function stopLeetCodePolling() {
    if (leetCodePollTimer) {
        clearInterval(leetCodePollTimer);
        leetCodePollTimer = null;
    }
}

// If the API tells us we're rate-limited, stop hammering it entirely and
// wait out a full cooldown window before trying again — repeatedly retrying
// every few seconds only makes the block last longer.
function enterRateLimitCooldown() {
    lcRateLimited = true;
    stopLeetCodePolling();
    if (leetCodeCooldownTimer) clearTimeout(leetCodeCooldownTimer);
    leetCodeCooldownTimer = setTimeout(() => {
        lcRateLimited = false;
        fetchLeetCodeStats();
        startLeetCodePolling();
    }, LEETCODE_RATE_LIMIT_COOLDOWN_MS);
    updateSyncStatusDisplay();
}

// Ticks every second so you can visually confirm the widget is alive even on
// polls where the underlying LeetCode numbers happen not to change.
function updateSyncStatusDisplay() {
    const syncStatusEl = document.getElementById("lcSyncStatus");
    if (!syncStatusEl) return;

    if (lcRateLimited) {
        syncStatusEl.textContent = "Rate limited — retrying in ~1h";
        return;
    }
    if (lcSyncFailed) {
        syncStatusEl.textContent = "Sync failed — retrying soon";
        return;
    }
    if (!lcLastSyncAt) {
        syncStatusEl.textContent = "Live Sync";
        return;
    }
    const secs = Math.floor((Date.now() - lcLastSyncAt) / 1000);
    if (secs < 5) syncStatusEl.textContent = "Synced just now";
    else if (secs < 60) syncStatusEl.textContent = `Synced ${secs}s ago`;
    else syncStatusEl.textContent = `Synced ${Math.floor(secs / 60)}m ago`;
}
setInterval(updateSyncStatusDisplay, 1000);

async function fetchLeetCodeStats() {
    const dashboard = document.getElementById("leetcodeWidget");
    if (!dashboard) return;
    if (leetCodeFetchInFlight) return; // never let two syncs race each other
    leetCodeFetchInFlight = true;

    const solvedEl = document.getElementById("lcSolved");
    const easyEl = document.getElementById("lcEasy-breakdown");
    const medEl = document.getElementById("lcMed-breakdown");
    const hardEl = document.getElementById("lcHard-breakdown");

    // Eased transition from whatever is currently on screen to the new value,
    // so a periodic refresh doesn't reset the counters back to 0 every time.
    function animateCountUp(element, targetValue) {
        if (!element) return;
        const startValue = parseInt(element.textContent, 10) || 0;
        if (startValue === targetValue) return;

        const duration = 1200;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeOutQuad = progress * (2 - progress);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuad);
            element.textContent = currentValue;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = targetValue;
            }
        }
        window.requestAnimationFrame(step);
    }

    function flashUpdated() {
        dashboard.classList.add("lc-just-updated");
        setTimeout(() => dashboard.classList.remove("lc-just-updated"), 800);
    }

    function applyFallbackIfEmpty() {
        // Only fall back to the hard-coded targets if nothing has ever loaded yet,
        // so a temporary blip during a later poll doesn't wipe out real numbers.
        if ((parseInt(solvedEl.textContent, 10) || 0) === 0) {
            animateCountUp(solvedEl, parseInt(solvedEl.getAttribute("data-target"), 10));
            animateCountUp(easyEl, parseInt(easyEl.getAttribute("data-target"), 10));
            animateCountUp(medEl, parseInt(medEl.getAttribute("data-target"), 10));
            animateCountUp(hardEl, parseInt(hardEl.getAttribute("data-target"), 10));
        }
    }

    const username = "AnishAntil";
    const apiEndpoint = `https://alfa-leetcode-api.onrender.com/${username}/solved`;

    try {
        const response = await fetch(apiEndpoint, { cache: "no-store" });
        const rawText = await response.text();

        if (response.status === 429 || /too many request/i.test(rawText)) {
            throw Object.assign(new Error(`Rate limited: ${rawText.slice(0, 200)}`), { isRateLimit: true });
        }
        if (!response.ok) {
            throw new Error(`API responded with HTTP ${response.status}: ${rawText.slice(0, 200)}`);
        }

        let data;
        try {
            data = JSON.parse(rawText);
        } catch {
            throw new Error(`API returned non-JSON body: ${rawText.slice(0, 200)}`);
        }

        const easySolved = data.easySolved ?? parseInt(easyEl.getAttribute("data-target"), 10);
        const medSolved = data.mediumSolved ?? parseInt(medEl.getAttribute("data-target"), 10);
        const hardSolved = data.hardSolved ?? parseInt(hardEl.getAttribute("data-target"), 10);

        // The API's own "solvedQuestions" total has been observed to lag behind
        // its own easy/medium/hard breakdown, so derive the total from the
        // breakdown (which the API keeps accurate) rather than trusting it directly.
        const breakdownTotal = easySolved + medSolved + hardSolved;
        const apiTotal = data.solvedQuestions;
        const totalSolved = Number.isFinite(breakdownTotal) && breakdownTotal > 0
            ? breakdownTotal
            : (apiTotal ?? parseInt(solvedEl.getAttribute("data-target"), 10));

        if (apiTotal !== undefined && apiTotal !== totalSolved) {
            console.warn(`[LeetCode widget] API's own total (${apiTotal}) disagreed with its easy+medium+hard breakdown (${breakdownTotal}) — using the breakdown sum.`);
        }
        if (apiTotal === undefined) {
            console.warn("[LeetCode widget] response is missing 'solvedQuestions' — using the breakdown sum instead. Full response:", data);
        }

        const hasChanged = [
            [solvedEl, totalSolved],
            [easyEl, easySolved],
            [medEl, medSolved],
            [hardEl, hardSolved],
        ].some(([el, val]) => (parseInt(el.textContent, 10) || 0) !== val);

        animateCountUp(solvedEl, totalSolved);
        animateCountUp(easyEl, easySolved);
        animateCountUp(medEl, medSolved);
        animateCountUp(hardEl, hardSolved);

        if (hasChanged) flashUpdated();

        lcLastSyncAt = Date.now();
        lcSyncFailed = false;
        lcRateLimited = false;
        updateSyncStatusDisplay();

        // Surface it for easy manual verification from the browser console too
        console.info("[LeetCode widget] synced OK:", { totalSolved, easySolved, medSolved, hardSolved, rawResponse: data, at: new Date().toISOString() });

    } catch (err) {
        if (err && err.isRateLimit) {
            console.warn("[LeetCode widget] rate-limited by the API — backing off for 1 hour instead of retrying repeatedly:", err.message);
            enterRateLimitCooldown();
            applyFallbackIfEmpty();
            leetCodeFetchInFlight = false;
            return;
        }
        console.warn("[LeetCode widget] sync failed, keeping last known values:", err);
        lcSyncFailed = true;
        updateSyncStatusDisplay();
        applyFallbackIfEmpty();
    } finally {
        leetCodeFetchInFlight = false;
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
            img.loading = "lazy";
            img.decoding = "async";
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
