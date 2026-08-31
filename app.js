/* ==========================================================================
   Reddot Events - Three.js 3D Mesh Hero & GSAP ScrollTrigger Motion Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Signature Three.js Hero Mesh (UNTOUCHED HERO SECTION)
    initThreeRedMesh();

    // 2. Lenis Smooth Scroll + GSAP ScrollTrigger Synchronization
    initSmoothScrollAndGSAP();

    // 3. Section Motion Systems (Strictly AFTER Hero)
    initMaskedHeadings();
    initVerticalScrollProgress();
    initConnectingDotsTimeline();
    initStickyWhatWeDo();
    initServicesMotion();
    initImageParallax();
    initContactMotion();
    initFooterMotion();

    // 4. Interaction & UI Utilities
    initFAQAccordion();
    initContactForm();
    initMobileNav();
    initScrollSpy();
    updateYear();
});

/* --------------------------------------------------------------------------
   1. Signature Three.js 3D Red Wireframe Mesh Object (Hero - UNTOUCHED)
   -------------------------------------------------------------------------- */
function initThreeRedMesh() {
    const container = document.getElementById('meshCanvasContainer');
    const canvas = document.getElementById('redMeshCanvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 8.5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const detailLevel = window.innerWidth <= 768 ? 2 : 3;
    const geometry = new THREE.IcosahedronGeometry(3.0, detailLevel);
    
    const posAttribute = geometry.attributes.position;
    const originalPositions = [];
    for (let i = 0; i < posAttribute.count; i++) {
        originalPositions.push(new THREE.Vector3(
            posAttribute.getX(i),
            posAttribute.getY(i),
            posAttribute.getZ(i)
        ));
    }

    const material = new THREE.MeshBasicMaterial({
        color: 0xE60026,
        wireframe: true,
        transparent: true,
        opacity: 0.65
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.position.set(0, 0, 0);

    let targetRotX = 0;
    let targetRotY = 0;
    let mouseNormX = 0;
    let mouseNormY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseNormX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseNormY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let scrollOffsetY = 0;
    window.addEventListener('scroll', () => {
        scrollOffsetY = window.scrollY || window.pageYOffset;
    });

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    let clock = new THREE.Clock();
    let isTabActive = true;

    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    function animate() {
        requestAnimationFrame(animate);
        if (!isTabActive || reduceMotion) return;

        const elapsedTime = clock.getElapsedTime();

        const positions = mesh.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const orig = originalPositions[i];
            const wave = Math.sin(elapsedTime * 1.6 + orig.x * 1.5 + orig.y * 1.5) * 0.22 +
                         Math.cos(elapsedTime * 1.2 + orig.z * 1.8) * 0.18;
            
            positions.setXYZ(i, 
                orig.x + orig.x * wave * 0.15,
                orig.y + orig.y * wave * 0.15,
                orig.z + orig.z * wave * 0.15
            );
        }
        positions.needsUpdate = true;

        targetRotX = mouseNormY * 0.35;
        targetRotY = mouseNormX * 0.5;

        mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.04 + 0.003;
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.04 + 0.005;

        const scrollFactor = Math.min(scrollOffsetY / 700, 1.2);
        const scaleVal = Math.max(1 - scrollFactor * 0.35, 0.4);
        mesh.scale.set(scaleVal, scaleVal, scaleVal);
        mesh.position.y = -scrollFactor * 1.2;

        renderer.render(scene, camera);
    }
    animate();
}

/* --------------------------------------------------------------------------
   2. Lenis Smooth Scroll + GSAP ScrollTrigger Synchronization
   -------------------------------------------------------------------------- */
function initSmoothScrollAndGSAP() {
    if (typeof Lenis === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

/* --------------------------------------------------------------------------
   3. Masked Heading Text Reveals (Strictly AFTER Hero)
   -------------------------------------------------------------------------- */
function initMaskedHeadings() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const headings = document.querySelectorAll('.masked-heading');
    headings.forEach(heading => {
        // Skip hero heading
        if (heading.closest('#home')) return;

        const text = heading.textContent.trim();
        heading.innerHTML = `<span class="masked-heading-line"><span>${text}</span></span>`;
        const innerSpan = heading.querySelector('.masked-heading-line > span');

        gsap.to(innerSpan, {
            y: '0%',
            opacity: 1,
            duration: 0.85,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: heading,
                start: 'top 82%',
                toggleActions: 'play none none none'
            }
        });
    });
}

/* --------------------------------------------------------------------------
   4. Vertical Red Scroll Progress Line
   -------------------------------------------------------------------------- */
function initVerticalScrollProgress() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const progressBar = document.getElementById('scrollProgressBar');
    if (!progressBar) return;

    gsap.to(progressBar, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true
        }
    });
}

/* --------------------------------------------------------------------------
   5. Reddot Approach — "Connecting the Dots" Timeline Animation
   -------------------------------------------------------------------------- */
function initConnectingDotsTimeline() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const wrapper = document.getElementById('dotsWrapper');
    const path = document.getElementById('connectingLinePath');
    const dot1 = document.getElementById('dotMarker1');
    const dot2 = document.getElementById('dotMarker2');
    const dot3 = document.getElementById('dotMarker3');

    const card1 = document.getElementById('cardOneTeam');
    const card2 = document.getElementById('cardOneFlow');
    const card3 = document.getElementById('cardOneStandard');

    if (!wrapper || !path) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: wrapper,
            start: 'top 75%',
            toggleActions: 'play none none none'
        }
    });

    tl.to(path, { strokeDashoffset: 0, duration: 1.2, ease: 'power3.inOut' })
      .to(dot1, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }, 0.2)
      .to(card1, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.3)
      .to(dot2, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }, 0.6)
      .to(card2, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.7)
      .to(dot3, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }, 1.0)
      .to(card3, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.1);
}

