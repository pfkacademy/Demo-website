/* ============================================================
   PFK ACADEMY — MAIN JAVASCRIPT
   All vanilla JS, no external libraries.
   Sections:
     1. Page Loader
     2. Hero Entrance Animation
     3. Count-Up Animation (hero stats)
     4. Mobile Menu Toggle
     5. Sticky Navbar (scroll + active state)
     6. Scroll Reveal (IntersectionObserver)
     7. Active Nav Link (IntersectionObserver)
     8. Testimonials Carousel (drag, touch, autoplay)
   ============================================================ */


/* ============================================================
   1. PAGE LOADER
   Injects a full-screen loader, removes it after 900ms.
   Safety fallback: force-hides at 1500ms in case load is slow.
   Customize: change 900 for longer/shorter loader duration.
   ============================================================ */
(function initPageLoader() {
    // Create the loader element
    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.innerHTML = `
        <div class="loader-logo">
            <img src="assets/Icon_White.png" alt="PFK Academy" class="loader-logo-img">
            <span>PFK <span class="loader-accent">Academy</span></span>
        </div>
        <div class="loader-slogan"><b>Code. Innovate. Elevate.</b></div>
        <div class="loader-ring"></div>
    `;
    document.body.appendChild(loader);

    // Function to hide the loader and trigger hero entrance
    function hideLoader() {
        loader.classList.add('hidden');

        // Remove from DOM after transition completes
        setTimeout(() => {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 500);

        // Trigger hero entrance animations after loader clears
        setTimeout(triggerHeroEntrance, 150);
    }

    // Primary: hide after 900ms
    const hideTimer = setTimeout(hideLoader, 900);

    // Safety fallback: force hide at 1500ms regardless of load state
    const fallbackTimer = setTimeout(() => {
        clearTimeout(hideTimer);
        hideLoader();
    }, 1500);

    // If page loads fast, hide immediately
    if (document.readyState === 'complete') {
        clearTimeout(hideTimer);
        clearTimeout(fallbackTimer);
        setTimeout(hideLoader, 400);
    } else {
        window.addEventListener('load', () => {
            clearTimeout(hideTimer);
            clearTimeout(fallbackTimer);
            setTimeout(hideLoader, 300);
        }, { once: true });
    }
})();


/* ============================================================
   2. HERO ENTRANCE ANIMATION
   Fades + slides up hero content and image after loader clears.
   Stagger: content first, image 200ms later.
   Targets: .hero-content, .hero-image
   Performance: uses opacity + transform only (GPU-accelerated)
   ============================================================ */
function triggerHeroEntrance() {
    const heroContent = document.querySelector('.hero-content');
    const heroImage   = document.querySelector('.hero-image');

    // Set initial invisible state
    [heroContent, heroImage].forEach(el => {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });

    // Animate content in
    requestAnimationFrame(() => {
        setTimeout(() => {
            if (heroContent) {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }
        }, 50);

        // Image follows 200ms later
        setTimeout(() => {
            if (heroImage) {
                heroImage.style.opacity = '1';
                heroImage.style.transform = 'translateY(0)';
            }

            // Start count-up after hero is visible
            startCountUp();
        }, 250);
    });
}


/* ============================================================
   3. COUNT-UP ANIMATION (Hero Stats)
   Targets: .stat-number elements inside .hero-stats
   Reads target value dynamically from DOM text.
   Easing: cubic ease-out (fast start, slows to target).
   Performance: uses requestAnimationFrame, no setInterval.
   Customize: change DURATION for faster/slower count.
   ============================================================ */
function startCountUp() {
    const DURATION = 2000; // milliseconds

    // Cubic ease-out: decelerates toward the end
    function easeOut(progress) {
        return 1 - Math.pow(1 - progress, 3);
    }

    // Format with commas for thousands (e.g. 9000 → "9,000")
    function formatNumber(num) {
        return num.toLocaleString('en-US');
    }

    // Find all stat numbers in the hero stats bar
    const statNumbers = document.querySelectorAll('.hero-stats .stat-number');

    statNumbers.forEach(el => {
        // The .accent span holds the "+" prefix — save and preserve it
        const accentSpan = el.querySelector('.accent');
        const prefix = accentSpan ? accentSpan.outerHTML : '';

        // Read raw text: remove "+", commas, spaces to get the number
        const rawText = el.textContent.replace(/[+,\s]/g, '');
        const target  = parseInt(rawText, 10);

        // Skip if we can't parse a valid number
        if (isNaN(target)) return;

        // Determine if this number needs comma formatting (≥1000)
        const useCommas = target >= 1000;

        const startTime = performance.now();

        function tick(currentTime) {
            const elapsed  = currentTime - startTime;
            const progress = Math.min(elapsed / DURATION, 1);
            const eased    = easeOut(progress);
            const current  = Math.round(eased * target);

            // Rebuild inner HTML: prefix span + animated number
            el.innerHTML = prefix + (useCommas ? formatNumber(current) : current);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                // Ensure we land on the exact target value
                el.innerHTML = prefix + (useCommas ? formatNumber(target) : target);
            }
        }

        requestAnimationFrame(tick);
    });
}


