/* ==========================================================================
   Reddot - Signature Three.js 3D Red Wireframe Mesh & Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initThreeRedMesh();
    initFAQAccordion();
    initContactForm();
    initMobileNav();
    initHeaderDarkState();
    initScrollSpy();
    initScrollReveals();
    initDarkSeamTransition();
    updateYear();
});

/* --------------------------------------------------------------------------
   Signature Three.js 3D Red Wireframe Mesh Object (Hero Section)
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

    // Create Organic Icosahedron Wireframe Mesh
    const compact = window.innerWidth <= 768;

    // Desktop keeps the wide, airy orb. On phones that same orb at detail 2 fills
    // the canvas and cuts through the headline, so use a sparser, dimmer facet held
    // just below centre — low enough to clear the headline, high enough to stay whole.
    const preset = compact
        ? { detail: 1, opacity: 0.34, scale: 0.72, y: -0.4, z: -0.8, spinX: 0.0016, spinY: 0.0028 }
        : { detail: 3, opacity: 0.65, scale: 1, y: 0, z: 0, spinX: 0.003, spinY: 0.005 };

    const geometry = new THREE.IcosahedronGeometry(3.0, preset.detail);
    
    // Store Original Vertices for Sine-Wave Noise Displacement
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
        opacity: preset.opacity
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Position mesh in background center of Hero
    mesh.position.set(0, preset.y, preset.z);
    mesh.scale.setScalar(preset.scale);

    // Mouse Inertia Interaction
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseNormX = 0;
    let mouseNormY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseNormX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseNormY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Scroll Deformation Shift
    let scrollOffsetY = 0;
    window.addEventListener('scroll', () => {
        scrollOffsetY = window.scrollY || window.pageYOffset;
    });

    // Window Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Animation Loop
    let clock = new THREE.Clock();
    let isTabActive = true;

    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    function animate() {
        requestAnimationFrame(animate);
        if (!isTabActive || reduceMotion) return;

        const elapsedTime = clock.getElapsedTime();

        // 1. Continuous Organic Vertex Displacement Noise
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

        // 2. Smooth Inertia Rotation
        targetRotX = mouseNormY * 0.35;
        targetRotY = mouseNormX * 0.5;

        mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.04 + preset.spinX;
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.04 + preset.spinY;

        // 3. Scroll Scale & Shift Interaction (pointer devices only)
        const breathe = 1 + Math.sin(elapsedTime * 0.8) * 0.04;
        if (!compact) {
            const scrollFactor = Math.min(scrollOffsetY / 700, 1.2);
            const scaleVal = preset.scale * breathe * Math.max(1 - scrollFactor * 0.35, 0.4);
            mesh.scale.setScalar(scaleVal);
            mesh.position.y = preset.y - scrollFactor * 1.2;
        } else {
            mesh.scale.setScalar(preset.scale * breathe);
        }

        renderer.render(scene, camera);
    }
    animate();
}

/* --------------------------------------------------------------------------
   Popup-Style Spring IntersectionObserver Scroll Reveal Animations
   -------------------------------------------------------------------------- */
function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-section, .reveal-card');

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.06
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Scroll-Scrubbed White <-> Dark Seams (GSAP ScrollTrigger)
   -------------------------------------------------------------------------- */
function initDarkSeamTransition() {
    const entry = document.querySelector('.dark-seam--in');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The seam's resting CSS state is already the finished look, so bailing out
    // leaves a static designed transition rather than a half-drawn one. The exit
    // seam is a plain fade by design and has nothing to animate.
    if (!entry || reduceMotion) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const glow = entry.querySelector('.dark-seam-glow');
    const rim = entry.querySelector('.dark-seam-rim');
    if (!glow || !rim) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.set(glow, { opacity: 0, scale: 0.55 });
    gsap.set(rim, { opacity: 0, y: 16 });

    gsap.timeline({
        scrollTrigger: {
            // The band's bottom edge is the actual white -> dark boundary.
            trigger: entry,
            start: 'bottom 92%',
            end: 'bottom 40%',
            scrub: 0.6
        }
    })
    .to(glow, { opacity: 0.9, scale: 1, duration: 1, ease: 'power2.out' }, 0)
    .to(rim, { opacity: 1, y: 0, duration: 1, ease: 'power2.inOut' }, 0);
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
   Floating Header Dark-Glass State (over the What We Do section)
   -------------------------------------------------------------------------- */
function initHeaderDarkState() {
    const header = document.getElementById('headerNav');
    const darkSection = document.getElementById('what-we-do');
    if (!header || !darkSection) return;

    const evaluate = () => {
        const headerMid = header.getBoundingClientRect().bottom - header.offsetHeight / 2;
        const { top, bottom } = darkSection.getBoundingClientRect();
        header.classList.toggle('nav-over-dark', headerMid > top && headerMid < bottom);
    };

    window.addEventListener('scroll', evaluate, { passive: true });
    window.addEventListener('resize', evaluate);
    evaluate();
}

/* --------------------------------------------------------------------------
   FAQ Accordion
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
                const c = i.querySelector('.faq-content');
                if (c) c.style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('active');
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
