/* ==========================================================================
   Reddot - Full Hero Canvas Icon Particles & Scroll Spy Active Highlighting
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initFullHeroReddots();
    initFAQAccordion();
    initContactForm();
    initMobileNav();
    initScrollSpy();
    updateYear();
});

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
   Full Hero Coverage — 48 Reddot Transparent PNG Icons Floating with Physics
   -------------------------------------------------------------------------- */
function initFullHeroReddots() {
    const canvas = document.getElementById('motionGraphicsCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('home');
    if (!heroSection) return;

    let width = (canvas.width = heroSection.clientWidth);
    let height = (canvas.height = heroSection.clientHeight);

    // Pre-load 48 Reddot transparent PNG icons from assets folder
    const iconImages = [];
    const totalIcons = 48;

    for (let i = 1; i <= totalIcons; i++) {
        const numStr = i < 10 ? `0${i}` : `${i}`;
        const img = new Image();
        img.src = `assets/Reddot_48_Transparent_PNG_Icons/reddot_icon_${numStr}.png`;
        iconImages.push(img);
    }

    window.addEventListener('resize', () => {
        width = canvas.width = heroSection.clientWidth;
        height = canvas.height = heroSection.clientHeight;
        initDotsAcrossHero();
    });

    const reddots = [];
    const repulsionRadius = 140;
    const forceFactor = 1.5;
    const returnSpeed = 0.05;

    let mouseX = -1000;
    let mouseY = -1000;

    heroSection.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    heroSection.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    heroSection.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.touches[0].clientX - rect.left;
            mouseY = e.touches[0].clientY - rect.top;
        }
    });

    function initDotsAcrossHero() {
        reddots.length = 0;
        const iconCount = Math.min(Math.floor((width * height) / 9000), 110);

        for (let i = 0; i < iconCount; i++) {
            const rx = Math.random() * width;
            const ry = Math.random() * height;
            const randomImg = iconImages[i % iconImages.length];

            reddots.push({
                baseX: rx,
                baseY: ry,
                x: rx,
                y: ry,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 10 + 14, // Small red dot icon size (14px - 24px)
                alpha: Math.random() * 0.35 + 0.5,
                img: randomImg,
                wanderTimer: Math.random() * 100
            });
        }
    }

    initDotsAcrossHero();

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Constellation connection lines when mouse hovers nearby
        for (let i = 0; i < reddots.length; i += 4) {
            const dotA = reddots[i];
            const dx = mouseX - dotA.x;
            const dy = mouseY - dotA.y;
            const dist = Math.hypot(dx, dy);

            if (dist < repulsionRadius * 1.3) {
                for (let j = i + 1; j < reddots.length; j += 4) {
                    const dotB = reddots[j];
                    const dAB = Math.hypot(dotA.x - dotB.x, dotA.y - dotB.y);

                    if (dAB < 48) {
                        ctx.strokeStyle = `rgba(230, 0, 38, ${0.18 * (1 - dist / (repulsionRadius * 1.3))})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(dotA.x, dotA.y);
                        ctx.lineTo(dotB.x, dotB.y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Move and render transparent PNG icons
        reddots.forEach(dot => {
            dot.wanderTimer += 0.008;
            dot.vx += Math.sin(dot.wanderTimer) * 0.015;
            dot.vy += Math.cos(dot.wanderTimer * 1.2) * 0.015;

            const maxV = 0.35;
            dot.vx = Math.max(-maxV, Math.min(maxV, dot.vx));
            dot.vy = Math.max(-maxV, Math.min(maxV, dot.vy));

            dot.baseX += dot.vx;
            dot.baseY += dot.vy;

            if (dot.baseX < -30) dot.baseX = width + 30;
            if (dot.baseX > width + 30) dot.baseX = -30;
            if (dot.baseY < -30) dot.baseY = height + 30;
            if (dot.baseY > height + 30) dot.baseY = -30;

            const dx = dot.x - mouseX;
            const dy = dot.y - mouseY;
            const dist = Math.hypot(dx, dy);

            if (dist < repulsionRadius && dist > 0) {
                const angle = Math.atan2(dy, dx);
                const force = (repulsionRadius - dist) / repulsionRadius;
                const pushDist = force * force * 60 * forceFactor;

                const targetX = dot.baseX + Math.cos(angle) * pushDist;
                const targetY = dot.baseY + Math.sin(angle) * pushDist;

                dot.x += (targetX - dot.x) * 0.22;
                dot.y += (targetY - dot.y) * 0.22;
            } else {
                dot.x += (dot.baseX - dot.x) * returnSpeed;
                dot.y += (dot.baseY - dot.y) * returnSpeed;
            }

            // Draw preloaded PNG icon
            if (dot.img && dot.img.complete && dot.img.naturalWidth !== 0) {
                ctx.globalAlpha = dot.alpha;
                ctx.drawImage(
                    dot.img,
                    dot.x - dot.size / 2,
                    dot.y - dot.size / 2,
                    dot.size,
                    dot.size
                );
            } else {
                // Temporary red circle fallback until PNG loads
                ctx.fillStyle = '#E60026';
                ctx.globalAlpha = dot.alpha;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size / 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.globalAlpha = 1.0;
        requestAnimationFrame(animate);
    }

    animate();
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
