/* ==========================================================================
   Ziply — App Controller (Trionn-style animations + API integration)
   ========================================================================== */
(function () {
    'use strict';

    // ─── STATE ───
    let currentUser = null;
    let userUrls = [];

    // ─── WAIT FOR DOM ───
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initCursor();
        initMagnetic();
        runPreloader(() => {
            initLenis();
            initScrollAnimations();
            initMarqueeLines();
            initHeader();
            initNavigation();
            initAdvancedToggle();
            initAuthPanel();
            initShortenForm();
            initDashboard();
            checkAuth();
        });
    }

    // ======================== PRELOADER ========================
    function runPreloader(onComplete) {
        const tl = gsap.timeline({
            onComplete: () => {
                document.getElementById('preloader').style.pointerEvents = 'none';
                onComplete();
            }
        });

        // Phase 1: Logo reveal
        tl.to('.pl-logo-box .brand-logo', { opacity: 1, duration: .6, ease: 'power2.out' })
        // Phase 2: Tagline words
          .to('.pl-tagline', { opacity: 1, duration: .4 }, '-=.6')
          .from('.pl-tag-word', { y: 15, opacity: 0, duration: .4, stagger: .12, ease: 'power3.out' }, '-=.3')

        // Phase 3: Counter 0→100
          .to('.pl-counter', { opacity: 1, duration: .2 }, '-=.3')
          .to({ val: 0 }, {
              val: 100,
              duration: 1.2,
              ease: 'power2.inOut',
              onUpdate: function () {
                  document.getElementById('pl-count').textContent = Math.round(this.targets()[0].val);
              }
          }, '-=.5')

        // Phase 4: Fade center, belts slide up
          .to('.pl-center', { opacity: 0, y: -30, duration: .4, ease: 'power2.in' })
          .to('.pl-belt', {
              scaleY: 0,
              duration: .6,
              stagger: { each: .04, from: 'center' },
              ease: 'power4.inOut'
          }, '-=.2')

        // Phase 5: Fade out preloader container
          .set('.preloader', { display: 'none' });
    }

    // ======================== LENIS SMOOTH SCROLL ========================
    let lenis;
    function initLenis() {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // ======================== CURSOR ========================
    function initCursor() {
        const dot = document.getElementById('cursor-dot');
        const ring = document.getElementById('cursor-ring');
        let mx = 0, my = 0, dx = 0, dy = 0, rx = 0, ry = 0;

        document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

        (function loop() {
            dx += (mx - dx) * .25;
            dy += (my - dy) * .25;
            rx += (mx - rx) * .12;
            ry += (my - ry) * .12;
            dot.style.left = dx + 'px'; dot.style.top = dy + 'px';
            ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
            requestAnimationFrame(loop);
        })();

        const sel = 'a,button,input,textarea,.magnetic,.auth-tab,.nav-char-link';
        function bindHover() {
            document.querySelectorAll(sel).forEach(el => {
                el.removeEventListener('mouseenter', cursorIn);
                el.removeEventListener('mouseleave', cursorOut);
                el.addEventListener('mouseenter', cursorIn);
                el.addEventListener('mouseleave', cursorOut);
            });
        }
        function cursorIn() { document.body.classList.add('cursor-hover'); }
        function cursorOut() { document.body.classList.remove('cursor-hover'); }
        bindHover();
        window._bindCursorHover = bindHover;
    }

    // ======================== MAGNETIC ========================
    function initMagnetic() {
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                el.style.transform = `translate(${x * .2}px, ${y * .2}px)`;
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    // ======================== SCROLL ANIMATIONS ========================
    function initScrollAnimations() {
        gsap.registerPlugin(ScrollTrigger);

        // Hero char reveals
        if (document.querySelector('.char')) {
            gsap.to('.char', {
                y: 0,
                duration: 1,
                stagger: .04,
                ease: 'power4.out',
                delay: .1
            });
        }

        // Hero subtitle
        gsap.to('.hero-sub', { opacity: 1, y: 0, duration: .8, ease: 'power3.out', delay: .8 });

        // Shortener station
        gsap.to('.shortener-station', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 1 });

        // Scroll cue
        gsap.to('.hero-scroll-cue', { opacity: 1, duration: .6, delay: 1.4 });

        // Section tags & headings
        gsap.utils.toArray('[data-reveal-line]').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
                opacity: 1, y: 0, duration: .8, ease: 'power3.out'
            });
        });

        // Feature / pricing / stat cards
        gsap.utils.toArray('[data-reveal-card]').forEach((el, i) => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
                opacity: 1, y: 0, duration: .7, delay: i % 3 * .1, ease: 'power3.out'
            });
        });

        // Stat countup
        gsap.utils.toArray('.stat-number').forEach(el => {
            const target = parseInt(el.dataset.count);
            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    gsap.to({ v: 0 }, {
                        v: target,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: function () {
                            el.textContent = Math.round(this.targets()[0].v).toLocaleString();
                        }
                    });
                }
            });
        });

        // Footer line + plus
        gsap.utils.toArray('.line-grow').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 96%', toggleActions: 'play none none none' },
                scaleX: 1, duration: 1.5, ease: 'power4.out'
            });
        });
        gsap.utils.toArray('.plus-icon').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 96%', toggleActions: 'play none none none' },
                opacity: 1, duration: .5, delay: .3
            });
        });
    }

    // ======================== MARQUEE LINES ========================
    function initMarqueeLines() {
        // Lines + plus icons in marquee section
        const mqSection = document.querySelector('.section-marquee');
        if (!mqSection) return;

        gsap.utils.toArray('.section-marquee .line-grow').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: mqSection, start: 'top 90%', toggleActions: 'play none none none' },
                scaleX: 1, duration: 1.2, ease: 'power4.out'
            });
        });
        gsap.utils.toArray('.section-marquee .plus-icon').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: mqSection, start: 'top 90%', toggleActions: 'play none none none' },
                opacity: 1, duration: .5, delay: .4
            });
        });
    }

    // ======================== HEADER ========================
    function initHeader() {
        const header = document.getElementById('site-header');
        const logo = header.querySelector('.brand-logo');
        ScrollTrigger.create({
            start: 100,
            onUpdate: (self) => {
                const isScrolled = self.scroll() > 100;
                const logoSrc = isScrolled ? 'ziply-logo.png' : 'ziply-logo-light.png';
                header.classList.toggle('scrolled', isScrolled);
                if (logo.getAttribute('src') !== logoSrc) logo.setAttribute('src', logoSrc);
            }
        });
    }

    // ======================== NAVIGATION ========================
    function initNavigation() {
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;

                // Hide dashboard if showing and target isn't dashboard
                if (href !== '#dashboard-section') {
                    const dashSection = document.getElementById('dashboard-section');
                    if (dashSection) dashSection.style.display = 'none';
                    showMainSections();
                }

                if (lenis) lenis.scrollTo(target, { offset: -90 });
            });
        });

        // Dashboard button
        const dashBtn = document.getElementById('dashboard-btn');
        dashBtn.addEventListener('click', () => {
            const dashSection = document.getElementById('dashboard-section');
            if (dashSection.style.display === 'none' || !dashSection.style.display) {
                hideMainSections();
                dashSection.style.display = 'flex';
                gsap.from(dashSection, { opacity: 0, y: 30, duration: .6, ease: 'power3.out' });
                fetchUserUrls();
                if (lenis) lenis.scrollTo(0);
            } else {
                dashSection.style.display = 'none';
                showMainSections();
                if (lenis) lenis.scrollTo(0);
            }
        });
    }

    function hideMainSections() {
        document.querySelectorAll('.section-hero, .section-marquee, .section-features, .section-stats').forEach(s => s.style.display = 'none');
    }
    function showMainSections() {
        document.querySelectorAll('.section-hero, .section-marquee, .section-features, .section-stats').forEach(s => s.style.display = '');
    }

    // ======================== ADVANCED TOGGLE ========================
    function initAdvancedToggle() {
        const btn = document.getElementById('toggle-advanced');
        const panel = document.getElementById('advanced-panel');
        const chevron = btn.querySelector('.chevron');
        btn.addEventListener('click', () => {
            panel.classList.toggle('open');
            chevron.classList.toggle('open');
        });
    }

    // ======================== AUTH PANEL ========================
    function initAuthPanel() {
        const panel = document.getElementById('auth-panel');
        const triggerBtn = document.getElementById('auth-trigger-btn');
        const closeBtn = document.getElementById('auth-close');
        const backdrop = document.querySelector('.auth-backdrop');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        const open = () => panel.classList.add('open');
        const close = () => panel.classList.remove('open');

        triggerBtn.addEventListener('click', () => { currentUser ? handleLogout() : open(); });
        closeBtn.addEventListener('click', close);
        backdrop.addEventListener('click', close);

        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active'); tabRegister.classList.remove('active');
            loginForm.classList.add('active'); registerForm.classList.remove('active');
        });
        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active'); tabLogin.classList.remove('active');
            registerForm.classList.add('active'); loginForm.classList.remove('active');
        });

        // Register
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    currentUser = data.user;
                    toast('Registration successful!', 'success');
                    setLoggedInUI(); close(); registerForm.reset();
                } else { toast(data.message || 'Registration failed', 'error'); }
            } catch { toast('Server unreachable', 'error'); }
        });

        // Login
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    currentUser = data.user;
                    toast('Welcome back!', 'success');
                    setLoggedInUI(); close(); loginForm.reset();
                } else { toast(data.message || 'Login failed', 'error'); }
            } catch { toast('Server unreachable', 'error'); }
        });
    }

    async function handleLogout() {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                currentUser = null; toast('Logged out', 'success'); setLoggedOutUI();
                document.getElementById('dashboard-section').style.display = 'none';
                showMainSections();
            } else { toast('Logout failed', 'error'); }
        } catch { toast('Server unreachable', 'error'); }
    }

    function setLoggedInUI() {
        document.getElementById('auth-trigger-btn').textContent = 'LOG OUT';
        document.getElementById('dashboard-btn').style.display = '';
    }
    function setLoggedOutUI() {
        document.getElementById('auth-trigger-btn').textContent = 'LOG IN';
        document.getElementById('dashboard-btn').style.display = 'none';
    }

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.user) { currentUser = data.user; setLoggedInUI(); }
            }
        } catch {}
    }

    // ======================== SHORTEN FORM ========================
    function initShortenForm() {
        const form = document.getElementById('shorten-form');
        const resultWidget = document.getElementById('result-widget');
        const resultUrl = document.getElementById('result-url');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = document.getElementById('long-url').value;
            const slug = document.getElementById('custom-slug').value.trim();
            const body = { url };
            if (slug) body.slug = slug;

            try {
                const res = await fetch('/api/create', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                if (res.ok) {
                    resultUrl.value = data.shortUrl;
                    form.style.display = 'none';
                    resultWidget.style.display = 'block';
                    toast('Link generated!', 'success');
                } else { toast(data.message || 'Failed', 'error'); }
            } catch { toast('API unreachable', 'error'); }
        });

        document.getElementById('copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(resultUrl.value);
            toast('Copied!', 'success');
        });

        document.getElementById('another-btn').addEventListener('click', () => {
            form.reset(); resultWidget.style.display = 'none'; form.style.display = 'block';
        });
    }

    // ======================== DASHBOARD ========================
    function initDashboard() {
        document.getElementById('dashboard-search').addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            const filtered = userUrls.filter(u => u.full_url.toLowerCase().includes(q) || u.short_url.toLowerCase().includes(q));
            renderUrls(filtered);
        });
    }

    async function fetchUserUrls() {
        const grid = document.getElementById('url-grid');
        grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Loading...</span></div>';
        try {
            const res = await fetch('/api/user/urls');
            if (res.ok) {
                const data = await res.json();
                userUrls = data.urls || [];
                renderUrls(userUrls);
            } else { toast('Failed to load URLs', 'error'); }
        } catch { toast('API unreachable', 'error'); }
    }

    function renderUrls(urls) {
        const grid = document.getElementById('url-grid');
        grid.innerHTML = '';
        if (!urls.length) {
            grid.innerHTML = '<div class="empty-state"><span>No links yet. Create one!</span></div>';
            return;
        }
        urls.forEach(u => {
            const href = `${location.origin}/${u.short_url}`;
            const card = document.createElement('div');
            card.className = 'url-card';
            card.innerHTML = `
                <div class="long-url" title="${u.full_url}">${u.full_url}</div>
                <a href="${href}" target="_blank" class="short-url magnetic">${location.host}/${u.short_url}</a>
                <div class="clicks"><span class="click-dot"></span>${u.click}</div>
                <button class="btn-card-copy magnetic" data-url="${href}">COPY</button>`;
            grid.appendChild(card);
        });

        // Animate cards in
        gsap.from('.url-card', { y: 30, opacity: 0, duration: .5, stagger: .08, ease: 'power3.out' });

        // Bind copy + cursor
        grid.querySelectorAll('.btn-card-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.url);
                toast('Copied!', 'success');
                btn.textContent = 'COPIED';
                setTimeout(() => btn.textContent = 'COPY', 1500);
            });
        });
        if (window._bindCursorHover) window._bindCursorHover();
    }

    // ======================== TOAST ========================
    function toast(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.innerHTML = `<span>${msg}</span>`;
        container.appendChild(el);
        setTimeout(() => {
            el.style.animation = 'toastIn .3s var(--ease) reverse forwards';
            setTimeout(() => el.remove(), 300);
        }, 2800);
    }

})();