/* ============================================================
   4. MOBILE MENU TOGGLE
   Targets: #menuToggle, #navLinks
   Closes menu when any nav link is clicked.
   ============================================================ */
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Close menu on any link click (smooth scroll navigation)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}


/* ============================================================
   5. STICKY NAVBAR — SCROLL EFFECT
   Targets: #navbar
   Adds .scrolled class after 50px scroll for:
     - Reduced padding (shrinks height)
     - Stronger shadow
     - Teal bottom border
   Performance: uses passive scroll listener.
   ============================================================ */
const navbar = document.getElementById('navbar');

if (navbar) {
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollY = currentScroll;
    }, { passive: true });
}


/* ============================================================
   6. SCROLL REVEAL — IntersectionObserver
   Targets: program cards, why-us items, package cards,
            video cards, about/why-us side images and content.
   Adds .reveal-ready on DOMContentLoaded, then .revealed on scroll.
   Stagger delays applied via inline transition-delay.
   Performance: single observer instance, GPU-only transforms.
   Customize: threshold (0.15) = % of element visible before reveal.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    // --- Helper: mark element as ready to reveal ---
    function prepareReveal(el, delay = 0, direction = 'up') {
        el.classList.add('reveal-ready');
        if (direction === 'left')  el.classList.add('reveal-from-left');
        if (direction === 'right') el.classList.add('reveal-from-right');
        el.dataset.revealDelay = delay;
    }

    // --- Program cards: stagger 0 / 100 / 200ms ---
    document.querySelectorAll('.program-card').forEach((card, i) => {
        prepareReveal(card, i * 100);
    });

    // --- Why Us items: stagger 0 / 120 / 240ms ---
    document.querySelectorAll('.why-us-item').forEach((item, i) => {
        prepareReveal(item, i * 120);
    });

    // --- Package cards: stagger 0 / 150 / 300ms ---
    document.querySelectorAll('.package-card').forEach((card, i) => {
        prepareReveal(card, i * 150);
    });

    // --- Video cards: stagger 0 / 100 / 200ms ---
    document.querySelectorAll('.video-card').forEach((card, i) => {
        prepareReveal(card, i * 100);
    });

    // --- About section: content from left, image from right ---
    const aboutContent = document.querySelector('.about-content');
    const aboutImage   = document.querySelector('.about-image');
    if (aboutContent) prepareReveal(aboutContent, 0,   'left');
    if (aboutImage)   prepareReveal(aboutImage,   150, 'right');

    // --- Why Us section: content from left, image from right ---
    const whyContent = document.querySelector('.why-us-content');
    const whyImage   = document.querySelector('.why-us-image');
    if (whyContent) prepareReveal(whyContent, 0,   'left');
    if (whyImage)   prepareReveal(whyImage,   150, 'right');

    // --- Section headers: simple fade up ---
    document.querySelectorAll(
        '.programs-header, .packages-header, .student-work-header, .testimonials-header'
    ).forEach(header => {
        prepareReveal(header, 0, 'up');
    });

    // --- Create the IntersectionObserver ---
    // threshold: 0.15 = trigger when 15% of element is visible
    // rootMargin: pull trigger point 60px before bottom of viewport
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el    = entry.target;
                const delay = el.dataset.revealDelay || 0;

                // Apply stagger delay inline, then add revealed class
                setTimeout(() => {
                    el.classList.add('revealed');
                }, parseInt(delay, 10));

                // Stop observing after reveal — no need to re-trigger
                revealObserver.unobserve(el);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    // Observe all prepared elements
    document.querySelectorAll('.reveal-ready').forEach(el => {
        revealObserver.observe(el);
    });
});


/* ============================================================
   7. ACTIVE NAV LINK — IntersectionObserver
   Targets: section elements matching nav href IDs
   Highlights the current section's nav link as user scrolls.
   Uses a separate observer from scroll reveal.
   The .nav-cta "Enroll Now" button is excluded.
   Performance: passive, uses IntersectionObserver not scroll events.
   ============================================================ */
