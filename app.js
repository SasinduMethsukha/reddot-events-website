/* ==========================================================================
   Reddot - Red Aurora Ribbons Background Motion, Scroll Reveals & Mobile Fixes
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initRedAuroraRibbons();
    initFAQAccordion();
    initContactForm();
    initMobileNav();
    initScrollSpy();
    initScrollReveals();
    updateYear();
});

/* --------------------------------------------------------------------------
   Red Aurora Ribbons - Flowing Motion Graphics Background
   -------------------------------------------------------------------------- */
function initRedAuroraRibbons() {
    const canvas = document.getElementById('ribbons');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, frame = 0, time = 0, last = 0;

    function resize() {
        const heroSection = document.getElementById('home');
        width = (heroSection ? heroSection.clientWidth : window.innerWidth) * 1.1;
        height = (heroSection ? heroSection.clientHeight : window.innerHeight) * 1.1;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw(time);
    }

    function draw(t) {
        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = 'round';

        // Each side is a bundle of independently flowing ribbons.
        for (let side = 0; side < 2; side++) {
            ctx.save();
            if (side) {
                ctx.translate(width, 0);
                ctx.scale(-1, 1);
            }
            for (let band = 0; band < 6; band++) {
                const phase = t * 0.48 + band * 0.42 + side * 1.75;
                const offset = (band - 2.5) * height * 0.024;
                const start = height * (0.31 + 0.08 * Math.sin(phase * 0.8)) + offset;
                const end = height * (0.73 + 0.055 * Math.cos(phase * 0.9)) + offset;

                const gradient = ctx.createLinearGradient(0, start, width * 0.79, end);
                gradient.addColorStop(0, 'rgba(227, 12, 43, 0.46)');
                gradient.addColorStop(0.30, 'rgba(255, 40, 67, 0.42)');
                gradient.addColorStop(0.58, 'rgba(255, 100, 113, 0.33)');
                gradient.addColorStop(0.80, 'rgba(243, 91, 140, 0.19)');
                gradient.addColorStop(1, 'rgba(255, 180, 171, 0)');

                ctx.strokeStyle = gradient;
                ctx.lineWidth = height * (0.060 + 0.012 * Math.sin(phase));
                ctx.beginPath();
                ctx.moveTo(-width * 0.12, start - height * 0.16);
                ctx.bezierCurveTo(
                    width * (0.14 + 0.04 * Math.sin(phase)), start + height * 0.06,
                    width * 0.20, height * (0.76 + 0.08 * Math.cos(phase)),
                    width * 0.48, end
                );
                ctx.bezierCurveTo(
                    width * 0.61, end - height * 0.035,
                    width * 0.72, end - height * (0.1 + 0.05 * Math.sin(phase)),
                    width * 0.88, end - height * 0.04
                );
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    function animate(now) {
        if (last) time += Math.min((now - last) / 1000, 0.05);
        last = now;
        draw(time);
        frame = requestAnimationFrame(animate);
    }

    function sync() {
        cancelAnimationFrame(frame);
        last = 0;
        if (!document.hidden && !reduce.matches) frame = requestAnimationFrame(animate);
        else draw(time);
    }

    window.addEventListener('resize', resize, { passive: true });
    reduce.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    resize();
    sync();
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
