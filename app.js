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
    initArchitecturalMeshMotion();
    updateYear();
});

/* --------------------------------------------------------------------------
   Subtle Architectural Mesh Motion Graphics Overlay ("Connecting the Dots")
   -------------------------------------------------------------------------- */
function initArchitecturalMeshMotion() {
    const container = document.getElementById('meshOverlayContainer');
    const svg = document.getElementById('architecturalMeshSvg');
    const backLayer = document.getElementById('backMeshLayer');
    const frontLayer = document.getElementById('frontMeshLayer');
    const strandsLayer = document.getElementById('scrollStrandsLayer');
    const nodesGroup = document.getElementById('meshNodesGroup');

    if (!container || !svg || !backLayer || !frontLayer || !strandsLayer || !nodesGroup) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        container.style.display = 'none';
        return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP/ScrollTrigger not loaded, retrying mesh motion...');
        setTimeout(initArchitecturalMeshMotion, 200);
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth <= 768;

    function generateMesh() {
        const bodyHeight = document.body.scrollHeight;
        const width = window.innerWidth;
        
        svg.setAttribute('viewBox', `0 0 ${width} ${bodyHeight}`);
        svg.setAttribute('width', width);
        svg.setAttribute('height', bodyHeight);

        backLayer.innerHTML = '';
        frontLayer.innerHTML = '';
        strandsLayer.innerHTML = '';
        nodesGroup.innerHTML = '';

        const aboutSec = document.getElementById('about');
        const servicesSec = document.getElementById('services');
        const faqSec = document.querySelector('.faq-section');

        if (!aboutSec || !servicesSec) return;

        const aboutY = aboutSec.offsetTop;
        const servicesY = servicesSec.offsetTop;
        const faqY = faqSec ? faqSec.offsetTop : servicesY + 800;

        const nodes = [];
        const lines = [];
        const polygons = [];

        // Helper to register node
        function addNode(id, origX, origY, isImportant = false) {
            const n = {
                id,
                x: origX,
                y: origY,
                origX,
                origY,
                offX: 0,
                offY: 0,
                isImportant,
                element: null
            };

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', origX);
            circle.setAttribute('cy', origY);
            circle.setAttribute('r', isImportant ? (isMobile ? 4 : 4.5) : (isMobile ? 2.5 : 2.5));
            circle.setAttribute('class', isImportant ? 'mesh-node-important' : 'mesh-node-dot');

            nodesGroup.appendChild(circle);
            n.element = circle;
            nodes.push(n);
            return n;
        }

        // Helper to connect line
        function addLine(n1, n2, isFront = true) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', n1.x);
            line.setAttribute('y1', n1.y);
            line.setAttribute('x2', n2.x);
            line.setAttribute('y2', n2.y);
            line.setAttribute('class', isFront ? 'mesh-line-front' : 'mesh-line-back');

            (isFront ? frontLayer : backLayer).appendChild(line);
            lines.push({ n1, n2, element: line });
        }

        // Helper to connect polygon triangle
        function addPolygon(n1, n2, n3, isFront = true) {
            const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            poly.setAttribute('points', `${n1.x},${n1.y} ${n2.x},${n2.y} ${n3.x},${n3.y}`);
            poly.setAttribute('class', isFront ? 'mesh-polygon-front' : 'mesh-polygon-back');

            (isFront ? frontLayer : backLayer).appendChild(poly);
            polygons.push({ n1, n2, n3, element: poly });
        }

        /* ------------------------------------------------------------------
           ZONE 1 — UPPER PAGE (#about Margin Whitespace)
           ------------------------------------------------------------------ */
        const z1Nodes = [];
        const z1Points = isMobile ? [
            [width * 0.90, aboutY + 40],
            [width * 0.82, aboutY + 140],
            [width * 0.94, aboutY + 260],
            [width * 0.88, aboutY + 380],
            [width * 0.10, aboutY + 80],
            [width * 0.18, aboutY + 220],
            [width * 0.06, aboutY + 340]
        ] : [
            [width * 0.82, aboutY + 60],
            [width * 0.92, aboutY + 120],
            [width * 0.78, aboutY + 220],
            [width * 0.88, aboutY + 280],
            [width * 0.95, aboutY + 380],
            [width * 0.84, aboutY + 460],
            [width * 0.76, aboutY + 540],
            [width * 0.90, aboutY + 600]
        ];

        z1Points.forEach((pt, i) => {
            z1Nodes.push(addNode(`z1_${i}`, pt[0], pt[1], i % 3 === 0));
        });

        for (let i = 0; i < z1Nodes.length - 1; i++) {
            addLine(z1Nodes[i], z1Nodes[i + 1], i % 2 === 0);
            if (i + 2 < z1Nodes.length) {
                addLine(z1Nodes[i], z1Nodes[i + 2], i % 3 === 0);
                if (i % 2 === 0) {
                    addPolygon(z1Nodes[i], z1Nodes[i + 1], z1Nodes[i + 2], i % 4 === 0);
                }
            }
        }

        /* ------------------------------------------------------------------
           ZONE 2 — MAIN MESH (#what-we-do to #services Transition)
           ------------------------------------------------------------------ */
        const z2Y = servicesY - 120;
        const z2Nodes = [];
        const z2Points = isMobile ? [
            [width * 0.08, z2Y - 40],
            [width * 0.20, z2Y + 80],
            [width * 0.05, z2Y + 200],
            [width * 0.16, z2Y + 320],
            [width * 0.92, z2Y - 20],
            [width * 0.82, z2Y + 100],
            [width * 0.95, z2Y + 240],
            [width * 0.86, z2Y + 360]
        ] : [
            [width * 0.08, z2Y - 60],
            [width * 0.18, z2Y + 40],
            [width * 0.04, z2Y + 160],
            [width * 0.22, z2Y + 260],
            [width * 0.12, z2Y + 380],
            [width * 0.82, z2Y - 40],
            [width * 0.94, z2Y + 80],
            [width * 0.76, z2Y + 200],
            [width * 0.88, z2Y + 320],
            [width * 0.96, z2Y + 440]
        ];

        z2Points.forEach((pt, i) => {
            z2Nodes.push(addNode(`z2_${i}`, pt[0], pt[1], i % 2 === 0));
        });

        for (let i = 0; i < z2Nodes.length - 1; i++) {
            addLine(z2Nodes[i], z2Nodes[i + 1], i % 2 === 1);
            if (i + 2 < z2Nodes.length) {
                addLine(z2Nodes[i], z2Nodes[i + 2], false);
                if (i % 3 === 0) {
                    addPolygon(z2Nodes[i], z2Nodes[i + 1], z2Nodes[i + 2], true);
                }
            }
        }

        /* ------------------------------------------------------------------
           ZONE 3 — SIDE MESH FRAGMENTS (#services & #faq Margins)
           ------------------------------------------------------------------ */
        const z3Nodes = [];
        const z3Points = isMobile ? [
            [width * 0.06, servicesY + 180],
            [width * 0.18, servicesY + 320],
            [width * 0.08, servicesY + 460],
            [width * 0.94, servicesY + 140],
            [width * 0.82, servicesY + 280],
            [width * 0.92, servicesY + 440],
            [width * 0.10, faqY + 120],
            [width * 0.90, faqY + 200]
        ] : [
            [width * 0.05, servicesY + 200],
            [width * 0.16, servicesY + 320],
            [width * 0.07, servicesY + 480],
            [width * 0.92, servicesY + 250],
            [width * 0.84, servicesY + 400],
            [width * 0.95, servicesY + 560],
            [width * 0.08, faqY + 140],
            [width * 0.92, faqY + 240]
        ];

        z3Points.forEach((pt, i) => {
            z3Nodes.push(addNode(`z3_${i}`, pt[0], pt[1], i % 2 === 1));
        });

        for (let i = 0; i < z3Nodes.length - 1; i++) {
            addLine(z3Nodes[i], z3Nodes[i + 1], i % 2 === 0);
            if (i + 2 < z3Nodes.length) {
                addLine(z3Nodes[i], z3Nodes[i + 2], true);
            }
        }

        /* ------------------------------------------------------------------
           SCROLL CONNECTION STRANDS (GSAP ScrollTrigger Linked Path Drawing)
           ------------------------------------------------------------------ */
        if (z1Nodes.length > 0 && z2Nodes.length > 0 && z3Nodes.length > 0) {
            const strandPaths = isMobile ? [
                `M ${z1Nodes[0].x} ${z1Nodes[0].y} Q ${width * 0.92} ${aboutY + 300} ${z2Nodes[4].x} ${z2Nodes[4].y}`,
                `M ${z2Nodes[0].x} ${z2Nodes[0].y} Q ${width * 0.04} ${z2Y + 300} ${z3Nodes[0].x} ${z3Nodes[0].y}`
            ] : [
                `M ${z1Nodes[0].x} ${z1Nodes[0].y} Q ${width * 0.88} ${aboutY + 400} ${z2Nodes[z2Nodes.length - 1].x} ${z2Nodes[z2Nodes.length - 1].y}`,
                `M ${z2Nodes[0].x} ${z2Nodes[0].y} C ${width * 0.02} ${z2Y + 500} ${width * 0.08} ${servicesY + 100} ${z3Nodes[0].x} ${z3Nodes[0].y}`
            ];

            strandPaths.forEach((dStr, idx) => {
                const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathEl.setAttribute('d', dStr);
                pathEl.setAttribute('class', 'scroll-strand-line');
                strandsLayer.appendChild(pathEl);

                const len = pathEl.getTotalLength();
                pathEl.style.strokeDasharray = len;
                pathEl.style.strokeDashoffset = len;

                gsap.to(pathEl, {
                    strokeDashoffset: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: idx === 0 ? aboutSec : servicesSec,
                        start: 'top 70%',
                        end: 'bottom 30%',
                        scrub: 0.5
                    }
                });
            });
        }

        /* ------------------------------------------------------------------
           GSAP Floating Node Motion & Dynamic Line Updates
           ------------------------------------------------------------------ */
        nodes.forEach((n, idx) => {
            const moveX = (idx % 2 === 0 ? 1 : -1) * (isMobile ? 5 : 8 + (idx % 7));
            const moveY = (idx % 3 === 0 ? -1 : 1) * (isMobile ? 6 : 10 + (idx % 5));
            const dur = 6 + (idx % 6);

            gsap.to(n, {
                offX: moveX,
                offY: moveY,
                duration: dur,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                onUpdate: () => {
                    n.x = n.origX + n.offX;
                    n.y = n.origY + n.offY;
                    if (n.element) {
                        n.element.setAttribute('cx', n.x);
                        n.element.setAttribute('cy', n.y);
                    }
                }
            });

            if (n.isImportant) {
                gsap.to(n.element, {
                    scale: 1.35,
                    opacity: 0.9,
                    duration: 2.4 + (idx % 3),
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut'
                });
            }
        });

        // Frame loop updating lines & polygons as nodes drift
        function updateLines() {
            lines.forEach(l => {
                l.element.setAttribute('x1', l.n1.x);
                l.element.setAttribute('y1', l.n1.y);
                l.element.setAttribute('x2', l.n2.x);
                l.element.setAttribute('y2', l.n2.y);
            });

            polygons.forEach(p => {
                p.element.setAttribute('points', `${p.n1.x},${p.n1.y} ${p.n2.x},${p.n2.y} ${p.n3.x},${p.n3.y}`);
            });

            requestAnimationFrame(updateLines);
        }
        updateLines();

        /* ------------------------------------------------------------------
           Subtle Mouse Parallax (Desktop Only)
           ------------------------------------------------------------------ */
        if (!isMobile) {
            window.addEventListener('mousemove', (e) => {
                const normX = (e.clientX / width - 0.5) * 16;
                const normY = (e.clientY / window.innerHeight - 0.5) * 16;

                gsap.to(frontLayer, { x: normX, y: normY, duration: 1.2, ease: 'power1.out' });
                gsap.to(backLayer, { x: normX * 0.4, y: normY * 0.4, duration: 1.6, ease: 'power1.out' });
            });
        }
    }

    generateMesh();

    window.addEventListener('resize', () => {
        generateMesh();
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