(function initActiveNav() {
    // Map of section IDs to their nav link <a> elements
    const sectionIds = ['about', 'programs', 'why-us', 'packages', 'student-work', 'testimonials'];
    const navMap     = {};

    sectionIds.forEach(id => {
        const section = document.getElementById(id);
        const link    = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (section && link) navMap[id] = { section, link };
    });

    if (Object.keys(navMap).length === 0) return;

    // Remove active from all links
    function clearActive() {
        Object.values(navMap).forEach(({ link }) => {
            link.classList.remove('nav-active');
        });
    }

    // Track which sections are currently visible
    const visibleSections = new Set();

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.id;
            if (entry.isIntersecting) {
                visibleSections.add(id);
            } else {
                visibleSections.delete(id);
            }
        });

        // Find the first visible section in DOM order and activate its link
        clearActive();
        for (const id of sectionIds) {
            if (visibleSections.has(id)) {
                navMap[id].link.classList.add('nav-active');
                break;
            }
        }
    }, {
        // Section is "active" when at least 40% visible
        threshold: 0.4
    });

    Object.values(navMap).forEach(({ section }) => {
        navObserver.observe(section);
    });
})();


/* ============================================================
   8. TESTIMONIALS CAROUSEL
   Features: drag (mouse), swipe (touch), autoplay, dot navigation.
   Targets: #testimonialsCarousel, #carouselPrev, #carouselNext,
            #carouselDots
   Performance: uses CSS transform for movement (GPU-accelerated).
   Customize: change 5000 (ms) for faster/slower autoplay.
   ============================================================ */
const carousel      = document.getElementById('testimonialsCarousel');
const prevBtn       = document.getElementById('carouselPrev');
const nextBtn       = document.getElementById('carouselNext');
const dotsContainer = document.getElementById('carouselDots');

