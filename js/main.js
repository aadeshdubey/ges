/**
 * Gayatri Electrical Services — Enterprise Application Engine
 * Version: 26.11.07.2 | Release Date: 2026-11-07
 */
// Performance Optimization: Idle & Interaction Third-Party Script Loaders
let gtmLoaded = false;
function loadGTM() {
    if (gtmLoaded) return;
    gtmLoaded = true;
    (function (w, d, s, l, i) {
        w[l] = w[l] || []; w[l].push({
            'gtm.start': new Date().getTime(), event: 'gtm.js'
        }); var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-K2CN9DK5');
}

let recaptchaLoaded = false;
function loadRecaptcha() {
    if (recaptchaLoaded) return;
    recaptchaLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=6Lfn-xksAAAAADNqkgOV8oBV6f3bzB6ulhvh1RHT';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

function triggerThirdPartyScripts() {
    loadGTM();
    loadRecaptcha();
    ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(function (evt) {
        window.removeEventListener(evt, triggerThirdPartyScripts);
    });
}

// User interaction triggers
['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(function (evt) {
    window.addEventListener(evt, triggerThirdPartyScripts, { passive: true, once: true });
});

// Fallback idle loader
if ('requestIdleCallback' in window) {
    requestIdleCallback(function () {
        loadGTM();
        loadRecaptcha();
    }, { timeout: 3500 });
} else {
    setTimeout(function () {
        loadGTM();
        loadRecaptcha();
    }, 3500);
}

// Dynamic JSON-LD Schema Injection
(function loadSchema() {
    fetch('data/schema.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(data);
            document.head.appendChild(script);
        })
        .catch(function (err) {
            console.warn('GES Schema load notice:', err);
        });
})();
// Service Worker Registration for PWA & Offline Resilience
(function registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function (err) {
                console.warn('GES ServiceWorker registration notice:', err);
            });
        });
    }
})();

        // 1. Initialize Animations

        AOS.init({
            duration: 800,
            once: true,
            offset: 50
        });

        // 2. Scroll Animation Logic
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0 &&
                rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
                rect.right >= 0
            );
        }

        const allAosElements = document.querySelectorAll('[data-aos]');

        function handleScrollAnimations() {
            allAosElements.forEach(function (el) {
                if (isElementInViewport(el)) {
                    el.classList.add('aos-animate');
                }
            });
        }

        window.addEventListener('scroll', handleScrollAnimations, { passive: true });
        window.addEventListener('load', handleScrollAnimations);
        if ('onscrollend' in window) {
            window.addEventListener('scrollend', handleScrollAnimations);
        }

        // 3. Navigation, Mobile Menu & Smooth Scroll Logic
        const header = document.querySelector('.main-header');
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const servicesDropdown = document.querySelector('.services-dropdown');
        const servicesToggle = document.getElementById('services-toggle');
        const serviceMenuItems = document.querySelectorAll('.service-menu-item');
        const allNavLinks = document.querySelectorAll('.nav-links a.nav-link-item');
        const trackedSections = document.querySelectorAll('section[id], footer[id]');

        function getHeaderHeight() {
            return header ? header.offsetHeight : (window.innerWidth <= 1024 ? 70 : 76);
        }

        let isNavScrolling = false;

        function smoothScrollTo(targetSelector) {
            let targetEl = document.querySelector(targetSelector);
            if (!targetEl) {
                if (targetSelector === '#authorities' || targetSelector === '#jurisdictions' || targetSelector === '#liaisoning') {
                    targetEl = document.querySelector('#liaisoning') || document.querySelector('#authorities');
                }
            }
            if (!targetEl) return;

            isNavScrolling = true;
            const headerHeight = getHeaderHeight();
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: Math.max(0, Math.round(offsetPosition)),
                behavior: 'smooth'
            });

            // Immediately set active menu link
            allNavLinks.forEach(a => {
                const href = a.getAttribute('href');
                if (href === targetSelector || (targetSelector === '#liaisoning' && href === '#authorities')) {
                    a.classList.add('active');
                } else {
                    a.classList.remove('active');
                }
            });

            // Immediately reveal any AOS elements inside destination
            targetEl.querySelectorAll('[data-aos]').forEach(el => el.classList.add('aos-animate'));

            setTimeout(() => {
                isNavScrolling = false;
                handleScrollAnimations();
                updateScrollSpy();
            }, 850);
        }

        function openMobileMenu() {
            if (!menuToggle || !mobileMenu) return;
            menuToggle.classList.add('open');
            mobileMenu.classList.add('open');
            document.body.classList.add('no-scroll');
            menuToggle.setAttribute('aria-expanded', 'true');
        }

        function closeMobileMenu() {
            if (!menuToggle || !mobileMenu) return;
            menuToggle.classList.remove('open');
            mobileMenu.classList.remove('open');
            document.body.classList.remove('no-scroll');
            menuToggle.setAttribute('aria-expanded', 'false');
            if (servicesDropdown) {
                servicesDropdown.classList.remove('open');
                if (servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
            }
        }

        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (mobileMenu.classList.contains('open')) {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }
            });
        }

        // Services toggle accordion on mobile; smooth scroll to #services on desktop
        if (servicesToggle) {
            servicesToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.innerWidth <= 1024) {
                    servicesDropdown.classList.toggle('open');
                    const isOpen = servicesDropdown.classList.contains('open');
                    servicesToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                } else {
                    smoothScrollTo('#services');
                }
            });
        }

        // Desktop hover close listener on outside click / resize
        document.addEventListener('click', (e) => {
            if (window.innerWidth > 1024 && servicesDropdown && !servicesDropdown.contains(e.target)) {
                servicesDropdown.classList.remove('open');
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                closeMobileMenu();
            }
        });

        // Nav Links click
        allNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    closeMobileMenu();
                    smoothScrollTo(href);
                }
            });
        });

        // Page-wide anchor links (e.g. CTA buttons, footer links, spotlight links)
        document.querySelectorAll('a[href^="#"]:not(.service-menu-item):not([data-modal-target])').forEach(anchor => {
            if (!anchor.classList.contains('nav-link-item')) {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href && href.length > 1 && !href.startsWith('#modal-')) {
                        const targetEl = document.querySelector(href);
                        if (targetEl || href === '#authorities' || href === '#liaisoning') {
                            e.preventDefault();
                            smoothScrollTo(href);
                        }
                    }
                });
            }
        });

        // Modal Logic
        const modalContainer = document.getElementById('modal-container');
        let activeModalButton = null;

        function openModalById(targetModalId, triggerEl) {
            const targetModal = document.querySelector(targetModalId);
            if (targetModal) {
                closeMobileMenu();
                document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
                targetModal.classList.add('active');
                modalContainer.classList.add('active');
                document.body.classList.add('no-scroll');
                activeModalButton = triggerEl || null;
            }
        }

        // Delegated click listener to support static and dynamically translated buttons
        document.addEventListener('click', (event) => {
            const button = event.target.closest('[data-modal-target]');
            if (button) {
                event.preventDefault();
                const targetModalId = button.getAttribute('data-modal-target');
                if (targetModalId) {
                    openModalById(targetModalId, button);
                }
            }
        });

        function closeModal() {
            modalContainer.classList.remove('active');
            document.body.classList.remove('no-scroll');
            if (activeModalButton) {
                activeModalButton.focus();
                activeModalButton = null;
            }
        }

        modalContainer.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                closeModal();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalContainer.classList.contains('active')) {
                closeModal();
            }
        });

        // Service items click -> open modal
        serviceMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href');
                const targetModal = document.querySelector(targetId);

                if (targetModal) {
                    closeMobileMenu();
                    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
                    targetModal.classList.add('active');
                    document.getElementById('modal-container').classList.add('active');
                    document.body.classList.add('no-scroll');
                    activeModalButton = item;
                }
            });
        });

        // Scroll Spy
        function updateScrollSpy() {
            if (isNavScrolling) return;

            const headerHeight = getHeaderHeight();
            const scrollPos = window.pageYOffset + headerHeight + 50;
            let currentId = '';

            trackedSections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                if (scrollPos >= top && scrollPos < top + height) {
                    currentId = section.getAttribute('id');
                }
            });

            if ((window.innerHeight + window.pageYOffset) >= (document.documentElement.scrollHeight - 60)) {
                currentId = 'contact';
            }

            if (currentId) {
                allNavLinks.forEach(a => {
                    const href = a.getAttribute('href');
                    if (href === '#' + currentId || (currentId === 'liaisoning' && href === '#authorities')) {
                        a.classList.add('active');
                    } else {
                        a.classList.remove('active');
                    }
                });
            }
        }

        window.addEventListener('scroll', updateScrollSpy, { passive: true });

        // Header scrolled class
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });

        const slides = document.querySelectorAll('.carousel-slide');
        let currentSlide = 0;

        function hydrateSlide(slide) {
            if (!slide) return;
            const img = slide.querySelector('img[data-src]');
            if (img) {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            }
        }

        function nextSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            hydrateSlide(slides[currentSlide]);
            const upcomingSlide = (currentSlide + 1) % slides.length;
            hydrateSlide(slides[upcomingSlide]);
            slides[currentSlide].classList.add('active');
        }

        setInterval(nextSlide, 5000);

        if ('requestIdleCallback' in window) {
            requestIdleCallback(function () {
                slides.forEach(hydrateSlide);
            }, { timeout: 4000 });
        } else {
            setTimeout(function () {
                slides.forEach(hydrateSlide);
            }, 3000);
        }

        // 4. Phone Input Setup
        const phoneInputField = document.querySelector("#phone");
        const phoneInput = window.intlTelInput(phoneInputField, {
            initialCountry: "in",
            showSearchBox: true,
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        });

        // 5. Form Submission with reCAPTCHA v3
        const form = document.getElementById("contactForm");
        if (form) {
            form.addEventListener('focusin', loadRecaptcha, { once: true, passive: true });
            form.addEventListener('mouseenter', loadRecaptcha, { once: true, passive: true });
        }
        const formStatus = document.getElementById("form-status");

        // YOUR NEW v3 SITE KEY
        const siteKey = "6Lfn-xksAAAAADNqkgOV8oBV6f3bzB6ulhvh1RHT";

        async function handleSubmit(event) {
            event.preventDefault();

            // Populate the hidden full phone field
            document.querySelector("input[name='full_phone']").value = phoneInput.getNumber();

            const submitButton = form.querySelector('button');
            const originalButtonText = submitButton.innerHTML;

            submitButton.disabled = true;
            submitButton.innerHTML = "Sending...";

            function sendPayload(token) {
                const data = new FormData(event.target);
                if (token) {
                    data.append("g-recaptcha-response", token);
                }
                fetch(event.target.action, {
                    method: form.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(response => {
                        if (response.ok) {
                            formStatus.innerHTML = "Thank you! Your submission has been received.";
                            formStatus.style.display = 'block';
                            formStatus.className = 'success';
                            formStatus.style.opacity = 1;
                            form.reset();
                            submitButton.innerHTML = "Sent!";
                            setTimeout(() => {
                                submitButton.disabled = false;
                                submitButton.innerHTML = originalButtonText;
                                formStatus.style.opacity = 0;
                            }, 5000);
                        } else {
                            response.json().then(data => {
                                if (Object.hasOwn(data, 'errors')) {
                                    formStatus.innerHTML = data["errors"].map(error => error["message"]).join(", ")
                                } else {
                                    formStatus.innerHTML = "Oops! There was a problem submitting your form";
                                }
                                formStatus.className = 'error';
                                formStatus.style.display = 'block';
                                formStatus.style.opacity = 1;
                                submitButton.disabled = false;
                                submitButton.innerHTML = originalButtonText;
                            }).catch(() => {
                                formStatus.innerHTML = "Oops! There was a problem submitting your form. Please try again.";
                                formStatus.className = 'error';
                                formStatus.style.display = 'block';
                                formStatus.style.opacity = 1;
                                submitButton.disabled = false;
                                submitButton.innerHTML = originalButtonText;
                            })
                        }
                    }).catch(error => {
                        formStatus.innerHTML = "Oops! There was a problem submitting your form";
                        formStatus.className = 'error';
                        formStatus.style.display = 'block';
                        formStatus.style.opacity = 1;
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonText;
                    });
            }

            if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
                grecaptcha.ready(function () {
                    grecaptcha.execute(siteKey, { action: 'submit' }).then(function (token) {
                        sendPayload(token);
                    }).catch(function () {
                        sendPayload(null);
                    });
                });
            } else {
                sendPayload(null);
            }
        }

        form.addEventListener("submit", handleSubmit);

        // 6. FAQ Accordion: Auto-close other questions when one is opened
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            item.addEventListener('toggle', () => {
                if (item.open) {
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.open) {
                            otherItem.removeAttribute('open');
                        }
                    });
                }
            });
        });

        // 7. Industry Category Filtering Logic
        const filterBtns = document.querySelectorAll('.industry-filter-btn');
        const indCards = document.querySelectorAll('.industry-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');

                indCards.forEach(card => {
                    const cardCat = card.getAttribute('data-category');
                    if (filter === 'all' || cardCat === filter) {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(15px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 250);
                    }
                });
            });
        });

        // 8. Select Industry helper function for Card CTAs
        window.selectIndustry = function(sector) {
            const select = document.getElementById('industry_sector');
            if (select) {
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === sector) {
                        select.selectedIndex = i;
                        break;
                    }
                }
            }
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.classList.add('form-highlight-pulse');
                setTimeout(() => {
                    contactForm.classList.remove('form-highlight-pulse');
                }, 2200);
            }
        };

        // 9. Multi-Language Switcher (English, Hindi, Marathi) - Instant Built-In + Dynamic Locale Loader
        const translations = {"en":{"logo_subtitle":"Govt. Auth. Electrical Contractor","logo_tagline":"<span class=\"tagline-voltage\">HIGH VOLTAGE</span> <span class=\"tagline-meets\">MEETS</span> <span class=\"tagline-intelligence\">HIGH INTELLIGENCE</span>","nav_home":"Home","nav_about":"About Us","nav_services":"Services","services_full_overview":"⚡ Full Services Overview","srv_transformer":"Transformer Management","srv_ht":"HT Substations","srv_panels":"Panel Systems","srv_cabling":"Cabling Works","srv_testing":"Testing & Safety","srv_liasoning":"Liasoning & Consulting","srv_projects":"Special Projects","srv_solar":"Solar Power","srv_earthing":"Earthing Solutions","nav_industries":"Industries","nav_liaisoning":"Liaisoning","nav_flagship_project":"13 MW Feeder","nav_faq":"FAQ","nav_contact":"Contact","hero_tagline":"<span class=\"hv-word\">High Voltage</span> <span class=\"connector-word\">Meets</span> <span class=\"hi-word\">High Intelligence</span>","hero_title":"Engineering the Future of Power","hero_subtitle":"Authoritative, reliable, and innovative electrical solutions for industrial and commercial projects of all sizes.","hero_cta":"Get a Consultation","metric_exp":"Years Experience","metric_exp_sub":"Established 2003 in Bhiwandi","metric_substations":"Turnkey Substations","metric_substations_sub":"New HT/LT Projects Executed","metric_trans":"Transformers Serviced","metric_trans_sub":"Overhauls, BDV Testing & Filtration","metric_amc":"Active Industrial AMCs","metric_amc_sub":"Comprehensive & Preventive Contracts","metric_panels":"HT/LT Panels Built","metric_panels_sub":"PCC/MCC & APFC Capacitor Banks","metric_compliance":"Statutory Clearances","metric_compliance_sub":"PWD CEI, Discom & Lift Approvals","about_title":"The Current That Drives Progress","about_p1":"For over two decades, Gayatri Electricals has been more than a service provider; we are the silent, steadfast current running through the core of industry and commerce. We don't just manage power—we empower potential. Our foundation is built on a legacy of unwavering commitment to excellence, translating complex electrical challenges into streamlined, robust solutions.","about_p2":"Our team of seasoned professionals operates at the intersection of experience and innovation. As a Govt. Authorized Electrical Contractor and Govt. Authorized Lift Contractor, our work is backed by official credentials and a deep commitment to compliance and safety. We view every project, from a critical emergency repair to a full-scale substation installation, as a dedicated collaboration. We are dedicated to building a future where your operations are not only safer and more efficient but are also primed for the growth and technological demands of tomorrow.","about_p3":"We believe that reliable power is the foundation of progress. That's why we're constantly adapting to new technologies, from advanced diagnostics to sustainable energy solutions like solar. Our goal is to ensure your operations are not only safer and more efficient today but are also primed for the growth and technological demands of tomorrow.","footer_desc":"Powering progress with more than two decades of unwavering commitment to safety, efficiency, and innovative electrical solutions.","footer_quick_links":"Quick Links","footer_contact_us":"Contact Us","footer_follow_us":"Follow & Verify Us","contact_office_addr":"Shop No 7, Tirupati Heights,<br>Sonale Pipeline Rd, Bhadwad,<br>Bhiwandi, Maharashtra - 421302","footer_rights":"© 2026 Gayatri Electrical Services. All Rights Reserved. | <button id=\"privacy-policy-link\" data-modal-target=\"#modal-privacy\" class=\"footer-link\">Privacy Policy</button> | <button id=\"terms-of-service-link\" data-modal-target=\"#modal-terms\" class=\"footer-link\">Terms of Service</button>","parallax_title":"Ready to Power Up Your Project?","parallax_sub":"Let our expertise be your asset. Partner with the best.","parallax_cta":"Discuss Your Needs","contact_title":"Contact Us","contact_sub":"Let's discuss how we can power your project's success. Reach out for a consultation.","contact_get_in_touch":"Get In Touch","contact_send_email":"Send an Email","contact_give_call":"Give Us a Call","contact_office":"Our Office","contact_form_title":"Send Us a Message","contact_form_name":"Your Name","contact_form_email":"Your Email","contact_form_phone":"Your Mobile No.","contact_form_industry":"Select Your Industry / Project Sector","contact_form_msg":"Your Message / Project Requirements","contact_form_btn":"Submit Inquiry","whatsapp_tooltip":"Quick Chat on WhatsApp","services_section":{"title":"Our Areas of Expertise","subtitle":"We provide a complete spectrum of electrical solutions, organized by our core specializations for clarity and precision.","cards":[{"title":"Transformer Lifecycle Management","desc":"Complete end-to-end services for your most critical assets, from supply and repair to ongoing maintenance."},{"title":"High-Voltage (HV) Substations","desc":"Turnkey solutions for MV & HV substation erection, testing, and commissioning of both AIS and GIS bays."},{"title":"Industrial Panel Systems (HT, LT & APFC)","desc":"Design, manufacturing, and installation of custom electrical control panels for optimal power distribution and factor correction."},{"title":"Industrial Cabling Works (HT & LT)","desc":"Precision cable laying, termination, and jointing for high and low-tension industrial applications."},{"title":"Electrical Testing & Safety","desc":"Comprehensive diagnostic services, including Transformer testing, Substation testing, and specialized HIGH-POT testing."},{"title":"Liasoning & Regulatory Consulting","desc":"Seamless administrative liasoning with PWD (CEI / Electrical Inspector for HT & D.G. sets), MSEDCL, MSETCL & Torrent Power."},{"title":"Turnkey Projects & Special Works","desc":"End-to-end management of complex electrical engineering projects, from express feeders to overhead line shifting."},{"title":"Solar Power Solutions","desc":"Harness renewable energy with our end-to-end solar installation and liasoning services for your property."},{"title":"Earthing Solutions","desc":"A robust earthing system is critical for the safety of your personnel and the protection of your expensive equipment. We provide reliable and long-lasting solutions."}]},"industries_section":{"title":"Heavy Power Infrastructure for Industries & Manufacturing","subtitle":"We deliver the mission-critical HT and LT electrical infrastructure—dedicated 11kV/22kV substations, main power distribution switchboards, PCC/MCC panels, APFC capacitor banks, express feeders, and statutory utility liaisoning—powering heavy manufacturing facilities across Maharashtra.","filters":["All Sectors","Glass & Materials","Packaging & Printing","Textiles & Looms","Polymers & Rubber","Chemical & Pharma","Cold Chain & Logistics","Heavy Grid & Turnkey"],"cards":[{"badge":"Tempering & Furnaces","title":"Glass & Toughened Processing","desc":"We execute dedicated 11kV/22kV HT substations, power step-down transformers, and heavy Main LT Distribution Panels (PCC) with detuned APFC harmonic capacitor banks. Delivering reliable bulk power up to the plant's main LT distribution panels and quench blower starter boards.","feature_tags":["11kV/22kV HT Substation Erection","Power Transformers & PCC Panels","APFC Harmonic Capacitor Banks"],"cta":"Inquire for Glass Industry"},{"badge":"Kilns & Refractory","title":"Ceramics, Refractory & Glass Moulding","desc":"We execute dedicated HT substation switchyards, high-capacity step-down transformers, and heavy-duty Main LT Switchboards (PCC/MCC). Delivering high-temperature-rated bulk power trunking up to the plant's main LT panels and electric tunnel kiln thyristor feeds, backed by APFC correction.","feature_tags":["Dedicated HT Transformer Bays","Main LT Switchboards (PCC/MCC)","Kiln Feed APFC Power Factor Control"],"cta":"Inquire for Ceramics & Refractory"},{"badge":"Presses & Tubes","title":"Printing & Flexible Packaging","desc":"We execute dedicated 11kV/22kV HT substations, power step-down transformers, and heavy Main LT Distribution Switchboards (PCC) with fast-switched APFC capacitor banks. Sinking harmonics and delivering clean, uninterrupted power up to the plant's main LT distribution bus.","feature_tags":["11kV/22kV Substation & Transformers","Main LT Distribution Panels (PCC)","Detuned APFC Harmonic Filtering"],"cta":"Inquire for Printing & Packaging"},{"badge":"Pulping & Corrugation","title":"Paper Mills & Corrugated Packaging","desc":"We execute dedicated heavy-duty HT transformer yards, HT vacuum circuit breakers, and plant-wide Main Power Distribution Switchboards (PCC) with automatic APFC capacitor correction. Delivering high-uptime bulk power directly up to the mill's main LT panels and MCC motor starter racks.","feature_tags":["Turnkey HT Substation Erection","Heavy-Duty PCC & MCC LT Panels","Multi-Stage APFC Capacitor Banks"],"cta":"Inquire for Paper & Corrugated"},{"badge":"Spinning & Looms","title":"Textiles & Automatic Looms","desc":"We execute dedicated 11kV/22kV HT substations, distribution transformers, and heavy Main LT Distribution Panels (PCC) with fast-switched detuned APFC capacitor banks. Delivering balanced 3-phase power up to the plant's main LT distribution bus and shedding voltage sags across high-speed loom sheds.","feature_tags":["11kV/22kV Substation & Transformer","Main LT Distribution Switchboards","Fast-Switching APFC Banks (>0.98 PF)"],"cta":"Inquire for Textile Power Setup"},{"badge":"Dyeing & Autoclaves","title":"Yarn Processing & Fabric Dyeing","desc":"We execute dedicated outdoor HT transformer substations, step-down transformers, and IP55-rated Main LT Power Distribution Boards (PCC/MCC) with heavy APFC correction. Delivering moisture-resistant bulk power trunking up to the plant's main LT panels and wet-finishing distribution boards.","feature_tags":["HT Transformer Substation Erection","Moisture-Sealed PCC/MCC Panels","High-Capacity APFC Banks & Earthing"],"cta":"Inquire for Yarn & Dyeing Setup"},{"badge":"Extrusion Lines","title":"Agricultural Pipes & Irrigation Extrusion","desc":"We execute dedicated 11kV/22kV HT substations, step-down power transformers, and heavy Main LT Power Distribution Centers (PCC) with detuned APFC capacitor banks. Delivering clean bulk power up to the plant's main LT distribution panels and barrel-heater MCC panels.","feature_tags":["Dedicated 11kV/22kV Substation","Heavy PCC Main LT Distribution Panels","APFC Banks for Extrusion Harmonics"],"cta":"Inquire for Pipe Extrusion Plants"},{"badge":"Moulding & Vulcanization","title":"Rubber & Polymer Manufacturing","desc":"We execute dedicated HT transformer substations, heavy-duty step-down transformers, and Main LT Distribution Switchboards (PCC/MCC) with APFC harmonic filters. Delivering high-inrush bulk power directly up to the plant's main LT distribution panels and hydraulic press pump drives.","feature_tags":["HT Substation & Transformer Setup","Shock-Resilient PCC/MCC Switchboards","Heavy-Duty APFC Capacitor Banks"],"cta":"Inquire for Rubber & Polymers"},{"badge":"Flameproof / FLP","title":"Chemical & Pharmaceutical Plants","desc":"We execute dedicated HT substations, oil-cooled step-down transformers, and certified flameproof (FLP) Main LT Distribution Switchboards (PCC/MCC) with APFC capacitor correction. Delivering statutory safety power trunking up to the plant's main LT distribution panels and reactor motor feeder boards.","feature_tags":["11kV/22kV HT Substation & Transformers","Main LT Switchboards (PCC/MCC)","Chemical Earthing & APFC Banks"],"cta":"Inquire for Pharma & Chemical"},{"badge":"Zone-1 Solvent Processing","title":"Paints, Resins & Solvent Formulations","desc":"We execute dedicated 11kV/22kV HT substations, step-down transformers, and explosion-proof Ex-d/FLP Main LT Power Distribution Switchboards (PCC) with detuned APFC banks. Delivering certified bulk power directly up to the facility's main LT panels and high-shear disperser drives.","feature_tags":["Dedicated HT Substation & Transformers","Main LT Distribution Panels (PCC)","Static Earthing & APFC Control"],"cta":"Inquire for Paints & Solvents"},{"badge":"Ammonia Compressors","title":"Cold Storage & Refrigerated Logistics","desc":"We execute dedicated 11kV/22kV HT substations, dual-incomer step-down transformers, and heavy Main LT Power Distribution Centers (PCC) with D.G. set emergency synchronization and APFC capacitor banks. Delivering continuous power up to the facility's main LT panels and refrigeration compressor panels.","feature_tags":["11kV/22kV HT Substation Erection","Dual-Incomer Main LT Panels (PCC)","High-kVAR APFC Capacitor Banks"],"cta":"Inquire for Cold Storage Power"},{"badge":"Multi-Tier Distribution","title":"Warehousing & Logistics Parks","desc":"We execute dedicated HT substations, distribution transformers, and centralized Main LT Power Distribution Centers (PCC) with APFC banks. Delivering scalable 3-phase power up to the logistics park's main LT distribution panels and high-bay dock feeder boards.","feature_tags":["Turnkey HT Substation & Transformers","Main LT Distribution Panels (PCC)","APFC Banks & Charging Distribution"],"cta":"Inquire for Warehousing Infrastructure"},{"badge":"Injection Moulding","title":"Office Furniture & Precision Polymers","desc":"We execute dedicated 11kV/22kV HT substations, step-down transformers, and centralized Main LT Power Distribution Switchboards (PCC) with detuned APFC capacitor banks. Delivering stable power directly up to the facility's main LT distribution panels and hydraulic injection moulding MCCs.","feature_tags":["11kV/22kV HT Substation Erection","Main LT Distribution Switchboards","Harmonic-Filtered APFC Banks"],"cta":"Inquire for Furniture & Moulding"},{"badge":"Grain & Feed Processing","title":"Food Processing & Commercial Agro Mills","desc":"We execute dedicated 11kV/22kV HT substations, food-grade distribution transformers, and dust-tight IP55 Main LT Distribution Switchboards (PCC/MCC) with APFC capacitor banks. Delivering continuous power up to the mill's main LT distribution panels and silo motor starter racks.","feature_tags":["Dedicated HT Substation Bays","Main LT Distribution Panels (PCC)","Multi-Stage APFC Capacitor Banks"],"cta":"Inquire for Agro & Food Processing"},{"badge":"Crushers & Induction Furnaces","title":"Stone Quarries, Crushers & Steel Mills","desc":"We execute heavy-duty 11kV/22kV/33kV HT substations, high-capacity step-down transformers, and heavy-gauge Main LT Switchboards (PCC/MCC) with dynamic APFC banks. Delivering high-shock-load bulk power directly up to the facility's main LT distribution panels and induction furnace buses.","feature_tags":["11kV/22kV/33kV Substations","Shock-Rated PCC/MCC Switchboards","Heavy-Duty APFC Capacitor Banks"],"cta":"Inquire for Quarries & Rolling Mills"},{"badge":"Heavy Machinery & Towers","title":"Engineering Fabrication & Commercial Towers","desc":"We execute dedicated 11kV/22kV HT substations, step-down transformers, rising main sandwich busducts, and heavy Main LT Distribution Switchboards (PCC) with detuned APFC banks. Delivering safe, fully sanctioned bulk power directly up to the facility's main LT distribution switchrooms.","feature_tags":["11kV/22kV HT Substation Erection","Dual-Incomer Main LT Panels (PCC)","APFC Banks & PWD Electrical Clearances"],"cta":"Inquire for Towers & Fabrication"},{"badge":"Die Casting & Robotics","title":"Automotive Ancillaries & Precision Die Casting","desc":"We design and install dedicated 11kV/22kV HT substations, dual-ratio step-down transformers, shock-rated Main LT Switchboards (PCC/MCC), and fast-acting APFC harmonic filtration banks, powering high-tonnage pressure die-casting machines, robotic welding cells, and CNC lines without voltage sags.","feature_tags":["11kV/22kV HT Substation Erection","Shock-Rated PCC/MCC & Busducts","Fast-Switching APFC Harmonic Banks"],"cta":"Inquire for Auto & Casting"},{"badge":"Tier-III/IV Redundancy","title":"Data Centers & Enterprise Server Hubs","desc":"We execute turnkey dual-source 22kV/33kV express HT substations, rapid-acting Vacuum Circuit Breakers, static transfer switchgear (STS), and fault-tolerant Main LT Distribution Switchboards (PCC) with PWD CEI statutory clearances, guaranteeing 99.999% power availability for enterprise data hubs.","feature_tags":["22kV/33kV Dual Express Feeder Bays","Fault-Tolerant PCC/MCC Switchboards","CEI Statutory Redundancy Clearances"],"cta":"Inquire for Data Centers"}],"spotlight":{"live_badge":"Live Ongoing Project","featured_badge":"Featured Mega Turnkey Project","dual_badge":"Dual-Substation EHV Feed","location_badge":"Bhiwandi Infrastructure","client_label":"Client: APCO Infratech (National Infrastructure Developer)","title":"13 MW Turnkey Power Sanctioning & Dual <span>6.5 MW Express Feeders</span>","desc":"Gayatri Electrical Services is currently executing and sanctioning a landmark <strong>13 MW turnkey power infrastructure project</strong> for national infrastructure leader <strong>APCO Infratech</strong> in Bhiwandi. Sourced across two distinct utility transmission hubs—a 100kV Substation and a 220kV EHV Grid Substation—we are establishing two dedicated <strong>6.5 MW express feeder lines (13 MW total capacity)</strong> with complete turnkey bay erection, line construction, vacuum circuit breakers, dual-incomer bus-coupler synchronization, Torrent Power and MSETCL grid approvals, and statutory commissioning under the Electrical Inspector.","m1_lbl":"Total Sanctioned Load","m2_lbl":"Dedicated Express Feeders","m3_lbl":"Dual EHV Grid Substations","m4_lbl":"Torrent Power, MSETCL & Electrical Inspector Clearances","highlights":["APCO Infratech Enterprise Infrastructure","Dual Incomer Synchronization","Torrent Power & MSETCL Grid Liaisoning","Electrical Inspector Statutory Commissioning"],"cta":"Consult on Mega Turnkey Projects"}},"liaisoning_section":{"title":"Statutory Liaisoning & Commissioning Approvals","subtitle":"As a Govt. Authorized Electrical Contractor (Est. 2003) and authorized Lift Contractor, we execute official engineering liaisoning, industrial load sanctions, electrical inspectorate clearances, and turnkey commissioning across Maharashtra's power utilities and regulatory boards.","cards":[{"badge":"Distribution Licensee","title":"Bhiwandi Distribution Circle","subtitle":"Torrent Power Limited","desc":"Govt. authorized HT and LT electrical contracting operations across Torrent Power's Bhiwandi franchise circle. We deliver turnkey HT/LT service connections, industrial load sanctions & enhancements, transformer overhauls, express feeders, and network engineering compliant with Torrent Power standards.","features":["Authorized HT & LT Contractor in Bhiwandi Circle","Fast-Track HT/LT Load Sanctions & Demand Enhancements","Substation Erection, Transformer Maintenance & Charging Clearances"]},{"badge":"EHV Transmission","title":"State Transmission Grid","subtitle":"MSETCL (Mahatransco)","desc":"Turnkey execution and liaisoning for high-capacity industrial power evacuation across 100kV and 220kV transmission networks. Sourcing power from dual EHV substations (as in our 13 MW APCO Infratech project), overhead line shifting, and transmission bay extension approvals.","features":["100kV & 220kV EHV Grid Connectivity & Feeder Sync","EHV Transmission Line Shifting & Bay Extension Approvals","Right-of-Way (ROW) Compliance & Grid Evacuation Clearances"]},{"badge":"Statutory Safety","title":"Chief Electrical Inspectorate","subtitle":"Electrical Inspector (Govt. of Maharashtra)","desc":"End-to-end statutory coordination for initial and periodic inspection clearances under Central Electricity Authority (CEA) Safety Regulations. We handle drawing scrutiny, Form A/B submissions, HT charging permissions, D.G. Set sanctioning, and earth pit resistance compliance.","features":["Form A & Form B Submissions for Initial & Periodic Clearances","High-Tension (11kV/22kV/33kV) Charging Permission & Safety Approvals","D.G. Set Statutory Clearances & Earthing Grid Resistance Testing"]},{"badge":"Power Distribution","title":"State Distribution Licensee","subtitle":"MSEDCL (Mahavitaran)","desc":"Comprehensive engineering liaisoning and electrical contracting for industrial power consumers across Wada, Kudus, Thane, and Palghar zones. Managing new HT/LT load sanctions, contract demand enhancements, dedicated industrial feeders, and TOD metering setups.","features":["New HT/LT Industrial Connections across Wada & Kudus Belts","Contract Demand Sanctioning, Extension & Rationalization","Dedicated Industrial Feeders & TOD Tariff Metering Setup"]},{"badge":"Incident & High-Rise","title":"Electrical Inspectorate & PWD","subtitle":"Incident Clearances & High-Rise Permissions","desc":"Specialized statutory liaisoning for industrial emergency power restoration and tall building electrical compliance. When a factory electrical fire occurs, we coordinate the Electrical Inspector's investigation and obtain re-charging safety clearance. For high-rise towers, we manage complete PWD electrical permissions.","features":["Emergency Forensic Inspection following Industrial Fires","Cable Hi-Pot, Insulation Resistance & Switchgear Health Audits","Electrical Inspectorate NOC & Fast-Track Power Restoration"]},{"badge":"Authorized Lift Contractor","title":"Lift & Escalator Safety Authority","subtitle":"Lift Inspectorate (Energy Department, Govt. of Maharashtra)","desc":"As a Govt. Authorized Lift Contractor, we execute complete vertical transportation installations, passenger and goods lift erection, modernization, and annual safety compliance under the Bombay Lifts Act and Maharashtra Lift Inspectorate regulations.","features":["Govt. Authorized Lift Contractor under Bombay Lifts Act","Passenger & Heavy Goods Elevator Erection & Modernization","Statutory Annual Lift Inspection & Safety Certification"]}]},"faq_section":{"title":"Frequently Asked Questions","subtitle":"Key insights regarding statutory approvals, D.G. set clearances, utility liaisons, and emergency electrical services.","items":[{"q":"What statutory approvals are required from the Electrical Inspector (PWD) for HT installations and D.G. sets?","a":"<p>Under Regulation 43 of the Central Electricity Authority (CEA) Safety Regulations and Section 54 of the Electricity Act, any electrical installation operating at High Tension (11kV, 22kV, 33kV) as well as Diesel Generator (D.G.) sets above statutory capacities require formal drawing scrutiny, earth pit resistance testing, interlock validation, and on-site physical inspection by the Electrical Inspectorate (PWD) before energization. Gayatri Electrical Services manages end-to-end liaisoning, submits Form A / Form B, and secures official charging permissions.</p>"},{"q":"What HT and LT electrical contracting services do you provide under Torrent Power and MSEDCL supply circles?","a":"<p>As a licensed Govt. Authorized Electrical Contractor, we execute turnkey HT and LT contracting across Torrent Power (Bhiwandi Circle) and MSEDCL (Mahavitaran). Our contracting scope includes new HT/LT industrial service connections, contract demand enhancement and reduction, dedicated overhead and underground HT cable laying, transformer and substation erection, Express Feeder commissioning, and CT/PT metering cubicle testing and charging approvals.</p>"},{"q":"Which manufacturing and process industries do you provide electrical infrastructure for?","a":"<p>We provide specialized HT/LT power engineering for diverse continuous manufacturing sectors, including Glass & Toughened Processing, Printing & Flexible Packaging, Agricultural Pipes & Drip Irrigation, Rubber & Polymers, Office Furniture & Wheel Moulding, Chemical & FLP Pharma Plants, Cold Storage & Warehousing, Automatic Textile Looms, and Stone Crushers & Steel Mills.</p>"},{"q":"Why is it mandatory to hire a Govt. Authorized Electrical Contractor in Maharashtra?","a":"<p>Under Indian Electricity Rules, only licensed electrical contractors authorized by the Maharashtra State Government Licensing Board (Industries, Energy & Labour Department) are legally permitted to execute, test, and certify HT/LT installations, substations, and passenger/freight lifts. Engaging an authorized contractor ensures full statutory compliance, insurance validity, and official acceptance of test certificates by utility authorities.</p>"},{"q":"What is the procedure for obtaining D.G. Set (Diesel Generator) approval from the Electrical Inspector (PWD)?","a":"<p>Obtaining statutory D.G. Set approval requires submitting an engineering Single Line Diagram (SLD) depicting the changeover switchgear, mechanical/electrical interlock verification to ensure no utility back-feeding, measurement of dedicated neutral and body earthing pits, acoustic enclosure noise compliance, and an on-site physical inspection by the Electrical Inspector (PWD). We prepare all engineering drawings, file statutory Form A and Form B, and secure final charging permission.</p>"},{"q":"Do you handle High-Rise Building Electrical Permissions & Substation Clearances?","a":"<p>Yes. Commercial and residential high-rise towers require specialized statutory scrutiny from the Electrical Inspectorate (Govt. of Maharashtra). We execute complete rising main busduct designs, D.G. set emergency changeovers, life-safety pump electrical panels, dual power source interlocks, and transformer substations, managing all PWD drawing approvals, on-site testing, and official final charging permissions.</p>"},{"q":"How do you handle Electrical Inspector investigation clearances after a factory fire or electrical flashover?","a":"<p>Following an industrial electrical fire or flashover, utility discoms cannot restore power without statutory clearance from the Electrical Inspector (Govt. of Maharashtra). Our senior engineers conduct emergency forensic damage assessments, perform Hi-Pot and Megger insulation resistance testing across cables and switchgear, draft remedial Single Line Diagrams (SLDs), rectify damaged distribution boards, and coordinate directly with the Electrical Inspectorate to obtain official inspection clearance and prompt power restoration.</p>"},{"q":"Do you provide Emergency Transformer Rental Services for industrial plants?","a":"<p>Yes. We provide emergency and temporary industrial transformer rentals (ranging from 100 kVA to 2000 kVA+) across Bhiwandi, Wada, Kudus, Thane, and Navi Mumbai. If your factory power transformer suffers an unexpected breakdown, winding flashover, or is undergoing major overhauls, our mobile emergency team swiftly delivers, mounts, cables, tests, and commissions a replacement rental transformer to eliminate manufacturing downtime.</p>"},{"q":"What Transformer Testing and On-Site Vacuum Oil Filtration services do you offer?","a":"<p>We provide complete NABL-traceable transformer diagnostic testing and servicing: Breakdown Voltage (BDV) dielectric oil strength test, Insulation Resistance (Megger 5kV/1kV), Winding Resistance, Voltage Ratio (Turns Ratio), Magnetic Balance, and Tan Delta / Capacitance testing. Our mobile high-vacuum oil filtration units perform continuous online/offline transformer oil heating, degassing, moisture extraction, and dehydration directly on-site to restore transformer dielectric strength to >60kV.</p>"},{"q":"What HT Substation Testing and Switchgear Maintenance do you perform?","a":"<p>Our licensed testing engineers carry out comprehensive preventive and statutory HT substation health audits: Vacuum Circuit Breaker (VCB) & SF6 breaker contact resistance and closing/tripping time testing, numerical protection relay calibration (overcurrent, earth fault, differential), CT/PT ratio and knee-point excitation verification, HT cable DC Hi-Pot and surge testing, and calibrated 4-terminal Earth Megger resistance audits of neutral and body earthing grids.</p>"},{"q":"Do you provide Annual Maintenance Contracts (AMCs) for industrial substations, transformers, and HT/LT panels?","a":"<p>Yes. We offer both <strong>Comprehensive and Non-Comprehensive Annual Maintenance Contracts (AMCs)</strong> across Bhiwandi, Kudus, Wada, Thane, and Mumbai. Our AMC packages cover HT Substation & Switchyard Servicing, Transformer Health & High-Vacuum Oil Conditioning (>60 kV BDV), LT Distribution & APFC Panel Calibration (guaranteeing PF >0.98), Protection Relay Testing, Earth Grid Safety Audits, and 24x7 Emergency Breakdown Priority Mobilization.</p>"},{"q":"Can you execute large-scale Turnkey Express Feeders and multi-megawatt industrial load sanctions (such as 13 MW projects)?","a":"<p>Yes. We have proven turnkey engineering capacity for multi-megawatt industrial infrastructure. A prime showcase is our current <strong>13 MW turnkey project for APCO Infratech in Bhiwandi</strong>, featuring dual 6.5 MW express feeders sourced from two separate transmission hubs—a 100kV Substation and a 220kV EHV Grid Substation. We manage right-of-way (ROW), tower/pole line construction, substation bay erection, vacuum circuit breakers, dual-incomer synchronization, and statutory MSEDCL/MSETCL/PWD commissioning.</p>"},{"q":"How do you help manufacturing plants avoid Low Power Factor (PF) penalties?","a":"<p>Operating with a power factor below 0.90 attracts severe monthly penalties on utility bills from MSEDCL and Torrent Power, while maintaining a PF above 0.95 earns substantial incentives. We design, install, and calibrate Automatic Power Factor Correction (APFC) capacitor banks equipped with detuned harmonic filters to neutralize harmonics created by VFDs, extruders, and moulding machines, keeping your plant consistently at 0.99+ PF.</p>"},{"q":"Do you provide emergency breakdown assistance and on-site transformer oil filtration?","a":"<p>Yes. We offer rapid emergency breakdown assistance across Bhiwandi, Kudus, Wada, Thane, and Navi Mumbai. Our mobile maintenance team provides on-site transformer diagnostics, BDV dielectric oil testing, high-vacuum oil filtration & dehydration, silica gel replacement, OLTC servicing, and high-voltage underground cable fault tracing and jointing.</p>"},{"q":"Which industrial areas and regions in Maharashtra do you serve?","a":"<p>We actively serve industrial and commercial clients throughout Bhiwandi (Sonale, Val, Mankoli, Padgha, Bhadwad), the major industrial belts of Kudus and Wada, as well as Thane, Kalyan, Dombivli, Ambernath, Badlapur, Shahapur, Navi Mumbai, and the wider Mumbai Metropolitan Region (MMR).</p>"},{"q":"Do you handle Solar Net-Metering Approvals and Statutory CEI Liaisoning for industrial rooftop solar plants?","a":"<p>Yes. Gayatri Electrical Services is a premier specialist in <strong>turnkey Solar Liaisoning, Net-Metering Approvals, and Chief Electrical Inspectorate (CEI / PWD) statutory charging clearances</strong> for industrial and commercial rooftop and ground-mounted solar installations across Bhiwandi, Wada, Kudus, Thane, and Maharashtra. We handle utility grid technical feasibility applications with Torrent Power (Bhiwandi Circle) and MSEDCL (Mahavitaran), statutory drawing scrutiny, solar inverter earthing grid compliance, and bi-directional TOD net-meter installation.</p>"},{"q":"What are your commercial terms, pricing structure, and accepted payment modes?","a":"<p>Gayatri Electrical Services is a legally registered GST engineering firm adhering to statutory corporate compliance. We provide transparent, competitive project estimates based on an itemized engineering Bill of Quantities (BOQ). All contracting transactions, milestone disbursements, and AMC retainers are billed through formal GST Tax Invoices and settled via institutional electronic banking: Bank Transfer (RTGS / NEFT / IMPS), Account Payee Cheques, or Verified Corporate UPI. This ensures 100% financial and auditing transparency, and enables our corporate clients to claim full GST Input Tax Credit (ITC) benefits.</p>"}]},"service_modals":{"modal-transformer":{"title":"Transformer Lifecycle Management","desc":"Complete end-to-end services for your most critical assets, from supply and repair to ongoing maintenance.","items":["Transformer Supply (New & Service Units)","Comprehensive Repair & Refurbishment","Preventative Maintenance Programs","Advanced Oil Filtration & Dehydration","Diagnostic Transformer Testing"]},"modal-ht":{"title":"High-Tension (HT) Substations","desc":"We specialize in the design and execution of high-tension infrastructure, the core of industrial power distribution. Our expertise includes:","items":["Outdoor & Indoor HT Sub-Station Erection","Comprehensive HT Sub-station Testing","Air Insulated (AIS) Bay Installation & Commissioning","Gas Insulated (GIS) Bay Installation & Commissioning"]},"modal-panels":{"title":"Panel Systems (HT, LT & APFC)","desc":"We supply, install, and maintain the full spectrum of electrical panels that control and protect your operations. Our offerings cover:","items":["HT Panel Supply, Installation & Maintenance","LT Panel Supply, Installation & Maintenance","Automatic Power Factor Correction (APFC) Panel Supply & Maintenance"]},"modal-cabling":{"title":"Cabling Works (HT & LT)","desc":"The integrity of your network relies on high-quality cabling. We provide professional services for all voltage levels, ensuring durable and efficient power transmission.","items":["HT & LT Underground Cable Laying","HT & LT Overhead Cable Laying","Precision HT & LT Cable Jointing"]},"modal-testing":{"title":"Electrical Testing & Safety","desc":"To ensure compliance, safety, and operational integrity, we conduct a range of diagnostic tests on your electrical systems. Key services include:","items":["HIGH-POT (High Potential) Testing","Tan Delta Testing","Comprehensive Transformer Testing","Substation Testing & Health Audits (for new and existing substations)"]},"modal-liasoning":{"title":"Liasoning & Regulatory Consulting","desc":"Navigating the complex regulatory landscape can be challenging. We act as your expert intermediary to secure all necessary approvals, saving you time and ensuring compliance.","items":["Professional Electrical Drawing & Design (Single Line Diagrams - SLD)","Statutory Approvals from PWD (Electrical Inspectorate)","D.G. (Diesel Generator) Set Liasoning, Approvals & Safety Clearances","Utility Liasoning & Coordination (MSEDCL, MSETCL & Torrent Power)","Solar Liasoning and Grid Connectivity Approvals"]},"modal-projects":{"title":"Turnkey Projects & Special Works","desc":"Beyond standard installations, we manage specialized, large-scale electrical projects that require unique expertise and meticulous planning.","items":["Express Feeder Liasoning and Commissioning","High Voltage Overhead Line Shifting","Complete Lift Erection Services"]},"modal-solar":{"title":"Solar Power Solutions","desc":"Embrace sustainable energy with our end-to-end solar solutions. We help you reduce operating costs and meet your environmental goals through renewable energy.","items":["Solar Power System Design & Installation","Regulatory Liasoning for Solar Projects","Grid Connectivity & Commissioning"]},"modal-earthing":{"title":"Earthing Solutions","desc":"A robust earthing system is critical for the safety of your personnel and the protection of your expensive equipment. We provide reliable and long-lasting solutions.","items":["Advanced Chemical Earthing","Traditional Coal Earthing"]}}},"hi":{"logo_subtitle":"शासकीय अधिकृत विद्युत कंत्राटदार","logo_tagline":"<span class=\"tagline-voltage\">हाई वोल्टेज</span> <span class=\"tagline-meets\">मीट्स</span> <span class=\"tagline-intelligence\">हाई इंटेलिजेंस</span>","nav_home":"होम","nav_about":"परिचय","nav_services":"सेवाएं","services_full_overview":"⚡ संपूर्ण सेवा विहंगावलोकन","srv_transformer":"ट्रांसफार्मर प्रबंधन","srv_ht":"एचटी सबस्टेशन","srv_panels":"पैनल सिस्टम","srv_cabling":"केबलिंग कार्य","srv_testing":"परीक्षण व सुरक्षा","srv_liasoning":"लायझनिंग व सल्लागार","srv_projects":"विशेष प्रकल्प","srv_solar":"सौर ऊर्जा","srv_earthing":"अर्थिंग सोल्यूशन्स","nav_industries":"उद्योग क्षेत्र","nav_liaisoning":"लायझनिंग","nav_flagship_project":"१३ MW फीडर","nav_faq":"सामान्य प्रश्न","nav_contact":"संपर्क","hero_tagline":"<span class=\"hv-word\">हाई वोल्टेज</span> <span class=\"connector-word\">मीट्स</span> <span class=\"hi-word\">हाई इंटेलिजेंस</span>","hero_title":"ऊर्जा के भविष्य का सशक्त निर्माण","hero_subtitle":"सभी औद्योगिक और वाणिज्यिक परियोजनाओं के लिए आधिकारिक, विश्वसनीय और अभिनव विद्युत समाधान।","hero_cta":"परामर्श प्राप्त करें","metric_exp":"वर्षों का अनुभव","metric_exp_sub":"भिवंडी में २००३ से स्थापित","metric_substations":"टर्नकी सबस्टेशन","metric_substations_sub":"नवीन एचटी/एलटी प्रकल्प पूर्ण","metric_trans":"सर्विस किए गए ट्रांसफार्मर","metric_trans_sub":"ओवरहाल, बीडीवी टेस्टिंग व ऑइल फिल्टरेशन","metric_amc":"सक्रिय औद्योगिक एएमसी","metric_amc_sub":"व्यापक और निवारक रखरखाव अनुबंध","metric_panels":"निर्मित एचटी/एलटी पैनल","metric_panels_sub":"पीसीसी/एमसीसी और एपीएफसी बैंक","metric_compliance":"वैधानिक अनुपालन","metric_compliance_sub":"पीडब्ल्यूडी, सीईआई और डिस्कॉम मंजूरी","about_title":"प्रगति को गति देने वाली शक्ति","about_p1":"दो दशकों से अधिक समय से, गायत्री इलेक्ट्रिकल्स सिर्फ एक सेवा प्रदाता नहीं, बल्कि उद्योग और वाणिज्य के केंद्र में निरंतर बहने वाली एक विश्वसनीय शक्ति है। हम केवल विद्युत प्रबंधन नहीं करते, बल्कि संभावनाओं को सशक्त बनाते हैं। हमारा आधार निरंतर उत्कृष्टता पर बना है, जो जटिल विद्युत चुनौतियों को मजबूत व सुगम समाधानों में बदलता है।","about_p2":"हमारी अनुभवी टीम दक्षता और आधुनिक तकनीक के साथ काम करती है। शासकीय अधिकृत विद्युत एवं लिफ्ट कंत्राटदार के रूप में, हमारा हर कार्य आधिकारिक प्रमाणन, सुरक्षा और पूर्ण गुणवत्ता से परिपूर्ण है। हम आपातकालीन मरम्मत से लेकर पूर्ण सबस्टेशन निर्माण तक हर परियोजना को एक विश्वसनीय तकनीकी सहयोग के रूप में देखते हैं।","about_p3":"हम मानते हैं कि निरंतर और सुरक्षित बिजली ही औद्योगिक प्रगति की नींव है। इसलिए हम अत्याधुनिक डायग्नोस्टिक्स से लेकर सौर ऊर्जा तक नए तकनीकी समाधानों को लगातार अपना रहे हैं, जिससे आपका उद्योग निरंतर आगे बढ़ता रहे।","footer_desc":"सुरक्षा, दक्षता और आधुनिक विद्युत समाधानों के प्रति दो दशकों से अधिक समय से समर्पित।","footer_quick_links":"त्वरित लिंक्स","footer_contact_us":"संपर्क करें","footer_follow_us":"हमें फॉलो करें","contact_office_addr":"दुकान नं. ७, तिरुपति हाइट्स,<br>सोनाले पाइपलाइन रोड, भादवड,<br>भिवंडी, महाराष्ट्र - ४२१३०२","footer_rights":"© २०२६ गायत्री इलेक्ट्रिकल सर्व्हिसेस. सर्वाधिकार सुरक्षित। | <button id=\"privacy-policy-link\" data-modal-target=\"#modal-privacy\" class=\"footer-link\">गोपनीयता नीति</button> | <button id=\"terms-of-service-link\" data-modal-target=\"#modal-terms\" class=\"footer-link\">सेवा की शर्तें</button>","parallax_title":"अपनी परियोजना को सशक्त बनाने के लिए तैयार हैं?","parallax_sub":"हमारी विशेषज्ञता को अपनी ताकत बनाएं। सर्वश्रेष्ठ के साथ साझेदारी करें।","parallax_cta":"अपनी आवश्यकताएं साझा करें","contact_title":"संपर्क करें","contact_sub":"आइए चर्चा करें कि हम आपकी परियोजना की सफलता को कैसे सशक्त बना सकते हैं। परामर्श के लिए संपर्क करें।","contact_get_in_touch":"सीधा संपर्क करें","contact_send_email":"ईमेल भेजें","contact_give_call":"हमें कॉल करें","contact_office":"हमारा कार्यालय","contact_form_title":"हमें संदेश भेजें","contact_form_name":"आपका नाम","contact_form_email":"आपका ईमेल","contact_form_phone":"आपका मोबाइल नंबर","contact_form_industry":"अपना उद्योग / परियोजना क्षेत्र चुनें","contact_form_msg":"आपका संदेश / परियोजना विवरण","contact_form_btn":"पूछताछ भेजें","whatsapp_tooltip":"व्हाट्सएप पर तुरंत चैट करें","services_section":{"title":"हमारी विशेषज्ञता के मुख्य क्षेत्र","subtitle":"हम औद्योगिक और व्यावसायिक आवश्यकताओं के लिए पूर्ण और सटीक विद्युत समाधानों की एक विस्तृत श्रृंखला प्रदान करते हैं।","cards":[{"title":"ट्रांसफार्मर लाइफसाइकल प्रबंधन","desc":"आपके प्रमुख उपकरणों के लिए पूर्ण एंड-टू-एंड सेवाएं, आपूर्ति और मरम्मत से लेकर नियमित रखरखाव और ऑइल फिल्टरेशन तक।"},{"title":"हाई-वोल्टेज (एचटी) सबस्टेशन","desc":"एमवी और एचवी सबस्टेशन निर्माण, परीक्षण और एआईएस व जीआईएस बे की टर्नकी कमीशनिंग।"},{"title":"औद्योगिक पैनल सिस्टम्स (एचटी, एलटी और एपीएफसी)","desc":"इष्टतम ऊर्जा वितरण और पावर फैक्टर सुधार के लिए कस्टम इलेक्ट्रिकल कंट्रोल पैनलों का निर्माण व इंस्टालेशन।"},{"title":"औद्योगिक केबलिंग कार्य (एचटी और एलटी)","desc":"हाई और लो-टेंशन औद्योगिक अनुप्रयोगों के लिए सटीक केबल बिछाना, टर्मिनेशन और स्ट्रेट थ्रू जॉइंटिंग।"},{"title":"विद्युत परीक्षण और सुरक्षा ऑडिट","desc":"ट्रांसफार्मर परीक्षण, सबस्टेशन स्वास्थ्य ऑडिट और विशेष हाई-पॉट व टैन-डेल्टा डायग्नोस्टिक सेवाएं।"},{"title":"लायझनिंग और विनियामक परामर्श","desc":"पीडब्ल्यूडी (इलेक्ट्रिकल इंस्पेक्टर), एमएसईडीसीएल, एमएसईटीसीएल और टोरेंट पावर के साथ सुगम प्रशासनिक मंजूरी।"},{"title":"टर्नकी प्रोजेक्ट्स और विशेष कार्य","desc":"एक्सप्रेस फीडर निर्माण, ट्रांसमिशन लाइन शिफ्टिंग और मल्टी-मेगावाट औद्योगिक बुनियादी ढांचे का संपूर्ण प्रबंधन।"},{"title":"सौर ऊर्जा समाधान","desc":"आपके परिसर के लिए संपूर्ण रूफटॉप सोलर इंस्टालेशन, नेट मीटरिंग और ग्रिड सिंक्रोनाइझेशन सेवाएं।"},{"title":"अर्थिंग सोल्यूशन्स","desc":"कर्मियों की सुरक्षा और महंगे औद्योगिक उपकरणों के संरक्षण के लिए विश्वसनीय केमिकल और कॉपर अर्थिंग समाधान।"}]},"industries_section":{"title":"उद्योगों और विनिर्माण के लिए भारी विद्युत बुनियादी ढांचा","subtitle":"हम महाराष्ट्र भर के भारी विनिर्माण संयंत्रों के लिए समर्पित ११केवी/२२केवी सबस्टेशन, मुख्य एलटी वितरण स्विचबोर्ड, पीसीसी/एमसीसी पैनल, एपीएफसी बैंक और वैधानिक मंजूरी सहित संपूर्ण बुनियादी ढांचा प्रदान करते हैं।","filters":["सभी क्षेत्र","ग्लास और सामग्री","पैकेजिंग और प्रिंटिंग","कपड़ा और लूम्स","पॉलिमर और रबर","केमिकल और फार्मा","कोल्ड चेन और लॉजिस्टिक्स","हेवी ग्रिड और टर्नकी"],"cards":[{"badge":"टेम्परिंग और भट्टियां","title":"ग्लास और टफन्ड प्रोसेसिंग उद्योग","desc":"हम समर्पित ११केवी/२२केवी एचटी सबस्टेशन, पावर स्टेप-डाउन ट्रांसफार्मर और डिट्यून्ड एपीएफसी हार्मोनिक फिल्टर युक्त मुख्य एलटी वितरण पैनल (पीसीसी) स्थापित करते हैं। प्लांट के मुख्य एलटी वितरण पैनलों और ब्लोअर स्टार्टर बोर्डों तक निर्बाध बिजली पहुंचाई जाती है।","feature_tags":["११केवी/२२केवी एचटी सबस्टेशन निर्माण","पावर ट्रांसफार्मर व पीसीसी पैनल","एपीएफसी हार्मोनिक कैपेसिटर बैंक"],"cta":"ग्लास उद्योग हेतु पूछताछ करें"},{"badge":"भट्टियां और सिरेमिक्स","title":"सिरेमिक्स और ग्लास मोल्डिंग उद्योग","desc":"हम समर्पित एचटी सबस्टेशन स्विचयार्ड, उच्च-क्षमता स्टेप-डाउन ट्रांसफार्मर और मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) तैयार करते हैं। टनल भट्टियों और मुख्य एलटी पैनलों तक एपीएफसी पावर फैक्टर सुधार सहित भारी बिजली पहुंचाई जाती है।","feature_tags":["समर्पित एचटी ट्रांसफार्मर बे","मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी)","टनल भट्टी एपीएफसी पावर फैक्टर नियंत्रण"],"cta":"सिरेमिक्स हेतु पूछताछ करें"},{"badge":"हाई-स्पीड प्रिंटिंग व ट्यूब्स","title":"प्रिंटिंग और फ्लेक्सिबल पैकेजिंग उद्योग","desc":"हम समर्पित ११केवी/२२केवी सबस्टेशन, ट्रांसफार्मर और तेज गति वाले एपीएफसी कैपेसिटर बैंकों से लैस मुख्य एलटी स्विचबोर्ड (पीसीसी) स्थापित करते हैं, जिससे प्रिंटिंग लाइनों को वोल्टेज उतार-चढ़ाव से मुक्त स्वच्छ बिजली मिलती है।","feature_tags":["११केवी/२२केवी सबस्टेशन व ट्रांसफार्मर","मुख्य एलटी वितरण पैनल (पीसीसी)","डिट्यून्ड एपीएफसी हार्मोनिक फिल्टरेशन"],"cta":"प्रिंटिंग व पैकेजिंग हेतु पूछताछ"},{"badge":"पल्पिंग और कोरुगेशन","title":"पेपर मिल्स और कोरुगेटेड बॉक्स निर्माण","desc":"हम समर्पित हेवी-ड्यूटी एचटी ट्रांसफार्मर यार्ड, वीसीबी ब्रेकर और स्वचालित एपीएफसी कैपेसिटर नियंत्रण के साथ प्लांट-व्यापी मुख्य एलटी पैनल (पीसीसी) स्थापित करते हैं, जिससे पल्पर्स और कोरुगेटर ड्राइव्स को निरंतर बिजली मिलती है।","feature_tags":["टर्नकी एचटी सबस्टेशन निर्माण","हेवी-ड्यूटी पीसीसी व एमसीसी एलटी पैनल","मल्टी-स्टेज एपीएफसी कैपेसिटर बैंक"],"cta":"पेपर मिल हेतु पूछताछ करें"},{"badge":"कताई व ऑटोमैटिक लूम्स","title":"वस्त्रोद्योग और ऑटोमैटिक लूम्स","desc":"हम समर्पित ११केवी/२२केवी एचटी सबस्टेशन, वितरण ट्रांसफार्मर और फास्ट-स्विच्ड एपीएफसी कैपेसिटर बैंकों से सुसज्जित मुख्य एलटी पैनल (पीसीसी) स्थापित करते हैं, जिससे हाई-स्पीड एयर-जेट व वॉटर-जेट लूम्स को स्थिर वोल्टेज मिलता है।","feature_tags":["११केवी/२२केवी सबस्टेशन व ट्रांसफार्मर","मुख्य एलटी वितरण स्विचबोर्ड","फास्ट-स्विचिंग एपीएफसी बैंक (>०.९८ पीएफ)"],"cta":"टेक्सटाइल पावर हेतु पूछताछ"},{"badge":"डाइंग व ऑटोक्लेव","title":"धागा प्रसंस्करण और फैब्रिक डाइंग मिल्स","desc":"हम समर्पित आउटडोर एचटी सबस्टेशन, स्टेप-डाउन ट्रांसफार्मर और आईपी५५-रेटेड मुख्य एलटी पावर डिस्ट्रीब्यूशन बोर्ड (पीसीसी/एमसीसी) का निर्माण करते हैं, जिससे नमी-युक्त वातावरण में भी प्लांट को सुरक्षित बिजली मिलती है।","feature_tags":["एचटी ट्रांसफार्मर सबस्टेशन निर्माण","नमी-रोधी पीसीसी/एमसीसी पैनल","उच्च-क्षमता एपीएफसी बैंक व अर्थिंग"],"cta":"डाइंग प्लांट हेतु पूछताछ करें"},{"badge":"पाइप एक्सट्रूज़न लाइन्स","title":"कृषि पाइप और ड्रिप सिंचाई एक्सट्रूज़न","desc":"हम समर्पित ११केवी/२२केवी सबस्टेशन, पावर ट्रांसफार्मर और डिट्यून्ड एपीएफसी बैंकों से लैस मुख्य एलटी वितरण केंद्र (पीसीसी) स्थापित करते हैं, जिससे पीवीसी/एचडीपीई एक्सट्रूज़न बैरल हीटरों को निरंतर स्वच्छ ऊर्जा मिलती है।","feature_tags":["समर्पित ११केवी/२२केवी सबस्टेशन","हेवी पीसीसी मुख्य एलटी वितरण पैनल","एक्सट्रूज़न हार्मोनिक्स हेतु एपीएफसी बैंक"],"cta":"पाइप एक्सट्रूज़न हेतु पूछताछ"},{"badge":"मोल्डिंग व वल्कनाइजेशन","title":"रबर और पॉलिमर विनिर्माण उद्योग","desc":"हम समर्पित एचटी ट्रांसफार्मर सबस्टेशन, स्टेप-डाउन ट्रांसफार्मर और एपीएफसी हार्मोनिक फिल्टर युक्त मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) स्थापित करते हैं, जिससे हाइड्रोलिक प्रेस और मिक्सर्स को भारी लोड पर भी निरंतर पावर मिलती है।","feature_tags":["एचटी सबस्टेशन व ट्रांसफार्मर सेटअप","शॉक-रोधी पीसीसी/एमसीसी स्विचबोर्ड","हेवी-ड्यूटी एपीएफसी कैपेसिटर बैंक"],"cta":"रबर व पॉलिमर हेतु पूछताछ"},{"badge":"फ्लेमप्रूफ / एफएलपी","title":"केमिकल और बल्क ड्रग फार्मा प्लांट्स","desc":"हम समर्पित एचटी सबस्टेशन, ऑइल-कूल्ड ट्रांसफार्मर और प्रमाणित फ्लेमप्रूफ (एफएलपी) मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) का निर्माण करते हैं, जिससे खतरनाक केमिकल रिएक्टरों और ब्लोअर्स को वैधानिक सुरक्षा मानकों के साथ पावर मिलती है।","feature_tags":["११केवी/२२केवी एचटी सबस्टेशन व ट्रांसफार्मर","मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी)","केमिकल अर्थिंग व एपीएफसी बैंक"],"cta":"केमिकल व फार्मा हेतु पूछताछ"},{"badge":"जोन-१ विलायक प्रसंस्करण","title":"पेंट्स, रेजिन और सॉल्वैंट्स फॉर्म्युलेशन","desc":"हम समर्पित ११केवी/२२केवी एचटी सबस्टेशन, स्टेप-डाउन ट्रांसफार्मर और एक्सप्लोशन-प्रूफ एक्स-डी मुख्य एलटी वितरण स्विचबोर्ड (पीसीसी) स्थापित करते हैं, जिससे उच्च-जोखिम वाले पेंट विलायक संयंत्रों को प्रमाणित सुरक्षित बिजली मिलती है।","feature_tags":["समर्पित एचटी सबस्टेशन व ट्रांसफार्मर","मुख्य एलटी वितरण पैनल (पीसीसी)","स्टैटिक अर्थिंग व एपीएफसी नियंत्रण"],"cta":"पेंट्स व सॉल्वैंट्स हेतु पूछताछ"},{"badge":"अमोनिया कंप्रेसर","title":"कोल्ड स्टोरेज और रेफ्रिजरेटेड लॉजिस्टिक्स","desc":"हम समर्पित ११केवी/२२केवी एचटी सबस्टेशन, डुअल-इनकमर स्टेप-डाउन ट्रांसफार्मर, डी.जी. ऑटोमैटिक सिंक्रोनाइझेशन और मुख्य एलटी पावर डिस्ट्रीब्यूशन सेंटर (पीसीसी) स्थापित करते हैं, जिससे अमोनिया कंप्रेसर २४x७ चालू रहते हैं।","feature_tags":["११केवी/२२केवी एचटी सबस्टेशन निर्माण","डुअल-इनकमर मुख्य एलटी पैनल (पीसीसी)","हाई-केवीएआर एपीएफसी कैपेसिटर बैंक"],"cta":"कोल्ड स्टोरेज हेतु पूछताछ करें"},{"badge":"मल्टी-टियर वितरण","title":"वेयरहाउसिंग और लॉजिस्टिक्स पार्क्स","desc":"हम समर्पित एचटी सबस्टेशन, वितरण ट्रांसफार्मर और एपीएफसी बैंकों से सुसज्जित केंद्रीकृत मुख्य एलटी डिस्ट्रीब्यूशन सेंटर (पीसीसी) स्थापित करते हैं, जिससे विशाल वेयरहाउसिंग परिसरों और डॉक लोडिंग फीडरों को संतुलित पावर मिलती है।","feature_tags":["टर्नकी एचटी सबस्टेशन व ट्रांसफार्मर","मुख्य एलटी वितरण पैनल (पीसीसी)","एपीएफसी बैंक व चार्जिंग वितरण"],"cta":"वेयरहाउसिंग हेतु पूछताछ करें"},{"badge":"इंजेक्शन मोल्डिंग","title":"ऑफिस फर्नीचर और प्रिसिजन पॉलिमर पार्ट्स","desc":"हम समर्पित ११केवी/२२केवी सबस्टेशन, स्टेप-डाउन ट्रांसफार्मर और केंद्रीकृत मुख्य एलटी वितरण स्विचबोर्ड (पीसीसी) का निर्माण करते हैं, जिससे इंजेक्शन मोल्डिंग मशीनों और असेंबली लाइनों को बिना रुकावट बिजली मिलती है।","feature_tags":["११केवी/२२केवी एचटी सबस्टेशन निर्माण","मुख्य एलटी वितरण स्विचबोर्ड","हार्मोनिक-फिल्टर्ड एपीएफसी बैंक"],"cta":"फर्नीचर मोल्डिंग हेतु पूछताछ"},{"badge":"अनाज व खाद्य प्रसंस्करण","title":"खाद्य प्रसंस्करण और एग्रो-कमोडिटी मिल्स","desc":"हम समर्पित ११केवी/२२केवी सबस्टेशन, फूड-ग्रेड वितरण ट्रांसफार्मर और डस्ट-टाइट आईपी५५ मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) का निर्माण करते हैं, जिससे रोलर फ्लोर मिल्स और साइलो मोटरों को निरंतर बिजली मिलती है।","feature_tags":["समर्पित एचटी सबस्टेशन बे","मुख्य एलटी वितरण पैनल (पीसीसी)","मल्टी-स्टेज एपीएफसी कैपेसिटर बैंक"],"cta":"एग्रो मिल्स हेतु पूछताछ करें"},{"badge":"क्रशर व इंडक्शन फर्नेस","title":"पत्थर खदानें, क्रशर और स्टील रोलिंग मिल्स","desc":"हम भारी-भरकम ११केवी/२२केवी/३३केवी एचटी सबस्टेशन, उच्च-क्षमता ट्रांसफार्मर और गतिशील एपीएफसी बैंकों से लैस मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) तैयार करते हैं, जो भारी शॉक-लोड को सहन करते हैं।","feature_tags":["११केवी/२२केवी/३३केवी सबस्टेशन","शॉक-रेटेड पीसीसी/एमसीसी स्विचबोर्ड","हेवी-ड्यूटी एपीएफसी कैपेसिटर बैंक"],"cta":"क्रशर व स्टील मिल्स हेतु पूछताछ"},{"badge":"भारी मशीनरी व टावर्स","title":"इंजीनियरिंग फैब्रिकेशन और वाणिज्यिक टावर्स","desc":"हम समर्पित ११केवी/२२केवी सबस्टेशन, स्टेप-डाउन ट्रांसफार्मर, राइजिंग मेन सैंडविच बसडक्ट और मुख्य एलटी डिस्ट्रीब्यूशन स्विचबोर्ड (पीसीसी) स्थापित करते हैं, जिससे वाणिज्यिक टावरों को पूर्ण वैधानिक स्वीकृति के साथ पावर मिलती है।","feature_tags":["११केवी/२२केवी एचटी सबस्टेशन निर्माण","डुअल-इनकमर मुख्य एलटी पैनल (पीसीसी)","एपीएफसी बैंक व पीडब्ल्यूडी मंजूरी"],"cta":"टावर्स व फैब्रिकेशन हेतु पूछताछ"},{"badge":"डाय कास्टिंग व रोबोटिक्स","title":"ऑटोमोटिव कंपोनेंट्स और डाई कास्टिंग उद्योग","desc":"हम समर्पित ११केवी/२२केवी एचटी सबस्टेशन, स्टेप-डाउन ट्रांसफार्मर, शॉक-रेटेड मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) और फास्ट-स्विचिंग एपीएफसी हार्मोनिक फिल्टरेशन बैंक स्थापित करते हैं, जिससे डाई-कास्टिंग मशीनों, रोबोटिक वेल्डिंग और सीएनसी लाइनों को वोल्टेज ड्रॉप के बिना निरंतर बिजली मिलती है।","feature_tags":["११केवी/२२केवी एचटी सबस्टेशन निर्माण","शॉक-रेटेड पीसीसी/एमसीसी व बसडक्ट्स","फास्ट-स्विचिंग एपीएफसी हार्मोनिक बैंक"],"cta":"ऑटो व कास्टिंग हेतु पूछताछ"},{"badge":"टियर-III/IV रिडंडेंसी","title":"डेटा सेंटर्स और एंटरप्राइज सर्वर हब्स","desc":"हम टर्नकी डुअल-सोर्स २२केवी/३३केवी एक्सप्रेस एचटी सबस्टेशन, वैक्यूम सर्किट ब्रेकर, स्टैटिक ट्रांसफर स्विचगियर (एसटीएस) और फॉल्ट-टॉलरेंट मुख्य एलटी स्विचबोर्ड (पीसीसी) स्थापित करते हैं, जो ९९.९९९% पावर विश्वसनीयता सुनिश्चित करते हैं।","feature_tags":["२२केवी/३३केवी डुअल एक्सप्रेस फीडर बे","फॉल्ट-टॉलरेंट पीसीसी/एमसीसी स्विचबोर्ड","सीईआई वैधानिक रिडंडेंसी क्लीयरेंस"],"cta":"डेटा सेंटर हेतु पूछताछ करें"}],"spotlight":{"live_badge":"लाइव चालू प्रोजेक्ट","featured_badge":"प्रमुख मेगा टर्नकी प्रोजेक्ट","dual_badge":"डुअल-सबस्टेशन ईएचवी ग्रिड आपूर्ति","location_badge":"भिवंडी बुनियादी ढांचा","client_label":"क्लाइंट: एपको इंफ्राटेक (राष्ट्रीय अवसंरचना विकासकर्ता)","title":"१३ मेगावाट टर्नकी पावर स्वीकृति और दोहरे <span>६.५ मेगावाट एक्सप्रेस फीडर</span>","desc":"गायत्री इलेक्ट्रिकल सर्विसेज वर्तमान में भिवंडी में राष्ट्रीय अवसंरचना क्षेत्र की अग्रणी कंपनी <strong>एपको इंफ्राटेक</strong> के लिए एक ऐतिहासिक <strong>१३ मेगावाट टर्नकी पावर प्रोजेक्ट</strong> का निष्पादन व वैधानिक मंजूरी कर रही है। दो अलग-अलग ट्रांसमिशन हब—१००केवी सबस्टेशन और २२०केवी ईएचवी ग्रिड सबस्टेशन—से बिजली लेकर हम दो समर्पित <strong>६.५ मेगावाट एक्सप्रेस फीडर लाइनें (कुल १३ मेगावाट क्षमता)</strong> स्थापित कर रहे हैं, जिसमें बे इरेक्शन, वीसीबी ब्रेकर्स, डुअल-इनकमर सिंक्रोनाइझेशन और विद्युत निरीक्षक की वैधानिक कमीशनिंग शामिल है।","m1_lbl":"कुल स्वीकृत भार","m2_lbl":"समर्पित एक्सप्रेस फीडर","m3_lbl":"डुअल ईएचवी ग्रिड सबस्टेशन","m4_lbl":"टोरेंट पावर, महापारेषण और सीईआई मंजूरी","highlights":["एपको इंफ्राटेक एंटरप्राइज बुनियादी ढांचा","दोहरे इनकमर का सिंक्रोनाइझेशन","टोरेंट पावर व महापारेषण ग्रिड लायझनिंग","विद्युत निरीक्षक वैधानिक कमीशनिंग"],"cta":"मेगा टर्नकी प्रोजेक्ट्स पर परामर्श लें"}},"liaisoning_section":{"title":"वैधानिक लायझनिंग और कमीशनिंग स्वीकृतियां","subtitle":"शासकीय अधिकृत विद्युत एवं लिफ्ट कंत्राटदार (२००३ से स्थापित) के रूप में, हम आधिकारिक इंजीनियरिंग लायझनिंग, लोड स्वीकृति, विद्युत निरीक्षक मंजूरी और संपूर्ण कमीशनिंग का निष्पादन करते हैं।","cards":[{"badge":"वितरण लाइसेंसधारी","title":"भिवंडी वितरण सर्कल","subtitle":"टोरेंट पावर लिमिटेड","desc":"टोरेंट पावर के भिवंडी सर्कल में शासकीय अधिकृत एचटी और एलटी विद्युत अनुबंध कार्य। नए औद्योगिक लोड की स्वीकृति, ट्रांसफार्मर परीक्षण, एक्सप्रेस फीडर निर्माण और टोरेंट मानकों के अनुसार संपूर्ण कार्य।","features":["भिवंडी सर्कल में शासकीय अधिकृत एचटी व एलटी कंत्राटदार","त्वरित एचटी/एलटी लोड स्वीकृति व डिमांड वृद्धि","सबस्टेशन निर्माण, ट्रांसफार्मर मेंटेनेंस व चार्जिंग क्लीयरेंस"]},{"badge":"ईएचवी ट्रांसमिशन","title":"राज्य ट्रांसमिशन ग्रिड","subtitle":"एमएसईटीसीएल (महापारेषण)","desc":"१००केवी और २२०केवी ट्रांसमिशन ग्रिड से उच्च-क्षमता औद्योगिक बिजली निकासी हेतु टर्नकी निष्पादन और लायझनिंग। एपको इंफ्राटेक की १३ मेगावाट परियोजना की तरह दोहरे ईएचवी सबस्टेशनों से आपूर्ति और बे एक्सटेंशन मंजूरी।","features":["१००केवी व २२०केवी ईएचवी ग्रिड कनेक्टिविटी व फीडर सिंक","ईएचवी ट्रांसमिशन लाइन शिफ्टिंग व बे एक्सटेंशन मंजूरी","राइट-ऑफ-वे (आरओडब्ल्यू) अनुपालन व ग्रिड निकासी क्लीयरेंस"]},{"badge":"वैधानिक सुरक्षा","title":"मुख्य विद्युत निरीक्षणालय","subtitle":"विद्युत निरीक्षक (महाराष्ट्र शासन)","desc":"केंद्रीय विद्युत प्राधिकरण (सीईए) सुरक्षा विनियमों के तहत निरीक्षण मंजूरी। ड्राइंग जांच, फॉर्म ए/बी सबमिशन, एचटी चार्जिंग अनुमति, डी.जी. सेट स्वीकृति और अर्थिंग रेजिस्टेंस अनुपालन का संपूर्ण समन्वय।","features":["प्रारंभिक व आवधिक क्लीयरेंस हेतु फॉर्म ए और बी सबमिशन","हाई-टेंशन (११केवी/२२केवी/३३केवी) चार्जिंग अनुमति व सुरक्षा मंजूरी","डी.जी. सेट वैधानिक स्वीकृति व अर्थिंग ग्रिड अनुपालन"]},{"badge":"विद्युत वितरण","title":"राज्य वितरण लाइसेंसधारी","subtitle":"एमएसईडीसीएल (महावितरण)","desc":"वाडा, कुडूस, ठाणे और पालघर औद्योगिक क्षेत्रों में औद्योगिक उपभोक्ताओं के लिए संपूर्ण इंजीनियरिंग लायझनिंग और विद्युत अनुबंध कार्य। नए एचटी/एलटी औद्योगिक कनेक्शन, कॉन्ट्रैक्ट डिमांड वृद्धि व युक्तिकरण, समर्पित औद्योगिक फीडर और टीओडी मीटरिंग व्यवस्था।","features":["वाडा व कुडूस औद्योगिक क्षेत्रों में नए एचटी/एलटी औद्योगिक कनेक्शन","कॉन्ट्रैक्ट डिमांड स्वीकृति, विस्तार व युक्तिकरण","समर्पित औद्योगिक फीडर व टीओडी टैरिफ मीटरिंग व्यवस्था"]},{"badge":"दुर्घटना व ऊंची इमारतें","title":"विद्युत निरीक्षणालय व पीडब्ल्यूडी","subtitle":"दुर्घटना क्लीयरेंस व हाई-राइज अनुमतियां","desc":"औद्योगिक आपातकालीन बिजली बहाली और ऊंची इमारतों के विद्युत अनुपालन हेतु विशेष वैधानिक लायझनिंग। कारखाने में आग या शॉर्ट सर्किट की घटना के बाद विद्युत निरीक्षक की जांच और पुनः चार्जिंग सुरक्षा मंजूरी। ऊंची व्यावसायिक इमारतों के लिए संपूर्ण पीडब्ल्यूडी विद्युत अनुमतियां।","features":["औद्योगिक आग के बाद आपातकालीन फोरेंसिक निरीक्षण","केबल हाई-पॉट, इंसुलेशन रेजिस्टेंस व स्विचगियर हेल्थ ऑडिट","विद्युत निरीक्षणालय एनओसी व त्वरित बिजली बहाली"]},{"badge":"अधिकृत लिफ्ट कंत्राटदार","title":"लिफ्ट व एस्केलेटर सुरक्षा प्राधिकरण","subtitle":"लिफ्ट निरीक्षणालय (ऊर्जा विभाग, महाराष्ट्र शासन)","desc":"शासकीय अधिकृत लिफ्ट कंत्राटदार के रूप में बॉम्बे लिफ्ट्स एक्ट और महाराष्ट्र लिफ्ट नियमों के तहत यात्री व मालवाहक लिफ्ट की स्थापना, आधुनिकीकरण और वार्षिक सुरक्षा प्रमाणन नवीनीकरण।","features":["बॉम्बे लिफ्ट्स एक्ट के तहत शासकीय अधिकृत लिफ्ट कंत्राटदार","यात्री व भारी मालवाहक लिफ्ट स्थापना व आधुनिकीकरण","वैधानिक वार्षिक लिफ्ट निरीक्षण व सुरक्षा प्रमाणन"]}]},"faq_section":{"title":"अक्सर पूछे जाने वाले प्रश्न (FAQ)","subtitle":"वैधानिक स्वीकृतियां, डी.जी. सेट क्लीयरेंस, पावर यूटिलिटी लायझनिंग और आपातकालीन विद्युत सेवाओं से संबंधित महत्वपूर्ण जानकारी।","items":[{"q":"एचटी प्रतिष्ठानों और डी.जी. सेटों के लिए विद्युत निरीक्षक (पीडब्ल्यूडी) से कौन-सी वैधानिक स्वीकृतियां आवश्यक हैं?","a":"<p>केंद्रीय विद्युत प्राधिकरण (सीईए) सुरक्षा विनियमों के नियम ४३ और विद्युत अधिनियम की धारा ५४ के तहत, हाई-टेंशन (११केवी, २२केवी, ३३केवी) पर संचालित किसी भी विद्युत स्थापना तथा वैधानिक क्षमता से अधिक के डीजल जनरेटर (डी.जी.) सेटों को चालू करने से पहले विद्युत निरीक्षणालय (पीडब्ल्यूडी) द्वारा औपचारिक ड्राइंग जांच, अर्थ पिट रेजिस्टेंस टेस्टिंग, इंटरलॉक सत्यापन और साइट पर भौतिक निरीक्षण अनिवार्य है। गायत्री इलेक्ट्रिकल सर्विसेज संपूर्ण लायझनिंग का प्रबंधन करती है, फॉर्म ए / फॉर्म बी जमा करती है और आधिकारिक चार्जिंग अनुमति प्राप्त करती है।</p>"},{"q":"आप टोरेंट पावर और महावितरण आपूर्ति क्षेत्रों के तहत कौन-सी एचटी और एलटी विद्युत अनुबंध सेवाएं प्रदान करते हैं?","a":"<p>एक लाइसेंस प्राप्त शासकीय अधिकृत विद्युत कंत्राटदार के रूप में, हम टोरेंट पावर (भिवंडी सर्कल) और एमएसईडीसीएल (महावितरण) में टर्नकी एचटी और एलटी अनुबंध कार्य निष्पादित करते हैं। हमारे दायरे में नए एचटी/एलटी औद्योगिक कनेक्शन, कॉन्ट्रैक्ट डिमांड वृद्धि व कमी, समर्पित ओवरहेड व अंडरग्राउंड एचटी केबल बिछाना, ट्रांसफार्मर व सबस्टेशन निर्माण, एक्सप्रेस फीडर कमीशनिंग, और सीटी/पीटी मीटरिंग क्यूबिकल टेस्टिंग व चार्जिंग स्वीकृतियां शामिल हैं।</p>"},{"q":"आप किन विनिर्माण और प्रक्रिया उद्योगों को विद्युत बुनियादी ढांचा प्रदान करते हैं?","a":"<p>हम ग्लास व टफन्ड प्रोसेसिंग, प्रिंटिंग व पैकेजिंग, कृषि पाइप एक्सट्रूज़न, रबर व मोल्डिंग, ऑफिस फर्नीचर, केमिकल व फार्मा प्लांट्स, कोल्ड स्टोरेज, वेयरहाउसिंग, टेक्सटाइल ऑटोमैटिक लूम्स, स्टोन क्रशर और स्टील रोलिंग मिलों को विशेष एचटी/एलटी पावर इंफ्रास्ट्रक्चर और लायझनिंग सेवाएं प्रदान करते हैं।</p>"},{"q":"महाराष्ट्र में शासकीय अधिकृत विद्युत कंत्राटदार (Govt. Authorized Contractor) को नियुक्त करना क्यों अनिवार्य है?","a":"<p>भारतीय विद्युत नियमों के तहत, केवल महाराष्ट्र राज्य सरकार लाइसेंसिंग बोर्ड (उद्योग, ऊर्जा एवं श्रम विभाग) द्वारा अधिकृत लाइसेंस प्राप्त विद्युत कंत्राटदारों को ही एचटी/एलटी प्रतिष्ठानों, सबस्टेशनों और यात्री/मालवाहक लिफ्टों के निर्माण, परीक्षण और प्रमाणन की कानूनी अनुमति है। अधिकृत कंत्राटदार से काम कराने पर पूर्ण वैधानिक अनुपालन, बीमा वैधता और बिजली कंपनियों द्वारा टेस्ट रिपोर्ट की आधिकारिक स्वीकृति सुनिश्चित होती है।</p>"},{"q":"विद्युत निरीक्षक (पीडब्ल्यूडी) से डी.जी. सेट (डीजल जनरेटर) स्वीकृति प्राप्त करने की क्या प्रक्रिया है?","a":"<p>वैधानिक डी.जी. सेट स्वीकृति प्राप्त करने के लिए चेंजओवर स्विचगियर दर्शाने वाला सिंगल लाइन डायग्राम (एसएलडी), यूटिलिटी बैक-फीडिंग रोकने हेतु मैकेनिकल/इलेक्ट्रिकल इंटरलॉक सत्यापन, समर्पित न्यूट्रल और बॉडी अर्थिंग पिट्स की माप, ध्वनिरोधी कैनोपी शोर अनुपालन और विद्युत निरीक्षक (पीडब्ल्यूडी) द्वारा साइट पर प्रत्यक्ष निरीक्षण आवश्यक है। हम सभी इंजीनियरिंग ड्राइंग तैयार करते हैं, वैधानिक फॉर्म ए और फॉर्म बी जमा करते हैं और अंतिम चार्जिंग अनुमति प्राप्त करते हैं।</p>"},{"q":"क्या आप ऊंची इमारतों (High-Rise Towers) के विद्युत क्लीयरेंस और सबस्टेशन अनुमतियों का काम संभालते हैं?","a":"<p>हाँ। व्यावसायिक और आवासीय ऊंची इमारतों के लिए मुख्य विद्युत निरीक्षणालय (महाराष्ट्र शासन) से विशेष वैधानिक जांच की आवश्यकता होती है। हम राइजिंग मेन बसडक्ट डिजाइन, डी.जी. सेट इमरजेंसी चेंजओवर, लाइफ-सेफ्टी पंप पैनल, दोहरे बिजली स्रोत इंटरलॉक और ट्रांसफार्मर सबस्टेशन का संपूर्ण निर्माण करते हैं, और पीडब्ल्यूडी ड्राइंग अनुमोदन, साइट परीक्षण और आधिकारिक अंतिम चार्जिंग अनुमति प्राप्त करते हैं।</p>"},{"q":"कारखाने में आग या शॉर्ट सर्किट की घटना के बाद आप विद्युत निरीक्षक जांच क्लीयरेंस कैसे संभालते हैं?","a":"<p>औद्योगिक आग या शॉर्ट सर्किट के बाद, बिजली वितरण कंपनियां विद्युत निरीक्षक (महाराष्ट्र शासन) की वैधानिक अनुमति के बिना बिजली बहाल नहीं कर सकतीं। हमारे वरिष्ठ इंजीनियर आपातकालीन फोरेंसिक क्षति मूल्यांकन करते हैं, केबल और स्विचगियर पर हाई-पॉट और मेगर इंसुलेशन रेजिस्टेंस परीक्षण करते हैं, सुधारात्मक एसएलडी बनाते हैं, क्षतिग्रस्त वितरण बोर्डों की मरम्मत करते हैं और आधिकारिक निरीक्षण क्लीयरेंस तथा त्वरित बिजली बहाली के लिए सीधे विद्युत निरीक्षणालय के साथ समन्वय करते हैं।</p>"},{"q":"क्या आप औद्योगिक संयंत्रों के लिए आपातकालीन ट्रांसफार्मर रेंटल (किराए पर) सेवाएं प्रदान करते हैं?","a":"<p>हाँ। हम भिवंडी, वाडा, कुडूस, ठाणे और नवी मुंबई में १०० केवीए से २०००+ केवीए तक आपातकालीन औद्योगिक ट्रांसफार्मर किराए पर उपलब्ध कराते हैं। यदि आपके कारखाने का मुख्य ट्रांसफार्मर अचानक खराब हो जाता है, तो हमारी मोबाइल आपातकालीन टीम तुरंत साइट पर ट्रांसफार्मर पहुंचाकर, स्थापित और परीक्षण करके बिजली चालू करती है ताकि उत्पादन न रुके।</p>"},{"q":"आप कौन-से ट्रांसफार्मर परीक्षण और ऑन-साइट वैक्यूम ऑइल फिल्टरेशन सेवाएं प्रदान करते हैं?","a":"<p>हम बीडीवी डाइइलेक्ट्रिक ऑइल स्ट्रेंथ टेस्ट, इंसुलेशन रेजिस्टेंस (मेगर), वाइंडिंग रेजिस्टेंस, टर्न्स रेश्यो, मैग्नेटिक बैलेंस और टैन डेल्टा टेस्ट करते हैं। हमारी मोबाइल हाई-वैक्यूम ऑइल फिल्टरेशन यूनिट्स सीधे आपकी साइट पर ट्रांसफार्मर ऑइल का हीटिंग, डीगैसिंग और डिहाइड्रेशन करके तेल की ताकत ६०केवी से अधिक बहाल करती हैं।</p>"},{"q":"आप कौन-सी एचटी सबस्टेशन टेस्टिंग और स्विचगियर मेंटेनेंस सेवाएं करते हैं?","a":"<p>हमारे लाइसेंस प्राप्त टेस्टिंग इंजीनियर वैक्यूम सर्किट ब्रेकर (वीसीबी) व एसएफ६ ब्रेकर टाइमिंग टेस्ट, न्यूमेरिकल प्रोटेक्शन रिले कैलिब्रेशन, सीटी/पीटी रेश्यो वेरिफिकेशन, एचटी केबल डीसी हाई-पॉट टेस्ट और अर्थ मेगर द्वारा न्यूट्रल व बॉडी अर्थिंग ग्रिड का संपूर्ण परीक्षण करते हैं।</p>"},{"q":"क्या आप सबस्टेशन, ट्रांसफार्मर और पैनलों के लिए वार्षिक रखरखाव अनुबंध (एएमसी) प्रदान करते हैं?","a":"<p>हाँ। हम भिवंडी, कुडूस, वाडा, ठाणे और मुंबई में उद्योगों के लिए <strong>व्यापक और गैर-व्यापक वार्षिक रखरखाव अनुबंध (एएमसी)</strong> प्रदान करते हैं। इसमें एचटी स्विचयार्ड सर्विसिंग, नियमित ऑइल फिल्टरेशन, एपीएफसी पैनल कैलिब्रेशन (पीएफ >०.९८ बनाए रखना), रिले टेस्टिंग और २४x७ आपातकालीन ब्रेकडाउन प्राथमिकता शामिल है।</p>"},{"q":"क्या आप बड़े पैमाने के टर्नकी एक्सप्रेस फीडर और मल्टी-मेगावाट प्रोजेक्ट्स (जैसे १३ मेगावाट) निष्पादित कर सकते हैं?","a":"<p>हाँ। हमारा प्रमुख प्रमाण भिवंडी में <strong>एपको इंफ्राटेक का १३ मेगावाट टर्नकी प्रोजेक्ट</strong> है, जिसमें १००केवी और २२०केवी ईएचवी ग्रिड सबस्टेशनों से दोहरे ६.५ मेगावाट एक्सप्रेस फीडर स्थापित किए जा रहे हैं। हम आरओडब्ल्यू, टावर लाइन निर्माण, वीसीबी ब्रेकर्स, सिंक्रोनाइझेशन और सरकारी कमीशनिंग का संपूर्ण प्रबंधन करते हैं।</p>"},{"q":"आप विनिर्माण संयंत्रों को लो पावर फैक्टर (पीएफ) पेनल्टी से बचने में कैसे मदद करते हैं?","a":"<p>०.९० से कम पावर फैक्टर होने पर भारी जुर्माना लगता है, जबकि ०.९५ से अधिक होने पर महावितरण व टोरेंट पावर से प्रोत्साहन मिलता है। हम वीएफडी और मोटरों के हार्मोनिक्स को खत्म करने के लिए डिट्यून्ड फिल्टर युक्त स्वचालित एपीएफसी कैपेसिटर बैंक स्थापित व कैलिब्रेट करते हैं, जिससे पीएफ हमेशा ०.९९+ बना रहता है।</p>"},{"q":"क्या आप आपातकालीन ब्रेकडाउन सहायता और ऑन-साइट ऑइल फिल्टरेशन प्रदान करते हैं?","a":"<p>हाँ। हम भिवंडी, कुडूस, वाडा, ठाणे और नवी मुंबई में त्वरित आपातकालीन ब्रेकडाउन सहायता प्रदान करते हैं। हमारी मोबाइल टीम साइट पर ट्रांसफार्मर डायग्नोस्टिक्स, ऑइल फिल्टरेशन, सिलिका जेल रिप्लेसमेंट, ओएलटीसी सर्विसिंग और हाई-वोल्टेज केबल फॉल्ट ट्रेसिंग व जॉइंटिंग करती है।</p>"},{"q":"आप महाराष्ट्र के किन औद्योगिक क्षेत्रों में सेवाएं प्रदान करते हैं?","a":"<p>हम भिवंडी (सोनाले, वाल, मानकोली, पडघा, भादवड), कुडूस और वाडा के प्रमुख औद्योगिक गलियारों, ठाणे, कल्याण, डोंबिवली, अंबरनाथ, बदलापुर, शहापुर, नवी मुंबई और संपूर्ण एमएमआर क्षेत्र में अपनी सेवाएं प्रदान करते हैं।</p>"},{"q":"क्या आप औद्योगिक रूफटॉप सोलर प्लांट्स के लिए सोलर नेट-मीटरिंग स्वीकृतियां और सीईआई लायझनिंग करते हैं?","a":"<p>हाँ। गायत्री इलेक्ट्रिकल सर्विसेज भिवंडी, वाडा, कुडूस, ठाणे और महाराष्ट्र भर में औद्योगिक एवं वाणिज्यिक सोलर परियोजनाओं के लिए <strong>टर्नकी सोलर लायझनिंग, नेट-मीटरिंग स्वीकृतियां और मुख्य विद्युत निरीक्षणालय (सीईआई / पीडब्ल्यूडी) वैधानिक चार्जिंग क्लीयरेंस</strong> में विशेषज्ञ है। हम टोरेंट पावर और महावितरण के साथ ग्रिड कनेक्टिविटी आवेदन, ड्राइंग जांच, इनवर्टर अर्थिंग अनुपालन, और द्विदिशी (बाय-डायरेक्शनल) नेट मीटर स्थापना की संपूर्ण प्रक्रिया पूरी करते हैं।</p>"},{"q":"आपकी वाणिज्यिक (कमर्शियल) शर्तें, मूल्य निर्धारण और भुगतान के तरीके क्या हैं?","a":"<p>गायत्री इलेक्ट्रिकल सर्विसेज एक शासकीय जीएसटी-पंजीकृत इंजीनियरिंग फर्म है। हमारी परियोजना लागत इंजीनियरिंग बिल ऑफ क्वांटिटीज (BOQ) के आधार पर पारदर्शी और प्रतिस्पर्धी होती है। सभी व्यावसायिक अनुबंध, माइलस्टोन भुगतान और एएमसी शुल्क आधिकारिक जीएसटी टैक्स इनवॉइस के विरुद्ध संस्थागत इलेक्ट्रॉनिक बैंकिंग चैनलों के माध्यम से स्वीकार किए जाते हैं: बैंक ट्रांसफर (RTGS / NEFT / IMPS), अकाउंट पेयी चेक, अथवा अधिकृत कॉर्पोरेट यूपीआई। इससे १००% वित्तीय व ऑडिटिंग पारदर्शिता सुनिश्चित होती है और कॉर्पोरेट ग्राहकों को पूर्ण जीएसटी इनपुट टैक्स क्रेडिट (ITC) का लाभ मिलता है।</p>"}]},"service_modals":{"modal-transformer":{"title":"ट्रांसफार्मर लाइफसाइकिल प्रबंधन","desc":"आपकी सबसे महत्वपूर्ण विद्युत संपत्तियों के लिए आपूर्ति, मरम्मत और निरंतर रखरखाव तक संपूर्ण एंड-टू-एंड सेवाएं।","items":["ट्रांसफार्मर आपूर्ति (नए और रेंटल/सर्विस यूनिट्स)","व्यापक मरम्मत और ओवरहालिंग","निवारक रखरखाव कार्यक्रम (AMC)","उन्नत हाई-वैक्यूम ऑइल फिल्टरेशन और डिहाइड्रेशन","डायग्नोस्टिक ट्रांसफार्मर परीक्षण (BDV, मेगर, टैन डेल्टा)"]},"modal-ht":{"title":"हाई-टेंशन (HT) सबस्टेशन","desc":"हम औद्योगिक विद्युत वितरण के मुख्य आधार—हाई-टेंशन इन्फ्रास्ट्रक्चर के डिजाइन और निष्पादन में विशेषज्ञ हैं:","items":["आउटडोर और इनडोर एचटी सब-स्टेशन निर्माण","व्यापक एचटी सब-स्टेशन परीक्षण और ऑडिट","एयर इंसुलेटेड (AIS) बे स्थापना और कमीशनिंग","गैस इंसुलेटेड (GIS) बे स्थापना और कमीशनिंग"]},"modal-panels":{"title":"पैनल सिस्टम (HT, LT और APFC)","desc":"हम आपके उद्योग के संचालन को नियंत्रित और सुरक्षित रखने वाले सभी प्रकार के विद्युत पैनलों की आपूर्ति, स्थापना और रखरखाव करते हैं:","items":["एचटी (HT) पैनल आपूर्ति, स्थापना और रखरखाव","एलटी (PCC/MCC) पैनल आपूर्ति, स्थापना और रखरखाव","ऑटोमैटिक पावर फैक्टर करेक्शन (APFC) पैनल आपूर्ति और रखरखाव"]},"modal-cabling":{"title":"केबलिंग कार्य (HT और LT)","desc":"आपके विद्युत नेटवर्क की मजबूती उच्च-गुणवत्ता वाली केबलिंग पर निर्भर करती है। हम सभी वोल्टेज स्तरों के लिए टिकाऊ केबलिंग सेवाएं प्रदान करते हैं:","items":["एचटी और एलटी भूमिगत (Underground) केबल बिछाना","एचटी और एलटी ओवरहेड केबल कार्य","सटीक एचटी और एलटी केबल जॉइंटिंग और टर्मिनेशन"]},"modal-testing":{"title":"विद्युत परीक्षण और सुरक्षा","desc":"वैधानिक अनुपालन, सुरक्षा और परिचालन अखंडता सुनिश्चित करने के लिए हम आपके विद्युत सिस्टम पर व्यापक डायग्नोस्टिक परीक्षण करते हैं:","items":["हाई-पॉट (HIGH-POT) परीक्षण","टैन डेल्टा (Tan Delta) परीक्षण","व्यापक ट्रांसफार्मर डायग्नोस्टिक परीक्षण","सबस्टेशन परीक्षण और सुरक्षा ऑडिट (नए और मौजूदा सबस्टेशनों के लिए)"]},"modal-liasoning":{"title":"लायझनिंग और नियामक परामर्श","desc":"हम सभी आवश्यक सरकारी और बिजली कंपनी स्वीकृतियां दिलाने के लिए आपके विशेषज्ञ प्रतिनिधि के रूप में कार्य करते हैं:","items":["पेशेवर इलेक्ट्रिकल ड्राइंग और डिजाइन (सिंगल लाइन डायग्राम - SLD)","पीडब्ल्यूडी (विद्युत निरीक्षणालय / CEI) से वैधानिक स्वीकृतियां","डी.जी. (डीजल जनरेटर) सेट लायझनिंग, स्वीकृतियां और सुरक्षा क्लीयरेंस","पावर यूटिलिटी लायझनिंग (MSEDCL, MSETCL और Torrent Power)","सोलर लायझनिंग और नेट-मीटरिंग ग्रिड कनेक्टिविटी स्वीकृतियां"]},"modal-projects":{"title":"टर्नकी प्रोजेक्ट्स और विशेष कार्य","desc":"मानक इंस्टॉलेशन से आगे बढ़कर, हम विशेष और बड़े पैमाने की विद्युत परियोजनाओं का संपूर्ण प्रबंधन करते हैं:","items":["एक्सप्रेस फीडर लायझनिंग और कमीशनिंग","हाई-वोल्टेज ओवरहेड लाइन शिफ्टिंग","संपूर्ण लिफ्ट इरेक्शन और लाइसेंसिंग सेवाएं"]},"modal-solar":{"title":"सौर ऊर्जा समाधान (Solar Power)","desc":"हमारे एंड-टू-एंड सोलर समाधानों के साथ स्वच्छ ऊर्जा अपनाएं और अपने परिचालन बिजली खर्च को कम करें:","items":["सोलर पावर सिस्टम डिजाइन और इंस्टॉलेशन","सोलर परियोजनाओं के लिए सीईआई और डिस्कॉम नियामक लायझनिंग","नेट-मीटरिंग ग्रिड कनेक्टिविटी और कमीशनिंग"]},"modal-earthing":{"title":"अर्थिंग समाधान (Earthing Solutions)","desc":"आपके कर्मचारियों की सुरक्षा और महंगे उपकरणों के बचाव के लिए एक मजबूत अर्थिंग सिस्टम अत्यंत आवश्यक है:","items":["उन्नत मेंटेनेंस-फ्री केमिकल अर्थिंग","पारंपरिक कोयला और नमक अर्थिंग"]}}},"mr":{"logo_subtitle":"शासकीय अधिकृत विद्युत कंत्राटदार","logo_tagline":"<span class=\"tagline-voltage\">हाय व्होल्टेज</span> <span class=\"tagline-meets\">मीट्स</span> <span class=\"tagline-intelligence\">हाय इंटेलिजन्स</span>","nav_home":"मुख्यपृष्ठ","nav_about":"आमच्याबद्दल","nav_services":"सेवा","services_full_overview":"⚡ संपूर्ण सेवा विहंगावलोकन","srv_transformer":"ट्रान्सफॉर्मर व्यवस्थापन","srv_ht":"एचटी सबस्टेशन","srv_panels":"पॅनेल सिस्टीम्स","srv_cabling":"केबलिंग कामे","srv_testing":"चाचणी व सुरक्षा","srv_liasoning":"लायझनिंग व सल्लागार","srv_projects":"विशेष प्रकल्प","srv_solar":"सौर ऊर्जा","srv_earthing":"अर्थिंग सोल्यूशन्स","nav_industries":"उद्योग क्षेत्रे","nav_liaisoning":"लायझनिंग","nav_flagship_project":"१३ MW फिडर","nav_faq":"नेहमीचे प्रश्न","nav_contact":"संपर्क","hero_tagline":"<span class=\"hv-word\">हाय व्होल्टेज</span> <span class=\"connector-word\">मीट्स</span> <span class=\"hi-word\">हाय इंटेलिजन्स</span>","hero_title":"ऊर्जेच्या भविष्याची सक्षम उभारणी","hero_subtitle":"सर्व प्रकारच्या औद्योगिक आणि व्यावसायिक प्रकल्पांसाठी अधिकृत, विश्वासार्ह आणि प्रगत विद्युत अभियांत्रिकी उपाय.","hero_cta":"तज्ज्ञ सल्ला मिळवा","metric_exp":"वर्षांचा प्रदीर्घ अनुभव","metric_exp_sub":"भिवंडीत २००३ पासून अविरत कार्यरत","metric_substations":"टर्नकी सबस्टेशन्स","metric_substations_sub":"नवीन एचटी/एलटी प्रकल्प पूर्ण","metric_trans":"सर्व्हिस केलेले ट्रान्सफॉर्मर्स","metric_trans_sub":"ओव्हरहॉल, बीडीव्ही टेस्टिंग व ऑइल फिल्टरेशन","metric_amc":"सक्रिय औद्योगिक एएमसी","metric_amc_sub":"सर्वसमावेशक व प्रतिबंधात्मक देखभाल करार","metric_panels":"तयार केलेले एचटी/एलटी पॅनेल्स","metric_panels_sub":"पीसीसी/एमसीसी व एपीएफसी बँक्स","metric_compliance":"शासकीय नियमांचे १००% पालन","metric_compliance_sub":"पीडब्ल्यूडी, सीईआय व महावितरण परवानग्या","about_title":"प्रगतीची ऊर्जा, अखंड विश्वास","about_p1":"गेल्या दोन दशकांपासून अधिक काळ, गायत्री इलेक्ट्रिकल्स केवळ एक सेवा प्रदाता नसून, उद्योग आणि व्यापाराच्या विकासाचा एक मजबूत आधारस्तंभ आहे. आम्ही केवळ ऊर्जेचे व्यवस्थापन करत नाही, तर आपल्या उद्योगाच्या क्षमतांना नवी दिशा देतो. जटिल विद्युत आव्हानांवर मात करून सुरक्षित, अखंडित आणि दर्जेदार उपाय पुरवणे हेच आमचे ध्येय आहे.","about_p2":"आमची तज्ज्ञ अभियंत्यांची टीम प्रदीर्घ अनुभव आणि आधुनिक तंत्रज्ञानाच्या आधारे काम करते. महाराष्ट्र शासनाचे अधिकृत विद्युत कंत्राटदार आणि लिफ्ट कंत्राटदार म्हणून आमचे प्रत्येक काम अधिकृत परवाने, सुरक्षा मानके आणि गुणवत्तेने परिपूर्ण असते. आपत्कालीन ब्रेकडाउन दुरुस्तीपासून ते महाकाय सबस्टेशन उभारणीपर्यंत आम्ही प्रत्येक कामात विश्वासार्ह तांत्रिक सहकारी म्हणून उभे राहतो.","about_p3":"आमचा ठाम विश्वास आहे की अखंड आणि सुरक्षित वीज हाच औद्योगिक प्रगतीचा खरा पाया आहे. म्हणूनच प्रगत चाचणी पद्धतींपासून सौर ऊर्जेपर्यंत सर्व अत्याधुनिक तंत्रज्ञान आम्ही आत्मसात केले आहे, जेणेकरून आपले उद्योग अखंड कार्यरत राहतील.","footer_desc":"सुरक्षा, कार्यक्षमता आणि प्रगत विद्युत उपायांसाठी दोन दशकांहून अधिक काळ कटिबद्ध.","footer_quick_links":"महत्त्वाच्या लिंक्स","footer_contact_us":"संपर्क साधा","footer_follow_us":"आम्हाला फॉलो करा","contact_office_addr":"दुकान क्र. ७, तिरुपती हाइट्स,<br>सोनाले पाईपलाईन रोड, भादवड,<br>भिवंडी, महाराष्ट्र - ४२१३०२","footer_rights":"© २०२६ गायत्री इलेक्ट्रिकल सर्व्हिसेस. सर्व हक्क राखीव. | <button id=\"privacy-policy-link\" data-modal-target=\"#modal-privacy\" class=\"footer-link\">गोपनीयता धोरण</button> | <button id=\"terms-of-service-link\" data-modal-target=\"#modal-terms\" class=\"footer-link\">सेवेच्या अटी</button>","parallax_title":"आपल्या प्रकल्पाला अखंड ऊर्जा देण्यासाठी सज्ज आहात?","parallax_sub":"आमचा प्रदीर्घ अनुभव आणि कौशल्य आपल्या सोबत आहे. सर्वोत्तम सेवांसाठी संपर्क साधा.","parallax_cta":"आमच्याशी चर्चा करा","contact_title":"संपर्क साधा","contact_sub":"आपल्या प्रकल्पाच्या यशासाठी आम्ही कसे सहाय्य करू शकतो यावर चर्चा करूया. तज्ज्ञ सल्ल्यासाठी संपर्क साधा.","contact_get_in_touch":"थेट संपर्क साधा","contact_send_email":"ईमेल पाठवा","contact_give_call":"आम्हाला कॉल करा","contact_office":"आमचे कार्यालय","contact_form_title":"आम्हाला संदेश पाठवा","contact_form_name":"आपले नाव","contact_form_email":"आपला ईमेल","contact_form_phone":"आपला मोबाईल नंबर","contact_form_industry":"आपले उद्योग / प्रकल्प क्षेत्र निवडा","contact_form_msg":"आपला संदेश / प्रकल्पाची माहिती","contact_form_btn":"चौकशी पाठवा","whatsapp_tooltip":"व्हॉट्सॲपवर त्वरित चॅट करा","services_section":{"title":"आमच्या सेवा आणि कार्यक्षेत्र","subtitle":"आम्ही औद्योगिक आणि व्यावसायिक गरजांसाठी अचूक, सुरक्षित आणि प्रमाणित विद्युत अभियांत्रिकी सेवांची संपूर्ण मालिका पुरवतो.","cards":[{"title":"ट्रान्सफॉर्मर लाइफसायकल व्यवस्थापन","desc":"ट्रान्सफॉर्मरची खरेदी, जागेवर दुरुस्ती, ऑइल फिल्टरेशन आणि नियमित मेंटेनन्ससाठी सर्वसमावेशक सेवा."},{"title":"हाय-व्होल्टेज (एचटी) सबस्टेशन्स","desc":"एमव्ही आणि एचव्ही सबस्टेशन उभारणी, चाचणी आणि एआयएस व जीआयएस बे ची टर्नकी कमिशनिंग."},{"title":"औद्योगिक पॅनेल सिस्टीम्स (एचटी, एलटी व एपीएफसी)","desc":"योग्य वीज वितरण आणि पॉवर फॅक्टर सुधारण्यासाठी दर्जेदार पीसीसी, एमसीसी व एपीएफसी पॅनेल्सची निर्मिती व उभारणी."},{"title":"औद्योगिक केबलिंग कामे (एचटी व एलटी)","desc":"हाय आणि लो-टेन्शन औद्योगिक वीजपुरवठ्यासाठी अचूक भूमिगत केबल लेईंग, टर्मिनेशन व जॉइंटिंग."},{"title":"विद्युत चाचणी आणि सुरक्षा","desc":"ट्रान्सफॉर्मर टेस्टिंग, सबस्टेशन हेल्थ ऑडिट, हाय-पॉट आणि टॅन-डेल्टा अत्याधुनिक डायग्नोस्टिक चाचण्या."},{"title":"लायझनिंग व शासकीय परवानग्या","desc":"पीडब्ल्यूडी (इलेक्ट्रिकल इन्स्पेक्टर), महावितरण, महापारेषण आणि टोरेंट पॉवरकडून शासकीय परवानग्या व लोड मंजुरी."},{"title":"टर्नकी प्रकल्प व विशेष कामे","desc":"एक्सप्रेस फीडर उभारणी, ट्रान्समिशन ओव्हरहेड लाईन शिफ्टिंग आणि मल्टी-मेगावॅट औद्योगिक वीज प्रकल्प."},{"title":"सौर ऊर्जा सोल्यूशन्स","desc":"औद्योगिकीसाठी रूफटॉप सोलर सिस्टीम डिझाइन, उभारणी, नेट मीटरिंग आणि ग्रिड जोडणी परवानग्या."},{"title":"अर्थिंग सोल्यूशन्स","desc":"मनुष्यबळ सुरक्षा आणि महागड्या मशनरींच्या संरक्षणासाठी प्रमाणित केमिकल अर्थिंग आणि कॉपर ग्रिड उभारणी."}]},"industries_section":{"title":"विविध उद्योग आणि उत्पादन क्षेत्रांसाठी वीज पायाभूत सुविधा","subtitle":"आम्ही संपूर्ण महाराष्ट्रातील उत्पादन प्रकल्पांसाठी ११केव्ही/२२केव्ही सबस्टेशन्स, मुख्य वीज वितरण स्विचबोर्ड, पीसीसी/एमसीसी पॅनेल्स, एपीएफसी कॅपेसिटर बँक्स आणि शासकीय परवानग्यांसह वीज पायाभूत सुविधा पुरवतो.","filters":["सर्व उद्योग","काच व सामग्री","पॅकेजिंग व प्रिंटिंग","वस्त्रोद्योग व लूम्स","पॉलिमर व रबर","केमिकल व फार्मा","कोल्ड चेन व लॉजिस्टिक्स","हेवी ग्रिड व टर्नकी"],"cards":[{"badge":"टेम्परिंग व भट्ट्या","title":"काच आणि टफन्ड ग्लास प्रक्रिया उद्योग","desc":"आम्ही स्वतंत्र ११केव्ही/२२केव्ही एचटी सबस्टेशन, स्टेप-डाऊन ट्रान्सफॉर्मर्स आणि डीट्यून्ड एपीएफसी हार्मोनिक फिल्टर असलेले मुख्य एलटी वितरण पॅनेल्स (पीसीसी) उभारतो, ज्यामुळे प्लांटच्या मुख्य एलटी पॅनेल आणि ब्लोअर्सपर्यंत सुरळीत वीज पोहोचते.","feature_tags":["११केव्ही/२२केव्ही एचटी सबस्टेशन उभारणी","पॉवर ट्रान्सफॉर्मर्स व पीसीसी पॅनेल्स","एपीएफसी हार्मोनिक कॅपेसिटर बँक्स"],"cta":"काच उद्योगासाठी चौकशी करा"},{"badge":"भट्ट्या व सिरॅमिक्स","title":"सिरॅमिक्स आणि काच मोल्डिंग उद्योग","desc":"आम्ही स्वतंत्र एचटी सबस्टेशन स्विचयार्ड, उच्च-क्षमतेचे स्टेप-डाऊन ट्रान्सफॉर्मर्स आणि मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) उभारतो, ज्यामुळे टनेल भट्ट्या आणि मुख्य एलटी पॅनेल्सना एपीएफसी नियंत्रणासह अखंड वीज मिळते.","feature_tags":["स्वतंत्र एचटी ट्रान्सफॉर्मर बे","मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी)","टनेल भट्टी एपीएफसी पॉवर फॅक्टर नियंत्रण"],"cta":"सिरॅमिक्ससाठी चौकशी करा"},{"badge":"हाय-स्पीड प्रिंटिंग व ट्यूब्स","title":"प्रिंटिंग आणि फ्लेक्सिबल पॅकेजिंग उद्योग","desc":"आम्ही स्वतंत्र ११केव्ही/२२केव्ही एचटी सबस्टेशन्स, ट्रान्सफॉर्मर्स आणि फास्ट-स्विच्ड एपीएफसी कॅपेसिटर बँक्स असलेले मुख्य एलटी स्विचबोर्ड (पीसीसी) उभारतो, ज्यामुळे प्रिंटिंग मशनरींना व्होल्टेज चढ-उतारांशिवाय स्वच्छ वीज मिळते.","feature_tags":["११केव्ही/२२केव्ही सबस्टेशन व ट्रान्सफॉर्मर","मुख्य एलटी वितरण पॅनेल्स (पीसीसी)","डीट्यून्ड एपीएफसी हार्मोनिक फिल्टरेशन"],"cta":"प्रिंटिंग व पॅकेजिंगसाठी चौकशी"},{"badge":"पल्पिंग व कोरुगेशन","title":"पेपर मिल्स आणि कोरुगेटेड बॉक्स निर्मिती","desc":"आम्ही हेवी-ड्यूटी एचटी ट्रान्सफॉर्मर यार्ड, व्हीसीबी ब्रेकर्स आणि स्वयंचलित एपीएफसी नियंत्रणासह मुख्य एलटी वितरण पॅनेल्स (पीसीसी) उभारतो, ज्यामुळे पल्पर्स आणि कोरुगेटर ड्राईव्ह्सना उच्च दाबाचा अखंड वीजपुरवठा होतो.","feature_tags":["टर्नकी एचटी सबस्टेशन उभारणी","हेवी-ड्यूटी पीसीसी व एमसीसी एलटी पॅनेल्स","मल्टी-स्टेज एपीएफसी कॅपेसिटर बँक्स"],"cta":"पेपर मिलसाठी चौकशी करा"},{"badge":"कताई व ऑटोमॅटिक लूम्स","title":"वस्त्रोद्योग आणि ऑटोमॅटिक लूम्स","desc":"आम्ही स्वतंत्र ११केव्ही/२२केव्ही एचटी सबस्टेशन्स, वितरण ट्रान्सफॉर्मर्स आणि फास्ट-स्विच्ड एपीएफसी बँक्स असलेले मुख्य एलटी पॅनेल्स (पीसीसी) उभारतो, ज्यामुळे हाय-स्पीड एअर-जेट व वॉटर-जेट लूम्सना स्थिर व्होल्टेज मिळते.","feature_tags":["११केव्ही/२२केव्ही सबस्टेशन व ट्रान्सफॉर्मर","मुख्य एलटी वितरण स्विचबोर्ड","फास्ट-स्विचिंग एपीएफसी बँक्स (>०.९८ पीएफ)"],"cta":"टेक्सटाईल वीज उभारणीसाठी चौकशी"},{"badge":"डायिंग व ऑटोक्लेव्ह","title":"धागा प्रक्रिया आणि फॅब्रिक डायिंग मिल्स","desc":"आम्ही स्वतंत्र आउटडोअर एचटी ट्रान्सफॉर्मर सबस्टेशन्स आणि आयपी५५-प्रमाणित मुख्य एलटी पॉवर डिस्ट्रिब्युशन बोर्ड (पीसीसी/एमसीसी) उभारतो, ज्यामुळे ओलसर वातावरणातही प्लांटच्या मुख्य पॅनेल्सना सुरक्षित वीज मिळते.","feature_tags":["एचटी ट्रान्सफॉर्मर सबस्टेशन उभारणी","ओलावा-रोधक पीसीसी/एमसीसी पॅनेल्स","उच्च-क्षमतेचे एपीएफसी बँक्स व अर्थिंग"],"cta":"डायिंग प्लांटसाठी चौकशी करा"},{"badge":"पाईप एक्स्ट्राड्युजन लाईन्स","title":"शेती पाईप्स आणि ठिबक सिंचन एक्सट्रूझन","desc":"आम्ही स्वतंत्र ११केव्ही/२२केव्ही सबस्टेशन्स, पॉवर ट्रान्सफॉर्मर्स आणि डीट्यून्ड एपीएफसी बँक्स असलेले मुख्य एलटी वितरण केंद्र (पीसीसी) उभारतो, ज्यामुळे पीव्हीसी/एचडीपीई बॅरल हीटर्सना अखंड ऊर्जा मिळते.","feature_tags":["स्वतंत्र ११केव्ही/२२केव्ही सबस्टेशन","हेवी पीसीसी मुख्य एलटी वितरण पॅनेल्स","एक्सट्रूझन हार्मोनिक्ससाठी एपीएफसी बँक्स"],"cta":"पाईप एक्सट्रूझनसाठी चौकशी"},{"badge":"मोल्डिंग व व्हल्कनायझेशन","title":"रबर आणि पॉलिमर उत्पादन उद्योग","desc":"आम्ही स्वतंत्र एचटी ट्रान्सफॉर्मर सबस्टेशन्स, हेवी-ड्यूटी स्टेप-डाऊन ट्रान्सफॉर्मर्स आणि एपीएफसी हार्मोनिक फिल्टर्स असलेले मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) उभारतो, ज्यामुळे हायड्रॉलिक प्रेशर्सना सतत वीज मिळते.","feature_tags":["एचटी सबस्टेशन व ट्रान्सफॉर्मर सेटअप","शॉक-रोधक पीसीसी/एमसीसी स्विचबोर्ड","हेवी-ड्यूटी एपीएफसी कॅपेसिटर बँक्स"],"cta":"रबर व पॉलिमरसाठी चौकशी"},{"badge":"फ्लेमप्रूफ / एफएलपी","title":"केमिकल आणि बल्क ड्रग फार्मा प्लांट्स","desc":"आम्ही स्वतंत्र एचटी सबस्टेशन्स, ऑइल-कूल्ड ट्रान्सफॉर्मर्स आणि प्रमाणित फ्लेमप्रूफ (एफएलपी) मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) उभारतो, ज्यामुळे धोकादायक केमिकल रिॲक्टर्सना वैधानिक सुरक्षा मानकांसह वीज मिळते.","feature_tags":["११केव्ही/२२केव्ही एचटी सबस्टेशन व ट्रान्सफॉर्मर","मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी)","केमिकल अर्थिंग व एपीएफसी बँक्स"],"cta":"केमिकल व फार्मासाठी चौकशी"},{"badge":"झोन-१ सॉल्व्हेंट प्रोसेसिंग","title":"पेंट्स, रेझिन्स आणि सॉल्व्हेंट्स फॉर्म्युलेशन्स","desc":"आम्ही स्वतंत्र ११केव्ही/२२केव्ही एचटी सबस्टेशन्स, स्टेप-डाऊन ट्रान्सफॉर्मर्स आणि एक्स्प्लोझन-प्रूफ एक्स-डी मुख्य एलटी वितरण स्विचबोर्ड (पीसीसी) उभारतो, ज्यामुळे उच्च-जोखीम पेंट प्रकल्पांना प्रमाणित सुरक्षित वीज मिळते.","feature_tags":["स्वतंत्र एचटी सबस्टेशन व ट्रान्सफॉर्मर","मुख्य एलटी वितरण पॅनेल्स (पीसीसी)","स्टॅटिक अर्थिंग व एपीएफसी नियंत्रण"],"cta":"पेंट्स व सॉल्व्हेंट्ससाठी चौकशी"},{"badge":"अमोनिया कंप्रेसर","title":"कोल्ड स्टोरेज आणि रेफ्रिजरेटेड लॉजिस्टिक्स","desc":"आम्ही स्वतंत्र ११केव्ही/२२केव्ही एचटी सबस्टेशन्स, दुहेरी-इनकमर स्टेप-डाऊन ट्रान्सफॉर्मर्स, डी.जी. ऑटोमॅटिक सिंक्रोनाइझेशन आणि मुख्य एलटी वितरण केंद्र (पीसीसी) उभारतो, ज्यामुळे अमोनिया कंप्रेसर्स २४x७ कार्यरत राहतात.","feature_tags":["११केव्ही/२२केव्ही एचटी सबस्टेशन उभारणी","दुहेरी-इनकमर मुख्य एलटी पॅनेल्स (पीसीसी)","हाय-केव्हीएआर एपीएफसी कॅपेसिटर बँक्स"],"cta":"कोल्ड स्टोरेजसाठी चौकशी करा"},{"badge":"मल्टी-टियर वितरण","title":"वेअरहाउसिंग आणि लॉजिस्टिक्स पार्क्स","desc":"आम्ही स्वतंत्र एचटी सबस्टेशन्स, वितरण ट्रान्सफॉर्मर्स आणि एपीएफसी बँक्स असलेले मुख्य एलटी डिस्ट्रिब्युशन केंद्र (पीसीसी) उभारतो, ज्यामुळे महाकाय वेअरहाउसिंग संकुले आणि डॉक लोडिंग फीडर्सना संतुलित वीज मिळते.","feature_tags":["टर्नकी एचटी सबस्टेशन व ट्रान्सफॉर्मर","मुख्य एलटी वितरण पॅनेल्स (पीसीसी)","एपीएफसी बँक्स व चार्जिंग डिस्ट्रिब्युशन"],"cta":"वेअरहाउसिंगसाठी चौकशी करा"},{"badge":"इंजेक्‍शन मोल्डिंग","title":"ऑफिस फर्निचर आणि प्रिसिजन पॉलिमर पार्ट्स","desc":"आम्ही स्वतंत्र ११केव्ही/२२केव्ही सबस्टेशन्स, स्टेप-डाऊन ट्रान्सफॉर्मर्स आणि मुख्य एलटी वितरण स्विचबोर्ड (पीसीसी) उभारतो, ज्यामुळे इंजेक्‍शन मोल्डिंग मशिन्स आणि असेंब्ली लाईन्सना विनाअडथळा वीज मिळते.","feature_tags":["११केव्ही/२२केव्ही एचटी सबस्टेशन उभारणी","मुख्य एलटी वितरण स्विचबोर्ड","हार्मोनिक-फिल्टर्ड एपीएफसी बँक्स"],"cta":"फर्निचर मोल्डिंगसाठी चौकशी"},{"badge":"धान्य व अन्न प्रक्रिया","title":"अन्न प्रक्रिया आणि ॲग्रो-कमोडिटी मिल्स","desc":"आम्ही स्वतंत्र ११केव्ही/२२केव्ही सबस्टेशन्स, फूड-ग्रेड वितरण ट्रान्सफॉर्मर्स आणि डस्ट-टाईट आयपी५५ मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) उभारतो, ज्यामुळे रोलर फ्लोअर मिल्स आणि सायलो मोटर्सना अखंड वीज मिळते.","feature_tags":["स्वतंत्र एचटी सबस्टेशन बे","मुख्य एलटी वितरण पॅनेल्स (पीसीसी)","मल्टी-स्टेज एपीएफसी कॅपेसिटर बँक्स"],"cta":"ॲग्रो मिल्ससाठी चौकशी करा"},{"badge":"क्रशर व इंडक्शन फर्नेस","title":"दगड खाणी, क्रशर आणि स्टील रोलिंग मिल्स","desc":"आम्ही ११केव्ही/२२केव्ही/३३केव्ही हेवी-ड्यूटी एचटी सबस्टेशन्स, उच्च-क्षमतेचे ट्रान्सफॉर्मर्स आणि डायनॅमिक एपीएफसी बँक्स असलेले मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) तयार करतो, जे अत्यंत जड शॉक-लोड पेलतात.","feature_tags":["११केव्ही/२२केव्ही/३३केव्ही सबस्टेशन्स","शॉक-रेटेड पीसीसी/एमसीसी स्विचबोर्ड","हेवी-ड्यूटी एपीएफसी कॅपेसिटर बँक्स"],"cta":"क्रशर व स्टील मिल्ससाठी चौकशी"},{"badge":"जड मशनरी व टॉवर्स","title":"इंजिनिअरिंग फॅब्रिकेशन आणि व्यावसायिक टॉवर्स","desc":"आम्ही स्वतंत्र ११केव्ही/२२केव्ही सबस्टेशन्स, स्टेप-डाऊन ट्रान्सफॉर्मर्स, रायझिंग मेन सँडविच बसडक्ट्स आणि मुख्य एलटी वितरण स्विचबोर्ड (पीसीसी) उभारतो, ज्यामुळे व्यावसायिक टॉवर्सना पूर्ण शासकीय मंजुरीसह वीज मिळते.","feature_tags":["११केव्ही/२२केव्ही एचटी सबस्टेशन उभारणी","दुहेरी-इनकमर मुख्य एलटी पॅनेल्स (पीसीसी)","एपीएफसी बँक्स व पीडब्ल्यूडी परवानग्या"],"cta":"टॉवर्स व फॅब्रिकेशनसाठी चौकशी"},{"badge":"डाय कास्टिंग व रोबोटिक्स","title":"ऑटोमोटिव्ह कंपोनंट्स आणि डाय कास्टिंग उद्योग","desc":"आम्ही स्वतंत्र ११केवी/२२केवी एचटी सबस्टेशन्स, स्टेप-डाऊन ट्रान्सफॉर्मर्स, शॉक-रेटेड मुख्य एलटी स्विचबोर्ड (पीसीसी/एमसीसी) आणि फास्ट-स्विचिंग एपीएफसी हार्मोनिक बँक्स उभारतो, ज्यामुळे हाय-टनेज डाय-कास्टिंग मशिन्स, रोबोटिक वेल्डिंग आणि सीएनसी लाईन्सना व्होल्टेज ड्रॉपशिवाय सुरळीत वीज मिळते.","feature_tags":["११केवी/२२केवी एचटी सबस्टेशन उभारणी","शॉक-रेटेड पीसीसी/एमसीसी व बसडक्ट्स","फास्ट-स्विचिंग एपीएफसी हार्मोनिक बँक्स"],"cta":"ऑटो व कास्टिंगसाठी चौकशी"},{"badge":"टायर-III/IV रिडंडन्सी","title":"डेटा सेंटर्स आणि एंटरप्राइझ सर्व्हर हब्स","desc":"आम्ही टर्नकी दुहेरी-स्रोत २२केवी/३३केवी एक्सप्रेस एचटी सबस्टेशन्स, व्हॅक्यूम सर्किट ब्रेकर्स, स्टॅटिक ट्रान्सफर स्विचगिअर (एसटीएस) आणि फॉल्ट-टॉलिरंट मुख्य एलटी स्विचबोर्ड्स (पीसीसी) उभारतो, ज्यामुळे एंटरप्राइझ डेटा हब्सना ९९.९९९% अखंड वीजपुरवठा मिळतो.","feature_tags":["२२केवी/३३केवी दुहेरी एक्सप्रेस फीडर बे","फॉल्ट-टॉलिरंट पीसीसी/एमसीसी स्विचबोर्ड्स","सीईआई शासकीय रिडंडन्सी परवानग्या"],"cta":"डेटा सेंटरसाठी चौकशी करा"}],"spotlight":{"live_badge":"सध्या प्रत्यक्ष कार्यरत प्रकल्प","featured_badge":"प्रमुख मेगा टर्नकी प्रकल्प","dual_badge":"दुहेरी सबस्टेशन ईएचव्ही ग्रिड पुरवठा","location_badge":"भिवंडी पायाभूत सुविधा","client_label":"क्लायंट: ॲपको इन्फ्राटेक (राष्ट्रीय पायाभूत सुविधा विकासक)","title":"१३ मेगावॅट टर्नकी पॉवर मंजुरी आणि दुहेरी <span>६.५ मेगावॅट एक्सप्रेस फीडर्स</span>","desc":"गायत्री इलेक्ट्रिकल सर्व्हिसेस सध्या भिवंडीत राष्ट्रीय पायाभूत सुविधा क्षेत्रातील अग्रगण्य कंपनी <strong>ॲपको इन्फ्राटेक</strong> साठी एका ऐतिहासिक <strong>१३ मेगावॅट टर्नकी पॉवर प्रकल्पाचे</strong> काम व शासकीय मंजुरी करत आहे. दोन स्वतंत्र ट्रान्समिशन हब्स—१००केव्ही सबस्टेशन आणि २२०केव्ही ईएचव्ही ग्रिड सबस्टेशन—मधून वीज घेऊन आम्ही दोन स्वतंत्र <strong>६.५ मेगावॅट एक्सप्रेस फीडर लाईन्स (एकूण १३ मेगावॅट क्षमता)</strong> उभारल्या आहेत, ज्यामध्ये बे इरेक्शन, व्हीसीबी ब्रेकर्स, ड्युअल-इनकमर सिंक्रोनाइझेशन आणि विद्युत निरीक्षकांची अधिकृत कमिशनिंग समाविष्ट आहे.","m1_lbl":"एकूण मंजूर वीजभार","m2_lbl":"स्वतंत्र एक्सप्रेस फीडर्स","m3_lbl":"दुहेरी ईएचव्ही ग्रिड सबस्टेशन्स","m4_lbl":"टोरेंट पॉवर, महापारेषण व विद्युत निरीक्षक परवानग्या","highlights":["ॲपको इन्फ्राटेक एंटरप्राइझ पायाभूत सुविधा","दुहेरी इनकमर सिंक्रोनाइझेशन","टोरेंट पॉवर व महापारेषण ग्रिड लायझनिंग","विद्युत निरीक्षक शासकीय कमिशनिंग"],"cta":"मेगा टर्नकी प्रकल्पांसाठी संपर्क करा"}},"liaisoning_section":{"title":"शासकीय लायझनिंग आणि कमिशनिंग परवानग्या","subtitle":"शासकीय अधिकृत विद्युत व लिफ्ट कंत्राटदार (स्थापना २००३) म्हणून आम्ही महाराष्ट्रभरात अधिकृत इंजिनिअरिंग लायझनिंग, लोड मंजुरी, विद्युत निरीक्षक परवानग्या आणि टर्नकी कमिशनिंगची कामे करतो.","cards":[{"badge":"वितरण परवानाधारक","title":"भिवंडी वितरण सर्कल","subtitle":"टोरेंट पॉवर लिमिटेड","desc":"टोरेंट पॉवरच्या भिवंडी सर्कलमध्ये शासकीय अधिकृत एचटी आणि एलटी विद्युत कंत्राटी कामे. नवीन औद्योगिक वीजभार मंजुरी, ट्रान्सफॉर्मर तपासणी, एक्सप्रेस फीडर उभारणी आणि टोरेंटच्या मानकांनुसार संपूर्ण नेटवर्क इंजिनिअरिंग.","features":["भिवंडी सर्कलमध्ये शासकीय अधिकृत एचटी व एलटी कंत्राटदार","जलद एचटी/एलटी वीजभार मंजुरी व मागणी वाढवणे","सबस्टेशन उभारणी, ट्रान्सफॉर्मर देखभाल व चार्जिंग परवानग्या"]},{"badge":"ईएचव्ही ट्रान्समिशन","title":"राज्य ट्रान्समिशन ग्रिड","subtitle":"महापारेषण (MSETCL)","desc":"१००केव्ही आणि २२०केव्ही ट्रान्समिशन ग्रिडवरून उच्च-क्षमतेच्या औद्योगिक वीज जोडणीसाठी टर्नकी काम आणि लायझनिंग. ॲपको इन्फ्राटेकच्या १३ मेगावॅट प्रकल्पाप्रमाणे दुहेरी ईएचव्ही सबस्टेशन्समधून वीज पुरवठा आणि बे विस्तारीकरण मंजुरी.","features":["१००केव्ही व २२०केव्ही ईएचव्ही ग्रिड जोडणी व फीडर सिंक","ईएचव्ही ट्रान्समिशन लाईन शिफ्टिंग व बे विस्तारीकरण मंजुरी","राईट-ऑफ-वे (आरओडब्ल्यू) पूर्तता व ग्रिड निकासी परवानग्या"]},{"badge":"शासकीय सुरक्षा","title":"मुख्य विद्युत निरीक्षणालय","subtitle":"विद्युत निरीक्षक (महाराष्ट्र शासन)","desc":"केंद्रीय विद्युत प्राधिकरण (सीईए) सुरक्षा नियमांनुसार तपासणी परवानग्या. रेखाचित्रे (SLD) तपासणी, फॉर्म ए व बी सादर करणे, एचटी चार्जिंग परवानगी, डी.जी. सेट मंजुरी आणि अर्थिंग रेझिस्टन्स तपासणीचे संपूर्ण काम.","features":["सुरुवातीच्या व नियमित तपासणीसाठी फॉर्म ए आणि बी सादर करणे","हाय-टेन्शन (११केव्ही/२२केव्ही/३३केव्ही) चार्जिंग परवानगी व सुरक्षा मंजुरी","डी.जी. सेट शासकीय मंजुरी व अर्थिंग ग्रिड चाचणी"]},{"badge":"वीज वितरण","title":"राज्य वितरण कंपनी","subtitle":"महावितरण (MSEDCL)","desc":"वाडा, कुडूस, ठाणे आणि पालघर औद्योगिक पट्ट्यात नवीन एचटी/एलटी औद्योगिक वीजभार मंजुरी, मागणी वाढवणे, स्वतंत्र औद्योगिक फीडर आणि टीओडी मीटरिंगची सर्वसमावेशक इंजिनिअरिंग लायझनिंग कामे.","features":["वाडा आणि कुडूस पट्ट्यात नवीन एचटी/एलटी औद्योगिक वीज जोडण्या","कॉन्ट्रॅक्ट डिमांड मंजुरी, वाढ व युक्तीकरण","स्वतंत्र औद्योगिक फीडर्स व टीओडी टॅरिफ मीटरिंग उभारणी"]},{"badge":"अपघात व उंच इमारती","title":"विद्युत निरीक्षणालय व पीडब्ल्यूडी","subtitle":"अपघातानंतर मंजुरी व हाय-राइज परमिशन","desc":"औद्योगिक आग किंवा शॉर्ट सर्किटच्या अपघातानंतर विद्युत निरीक्षकांची अधिकृत तपासणी, त्रुटी निवारण आणि वीज पुन्हा सुरू करण्यासाठी एनओसी मिळवणे. तसेच उंच व्यावसायिक इमारतींसाठी पीडब्ल्यूडी विद्युत परवानग्या.","features":["औद्योगिक आगीच्या अपघातानंतर तत्काळ फॉरेन्सिक तपासणी","केबल हाय-पॉट, इन्सुलेशन रेझिस्टन्स व स्विचगिअर हेल्थ ऑडिट","विद्युत निरीक्षणालय एनओसी व जलद वीज पुनर्स्थापना"]},{"badge":"अधिकृत लिफ्ट कंत्राटदार","title":"लिफ्ट व एस्कलेटर सुरक्षा प्राधिकरण","subtitle":"लिफ्ट निरीक्षणालय (ऊर्जा विभाग, महाराष्ट्र शासन)","desc":"शासकीय अधिकृत लिफ्ट कंत्राटदार म्हणून बॉम्बे लिफ्ट्स ॲक्ट आणि महाराष्ट्र लिफ्ट नियमांनुसार पॅसेंजर व गुड्स लिफ्टची उभारणी, आधुनिकीकरण आणि वार्षिक सुरक्षा प्रमाणपत्र नूतनीकरण.","features":["बॉम्बे लिफ्ट्स ॲक्ट अंतर्गत शासकीय अधिकृत लिफ्ट कंत्राटदार","प्रवासी व अवजड मालवाहतूक लिफ्ट उभारणी व आधुनिकीकरण","शासकीय वार्षिक लिफ्ट तपासणी व सुरक्षा प्रमाणपत्र नूतनीकरण"]}]},"faq_section":{"title":"नेहमी विचारले जाणारे प्रश्न","subtitle":"शासकीय परवानग्या, डी.जी. सेट मंजुरी, महावितरण लायझनिंग आणि आपत्कालीन विद्युत सेवांची माहिती.","items":[{"q":"एचटी इंस्टालेशन आणि डी.जी. सेटसाठी विद्युत निरीक्षकांकडून (पीडब्ल्यूडी) कोणत्या परवानग्या आवश्यक असतात?","a":"<p>केंद्रीय विद्युत प्राधिकरण (सीईए) सुरक्षा नियम ४३ आणि विद्युत कायद्याच्या कलम ५४ नुसार, कोणत्याही हाय टेन्शन (११केव्ही, २२केव्ही, ३३केव्ही) यंत्रणा आणि डी.जी. सेट कार्यान्वित करण्यापूर्वी विद्युत निरीक्षणालयाकडून (पीडब्ल्यूडी) रेखाचित्रांची तपासणी, अर्थिंग चाचणी, इंटरलॉकिंग पडताळणी आणि जागेवर प्रत्यक्ष तपासणी अनिवार्य आहे. गायत्री इलेक्ट्रिकल सर्व्हिसेस फॉर्म ए व बी सादर करून अधिकृत चार्जिंग परवानगी मिळवून देते.</p>"},{"q":"तुम्ही टोरेंट पॉवर आणि महावितरण अंतर्गत कोणत्या एचटी आणि एलटी सेवा पुरवता?","a":"<p>शासकीय अधिकृत विद्युत कंत्राटदार म्हणून, आम्ही टोरेंट पॉवर (भिवंडी सर्कल) आणि महावितरण (एमएसईडीसीएल) अंतर्गत नवीन औद्योगिक वीज जोडणी, कॉन्ट्रॅक्ट डिमांड वाढवणे/कमी करणे, भूमिगत एचटी केबल लेईंग, सबस्टेशन उभारणी, एक्सप्रेस फीडर कमिशनिंग आणि सीटी/पीटी मीटरिंग क्यूबिकल टेस्टिंगची टर्नकी कामे करतो.</p>"},{"q":"तुम्ही कोणत्या उत्पादन आणि प्रक्रिया उद्योगांना वीज पायाभूत सुविधा पुरवता?","a":"<p>आम्ही काच व टफन्ड प्रोसेसिंग, प्रिंटिंग व पॅकेजिंग, शेती पाईप एक्सट्रूझन, रबर व मोल्डिंग, ऑफिस फर्निचर, केमिकल व फार्मा प्लांट्स, कोल्ड स्टोरेज, वेअरहाउसिंग, टेक्स्टाईल ऑटोमॅटिक लूम्स आणि स्टोन क्रशर्स व स्टील रोलिंग मिल्सना विशेष एचटी/एलटी पॉवर इन्फ्रास्ट्रक्चर पुरवतो.</p>"},{"q":"महाराष्ट्रात शासकीय अधिकृत विद्युत कंत्राटदाराची निवड करणे का अनिवार्य आहे?","a":"<p>भारतीय विद्युत नियमांनुसार, केवळ महाराष्ट्र राज्य सरकारच्या परवाना मंडळाने अधिकृत केलेले कंत्राटदारच एचटी/एलटी सिस्टीम, सबस्टेशन्स आणि लिफ्ट उभारणी व प्रमाणित करण्यास कायदेशीररीत्या पात्र आहेत. अधिकृत कंत्राटदाराकडून काम करून घेतल्यासच विम्याचे संरक्षण मिळते आणि वीज कंपन्यांचे टेस्ट सर्टिफिकेट वैध ठरते.</p>"},{"q":"विद्युत निरीक्षकांकडून डी.जी. सेट (डिझेल जनरेटर) मंजुरी मिळवण्याची प्रक्रिया काय आहे?","a":"<p>डी.जी. सेटच्या मंजुरीसाठी चेंजओव्हर स्विचगिअरचे सिंगल लाईन डायग्राम (एसएलडी), वीज ग्रिडमध्ये बॅक-फीडिंग रोखण्यासाठी मेकॅनिकल/इलेक्ट्रिकल इंटरलॉकिंग, स्वतंत्र न्यूट्रल व बॉडी अर्थिंग पिट्सची चाचणी आणि विद्युत निरीक्षकांची जागेवर तपासणी आवश्यक असते. आम्ही सर्व रेखाचित्रे तयार करून अंतिम चार्जिंग परवानगी मिळवतो.</p>"},{"q":"तुम्ही उंच इमारतींसाठी विद्युत परवानग्या आणि सबस्टेशन क्लिअरन्सची कामे करता का?","a":"<p>होय. व्यावसायिक आणि निवासी उंच इमारतींसाठी आम्ही रायझिंग मेन बसडक्ट, डी.जी. इमर्जन्सी चेंजओव्हर, लाईफ-सेफ्टी पंप पॅनेल्स आणि ट्रान्सफॉर्मर सबस्टेशन्ससाठी पीडब्ल्यूडी विद्युत निरीक्षणालयाकडून संपूर्ण रेखाचित्र मंजुरी, चाचण्या आणि अंतिम चार्जिंग परवानग्या मिळवतो.</p>"},{"q":"कारखान्यात आग लागल्यानंतर किंवा फ्लॅशओव्हरनंतर तुम्ही विद्युत निरीक्षकांकडून क्लिअरन्स कसे मिळवून देता?","a":"<p>कारखान्यात आग लागल्यानंतर विद्युत निरीक्षकांच्या (सीईआय) अधिकृत मंजुरीशिवाय वीज कंपन्या वीज पुरवठा पुन्हा सुरू करू शकत नाहीत. आमचे वरिष्ठ अभियंते नुकसानीचे मूल्यांकन करतात, केबल्सची हाय-पॉट व मेगर चाचणी करतात, त्रुटींचे निवारण करतात आणि विद्युत निरीक्षकांकडून तपासणी क्लिअरन्स मिळवून वीज त्वरित पूर्ववत करतात.</p>"},{"q":"तुम्ही उद्योगांसाठी आपत्कालीन ट्रान्सफॉर्मर रेंटल (भाड्याने) सेवा देता का?","a":"<p>होय. आम्ही भिवंडी, वाडा, कुडूस, ठाणे आणि नवी मुंबईमध्ये १०० केव्हीए ते २०००+ केव्हीए क्षमतेचे आपत्कालीन ट्रान्सफॉर्मर्स भाड्याने देतो. तुमचा ट्रान्सफॉर्मर अचानक नादुरुस्त झाल्यास आमची फिरती टीम काही तासांत रेंटल ट्रान्सफॉर्मर पोहोचवून सुरू करते, ज्यामुळे कारखान्याचे उत्पादन ठप्प होत नाही.</p>"},{"q":"तुम्ही कोणती ट्रान्सफॉर्मर टेस्टिंग आणि ऑन-साइट व्हॅक्यूम ऑइल फिल्टरेशन सेवा पुरवता?","a":"<p>आम्ही बीडीव्ही डायइलेक्ट्रिक ऑइल स्ट्रेंथ टेस्ट, इन्सुलेशन रेझिस्टन्स (मेगर), वाईंडिंग रेझिस्टन्स, टर्न्स रेशो, मॅग्नेटिक बॅलन्स आणि टॅन डेल्टा चाचण्या करतो. आमची फिरती हाय-व्हॅक्यूम ऑइल फिल्टरेशन युनिट्स जागेवरच ट्रान्सफॉर्मर तेलाचे हीटिंग, डीगॅसिंग आणि डिहायड्रेशन करून तेलाची क्षमता ६०केव्ही पेक्षा अधिक पुनर्स्थापित करतात.</p>"},{"q":"तुम्ही कोणती एचटी सबस्टेशन टेस्टिंग आणि स्विचगिअर मेंटेनन्स कामे करता?","a":"<p>आमचे परवानाधारक टेस्टिंग अभियंते व्हॅक्यूम सर्किट ब्रेकर (व्हीसीबी) व एसएफ६ ब्रेकर टायमिंग टेस्ट, न्यूमॅरिकल प्रोटेक्शन रिले कॅलिब्रेशन, सीटी/पीटी रेशो पडताळणी, एचटी केबल डीसी हाय-पॉट टेस्ट आणि अर्थ मेगरद्वारे अर्थिंग ग्रिडची सर्वसमावेशक चाचणी करतात.</p>"},{"q":"तुम्ही सबस्टेशन्स, ट्रान्सफॉर्मर्स आणि पॅनेल्ससाठी वार्षिक देखभाल करार (एएमसी) देता का?","a":"<p>होय. आम्ही भिवंडी, कुडूस, वाडा, ठाणे आणि मुंबईतील उद्योगांसाठी <strong>सर्वसमावेशक आणि गैर-सर्वसमावेशक वार्षिक देखभाल करार (एएमसी)</strong> देतो. यात एचटी सबस्टेशन सर्व्हिसिंग, ऑइल फिल्टरेशन, एपीएफसी पॅनेल कॅलिब्रेशन (पीएफ >०.९८ राखणे), रिले टेस्टिंग आणि २४x७ आपत्कालीन ब्रेकडाउन प्राधान्य समाविष्ट आहे.</p>"},{"q":"तुम्ही मोठ्या प्रमाणावर टर्नकी एक्सप्रेस फीडर्स आणि मल्टी-मेगावॅट प्रकल्प (उदा. १३ मेगावॅट) राबवू शकता का?","a":"<p>होय. याचे सर्वोत्तम उदाहरण म्हणजे भिवंडीतील <strong>ॲपको इन्फ्राटेकचा १३ मेगावॅट टर्नकी प्रकल्प</strong>, ज्यामध्ये १००केव्ही आणि २२०केव्ही ईएचव्ही ग्रिड सबस्टेशन्समधून दुहेरी ६.५ मेगावॅट एक्सप्रेस फीडर्स उभारले जात आहेत. आम्ही आरओडब्ल्यू, टॉवर लाईन बांधकाम, व्हीसीबी ब्रेकर्स, सिंक्रोनाइझेशन आणि शासकीय कमिशनिंगचे संपूर्ण काम करतो.</p>"},{"q":"तुम्ही उत्पादन प्रकल्पांना लो पॉवर फॅक्टर (पीएफ) दंडापासून वाचवण्यासाठी कशी मदत करता?","a":"<p>०.९० पेक्षा कमी पॉवर फॅक्टर असल्यास वीज बिलावर मोठा दंड आकारला जातो, तर ०.९५ पेक्षा जास्त असल्यास महावितरण व टोरेंट पॉवरकडून प्रोत्साहनपर सवलत मिळते. आम्ही व्हीएफडी आणि मोटार्सच्या हार्मोनिक्सचे निवारण करण्यासाठी डीट्यून्ड फिल्टरसह स्वयंचलित एपीएफसी कॅपेसिटर बँक्स बसवतो, ज्यामुळे पीएफ नेहमी ०.९९+ राहतो.</p>"},{"q":"तुम्ही आपत्कालीन ब्रेकडाउन मदत आणि जागेवर ऑइल फिल्टरेशन देता का?","a":"<p>होय. आम्ही भिवंडी, कुडूस, वाडा, ठाणे आणि नवी मुंबईत तत्काळ आपत्कालीन ब्रेकडाउन मदत पुरवतो. आमची फिरती टीम जागेवर ट्रान्सफॉर्मर तपासणी, ऑइल फिल्टरेशन, सिलिका जेल बदलणे, ओएलटीसी सर्व्हिसिंग आणि हाय-व्होल्टेज केबल फॉल्ट शोधून जॉइंटिंग करते.</p>"},{"q":"तुम्ही महाराष्ट्रातील कोणत्या औद्योगिक पट्ट्यांमध्ये सेवा पुरवता?","a":"<p>आम्ही भिवंडी (सोनाले, वाल, मानकोली, पडघा, भादवड), कुडूस आणि वाडा औद्योगिक पट्टा, तसेच ठाणे, कल्याण, डोंबिवली, अंबरनाथ, बदलापुर, शहापूर, नवी मुंबई आणि संपूर्ण एमएमआर परिसरात अविरत सेवा पुरवतो.</p>"},{"q":"तुम्ही औद्योगिक रूफटॉप सोलर प्रकल्पांसाठी सोलर नेट-मीटरिंग परवानग्या आणि सीईआय लायझनिंगचे काम करता का?","a":"<p>होय. गायत्री इलेक्ट्रिकल सर्व्हिसेस भिवंडी, वाडा, कुडूस, ठाणे आणि संपूर्ण महाराष्ट्रात औद्योगिक व व्यावसायिक सोलर प्रकल्पांसाठी <strong>टर्नकी सोलर लायझनिंग, नेट-मीटरिंग परवानग्या आणि मुख्य विद्युत निरीक्षणालय (सीईआय / पीडब्ल्यूडी) शासकीय चार्जिंग क्लिअरन्स</strong> मिळवून देणारी अग्रगण्य संस्था आहे. आम्ही टोरेंट पॉवर आणि महावितरणसोबत ग्रिड जोडणी अर्ज, रेखाचित्रे मंजुरी, इन्व्हर्टर अर्थिंग चाचणी, आणि बाय-डायरेक्शनल नेट मीटर बसवण्याची संपूर्ण कायदेशीर प्रक्रिया पूर्ण करतो.</p>"},{"q":"आपल्या व्यावसायिक अटी, दर रचना आणि पेमेंट पद्धती काय आहेत?","a":"<p>गायत्री इलेक्ट्रिकल सर्व्हिसेस ही अधिकृत जीएसटी-नोंदणीकृत अभियांत्रिकी संस्था आहे. आमचे प्रकल्प शुल्क पारदर्शी आणि स्पर्धात्मक इंजिनिअरिंग बिल ऑफ क्वांटिटीज (BOQ) नुसार असते. सर्व व्यावसायिक बिले अधिकृत जीएसटी टॅक्स इन्व्हॉइससह दिली जातात आणि पेमेंट केवळ संस्थागत इलेक्ट्रॉनिक बँकिंगद्वारेच स्वीकारले जाते: बँक ट्रान्सफर (RTGS / NEFT / IMPS), अकाउंट पेयी धनादेश (चेक) किंवा कॉर्पोरेट यूपीआय. यामुळे कॉर्पोरेट ग्राहकांना १००% कायदेशीर व ऑडिटिंग पारदर्शकता आणि जीएसटी इनपुट टॅक्स क्रेडिट (ITC) चा पूर्ण लाभ मिळतो.</p>"}]},"service_modals":{"modal-transformer":{"title":"ट्रान्सफॉर्मर लाइफसायकल व्यवस्थापन","desc":"तुमच्या सर्वात महत्त्वाच्या विद्युत यंत्रणेसाठी पुरवठा, दुरुस्ती आणि नियमित देखभालीपर्यंत संपूर्ण सेवा.","items":["ट्रान्सफॉर्मर पुरवठा (नवीन आणि रेंटल/सर्व्हिस युनिट्स)","सर्वसमावेशक दुरुस्ती आणि नूतनीकरण (Overhauling)","प्रतिबंधात्मक देखभाल कार्यक्रम (AMC)","प्रगत हाय-व्हॅक्यूम ऑइल फिल्टरेशन आणि डिहायड्रेशन","डायग्नोस्टिक ट्रान्सफॉर्मर चाचणी (BDV, मेगर, टॅन डेल्टा)"]},"modal-ht":{"title":"हाय-टेन्शन (HT) सबस्टेशन्स","desc":"औद्योगिक वीज वितरणाचा कणा असलेल्या हाय-टेन्शन इन्फ्रास्ट्रक्चरच्या डिझाइन आणि उभारणीत आम्ही तज्ज्ञ आहोत:","items":["आउटडोअर आणि इनडोअर एचटी सब-स्टेशन उभारणी","सर्वसमावेशक एचटी सब-स्टेशन चाचणी आणि तपासणी","एअर इन्सुलेटेड (AIS) बे इन्स्टॉलेशन आणि कमिशनिंग","गॅस इन्सुलेटेड (GIS) बे इन्स्टॉलेशन आणि कमिशनिंग"]},"modal-panels":{"title":"पॅनेल सिस्टीम्स (HT, LT आणि APFC)","desc":"तुमच्या उद्योगाचे कार्य नियंत्रित आणि सुरक्षित ठेवणाऱ्या सर्व प्रकारच्या इलेक्ट्रिकल पॅनेल्सचा आम्ही पुरवठा, उभारणी आणि देखभाल करतो:","items":["एचटी (HT) पॅनेल पुरवठा, इन्स्टॉलेशन आणि देखभाल","एलटी (PCC/MCC) पॅनेल पुरवठा, इन्स्टॉलेशन आणि देखभाल","ऑटोमॅटिक पॉवर फॅक्टर करेक्शन (APFC) पॅनेल पुरवठा आणि देखभाल"]},"modal-cabling":{"title":"केबलिंग कामे (HT आणि LT)","desc":"तुमच्या विद्युत नेटवर्कची सुरक्षितता दर्जेदार केबलिंगवर अवलंबून असते. आम्ही सर्व व्होल्टेज स्तरांसाठी व्यावसायिक सेवा पुरवतो:","items":["एचटी आणि एलटी भूमिगत (Underground) केबल लेईंग","एचटी आणि एलटी ओव्हरहेड केबल लेईंग","अचूक एचटी आणि एलटी केबल जॉइंटिंग आणि टर्मिनेशन"]},"modal-testing":{"title":"विद्युत चाचणी आणि सुरक्षा","desc":"शासकीय नियमांचे पालन, सुरक्षा आणि अखंड कार्यक्षमता सुनिश्चित करण्यासाठी आम्ही खालील डायग्नोस्टिक चाचण्या करतो:","items":["हाय-पॉट (HIGH-POT) चाचणी","टॅन डेल्टा (Tan Delta) चाचणी","सर्वसमावेशक ट्रान्सफॉर्मर टेस्टिंग","सबस्टेशन टेस्टिंग आणि हेल्थ ऑडिट (नवीन आणि जुन्या सबस्टेशन्ससाठी)"]},"modal-liasoning":{"title":"लायझनिंग आणि शासकीय सल्लागार","desc":"सर्व आवश्यक शासकीय आणि वीज कंपनी परवानग्या वेळेत मिळवून देण्यासाठी आम्ही तुमचे अधिकृत तांत्रिक प्रतिनिधी म्हणून काम करतो:","items":["व्यावसायिक इलेक्ट्रिकल ड्रॉइंग आणि डिझाइन (सिंगल लाईन डायग्राम - SLD)","पीडब्ल्यूडी (विद्युत निरीक्षणालय / CEI) कडून शासकीय मंजुरी","डी.जी. (डिझेल जनरेटर) सेट लायझनिंग, परवानग्या आणि सुरक्षा क्लिअरन्स","पॉवर युटिलिटी लायझनिंग व समन्वय (MSEDCL, MSETCL आणि Torrent Power)","सोलर लायझनिंग आणि नेट-मीटरिंग ग्रिड कनेक्टिव्हिटी मंजुरी"]},"modal-projects":{"title":"टर्नकी प्रकल्प आणि विशेष कामे","desc":"विशेष कौशल्य आणि सूक्ष्म नियोजनाची गरज असलेले मोठ्या प्रमाणावरील विद्युत प्रकल्प आम्ही टर्नकी पद्धतीने पूर्ण करतो:","items":["एक्सप्रेस फीडर लायझनिंग आणि कमिशनिंग","हाय-व्होल्टेज ओव्हरहेड लाईन शिफ्टिंग","संपूर्ण लिफ्ट उभारणी आणि शासकीय परवाना सेवा"]},"modal-solar":{"title":"सौर ऊर्जा उपाय (Solar Power)","desc":"आमच्या एंड-टू-एंड सोलर उपायांसह शाश्वत ऊर्जा स्वीकारा आणि आपल्या कारखान्याचा वीज खर्च कमी करा:","items":["सोलर पॉवर सिस्टीम डिझाइन आणि इन्स्टॉलेशन","सोलर प्रकल्पांसाठी सीईआय आणि महावितरण/टोरेंट पॉवर लायझनिंग","नेट-मीटरिंग ग्रिड कनेक्टिव्हिटी आणि कमिशनिंग"]},"modal-earthing":{"title":"अर्थिंग सोल्यूशन्स (Earthing Solutions)","desc":"तुमच्या कर्मचाऱ्यांच्या सुरक्षिततेसाठी आणि महागड्या यंत्रसामग्रीच्या संरक्षणासाठी मजबूत अर्थिंग सिस्टीम अत्यंत आवश्यक आहे:","items":["प्रगत मेंटेनन्स-फ्री केमिकल अर्थिंग","पारंपारिक कोळसा आणि मीठ अर्थिंग"]}}}};
        async function loadLocale(lang) {
            if (translations[lang]) return translations[lang];
            try {
                const res = await fetch(`data/locales/${lang}.json`);
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data = await res.json();
                translations[lang] = data;
                return data;
            } catch (err) {
                console.warn(`GES Locale notice for ${lang}:`, err);
                return translations[lang] || translations.en || null;
            }
        }

        window.setLanguage = async function(lang) {
            if (!['en', 'hi', 'mr'].includes(lang)) lang = 'en';
            document.documentElement.lang = lang;

            // Immediate responsive feedback for language buttons
            document.querySelectorAll('.lang-btn').forEach(btn => {
                if (btn.getAttribute('data-lang') === lang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Save preference to localStorage
            try {
                localStorage.setItem('ges_preferred_lang', lang);
            } catch (e) {}

            // Load locale asynchronously
            const t = await loadLocale(lang);
            if (!t) return;

            // 1. Standard [data-i18n] keys (auto-detects HTML to prevent literal <br> or <span> leaking)
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (t[key] !== undefined) {
                    if (typeof t[key] === 'string' && t[key].includes('<') && t[key].includes('>')) {
                        el.innerHTML = t[key];
                    } else {
                        el.textContent = t[key];
                    }
                }
            });

            // 2. Standard [data-i18n-html] keys
            document.querySelectorAll('[data-i18n-html]').forEach(el => {
                const key = el.getAttribute('data-i18n-html');
                if (t[key] !== undefined) {
                    el.innerHTML = t[key];
                }
            });

            // 3. Services Section
            if (t.services_section) {
                const srvTitle = document.querySelector('#services h2');
                if (srvTitle) srvTitle.textContent = t.services_section.title;
                const srvSub = document.querySelector('#services .section-subtitle');
                if (srvSub) srvSub.textContent = t.services_section.subtitle;

                const srvCards = document.querySelectorAll('#services .services-grid .service-card');
                t.services_section.cards.forEach((cardData, idx) => {
                    if (srvCards[idx]) {
                        const h3 = srvCards[idx].querySelector('h3');
                        const p = srvCards[idx].querySelector('p');
                        if (h3) h3.textContent = cardData.title;
                        if (p) p.textContent = cardData.desc;
                    }
                });
            }

            // 4. Industries Section
            if (t.industries_section) {
                const indTitle = document.querySelector('#industries h2');
                if (indTitle) indTitle.textContent = t.industries_section.title;
                const indSub = document.querySelector('#industries .section-subtitle');
                if (indSub) indSub.textContent = t.industries_section.subtitle;

                // Category Filter Buttons (preserve count badge)
                const filterBtns = document.querySelectorAll('.industry-category-filters .industry-filter-btn');
                t.industries_section.filters.forEach((filterText, idx) => {
                    if (filterBtns[idx]) {
                        const countSpan = filterBtns[idx].querySelector('.filter-count');
                        const countHtml = countSpan ? countSpan.outerHTML : '';
                        filterBtns[idx].innerHTML = filterText + ' ' + countHtml;
                    }
                });

                // 18 Industry Cards
                const indCards = document.querySelectorAll('#industries .industries-grid .industry-card');
                t.industries_section.cards.forEach((cardData, idx) => {
                    if (indCards[idx]) {
                        const badge = indCards[idx].querySelector('.industry-badge');
                        const h3 = indCards[idx].querySelector('h3');
                        const p = indCards[idx].querySelector('p');
                        const cta = indCards[idx].querySelector('.industry-card-cta');
                        if (badge) badge.textContent = cardData.badge;
                        if (h3) h3.textContent = cardData.title;
                        if (p) p.textContent = cardData.desc;
                        if (cta) cta.innerHTML = cardData.cta + ' <span>&rarr;</span>';

                        // Update the 3 feature tags (ticks)
                        if (cardData.feature_tags && cardData.feature_tags.length) {
                            const tags = indCards[idx].querySelectorAll('.industry-feature-tag');
                            cardData.feature_tags.forEach((tagText, tIdx) => {
                                if (tags[tIdx]) {
                                    tags[tIdx].innerHTML = '<span>✓</span> ' + tagText;
                                }
                            });
                        }
                    }
                });

                // APCO Spotlight Card
                const sp = t.industries_section.spotlight;
                const spCard = document.querySelector('#industries .project-spotlight-card');
                if (sp && spCard) {
                    const liveBadge = spCard.querySelector('.spotlight-badge.live-beacon');
                    if (liveBadge) liveBadge.innerHTML = '<span class="beacon-dot"></span> ' + sp.live_badge;
                    const badges = spCard.querySelectorAll('.spotlight-badge:not(.live-beacon)');
                    if (badges[0]) badges[0].textContent = sp.featured_badge;
                    if (badges[1]) badges[1].textContent = sp.dual_badge;
                    if (badges[2]) badges[2].textContent = sp.location_badge;

                    const clientLbl = spCard.querySelector('.spotlight-client-badge .client-text');
                    if (clientLbl) clientLbl.textContent = sp.client_label;

                    const spTitle = spCard.querySelector('.spotlight-title');
                    if (spTitle) spTitle.innerHTML = sp.title;

                    const spDesc = spCard.querySelector('.spotlight-desc');
                    if (spDesc) spDesc.innerHTML = sp.desc;

                    const metricLbls = spCard.querySelectorAll('.spotlight-metric-lbl');
                    if (metricLbls[0]) metricLbls[0].textContent = sp.m1_lbl;
                    if (metricLbls[1]) metricLbls[1].textContent = sp.m2_lbl;
                    if (metricLbls[2]) metricLbls[2].textContent = sp.m3_lbl;
                    if (metricLbls[3]) metricLbls[3].textContent = sp.m4_lbl;

                    // Update spotlight highlights (ticks)
                    if (sp.highlights && sp.highlights.length) {
                        const hlTags = spCard.querySelectorAll('.spotlight-highlight-tag');
                        sp.highlights.forEach((hlText, hIdx) => {
                            if (hlTags[hIdx]) {
                                hlTags[hIdx].textContent = '✓ ' + hlText;
                            }
                        });
                    }

                    const spCta = spCard.querySelector('.spotlight-cta');
                    if (spCta) spCta.innerHTML = sp.cta + ' <span>&rarr;</span>';
                }
            }

            // 5. Liaisoning Section
            if (t.liaisoning_section) {
                const lTitle = document.querySelector('#liaisoning h2');
                if (lTitle) lTitle.textContent = t.liaisoning_section.title;
                const lSub = document.querySelector('#liaisoning .section-subtitle');
                if (lSub) lSub.textContent = t.liaisoning_section.subtitle;

                const lCards = document.querySelectorAll('#liaisoning .liaisoning-container .liaisoning-card');
                t.liaisoning_section.cards.forEach((cardData, idx) => {
                    if (lCards[idx]) {
                        const badge = lCards[idx].querySelector('.liaisoning-badge');
                        const h3 = lCards[idx].querySelector('h3');
                        const h4 = lCards[idx].querySelector('h4');
                        const p = lCards[idx].querySelector('p');
                        if (badge) badge.textContent = cardData.badge;
                        if (h3) h3.textContent = cardData.title;
                        if (h4) h4.textContent = cardData.subtitle;
                        if (p) p.textContent = cardData.desc;

                        // Update liaisoning features (ticks)
                        if (cardData.features && cardData.features.length) {
                            const feats = lCards[idx].querySelectorAll('.liaisoning-features .feature span:last-child');
                            cardData.features.forEach((featText, fIdx) => {
                                if (feats[fIdx]) {
                                    feats[fIdx].textContent = featText;
                                }
                            });
                        }
                    }
                });
            }

            // 6. FAQs Section
            if (t.faq_section) {
                const fTitle = document.querySelector('#faq h2');
                if (fTitle) fTitle.textContent = t.faq_section.title;
                const fSub = document.querySelector('#faq .section-subtitle');
                if (fSub) fSub.textContent = t.faq_section.subtitle;

                const faqItems = document.querySelectorAll('#faq .faq-container .faq-item');
                t.faq_section.items.forEach((itemData, idx) => {
                    if (faqItems[idx]) {
                        const q = faqItems[idx].querySelector('.faq-question');
                        const a = faqItems[idx].querySelector('.faq-answer');
                        if (q) {
                            const icon = q.querySelector('.faq-icon');
                            const iconHtml = icon ? icon.outerHTML : '<span class="faq-icon">+</span>';
                            q.innerHTML = itemData.q + ' ' + iconHtml;
                        }
                        if (a) a.innerHTML = itemData.a;
                    }
                });
            }

            // 6b. Service Modals
            if (t.service_modals) {
                Object.keys(t.service_modals).forEach(mId => {
                    const mEl = document.getElementById(mId);
                    if (mEl) {
                        const mData = t.service_modals[mId];
                        const h3 = mEl.querySelector('h3');
                        const p = mEl.querySelector('p');
                        const lis = mEl.querySelectorAll('ul li');
                        if (h3 && mData.title) h3.textContent = mData.title;
                        if (p && mData.desc) p.textContent = mData.desc;
                        if (lis && mData.items) {
                            mData.items.forEach((itemText, iIdx) => {
                                if (lis[iIdx]) lis[iIdx].textContent = itemText;
                            });
                        }
                    }
                });
            }

            // 7. Parallax CTA
            const pCtaTitle = document.querySelector('#parallax-cta h2');
            const pCtaSub = document.querySelector('#parallax-cta p');
            const pCtaBtn = document.querySelector('#parallax-cta a');
            if (pCtaTitle && t.parallax_title) pCtaTitle.textContent = t.parallax_title;
            if (pCtaSub && t.parallax_sub) pCtaSub.textContent = t.parallax_sub;
            if (pCtaBtn && t.parallax_cta) pCtaBtn.textContent = t.parallax_cta;

            // 8. Contact Section & Form
            const cTitle = document.querySelector('#contact h2');
            const cSub = document.querySelector('#contact .section-subtitle');
            if (cTitle && t.contact_title) cTitle.textContent = t.contact_title;
            if (cSub && t.contact_sub) cSub.textContent = t.contact_sub;

            const cInfoH3 = document.querySelector('#contact .contact-info h3');
            if (cInfoH3 && t.contact_get_in_touch) cInfoH3.textContent = t.contact_get_in_touch;

            const cCards = document.querySelectorAll('#contact .contact-card-info h4');
            if (cCards[0] && t.contact_send_email) cCards[0].textContent = t.contact_send_email;
            if (cCards[1] && t.contact_give_call) cCards[1].textContent = t.contact_give_call;
            if (cCards[2] && t.contact_office) cCards[2].textContent = t.contact_office;

            const formH3 = document.querySelector('#contactForm h3');
            if (formH3 && t.contact_form_title) formH3.textContent = t.contact_form_title;

            const nameInput = document.getElementById('name');
            if (nameInput && t.contact_form_name) nameInput.placeholder = t.contact_form_name;

            const emailInput = document.getElementById('email');
            if (emailInput && t.contact_form_email) emailInput.placeholder = t.contact_form_email;

            const phoneInput = document.getElementById('phone');
            if (phoneInput && t.contact_form_phone) phoneInput.placeholder = t.contact_form_phone;

            const industrySelect = document.getElementById('industry_sector');
            if (industrySelect && industrySelect.options.length > 0 && t.contact_form_industry) {
                industrySelect.options[0].text = t.contact_form_industry;
            }

            const msgInput = document.getElementById('message');
            if (msgInput && t.contact_form_msg) msgInput.placeholder = t.contact_form_msg;

            const submitBtn = document.querySelector('#contactForm button[type="submit"]');
            if (submitBtn && t.contact_form_btn) submitBtn.textContent = t.contact_form_btn;

            // 9. Floating WhatsApp Tooltip
            const waTooltip = document.querySelector('.whatsapp-tooltip');
            if (waTooltip && t.whatsapp_tooltip) {
                waTooltip.innerHTML = '<span class="status-dot"></span>' + t.whatsapp_tooltip;
            }

            // 10. Trigger Google Translate for any remaining untranslated legal/dynamic nodes
            if (typeof window.triggerGoogleTranslate === 'function') {
                window.triggerGoogleTranslate(lang);
            }
        };

        // Wire up language switch button click listeners
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                window.setLanguage(lang);
            });
        });

        // Google Translate Integration with Electrical Context Preservation
        window.googleTranslateElementInit = function() {
            // Protect curated electrical sections from being overwritten by literal machine translation
            document.querySelectorAll('header, main, footer, #modal-transformer, #modal-ht, #modal-panels, #modal-cabling, #modal-testing, #modal-liasoning, #modal-projects, #modal-solar, #modal-earthing').forEach(function(el) {
                el.classList.add('notranslate');
            });
            if (window.google && window.google.translate && window.google.translate.TranslateElement) {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,mr',
                    autoDisplay: false
                }, 'google_translate_element');
            }
        };

        window.triggerGoogleTranslate = function(langCode) {
            const hostname = window.location.hostname;
            document.cookie = 'googtrans=/en/' + langCode + '; path=/;';
            if (hostname && hostname !== 'localhost') {
                document.cookie = 'googtrans=/en/' + langCode + '; path=/; domain=' + hostname + ';';
                document.cookie = 'googtrans=/en/' + langCode + '; path=/; domain=.' + hostname + ';';
            }
            const select = document.querySelector('.goog-te-combo');
            if (select && select.value !== langCode) {
                select.value = langCode;
                select.dispatchEvent(new Event('change'));
            }
        };

        // Initialize with user's saved language or default to 'en'
        let initialLang = 'en';
        try {
            initialLang = localStorage.getItem('ges_preferred_lang') || 'en';
        } catch(e) {}
        window.setLanguage(initialLang);

        (function() {
            if (!document.getElementById('google_translate_element')) {
                var gtDiv = document.createElement('div');
                gtDiv.id = 'google_translate_element';
                gtDiv.style.display = 'none';
                gtDiv.setAttribute('aria-hidden', 'true');
                document.body.appendChild(gtDiv);
            }
            var gt = document.createElement('script');
            gt.type = 'text/javascript';
            gt.async = true;
            gt.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.body.appendChild(gt);
        })();
