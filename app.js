/* ==========================================================================
   Reddot - Signature Three.js 3D Red Wireframe Mesh & Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initThreeRedMesh();
    initFAQAccordion();
    initContactForm();
    initMobileNav();
    initScrollSpy();
    initScrollReveals();
    initConnectingScrollLine();
    updateYear();
});

/* --------------------------------------------------------------------------
   Connecting-The-Dots Center Spine Scroll Animation (GSAP ScrollTrigger)
   -------------------------------------------------------------------------- */
function initConnectingScrollLine() {
    const container = document.getElementById('connectingLineContainer');
    const svg = document.getElementById('scrollConnectingSvg');
    const basePath = document.getElementById('baseScrollPath');
    const activePath = document.getElementById('activeScrollPath');
    const activeDot = document.getElementById('activeConnectingDot');
    const nodeGroup = document.getElementById('nodeDotsGroup');

    if (!container || !svg || !basePath || !activePath || !activeDot || !nodeGroup) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        container.style.display = 'none';
        return;
    }

    function buildPath() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            container.style.display = 'none';
            return [];
        } else {
            container.style.display = 'block';
        }

        const bodyHeight = document.body.scrollHeight;
        svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${bodyHeight}`);
        svg.setAttribute('width', window.innerWidth);
        svg.setAttribute('height', bodyHeight);

        const aboutSec = document.getElementById('about');
        const whatWeDoSec = document.getElementById('what-we-do');
        const servicesSec = document.getElementById('services');
        const faqSec = document.querySelector('.faq-section');
        const contactSec = document.getElementById('contact');

        if (!aboutSec || !whatWeDoSec || !servicesSec || !contactSec) return [];

        const midX = window.innerWidth / 2;
        const connectorLength = Math.min(window.innerWidth * 0.16, 150);

        const y1 = aboutSec.offsetTop + 60;
        const y2 = aboutSec.offsetTop + aboutSec.offsetHeight / 2;
        const y3 = whatWeDoSec.offsetTop + 80;
        const y4 = whatWeDoSec.offsetTop + whatWeDoSec.offsetHeight / 2;
        const y5 = servicesSec.offsetTop + 70;
        const y6 = faqSec ? faqSec.offsetTop + 60 : servicesSec.offsetTop + servicesSec.offsetHeight + 60;
        const y7 = contactSec.offsetTop + 80;
        const endY = contactSec.offsetTop + contactSec.offsetHeight - 120;

        // Exact Center Spine Path with short horizontal side connectors
        let d = `M ${midX} ${y1}`;
        
        // Center Spine down to y1, connector left
        d += ` L ${midX - connectorLength} ${y1} L ${midX} ${y1}`;
        
        // Down to y2, connector right
        d += ` L ${midX} ${y2} L ${midX + connectorLength} ${y2} L ${midX} ${y2}`;
        
        // Down through what-we-do y3, y4
        d += ` L ${midX} ${y3} L ${midX} ${y4}`;
        
        // Down to services y5, connector left
        d += ` L ${midX} ${y5} L ${midX - connectorLength} ${y5} L ${midX} ${y5}`;
        
        // Down to FAQ y6
        d += ` L ${midX} ${y6}`;
        
        // Down to Contact y7, connector right
        d += ` L ${midX} ${y7} L ${midX + connectorLength} ${y7} L ${midX} ${y7}`;
        
        // End at endY
        d += ` L ${midX} ${endY}`;

        basePath.setAttribute('d', d);
        activePath.setAttribute('d', d);

        // Connection Node Points along the Center Spine & Connectors
        const nodePoints = [
            { x: midX, y: y1 },
            { x: midX - connectorLength, y: y1 },
            { x: midX, y: y2 },
            { x: midX + connectorLength, y: y2 },
            { x: midX, y: y3 },
            { x: midX, y: y4 },
            { x: midX, y: y5 },
            { x: midX - connectorLength, y: y5 },
            { x: midX, y: y6 },
            { x: midX, y: y7 },
            { x: midX + connectorLength, y: y7 },
            { x: midX, y: endY }
        ];

        nodeGroup.innerHTML = '';
        const nodes = nodePoints.map((p) => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            ring.setAttribute('cx', p.x);
            ring.setAttribute('cy', p.y);
            ring.setAttribute('r', 12);
            ring.setAttribute('class', 'node-dot-ring');

            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', p.x);
            dot.setAttribute('cy', p.y);
            dot.setAttribute('r', 5);
            dot.setAttribute('class', 'node-dot-circle');
            dot.style.transform = 'scale(0)';

            g.appendChild(ring);
            g.appendChild(dot);
            nodeGroup.appendChild(g);

            return {
                x: p.x,
                y: p.y,
                dotElement: dot,
                ringElement: ring,
                distance: 0,
                activated: false
            };
        });

        return nodes;
    }

    let nodes = buildPath();
    if (!nodes || nodes.length === 0) return;

    const pathLength = activePath.getTotalLength();
    activePath.style.strokeDasharray = pathLength;
    activePath.style.strokeDashoffset = pathLength;

    // Calculate node distances along SVG path
    nodes.forEach(node => {
        let minDiff = Infinity;
        let bestLen = 0;
        const steps = 120;
        for (let i = 0; i <= steps; i++) {
            const len = (i / steps) * pathLength;
            const pt = activePath.getPointAtLength(len);
            const dist = Math.hypot(pt.x - node.x, pt.y - node.y);
            if (dist < minDiff) {
                minDiff = dist;
                bestLen = len;
            }
        }
        node.distance = bestLen;
    });

    // GSAP ScrollTrigger Scrub
    const aboutSec = document.getElementById('about');
    const contactSec = document.getElementById('contact');

    gsap.to(activePath, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: aboutSec,
            start: 'top 85%',
            endTrigger: contactSec,
            end: 'bottom 80%',
            scrub: 0.5,
            onUpdate: (self) => {
                const currentLength = pathLength * self.progress;
                
                if (currentLength > 0.5) {
                    const point = activePath.getPointAtLength(Math.min(currentLength, pathLength - 0.1));
                    activeDot.setAttribute('cx', point.x);
                    activeDot.setAttribute('cy', point.y);
                    activeDot.style.opacity = '1';
                } else {
                    activeDot.style.opacity = '0';
                }

                nodes.forEach(node => {
                    if (currentLength >= node.distance - 15 && !node.activated) {
                        node.activated = true;
                        gsap.to(node.dotElement, { scale: 1.25, duration: 0.25, ease: 'back.out(2)' });
                        gsap.to(node.dotElement, { scale: 1, duration: 0.2, delay: 0.25 });
                        gsap.fromTo(node.ringElement,
                            { scale: 0.5, opacity: 0.6 },
                            { scale: 2.2, opacity: 0, duration: 0.6, ease: 'power2.out' }
                        );
                    } else if (currentLength < node.distance - 15 && node.activated) {
                        node.activated = false;
                        gsap.to(node.dotElement, { scale: 0, duration: 0.2 });
                    }
                });
            }
        }
    });

    window.addEventListener('resize', () => {
        nodes = buildPath();
        ScrollTrigger.refresh();
    });
}

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
    const detailLevel = window.innerWidth <= 768 ? 2 : 3;
    const geometry = new THREE.IcosahedronGeometry(3.0, detailLevel);
    
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
        opacity: 0.65
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Position mesh in background center of Hero
    mesh.position.set(0, 0, 0);

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

        mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.04 + 0.003;
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.04 + 0.005;

        // 3. Scroll Scale & Shift Interaction
        const scrollFactor = Math.min(scrollOffsetY / 700, 1.2);
        const scaleVal = Math.max(1 - scrollFactor * 0.35, 0.4);
        mesh.scale.set(scaleVal, scaleVal, scaleVal);
        mesh.position.y = -scrollFactor * 1.2;

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