if (carousel && prevBtn && nextBtn && dotsContainer) {
    const cards       = carousel.querySelectorAll('.testimonial-card');
    let currentIndex  = 0;
    let autoPlayInterval;
    let visibleCards  = 3;
    let isDragging    = false;
    let startPosX     = 0;
    let currentTranslateX = 0;
    let prevTranslateX    = 0;

    // Calculate the pixel width of one card + its gap
    function getCardWidth() {
        const firstCard = cards[0];
        if (!firstCard) return 344;
        return firstCard.offsetWidth + 24; // card width + gap (24px from CSS)
    }

    // Recalculate how many cards show at current viewport width
    function updateVisibleCards() {
        if      (window.innerWidth < 768)  visibleCards = 1;
        else if (window.innerWidth < 1024) visibleCards = 2;
        else                               visibleCards = 3;
    }

    // Build the dot indicators below the carousel
    function createDots() {
        updateVisibleCards();
        const totalDots = Math.ceil(cards.length / visibleCards);
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    // Move to a specific slide index
    function goToSlide(index) {
        updateVisibleCards();
        const totalDots = Math.ceil(cards.length / visibleCards);
        if (index >= totalDots) index = 0;
        if (index < 0)          index = totalDots - 1;
        currentIndex = index;

        const cardWidth  = getCardWidth();
        const translateX = -(index * (visibleCards * cardWidth));
        currentTranslateX = translateX;
        prevTranslateX    = translateX;

        carousel.style.transform = `translateX(${translateX}px)`;

        // Update dot active state
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        const totalDots = Math.ceil(cards.length / visibleCards);
        goToSlide((currentIndex + 1) % totalDots);
    }

    function prevSlide() {
        const totalDots = Math.ceil(cards.length / visibleCards);
        goToSlide((currentIndex - 1 + totalDots) % totalDots);
    }

    // --- Drag & Touch Support ---

    function dragStart(e) {
        isDragging = true;
        clearInterval(autoPlayInterval);
        carousel.classList.add('dragging');

        const event = e.type === 'mousedown' ? e : e.touches[0];
        startPosX   = event.clientX;

        // Read current transform position
        const transform = carousel.style.transform;
        const match     = transform.match(/translateX\(([^)]+)\)/);
        prevTranslateX    = match ? parseFloat(match[1]) : 0;
        currentTranslateX = prevTranslateX;

        carousel.style.transition = 'none'; // Remove transition during drag
    }

    function dragMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const event  = e.type === 'mousemove' ? e : e.touches[0];
        const diff   = event.clientX - startPosX;
        currentTranslateX = prevTranslateX + diff;

        carousel.style.transform = `translateX(${currentTranslateX}px)`;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        carousel.classList.remove('dragging');

        // Re-enable smooth transition
        carousel.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        // Snap to next/prev if drag passed 30% of card width, else snap back
        const cardWidth     = getCardWidth();
        const moveThreshold = cardWidth * 0.3;
        const diff          = currentTranslateX - prevTranslateX;

        if      (diff < -moveThreshold) nextSlide();
        else if (diff >  moveThreshold) prevSlide();
        else                            goToSlide(currentIndex);

        startAutoPlay();
    }

    // Mouse drag listeners
    carousel.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove',  dragMove);
    window.addEventListener('mouseup',    dragEnd);

    // Touch swipe listeners
    carousel.addEventListener('touchstart', dragStart, { passive: true });
    window.addEventListener('touchmove',   dragMove,  { passive: false });
    window.addEventListener('touchend',    dragEnd,   { passive: true });

    // --- Autoplay ---
    function startAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 8000);
    }

    // --- Initialize Carousel ---
    function initCarousel() {
        updateVisibleCards();
        carousel.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        createDots();
        goToSlide(0);
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Button listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        clearInterval(autoPlayInterval);
        startAutoPlay();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        clearInterval(autoPlayInterval);
        startAutoPlay();
    });

    // Re-initialize on window resize (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initCarousel, 200);
    });

    // Kick everything off
    initCarousel();
    // ============================================================
// PROGRAM FILTER — Age-Based Tabs
// ============================================================
// ============================================================
// PROGRAM FILTER — Age-Based Tabs (Fixed)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.pathway-tab');
    const categories = document.querySelectorAll('.program-category');

    // Function to check if a card's age range matches the selected age
    function matchesAge(cardAge, selectedAge) {
        if (selectedAge === 'all') return true;
        
        // Parse the age range from the card (e.g., "6-12" → [6, 12])
        const rangeParts = cardAge.split('-').map(Number);
        if (rangeParts.length === 2) {
            const minAge = rangeParts[0];
            const maxAge = rangeParts[1];
            const selected = parseInt(selectedAge);
            return selected >= minAge && selected <= maxAge;
        }
        // If it's a single age (e.g., "13-17" already handled above)
        return cardAge === selectedAge;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const selectedAge = tab.dataset.age;

            categories.forEach(category => {
                const cards = category.querySelectorAll('.program-card-large');
                let hasVisibleCard = false;

                cards.forEach(card => {
                    const cardAge = card.dataset.age;
                    
                    if (selectedAge === 'all') {
                        // Show all cards when "All Courses" is selected
                        card.style.display = 'flex';
                        hasVisibleCard = true;
                    } else if (matchesAge(cardAge, selectedAge)) {
                        // Show card if its age range matches
                        card.style.display = 'flex';
                        hasVisibleCard = true;
                    } else {
                        // Hide card
                        card.style.display = 'none';
                    }
                });

                // Show category if it has at least one visible card
                category.style.display = hasVisibleCard ? 'block' : 'none';
            });
        });
    });
});

}