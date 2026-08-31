/* ==========================================================================
   Reddot Events — Swiss Editorial & Three.js WebGL Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCustomCursor();
    initThreeRedMesh();
    initMobileMenu();
    initHeaderScroll();
    initConnectionDiagram();
    initFAQAccordion();
    initContactForm();
    updateYear();
});

/* --------------------------------------------------------------------------
   1. Page Initial Brand Loader (1.2s reveal)
   -------------------------------------------------------------------------- */
function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    setTimeout(() => {
        loader.classList.add('loaded');
    }, 1200);
}

/* --------------------------------------------------------------------------
   2. Desktop Custom Cursor Tracking
   -------------------------------------------------------------------------- */
function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    const cursorText = document.getElementById('cursorText');
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function renderCursor() {
        cursorX += (mouseX - cursorX) * 0.18;
        cursorY += (mouseY - cursorY) * 0.18;
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const hoverTriggers = document.querySelectorAll('.hover-trigger, a, button, input, textarea');
    hoverTriggers.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const viewText = el.getAttribute('data-cursor-text');
            if (viewText && cursorText) {
                cursorText.textContent = viewText;
                cursor.classList.add('cursor-view');
            } else {
                cursor.classList.add('cursor-hover');
            }
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover', 'cursor-view');
            if (cursorText) cursorText.textContent = '';
        });
    });
}

/* --------------------------------------------------------------------------
   3. Signature Three.js 3D Red Wireframe Mesh Object
   -------------------------------------------------------------------------- */
function initThreeRedMesh() {
    const container = document.getElementById('meshCanvasContainer');
    const canvas = document.getElementById('redMeshCanvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Create Organic Icosahedron Wireframe Mesh
    const detailLevel = window.innerWidth <= 768 ? 2 : 3;
    const geometry = new THREE.IcosahedronGeometry(3.2, detailLevel);
    
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
        color: 0xE30613,
        wireframe: true,
        transparent: true,
        opacity: 0.65
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Position mesh slightly to the left center on desktop
    if (window.innerWidth > 992) {
        mesh.position.set(-1.2, 0.4, 0);
    } else {
        mesh.position.set(0, 0.2, 0);
    }

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
        if (window.innerWidth > 992) {
            mesh.position.set(-1.2, 0.4, 0);
        } else {
            mesh.position.set(0, 0.2, 0);
        }
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

        // 2. Smooth Inertia Rotation & Breathing
        targetRotX = mouseNormY * 0.4;
        targetRotY = mouseNormX * 0.6;

        mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.04 + 0.003;
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.04 + 0.005;

        // 3. Scroll Scale & Shift Interaction
        const scrollFactor = Math.min(scrollOffsetY / 800, 1.2);
        const scaleVal = 1 - scrollFactor * 0.35;
        mesh.scale.set(scaleVal, scaleVal, scaleVal);
        mesh.position.y = (window.innerWidth > 992 ? 0.4 : 0.2) - scrollFactor * 1.5;

        renderer.render(scene, camera);
    }
    animate();
}

/* --------------------------------------------------------------------------
   4. Interactive Reddot Connection Diagram Canvas
   -------------------------------------------------------------------------- */
function initConnectionDiagram() {
    const canvas = document.getElementById('connectionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    window.addEventListener('resize', () => {
        if (!canvas.parentElement) return;
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
    });

    const nodes = [
        { label: 'PLANNING', x: 0.18, y: 0.25 },
        { label: 'PRODUCTION', x: 0.82, y: 0.25 },
        { label: 'AUDIO', x: 0.15, y: 0.75 },
        { label: 'VISUALS', x: 0.85, y: 0.75 },
        { label: 'LOGISTICS', x: 0.50, y: 0.15 },
        { label: 'MEDIA', x: 0.50, y: 0.85 }
    ];

    let drawProgress = 0;
    let isVisible = false;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    isVisible = true;
                }
            });
        }, { threshold: 0.2 });
        observer.observe(canvas.parentElement);
    } else {
        isVisible = true;
    }

    function renderDiagram() {
        ctx.clearRect(0, 0, width, height);

        if (isVisible && drawProgress < 1) {
            drawProgress += 0.015;
        }

        const centerX = width / 2;
        const centerY = height / 2;

        nodes.forEach(node => {
            const nx = node.x * width;
            const ny = node.y * height;

            // Draw line to center
            const curX = nx + (centerX - nx) * drawProgress;
            const curY = ny + (centerY - ny) * drawProgress;

            ctx.strokeStyle = 'rgba(227, 6, 19, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(curX, curY);
            ctx.stroke();

            // Draw node red dot
            ctx.fillStyle = '#E30613';
            ctx.beginPath();
            ctx.arc(nx, ny, 5, 0, Math.PI * 2);
            ctx.fill();

            // Node text label
            ctx.fillStyle = '#555555';
            ctx.font = '600 11px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, nx, ny > centerY ? ny + 20 : ny - 12);
        });

        // Center Master Red Dot
        ctx.fillStyle = '#E30613';
        ctx.shadowColor = 'rgba(227, 6, 19, 0.4)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8 * drawProgress, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        requestAnimationFrame(renderDiagram);
    }
    renderDiagram();
}

/* --------------------------------------------------------------------------
   5. Mobile Navigation Menu Toggle
   -------------------------------------------------------------------------- */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('mobileMenuClose');
    const menu = document.getElementById('mobileMenu');
    const links = document.querySelectorAll('.mobile-menu-item');

    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        menu.classList.add('open');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            menu.classList.remove('open');
        });
    }

    links.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
        });
    });
}

/* --------------------------------------------------------------------------
   6. Header Scroll Blur Observer
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
    const header = document.getElementById('headerNav');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* --------------------------------------------------------------------------
   7. FAQ Accordion Toggle
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item-editorial');

    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question-btn');
        const body = item.querySelector('.faq-answer-body');

        if (!btn || !body) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            faqItems.forEach(i => {
                i.classList.remove('active');
                const b = i.querySelector('.faq-answer-body');
                if (b) b.style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('active');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });
}

/* --------------------------------------------------------------------------
   8. Direct Email Contact Form Dispatch
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