/* --------------------------------------------------------------------------
   6. WHAT WE DO — Sticky Desktop Storytelling Experience
   -------------------------------------------------------------------------- */
function initStickyWhatWeDo() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.innerWidth < 992) return; // Fallback to normal reveals on mobile

    const slides = document.querySelectorAll('.capability-story-slide');
    const container = document.getElementById('whatWeDoPinnedContainer');

    if (!container || slides.length === 0) return;

    slides.forEach((slide, idx) => {
        if (idx === 0) return; // First slide is visible initially

        gsap.fromTo(slide, 
            { opacity: 0, y: 35 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: slide,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });
}

/* --------------------------------------------------------------------------
   7. Service Section Alternating Item Reveals & Large Background Numbers
   -------------------------------------------------------------------------- */
function initServicesMotion() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const oddItems = document.querySelectorAll('.service-odd-item');
    const evenItems = document.querySelectorAll('.service-even-item');
    const bgNums = document.querySelectorAll('.bg-service-num');

    oddItems.forEach(item => {
        gsap.fromTo(item, 
            { x: -35, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.75,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    evenItems.forEach(item => {
        gsap.fromTo(item, 
            { x: 35, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.75,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Background Service Numbers Parallax
    bgNums.forEach(num => {
        gsap.to(num, {
            y: 30,
            ease: 'none',
            scrollTrigger: {
                trigger: num.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });
}

/* --------------------------------------------------------------------------
   8. Internal Image Parallax
   -------------------------------------------------------------------------- */
function initImageParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const parallaxImgs = document.querySelectorAll('.parallax-img');
    parallaxImgs.forEach(img => {
        gsap.fromTo(img, 
            { y: '-5%' },
            {
                y: '5%',
                ease: 'none',
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            }
        );
    });
}

/* --------------------------------------------------------------------------
   9. Contact Section Cinematic Reveal & Ambient Red Orb
   -------------------------------------------------------------------------- */
function initContactMotion() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const infoBlock = document.getElementById('contactInfoBlock');
    const formFields = document.querySelectorAll('.form-field-anim');
    const orb = document.getElementById('ambientRedOrb');

    if (infoBlock) {
        gsap.fromTo(infoBlock,
            { x: -30, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: infoBlock,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    if (formFields.length > 0) {
        gsap.fromTo(formFields,
            { y: 20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#contactForm',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    if (orb) {
        gsap.to(orb, {
            y: -50,
            ease: 'none',
            scrollTrigger: {
                trigger: '#contact',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    }
}

/* --------------------------------------------------------------------------
   10. Footer Reveal
   -------------------------------------------------------------------------- */
function initFooterMotion() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const logo = document.getElementById('footerLogo');
    const footerLeft = document.getElementById('footerLeftBlock');
    const footerRight = document.getElementById('footerRightBlock');

    if (logo) {
        gsap.fromTo(logo,
            { scale: 0.92, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.7,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#footerSection',
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }
}

/* --------------------------------------------------------------------------
   Popup-Style Spring Fallback Observer
   -------------------------------------------------------------------------- */
function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-card');

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.06 });

    revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Scroll Spy Active Navbar Highlighting
   -------------------------------------------------------------------------- */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links .nav-item');

    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollY = window.scrollY || window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 160;
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Mobile Navigation Drawer Toggle
   -------------------------------------------------------------------------- */
function initMobileNav() {
    const toggleBtn = document.getElementById('menuToggleBtn');
    const drawer = document.getElementById('mobileDrawer');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.toggle('open');
    });

    mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
            drawer.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
            drawer.classList.remove('open');
        }
    });
}

/* --------------------------------------------------------------------------
   FAQ Accordion Toggle
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
    const items = document.querySelectorAll('.faq-card');

    items.forEach(item => {
        const toggle = item.querySelector('.faq-toggle');
        const content = item.querySelector('.faq-content');

        if (!toggle || !content) return;

        toggle.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            items.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-toggle')?.setAttribute('aria-expanded', 'false');
                const c = i.querySelector('.faq-content');
                if (c) c.style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Direct Email Contact Form Dispatch
   -------------------------------------------------------------------------- */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('cName')?.value || 'Valued Client';
        const company = document.getElementById('cCompany')?.value || 'N/A';
        const phone = document.getElementById('cPhone')?.value || 'N/A';
        const email = document.getElementById('cEmail')?.value || 'N/A';
        const details = document.getElementById('cDetails')?.value || 'N/A';

        const subject = `New Website Event Inquiry - ${name} (${company})`;
        const body = `New Event Inquiry Received via Website:

Client Name: ${name}
Company/Organization: ${company}
Phone Number: ${phone}
Email Address: ${email}

Event Details & Requirements:
${details}
`;

        const mailtoUrl = `mailto:reddotcreative.events@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;

        if (form.action && form.action.includes('formspree.io')) {
            const formData = new FormData(form);
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).catch(err => console.log('Formspree dispatch executed'));
        }

        if (toastMsg) toastMsg.textContent = `Thank you, ${name}! Your inquiry is opening in your email app for reddotcreative.events@gmail.com.`;
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 5000);
        }

        form.reset();
    });
}

function updateYear() {
    const y = document.getElementById('fYear');
    if (y) y.textContent = new Date().getFullYear();
}
