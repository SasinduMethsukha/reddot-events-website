/* ==========================================================================
   Reddot Events - Full Hero Section Red Dot Physics, Custom Estimator & Mobile Drawer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initFullHeroReddots();
    initEstimator();
    initFAQAccordion();
    initContactForm();
    initMobileNav();
    updateYear();
});

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

    // Close mobile drawer when clicking a navigation link
    mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
            drawer.classList.remove('open');
        });
    });

    // Close when tapping outside
    document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
            drawer.classList.remove('open');
        }
    });
}

/* --------------------------------------------------------------------------
   1. Full Hero Section Coverage - Small Red Dots Floating Slowly with Repulsion
   -------------------------------------------------------------------------- */
function initFullHeroReddots() {
    const canvas = document.getElementById('motionGraphicsCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('home');
    if (!heroSection) return;

    let width = (canvas.width = heroSection.clientWidth);
    let height = (canvas.height = heroSection.clientHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = heroSection.clientWidth;
        height = canvas.height = heroSection.clientHeight;
        initDotsAcrossHero();
    });

    const reddots = [];
    const dotCount = Math.min(Math.floor((width * height) / 1600), 700);
    const repulsionRadius = 130;
    const forceFactor = 1.4;
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

        for (let i = 0; i < dotCount; i++) {
            const rx = Math.random() * width;
            const ry = Math.random() * height;

            reddots.push({
                baseX: rx,
                baseY: ry,
                x: rx,
                y: ry,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                size: Math.random() * 1.2 + 1.2,
                alpha: Math.random() * 0.4 + 0.3,
                wanderTimer: Math.random() * 100
            });
        }
    }

    initDotsAcrossHero();

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < reddots.length; i += 6) {
            const dotA = reddots[i];
            const dx = mouseX - dotA.x;
            const dy = mouseY - dotA.y;
            const dist = Math.hypot(dx, dy);

            if (dist < repulsionRadius * 1.3) {
                for (let j = i + 1; j < reddots.length; j += 6) {
                    const dotB = reddots[j];
                    const dAB = Math.hypot(dotA.x - dotB.x, dotA.y - dotB.y);

                    if (dAB < 36) {
                        ctx.strokeStyle = `rgba(230, 0, 38, ${0.14 * (1 - dist / (repulsionRadius * 1.3))})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(dotA.x, dotA.y);
                        ctx.lineTo(dotB.x, dotB.y);
                        ctx.stroke();
                    }
                }
            }
        }

        reddots.forEach(dot => {
            dot.wanderTimer += 0.008;
            dot.vx += Math.sin(dot.wanderTimer) * 0.015;
            dot.vy += Math.cos(dot.wanderTimer * 1.2) * 0.015;

            const maxV = 0.35;
            dot.vx = Math.max(-maxV, Math.min(maxV, dot.vx));
            dot.vy = Math.max(-maxV, Math.min(maxV, dot.vy));

            dot.baseX += dot.vx;
            dot.baseY += dot.vy;

            if (dot.baseX < -20) dot.baseX = width + 20;
            if (dot.baseX > width + 20) dot.baseX = -20;
            if (dot.baseY < -20) dot.baseY = height + 20;
            if (dot.baseY > height + 20) dot.baseY = -20;

            const dx = dot.x - mouseX;
            const dy = dot.y - mouseY;
            const dist = Math.hypot(dx, dy);

            if (dist < repulsionRadius && dist > 0) {
                const angle = Math.atan2(dy, dx);
                const force = (repulsionRadius - dist) / repulsionRadius;
                const pushDist = force * force * 55 * forceFactor;

                const targetX = dot.baseX + Math.cos(angle) * pushDist;
                const targetY = dot.baseY + Math.sin(angle) * pushDist;

                dot.x += (targetX - dot.x) * 0.22;
                dot.y += (targetY - dot.y) * 0.22;
            } else {
                dot.x += (dot.baseX - dot.x) * returnSpeed;
                dot.y += (dot.baseY - dot.y) * returnSpeed;
            }

            ctx.fillStyle = '#E60026';
            ctx.globalAlpha = dot.alpha;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1.0;
        requestAnimationFrame(animate);
    }

    animate();
}

/* --------------------------------------------------------------------------
   2. Scope Estimator & Custom Options Logic
   -------------------------------------------------------------------------- */
function initEstimator() {
    const typeBtns = document.querySelectorAll('#eventTypeGroup .pill-option');
    const customEventTypeBox = document.getElementById('customEventTypeBox');
    const customEventTypeInput = document.getElementById('customEventTypeInput');

    const guestBtns = document.querySelectorAll('#guestCountGroup .pill-option');
    const customGuestCountBox = document.getElementById('customGuestCountBox');
    const customGuestCountInput = document.getElementById('customGuestCountInput');

    const moduleBoxes = document.querySelectorAll('#moduleCheckboxes input[type="checkbox"]');
    
    const customModuleInput = document.getElementById('customModuleInput');
    const addCustomModuleBtn = document.getElementById('addCustomModuleBtn');
    const customItemsTags = document.getElementById('customItemsTags');

    const scopeType = document.getElementById('scopeType');
    const scopeGuests = document.getElementById('scopeGuests');
    const scopeModuleList = document.getElementById('scopeModuleList');
    const sendWhatsAppBtn = document.getElementById('sendWhatsAppEstimate');
    const sendEmailEstimateBtn = document.getElementById('sendEmailEstimate');

    let currentType = 'Corporate Conference';
    let currentGuests = '100 - 300 Guests';
    const customModulesList = [];

    // 1. Event Type Selection & Custom Input
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.classList.contains('custom-trigger')) {
                customEventTypeBox.classList.remove('hidden');
                customEventTypeInput.focus();
                currentType = customEventTypeInput.value.trim() || 'Custom Event Type';
            } else {
                customEventTypeBox.classList.add('hidden');
                currentType = btn.dataset.val;
            }
            updateScope();
        });
    });

    if (customEventTypeInput) {
        customEventTypeInput.addEventListener('input', () => {
            currentType = customEventTypeInput.value.trim() || 'Custom Event Type';
            updateScope();
        });
    }

    // 2. Guest Count Selection & Custom Input
    guestBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            guestBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.classList.contains('custom-trigger')) {
                customGuestCountBox.classList.remove('hidden');
                customGuestCountInput.focus();
                currentGuests = customGuestCountInput.value.trim() || 'Custom Guest Scale';
            } else {
                customGuestCountBox.classList.add('hidden');
                currentGuests = btn.dataset.val;
            }
            updateScope();
        });
    });

    if (customGuestCountInput) {
        customGuestCountInput.addEventListener('input', () => {
            currentGuests = customGuestCountInput.value.trim() || 'Custom Guest Scale';
            updateScope();
        });
    }

    // 3. Module Selection & Custom Item Addition
    moduleBoxes.forEach(box => {
        box.addEventListener('change', updateScope);
    });

    if (addCustomModuleBtn && customModuleInput) {
        const addModule = () => {
            const val = customModuleInput.value.trim();
            if (val && !customModulesList.includes(val)) {
                customModulesList.push(val);
                customModuleInput.value = '';
                renderCustomTags();
                updateScope();
            }
        };

        addCustomModuleBtn.addEventListener('click', addModule);
        customModuleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addModule();
            }
        });
    }

    function renderCustomTags() {
        if (!customItemsTags) return;
        customItemsTags.innerHTML = customModulesList
            .map((item, idx) => `
                <span class="custom-tag-item">
                    ${item}
                    <button type="button" onclick="removeCustomModule(${idx})">&times;</button>
                </span>
            `).join('');
    }

    window.removeCustomModule = (index) => {
        customModulesList.splice(index, 1);
        renderCustomTags();
        updateScope();
    };

    function updateScope() {
        if (scopeType) scopeType.textContent = currentType;
        if (scopeGuests) scopeGuests.textContent = currentGuests;

        const selectedModules = [];
        moduleBoxes.forEach(box => {
            if (box.checked) selectedModules.push(box.value);
        });

        // Append custom user added modules
        const allModules = [...selectedModules, ...customModulesList];

        if (scopeModuleList) {
            if (allModules.length === 0) {
                scopeModuleList.innerHTML = '<li>No modules selected</li>';
            } else {
                scopeModuleList.innerHTML = allModules
                    .map(m => `<li><i data-lucide="check"></i> ${m}</li>`)
                    .join('');
            }
            if (window.lucide) lucide.createIcons();
        }

        // WhatsApp trigger
        if (sendWhatsAppBtn) {
            const text = `Hello Reddot Events! I configured my custom event requirements on your website:
📌 Event Category: ${currentType}
👥 Attendance Scale: ${currentGuests}
🛠️ Required Production Modules: ${allModules.join(', ')}

Please check date availability and send a custom proposal.`;

            sendWhatsAppBtn.onclick = () => {
                window.open(`https://wa.me/94771234567?text=${encodeURIComponent(text)}`, '_blank');
            };
        }

        // Email trigger directly to reddotcreative.events@gmail.com
        if (sendEmailEstimateBtn) {
            const emailSubject = `New Event Inquiry: ${currentType} (${currentGuests})`;
            const emailBody = `Hello Reddot Events Team,

I configured the following event requirements on your website:

- Event Category: ${currentType}
- Expected Attendance: ${currentGuests}
- Required Modules & Gear:
  * ${allModules.join('\n  * ')}

Please get back to me with pricing and availability.

Best regards,`;

            sendEmailEstimateBtn.onclick = () => {
                window.location.href = `mailto:reddotcreative.events@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            };
        }
    }

    updateScope();
}

/* --------------------------------------------------------------------------
   3. FAQ Accordion
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
    const items = document.querySelectorAll('.faq-card');

    items.forEach(item => {
        const toggle = item.querySelector('.faq-toggle');
        const content = item.querySelector('.faq-content');

        toggle.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            items.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-content').style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

/* --------------------------------------------------------------------------
   4. Direct Email Contact Form Dispatch
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

        // Direct Email Mailto Dispatch to reddotcreative.events@gmail.com
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
            }).catch(err => console.log('Formspree dispatch fallback executed'));
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
