document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Theme Management (Light / Dark Mode)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    // Safe check for localStorage (file:/// security restrictions)
    let savedTheme = 'dark';
    try {
        savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) {
        console.warn("localStorage is restricted, defaulting to dark theme:", e);
    }
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeIcon) updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            try {
                localStorage.setItem('theme', newTheme);
            } catch (e) {
                console.warn("localStorage is restricted, theme preference not saved:", e);
            }
            if (themeIcon) updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    // ==========================================
    // 2. Navigation & Header Effects
    // ==========================================
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active link tracking on scroll
        let current = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translate(6px, 6px)' : 'none';
        spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
        spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translate(6px, -6px)' : 'none';
    });

    // Close menu when clicking link
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // ==========================================
    // 3. Scroll Reveal Animation
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    // 4. Testimonial Slider / Carousel
    // ==========================================
    const track = document.querySelector('.testimonial-track');
    const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
    const dotsContainer = document.querySelector('.slider-nav');
    let currentSlideIndex = 0;

    // Create dot indicators dynamically
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(document.querySelectorAll('.slider-dot'));

    function goToSlide(index) {
        currentSlideIndex = index;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
    }

    // Auto slide change
    let slideInterval = setInterval(nextSlide, 6000);

    function nextSlide() {
        let nextIndex = currentSlideIndex + 1;
        if (nextIndex >= slides.length) nextIndex = 0;
        goToSlide(nextIndex);
    }

    // Reset slide interval on user interaction
    dotsContainer.addEventListener('click', () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 6000);
    });

    // ==========================================
    // 5. Leaflet Map Integration (With try-catch safety)
    // ==========================================
    try {
        const coords = [48.7885, 10.1086]; // Heidenheimer Straße 114, Oberkochen
        const map = L.map('map', {
            scrollWheelZoom: false
        }).setView(coords, 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Custom map marker icon
        const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: '<div style="background-color: #ff5e00; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        L.marker(coords, { icon: customIcon }).addTo(map)
            .bindPopup(`
                <div style="font-family: 'Outfit', sans-serif; text-align: center; color: #111827;">
                    <h4 style="margin: 0 0 5px 0; font-weight: 700; color: #ff5e00;">Das Autoservice</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: #4b5563;">Wolfgang Dietz</p>
                    <p style="margin: 3px 0 0 0; font-size: 0.8rem; font-weight: 600; color: #111827;">Heidenheimer Straße 114</p>
                </div>
            `)
            .openPopup();
    } catch (mapError) {
        console.warn("Leaflet map could not load (possibly offline or blocked):", mapError);
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center; background-color: var(--bg-tertiary); color: var(--text-secondary); border-radius: var(--radius-lg);">
                    <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: var(--accent); margin-bottom: 1rem;"></i>
                    <h4 style="margin-bottom: 0.5rem;">Karte konnte nicht geladen werden</h4>
                    <p style="font-size: 0.85rem; max-width: 300px; margin-bottom: 1rem;">Die interaktive Anfahrtskarte benötigt eine aktive Internetverbindung.</p>
                    <p style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">Adresse: Heidenheimer Straße 114, 73447 Oberkochen</p>
                </div>
            `;
        }
    }

    // ==========================================
    // 6. Interactive Service Booking Wizard
    // ==========================================
    const wizardState = {
        currentStep: 1,
        selectedServices: [],
        vehicle: {
            brand: '',
            model: '',
            year: '',
            plate: ''
        },
        dateTime: {
            date: '',
            timeSlot: ''
        },
        contact: {
            name: '',
            phone: '',
            email: '',
            message: ''
        }
    };

    const wizardSteps = Array.from(document.querySelectorAll('.wizard-step'));
    const stepIndicators = Array.from(document.querySelectorAll('.step-indicator'));
    const progressBar = document.querySelector('.wizard-progress-bar');
    
    const prevBtn = document.getElementById('wizard-prev');
    const nextBtn = document.getElementById('wizard-next');
    const successPanel = document.querySelector('.wizard-success');
    const wizardFormPanel = document.querySelector('.wizard-steps');
    const wizardActionsPanel = document.querySelector('.wizard-actions');

    // Step 1: Select service cards toggle
    const serviceCards = document.querySelectorAll('.service-select-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const serviceId = card.getAttribute('data-service');
            card.classList.toggle('selected');
            
            if (card.classList.contains('selected')) {
                wizardState.selectedServices.push(serviceId);
            } else {
                wizardState.selectedServices = wizardState.selectedServices.filter(id => id !== serviceId);
            }
            updateWizardNav();
        });
    });

    // Step 2: Sync form inputs to state
    const vehicleInputs = {
        brand: document.getElementById('vehicle-brand'),
        model: document.getElementById('vehicle-model'),
        year: document.getElementById('vehicle-year'),
        plate: document.getElementById('vehicle-plate')
    };

    Object.keys(vehicleInputs).forEach(key => {
        vehicleInputs[key].addEventListener('input', (e) => {
            wizardState.vehicle[key] = e.target.value.trim();
        });
    });

    // Step 3: Date picker and Time slots selection
    const dateInput = document.getElementById('appointment-date');
    const timeSlots = document.querySelectorAll('.time-slot');

    // Restrict date input to today and future dates only
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    dateInput.addEventListener('change', (e) => {
        wizardState.dateTime.date = e.target.value;
        // Reset time slot when date changes to force choosing again
        timeSlots.forEach(slot => slot.classList.remove('selected'));
        wizardState.dateTime.timeSlot = '';
        
        // Simulating booked slots for certain days
        const day = new Date(e.target.value).getDay();
        timeSlots.forEach((slot, index) => {
            // Saturdays (6) and Sundays (0) are closed
            if (day === 0 || day === 6) {
                slot.classList.add('disabled');
            } else {
                slot.classList.remove('disabled');
                // Randomly disable slots for demo realism
                if ((day + index) % 4 === 0) {
                    slot.classList.add('disabled');
                }
            }
        });
        updateWizardNav();
    });

    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (slot.classList.contains('disabled')) return;
            timeSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            wizardState.dateTime.timeSlot = slot.getAttribute('data-time');
            updateWizardNav();
        });
    });

    // Step 4: Contact details sync and Summary render
    const contactInputs = {
        name: document.getElementById('contact-name'),
        phone: document.getElementById('contact-phone'),
        email: document.getElementById('contact-email'),
        message: document.getElementById('contact-message')
    };

    Object.keys(contactInputs).forEach(key => {
        contactInputs[key].addEventListener('input', (e) => {
            wizardState.contact[key] = e.target.value.trim();
        });
    });

    // Main Wizard Navigation Trigger
    nextBtn.addEventListener('click', () => {
        if (validateStep(wizardState.currentStep)) {
            if (wizardState.currentStep < 4) {
                wizardState.currentStep++;
                showStep(wizardState.currentStep);
            } else {
                submitRequest();
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (wizardState.currentStep > 1) {
            wizardState.currentStep--;
            showStep(wizardState.currentStep);
        }
    });

    function showStep(step) {
        wizardSteps.forEach((s, idx) => {
            s.classList.toggle('active', idx === (step - 1));
        });
        
        // Update stepper indicators
        stepIndicators.forEach((ind, idx) => {
            ind.classList.toggle('active', idx === (step - 1));
            ind.classList.toggle('completed', idx < (step - 1));
        });

        // Update Progress bar percentage
        const progressPercent = ((step - 1) / (stepIndicators.length - 1)) * 100;
        progressBar.style.width = `${progressPercent}%`;

        // Render summary if entering step 4
        if (step === 4) {
            renderSummary();
        }

        updateWizardNav();
    }

    function updateWizardNav() {
        // Hide prev button on step 1
        prevBtn.style.display = wizardState.currentStep === 1 ? 'none' : 'block';
        
        // Toggle button text on last step
        nextBtn.innerHTML = wizardState.currentStep === 4 ? 'Jetzt Anfrage senden <i class="fas fa-paper-plane"></i>' : 'Weiter <i class="fas fa-arrow-right"></i>';

        // Check if next step is valid to enable/disable button
        const isValid = validateStep(wizardState.currentStep, false);
        if (isValid) {
            nextBtn.removeAttribute('disabled');
            nextBtn.style.opacity = '1';
        } else {
            nextBtn.setAttribute('disabled', 'true');
            nextBtn.style.opacity = '0.5';
        }
    }

    function validateStep(step, showErrors = true) {
        switch(step) {
            case 1:
                return wizardState.selectedServices.length > 0;
            case 2:
                // Brand and Model are mandatory
                const brandOk = wizardState.vehicle.brand.length >= 2;
                const modelOk = wizardState.vehicle.model.length >= 1;
                return brandOk && modelOk;
            case 3:
                // Date and Time slot selected
                return wizardState.dateTime.date !== '' && wizardState.dateTime.timeSlot !== '';
            case 4:
                // Contact Details validation
                const nameOk = wizardState.contact.name.length >= 3;
                const phoneOk = wizardState.contact.phone.length >= 6;
                const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wizardState.contact.email);
                return nameOk && phoneOk && emailOk;
            default:
                return false;
        }
    }

    function renderSummary() {
        const selectedServicesText = wizardState.selectedServices.map(id => {
            const el = document.querySelector(`.service-select-card[data-service="${id}"] .select-card-title`);
            return el ? el.innerText : id;
        }).join(', ');

        const formattedDate = wizardState.dateTime.date.split('-').reverse().join('.');

        document.getElementById('summary-services').innerText = selectedServicesText;
        document.getElementById('summary-vehicle').innerText = `${wizardState.vehicle.brand} ${wizardState.vehicle.model} ${wizardState.vehicle.year ? `(${wizardState.vehicle.year})` : ''} ${wizardState.vehicle.plate ? `[${wizardState.vehicle.plate}]` : ''}`;
        document.getElementById('summary-date').innerText = `${formattedDate} um ${wizardState.dateTime.timeSlot} Uhr`;
        document.getElementById('summary-name').innerText = wizardState.contact.name;
    }

    function submitRequest() {
        // Show loading spinner
        nextBtn.setAttribute('disabled', 'true');
        nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anfrage wird vorbereitet...';

        setTimeout(() => {
            // Hide form and navigation controls
            wizardFormPanel.style.display = 'none';
            wizardActionsPanel.style.display = 'none';
            
            // Show Success Panel
            successPanel.style.display = 'block';
            
            // Generate professional mailto link to Wolfgang Dietz
            triggerEmailClient();
        }, 1500);
    }

    function triggerEmailClient() {
        const emailTo = 'wolfgang.dietz@das-autoservice.de';
        const subject = encodeURIComponent('Terminanfrage über das-autoservice.de');
        
        const selectedServicesText = wizardState.selectedServices.map(id => {
            const el = document.querySelector(`.service-select-card[data-service="${id}"] .select-card-title`);
            return el ? el.innerText : id;
        }).join(', ');
        const formattedDate = wizardState.dateTime.date.split('-').reverse().join('.');

        let bodyText = `Hallo Wolfgang Dietz,

ich möchte einen Servicetermin für mein Fahrzeug anfragen. Hier sind meine Details:

=== ANFRAGEDATEN ===
Gewählte Services: ${selectedServicesText}
Fahrzeug: ${wizardState.vehicle.brand} ${wizardState.vehicle.model} ${wizardState.vehicle.year ? `(Baujahr: ${wizardState.vehicle.year})` : ''}
Kennzeichen: ${wizardState.vehicle.plate || 'Nicht angegeben'}

Wunschtermin: ${formattedDate} um ${wizardState.dateTime.timeSlot} Uhr

=== KONTAKTDATEN ===
Name: ${wizardState.contact.name}
Telefon: ${wizardState.contact.phone}
E-Mail: ${wizardState.contact.email}
${wizardState.contact.message ? `\nZusätzliche Nachricht:\n"${wizardState.contact.message}"` : ''}

Bitte senden Sie mir eine kurze Bestätigung für diesen Termin zu oder rufen Sie mich an, falls Rückfragen bestehen.

Mit freundlichen Grüßen,
${wizardState.contact.name}`;

        const body = encodeURIComponent(bodyText);
        
        // Open the email window after short delay so user sees success screen
        setTimeout(() => {
            window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
        }, 800);
    }

    // Connect secondary call to actions to launch Wizard
    const startWizardBtns = document.querySelectorAll('.start-wizard-btn');
    startWizardBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const wizardSection = document.getElementById('booking');
            wizardSection.scrollIntoView({ behavior: 'smooth' });
            
            // If they clicked a specific service link, pre-select it
            const serviceId = btn.getAttribute('data-select-service');
            if (serviceId) {
                // Deselect other cards
                serviceCards.forEach(card => card.classList.remove('selected'));
                wizardState.selectedServices = [serviceId];
                
                // Select specific card
                const card = document.querySelector(`.service-select-card[data-service="${serviceId}"]`);
                if (card) {
                    card.classList.add('selected');
                }
                showStep(1);
            }
        });
    });

    // ==========================================
    // 7. Parts Search Catalog & Modal Inquiry
    // ==========================================
    const partsCatalog = [
        { id: 1, name: 'Bremsbelagsatz, Scheibenbremse (Vorderachse)', artNr: 'BO-0986494001', brand: 'Bosch', uvp: '89,90 €', category: 'bremse bremsen beläge', suitability: 'VW Golf VII, Passat, Audi A3' },
        { id: 2, name: 'Bremsscheibe (Vorderachse, Belüftet)', artNr: 'BR-09.9145.11', brand: 'Brembo', uvp: '134,50 €', category: 'bremse bremsen scheiben', suitability: 'BMW 3er (F30), 4er (F32)' },
        { id: 3, name: 'Innenraumfilter (Aktivkohle)', artNr: 'MA-CUK29005', brand: 'Mann-Filter', uvp: '29,95 €', category: 'filter innenraum pollenfilter', suitability: 'VW Golf, Skoda Octavia, Seat Leon' },
        { id: 4, name: 'Luftfilter (Motor)', artNr: 'MA-C30005', brand: 'Mann-Filter', uvp: '24,50 €', category: 'filter luftfilter motor', suitability: 'Mercedes C-Klasse (W205), E-Klasse' },
        { id: 5, name: 'Starterbatterie Silver Dynamic (12V 70Ah)', artNr: 'VA-570901076', brand: 'Varta', uvp: '169,00 €', category: 'batterie starterbatterie strom', suitability: 'Universell für Start-Stopp-Fahrzeuge' },
        { id: 6, name: 'Zündkerze Iridium Tough', artNr: 'NG-4711', brand: 'NGK', uvp: '15,80 €', category: 'zündung zündkerze kerze', suitability: 'Audi A4 (B8), VW Golf TSI' },
        { id: 7, name: 'Motoröl 5W-30 Longlife 3 (5 Liter)', artNr: 'CA-EDGE-5W30-5L', brand: 'Castrol', uvp: '79,90 €', category: 'öl motoröl longlife', suitability: 'Viele Modelle (VW, BMW, Mercedes)' },
        { id: 8, name: 'Wischerblattsatz (Aerotwin)', artNr: 'BO-3397118929', brand: 'Bosch', uvp: '42,50 €', category: 'wischer scheibenwischer aerotwin', suitability: 'VW Golf VII, Tiguan, Skoda' }
    ];

    const partsSearchInput = document.getElementById('parts-search-input');
    const partsResultsGrid = document.getElementById('parts-results-grid');
    const partsModalOverlay = document.getElementById('parts-modal-overlay');
    const closePartsModal = document.getElementById('close-parts-modal');
    const cancelPartsModal = document.getElementById('cancel-parts-modal');
    const partsInquiryForm = document.getElementById('parts-inquiry-form');
    
    // Modal elements to populate
    const modalPartName = document.getElementById('modal-part-name');
    const modalPartMeta = document.getElementById('modal-part-meta');
    const modalPartUvp = document.getElementById('modal-part-uvp');
    let selectedPartForInquiry = null;

    // Load featured parts by default
    renderParts(partsCatalog.slice(0, 4));

    // Handle typing in search input
    partsSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query === '') {
            renderParts(partsCatalog.slice(0, 4)); // Show default if empty
            return;
        }

        const filtered = partsCatalog.filter(part => {
            return part.name.toLowerCase().includes(query) ||
                   part.brand.toLowerCase().includes(query) ||
                   part.artNr.toLowerCase().includes(query) ||
                   part.category.toLowerCase().includes(query) ||
                   part.suitability.toLowerCase().includes(query);
        });

        renderParts(filtered);
    });

    function renderParts(parts) {
        partsResultsGrid.innerHTML = '';

        if (parts.length === 0) {
            partsResultsGrid.innerHTML = `
                <div class="no-results-message glass-panel" style="width: 100%;">
                    <i class="fas fa-box-open" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem; display: block;"></i>
                    <h4>Keine passenden Teile gefunden</h4>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Probieren Sie andere Suchbegriffe wie „Bremse“, „Filter“, „Bosch“ oder Ihren Fahrzeughersteller.</p>
                </div>
            `;
            return;
        }

        parts.forEach(part => {
            const card = document.createElement('div');
            card.className = 'part-result-card glass-panel reveal active';
            
            let iconClass = 'fa-wrench';
            if (part.category.includes('filter')) iconClass = 'fa-filter';
            if (part.category.includes('bremse')) iconClass = 'fa-align-justify';
            if (part.category.includes('batterie')) iconClass = 'fa-car-battery';
            if (part.category.includes('öl')) iconClass = 'fa-oil-can';
            if (part.category.includes('wischer')) iconClass = 'fa-windshield';

            card.innerHTML = `
                <div class="part-result-info">
                    <div class="part-result-icon flex-center"><i class="fas ${iconClass}"></i></div>
                    <div class="part-details">
                        <h4>${part.name} <span class="part-brand-badge">${part.brand}</span></h4>
                        <p>Art-Nr: ${part.artNr} | Passend für: ${part.suitability}</p>
                    </div>
                </div>
                <div class="part-result-price-cta">
                    <div class="part-uvp-container">
                        <div class="part-uvp-label">Hersteller-UVP</div>
                        <div class="part-uvp-value">${part.uvp}</div>
                    </div>
                    <button class="btn btn-primary request-part-btn" data-id="${part.id}" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;">Angebot anfragen</button>
                </div>
            `;
            partsResultsGrid.appendChild(card);
        });

        // Add event listeners to the new buttons
        const requestBtns = partsResultsGrid.querySelectorAll('.request-part-btn');
        requestBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const partId = parseInt(btn.getAttribute('data-id'));
                const part = partsCatalog.find(p => p.id === partId);
                if (part) {
                    openInquiryModal(part);
                }
            });
        });
    }

    function openInquiryModal(part) {
        selectedPartForInquiry = part;
        modalPartName.innerText = part.name;
        modalPartMeta.innerText = `Hersteller: ${part.brand} | Art-Nr: ${part.artNr} | Passend für: ${part.suitability}`;
        modalPartUvp.innerText = part.uvp;

        // Auto-fill modal contact details if they already entered them in the main booking wizard
        if (wizardState.contact.name) document.getElementById('parts-client-name').value = wizardState.contact.name;
        if (wizardState.contact.phone) document.getElementById('parts-client-phone').value = wizardState.contact.phone;
        if (wizardState.contact.email) document.getElementById('parts-client-email').value = wizardState.contact.email;
        
        let vehicleText = '';
        if (wizardState.vehicle.brand) {
            vehicleText = `${wizardState.vehicle.brand} ${wizardState.vehicle.model}`;
            if (wizardState.vehicle.plate) vehicleText += `, Kennzeichen: ${wizardState.vehicle.plate}`;
        }
        if (vehicleText) {
            document.getElementById('parts-client-vehicle').value = vehicleText;
        }

        partsModalOverlay.classList.add('active');
    }

    function closeInquiryModal() {
        partsModalOverlay.classList.remove('active');
        selectedPartForInquiry = null;
    }

    closePartsModal.addEventListener('click', closeInquiryModal);
    cancelPartsModal.addEventListener('click', closeInquiryModal);
    partsModalOverlay.addEventListener('click', (e) => {
        if (e.target === partsModalOverlay) {
            closeInquiryModal();
        }
    });

    partsInquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const clientName = document.getElementById('parts-client-name').value.trim();
        const clientPhone = document.getElementById('parts-client-phone').value.trim();
        const clientEmail = document.getElementById('parts-client-email').value.trim();
        const clientVehicle = document.getElementById('parts-client-vehicle').value.trim();
        const contactPref = document.getElementById('parts-contact-pref').value;

        // Prepare mailto link
        const emailTo = 'wolfgang.dietz@das-autoservice.de';
        const subject = encodeURIComponent(`Teile-Preisanfrage: ${selectedPartForInquiry.name}`);
        
        let bodyText = `Hallo Wolfgang Dietz,

ich interessiere mich für folgendes Ersatzteil und möchte ein Angebot inkl. Montage anfragen:

=== ERSATZTEIL ===
Teil: ${selectedPartForInquiry.name}
Hersteller: ${selectedPartForInquiry.brand}
Artikelnummer: ${selectedPartForInquiry.artNr}
Hersteller-UVP: ${selectedPartForInquiry.uvp}

=== KONTAKTDATEN DES KUNDEN ===
Name: ${clientName}
Telefon: ${clientPhone}
E-Mail: ${clientEmail}
Fahrzeug/Kennzeichen: ${clientVehicle || 'Nicht angegeben'}
Gewünschte Rückmeldung per: ${contactPref}

Bitte teilen Sie mir mit, wie viel das Ersatzteil inklusive Montage in Ihrer Werkstatt kosten würde.

Mit freundlichen Grüßen,
${clientName}`;

        const body = encodeURIComponent(bodyText);
        
        // Open the email client
        window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;

        // Close modal
        closeInquiryModal();

        // Simple feedback alert
        alert('Vielen Dank! Ihre Preisanfrage wird über Ihr E-Mail-Programm vorbereitet. Bitte senden Sie die generierte E-Mail ab.');
    });

    // ==========================================
    // 8. Connection for Tire promotions
    // ==========================================
    const promoBookingBtns = document.querySelectorAll('.promo-booking-btn');
    promoBookingBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const promoType = btn.getAttribute('data-promo');
            
            // Scroll to wizard
            const wizardSection = document.getElementById('booking');
            wizardSection.scrollIntoView({ behavior: 'smooth' });

            // Deselect all services first
            serviceCards.forEach(card => card.classList.remove('selected'));
            wizardState.selectedServices = [];

            let commentText = '';
            if (promoType === 'achsvermessung') {
                // Select "Achsvermessung" card
                const card = document.querySelector('.service-select-card[data-service="vermessung"]');
                if (card) card.classList.add('selected');
                wizardState.selectedServices = ['vermessung'];
                commentText = 'Aktion: 3D-Achsvermessung für 59 €';
            } else if (promoType === 'reifen-achse') {
                // Select "Reifen" and "Achsvermessung" card
                const cardReifen = document.querySelector('.service-select-card[data-service="reifen"]');
                const cardVermessung = document.querySelector('.service-select-card[data-service="vermessung"]');
                if (cardReifen) cardReifen.classList.add('selected');
                if (cardVermessung) cardVermessung.classList.add('selected');
                wizardState.selectedServices = ['reifen', 'vermessung'];
                commentText = 'Aktion: Komplettpaket Radwechsel + 3D-Achsvermessung für 89 €';
            }

            // Pre-populate Step 4 message
            document.getElementById('contact-message').value = commentText;
            wizardState.contact.message = commentText;

            // Start at Step 1
            showStep(1);
        });
    });

    // ==========================================
    // 9. Reifen-Finder (Reifen Göggel Wholesale simulation)
    // ==========================================
    const tireFinderForm = document.getElementById('tire-finder-form');
    const tireLoading = document.getElementById('tire-loading');
    const tireResultsContainer = document.getElementById('tire-results-container');
    const tireResultsGrid = document.getElementById('tire-results-grid');
    const tireModalOverlay = document.getElementById('tire-modal-overlay');
    const closeTireModalBtn = document.getElementById('close-tire-modal');
    const cancelTireModal = document.getElementById('cancel-tire-modal');
    const tireInquiryForm = document.getElementById('tire-inquiry-form');

    // Modal elements to populate
    const modalTireName = document.getElementById('modal-tire-name');
    const modalTireMeta = document.getElementById('modal-tire-meta');
    const modalTirePrice = document.getElementById('modal-tire-price');
    let selectedTireForInquiry = null;

    // Standard speed & load indices based on width
    function getTireSpecs(width, aspect, size) {
        if (parseInt(width) >= 225) return '94Y XL';
        if (parseInt(size) >= 17) return '91W';
        return '91V';
    }

    // Dynamic Tire Catalog generator to match user sizes
    function generateTireOffers(width, aspect, size, type, brandClass) {
        const specs = getTireSpecs(width, aspect, size);
        const dimension = `${width}/${aspect} R${size} ${specs}`;
        const typeLabel = type === 'sommer' ? 'Sommerreifen' : (type === 'winter' ? 'Winterreifen' : 'Allwetterreifen');
        
        // Base price calculation to make it look realistic
        const basePrice = Math.round(50 + (parseInt(size) - 15) * 12 + (parseInt(width) - 175) * 0.4);

        const premiumOffers = [
            {
                brand: 'Continental',
                model: type === 'sommer' ? 'PremiumContact 6' : (type === 'winter' ? 'WinterContact TS 870' : 'AllSeasonContact'),
                price: basePrice + 25,
                class: 'premium',
                label: 'Testsieger',
                ratings: { fuel: 'C', wet: 'A', noise: '71 dB' }
            },
            {
                brand: 'Michelin',
                model: type === 'sommer' ? 'Pilot Sport 4' : (type === 'winter' ? 'Alpin 6' : 'CrossClimate 2'),
                price: basePrice + 35,
                class: 'premium',
                label: 'Langlebig',
                ratings: { fuel: 'B', wet: 'A', noise: '69 dB' }
            },
            {
                brand: 'Hankook',
                model: type === 'sommer' ? 'Ventus Prime 4' : (type === 'winter' ? 'Winter i*cept RS3' : 'Kinergy 4S2'),
                price: basePrice + 10,
                class: 'premium',
                label: 'Preis-Leistung',
                ratings: { fuel: 'C', wet: 'B', noise: '70 dB' }
            }
        ];

        const budgetOffers = [
            {
                brand: 'Nexen',
                model: type === 'sommer' ? 'N\'Blue HD Plus' : (type === 'winter' ? 'Winguard Snow\'G 3' : 'N\'Blue 4Season'),
                price: basePrice - 10,
                class: 'quality',
                label: 'Günstig',
                ratings: { fuel: 'D', wet: 'B', noise: '72 dB' }
            },
            {
                brand: 'Kumho',
                model: type === 'sommer' ? 'Ecowing ES31' : (type === 'winter' ? 'WinterCraft WP52' : 'Solus 4S HA32'),
                price: basePrice - 5,
                class: 'quality',
                label: 'Bewährt',
                ratings: { fuel: 'C', wet: 'C', noise: '71 dB' }
            }
        ];

        let finalOffers = [];
        if (brandClass === 'all') {
            finalOffers = [premiumOffers[0], premiumOffers[2], budgetOffers[0]];
        } else if (brandClass === 'premium') {
            finalOffers = premiumOffers;
        } else {
            finalOffers = budgetOffers;
        }

        return finalOffers.map((item, idx) => ({
            id: idx + 1,
            brand: item.brand,
            name: `${item.brand} ${item.model}`,
            dimension: dimension,
            type: typeLabel,
            price: `${item.price},90 €`,
            class: item.class,
            label: item.label,
            ratings: item.ratings
        }));
    }

    tireFinderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const width = document.getElementById('tire-width').value;
        const aspect = document.getElementById('tire-aspect').value;
        const size = document.getElementById('tire-size').value;
        const type = document.getElementById('tire-type').value;
        const brandClass = document.getElementById('tire-brand-class').value;

        // Hide old results, show loader
        tireResultsContainer.style.display = 'none';
        tireLoading.style.display = 'block';

        // Scroll loader into view slightly so they see it working
        tireLoading.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Simulate B2B Wholesale server connection
        setTimeout(() => {
            tireLoading.style.display = 'none';
            
            const offers = generateTireOffers(width, aspect, size, type, brandClass);
            renderTires(offers);
            
            tireResultsContainer.style.display = 'block';
            tireResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 1600);
    });

    function renderTires(offers) {
        tireResultsGrid.innerHTML = '';

        offers.forEach(offer => {
            const card = document.createElement('div');
            card.className = 'part-result-card glass-panel reveal active';
            if (offer.class === 'premium') {
                card.style.borderLeft = '4px solid var(--accent)';
            }

            card.innerHTML = `
                <div class="part-result-info" style="width: 100%;">
                    <div class="part-result-icon flex-center" style="background-color: var(--bg-secondary); color: var(--accent); font-size: 2rem;">
                        <i class="fas fa-circle-notch"></i>
                    </div>
                    <div class="part-details" style="flex-grow: 1;">
                        <h4 style="display: flex; align-items: center; justify-content: space-between;">
                            <span>${offer.name} <span class="part-brand-badge">${offer.type}</span></span>
                            ${offer.label ? `<span class="part-brand-badge" style="background-color: var(--accent-glow); border-color: var(--accent); color: var(--accent);">${offer.label}</span>` : ''}
                        </h4>
                        <p>Größe: ${offer.dimension} | EU-Label: Kraftstoff ${offer.ratings.fuel} / Nasshaftung ${offer.ratings.wet} / Geräusch ${offer.ratings.noise}</p>
                    </div>
                </div>
                <div class="part-result-price-cta">
                    <div class="part-uvp-container">
                        <div class="part-uvp-label">Wholesale Schätzpreis</div>
                        <div class="part-uvp-value" style="color: var(--accent);">${offer.price}</div>
                    </div>
                    <button class="btn btn-primary request-tire-btn" data-id="${offer.id}" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;">Angebot anfragen</button>
                </div>
            `;
            
            // Save offers array temporarily on grid element for lookup
            tireResultsGrid.offers = offers;
            tireResultsGrid.appendChild(card);
        });

        // Add event listeners to request buttons
        const requestBtns = tireResultsGrid.querySelectorAll('.request-tire-btn');
        requestBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const offerId = parseInt(btn.getAttribute('data-id'));
                const offer = tireResultsGrid.offers.find(o => o.id === offerId);
                if (offer) {
                    openTireModal(offer);
                }
            });
        });
    }

    function openTireModal(offer) {
        selectedTireForInquiry = offer;
        modalTireName.innerText = offer.name;
        modalTireMeta.innerText = `Größe: ${offer.dimension} | ${offer.type}`;
        modalTirePrice.innerText = offer.price;

        // Auto-fill modal details from wizard state
        if (wizardState.contact.name) document.getElementById('tire-client-name').value = wizardState.contact.name;
        if (wizardState.contact.phone) document.getElementById('tire-client-phone').value = wizardState.contact.phone;
        if (wizardState.contact.email) document.getElementById('tire-client-email').value = wizardState.contact.email;
        if (wizardState.vehicle.brand) {
            document.getElementById('tire-client-vehicle').value = `${wizardState.vehicle.brand} ${wizardState.vehicle.model}`;
        }

        tireModalOverlay.classList.add('active');
    }

    function closeTireModal() {
        tireModalOverlay.classList.remove('active');
        selectedTireForInquiry = null;
    }

    closeTireModalBtn.addEventListener('click', closeTireModal);
    cancelTireModal.addEventListener('click', closeTireModal);
    tireModalOverlay.addEventListener('click', (e) => {
        if (e.target === tireModalOverlay) {
            closeTireModal();
        }
    });

    tireInquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const clientName = document.getElementById('tire-client-name').value.trim();
        const clientPhone = document.getElementById('tire-client-phone').value.trim();
        const clientEmail = document.getElementById('tire-client-email').value.trim();
        const clientVehicle = document.getElementById('tire-client-vehicle').value.trim();
        const quantity = document.getElementById('tire-quantity').value;
        const servicePref = document.getElementById('tire-service-pref').value;

        // Prepare mailto link
        const emailTo = 'wolfgang.dietz@das-autoservice.de';
        const subject = encodeURIComponent(`Reifen-Preisanfrage über Goeggel-Wholesale: ${selectedTireForInquiry.name}`);
        
        let bodyText = `Hallo Wolfgang Dietz,

ich interessiere mich für folgendes Reifenangebot und möchte einen Preis inkl. Montage anfragen:

=== GEWÄHLTER REIFEN (REIFEN GÖGGEL) ===
Reifen: ${selectedTireForInquiry.name}
Dimension: ${selectedTireForInquiry.dimension}
Typ: ${selectedTireForInquiry.type}
Wholesale-Preis (UVP): ${selectedTireForInquiry.price}

=== ANFRAGEDETAILS ===
Menge: ${quantity} Stück
Montage-Option: ${servicePref}

=== KONTAKTDATEN DES KUNDEN ===
Name: ${clientName}
Telefon: ${clientPhone}
E-Mail: ${clientEmail}
Fahrzeug: ${clientVehicle || 'Nicht angegeben'}

Bitte loggen Sie sich in Ihr Reifen Göggel Portal ein, prüfen Sie die aktuellen Tageskonditionen und senden Sie mir ein verbindliches Angebot per E-Mail oder rufen Sie mich an.

Mit freundlichen Grüßen,
${clientName}`;

        const body = encodeURIComponent(bodyText);
        
        // Open the email client
        window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;

        // Close modal
        closeTireModal();

        // Feedback alert
        alert('Vielen Dank! Ihre Reifen-Preisanfrage wird über Ihr E-Mail-Programm vorbereitet. Bitte senden Sie die generierte E-Mail ab.');
    });

    // ==========================================
    // 10. Gebrauchtwagen (Fahrzeugverkauf)
    // ==========================================
    const carsCatalog = [
        {
            id: 1,
            brand: 'Volkswagen',
            model: 'Golf VII Variant 2.0 TDI Comfortline',
            ez: '08/2018',
            km: '94.500 km',
            power: '150 PS (110 kW)',
            fuel: 'Diesel',
            transmission: 'Automatik (DSG)',
            price: '16.890 €',
            image: 'img/photo1.jpg',
            type: 'eigene',
            description: 'Sehr gepflegter Golf Variant aus 1. Hand. Lückenlos scheckheftgepflegt bei uns. 8-fach bereift auf Alufelgen, HU/AU neu, abnehmbare Anhängerkupplung.'
        },
        {
            id: 2,
            brand: 'Audi',
            model: 'A4 Avant 2.0 TFSI ultra S line',
            ez: '04/2019',
            km: '78.200 km',
            power: '190 PS (140 kW)',
            fuel: 'Benzin',
            transmission: 'Automatik (S tronic)',
            price: '24.950 €',
            image: 'img/photo2.jpg',
            type: 'eigene',
            description: 'Sportlicher Kombi in Mythosschwarz Metallic mit S line Sportpaket. Virtual Cockpit, LED-Scheinwerfer, MMI Navigation plus, Einparkhilfe plus.'
        },
        {
            id: 3,
            brand: 'Ford',
            model: 'Fiesta 1.0 EcoBoost Cool & Connect',
            ez: '11/2017',
            km: '62.100 km',
            power: '100 PS (74 kW)',
            fuel: 'Benzin',
            transmission: 'Schaltgetriebe',
            price: '9.490 €',
            image: 'img/photo3.jpg',
            type: 'kundenauftrag',
            description: 'Im Kundenauftrag: Zuverlässiger Stadtflitzer mit spritzigem EcoBoost Motor. Beheizbare Frontscheibe, Klimaanlage, Apple CarPlay/Android Auto, Tempomat.'
        },
        {
            id: 4,
            brand: 'BMW',
            model: '320d Touring Luxury Line (F31)',
            ez: '03/2016',
            km: '142.000 km',
            power: '190 PS (140 kW)',
            fuel: 'Diesel',
            transmission: 'Automatik (Steptronic)',
            price: '14.200 €',
            image: 'img/photo4.jpg',
            type: 'kundenauftrag',
            description: 'Im Kundenauftrag: Komfortabler Reisekombi mit Lederausstattung, Navigationssystem Professional, Panoramadach, Spurwechselwarnung. Neuer Service durchgeführt.'
        }
    ];

    const carsGrid = document.getElementById('cars-grid');
    const filterButtons = document.querySelectorAll('.cars-filter-container .filter-btn');
    const carModalOverlay = document.getElementById('car-modal-overlay');
    const closeCarModalBtn = document.getElementById('close-car-modal');
    const cancelCarModalBtn = document.getElementById('cancel-car-modal');
    const carInquiryForm = document.getElementById('car-inquiry-form');

    // Modal elements to populate
    const modalCarName = document.getElementById('modal-car-name');
    const modalCarMeta = document.getElementById('modal-car-meta');
    const modalCarPrice = document.getElementById('modal-car-price');
    let selectedCarForInquiry = null;

    // Load all cars by default
    renderCars('all');

    // Filter event listeners
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            renderCars(filterValue);
        });
    });

    function renderCars(filter) {
        if (!carsGrid) return;
        carsGrid.innerHTML = '';

        const filteredCars = carsCatalog.filter(car => {
            if (filter === 'all') return true;
            return car.type === filter;
        });

        if (filteredCars.length === 0) {
            carsGrid.innerHTML = `
                <div class="no-results-message glass-panel" style="grid-column: 1 / -1;">
                    <i class="fas fa-car" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem; display: block;"></i>
                    <h4>Aktuell keine Fahrzeuge in dieser Kategorie</h4>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Bitte schauen Sie später wieder vorbei oder kontaktieren Sie uns direkt bezüglich Ihres Wunschfahrzeugs.</p>
                </div>
            `;
            return;
        }

        filteredCars.forEach(car => {
            const card = document.createElement('div');
            card.className = 'car-card glass-panel reveal active';
            
            const badgeText = car.type === 'eigene' ? 'Eigene Fahrzeuge' : 'In Kundenauftrag';
            const badgeClass = car.type === 'eigene' ? 'badge-eigene' : 'badge-kundenauftrag';

            card.innerHTML = `
                <div class="car-img-wrapper">
                    <span class="car-badge ${badgeClass}">${badgeText}</span>
                    <img src="${car.image}" alt="${car.brand} ${car.model}" class="car-img" loading="lazy">
                </div>
                <div class="car-info">
                    <h3>
                        <span>${car.brand} ${car.model}</span>
                        <span class="car-price">${car.price}</span>
                    </h3>
                    <div class="car-specs">
                        <div class="spec-item">
                            <span class="spec-label">Erstzulassung</span>
                            <span class="spec-value">${car.ez}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Kilometerstand</span>
                            <span class="spec-value">${car.km}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Leistung</span>
                            <span class="spec-value">${car.power}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Kraftstoff</span>
                            <span class="spec-value">${car.fuel}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Getriebe</span>
                            <span class="spec-value">${car.transmission}</span>
                        </div>
                    </div>
                    <p class="car-description">${car.description}</p>
                    <div class="car-card-footer">
                        <button class="btn btn-primary request-car-btn" data-id="${car.id}">Probefahrt / Besichtigung anfragen <i class="fas fa-calendar-day"></i></button>
                    </div>
                </div>
            `;
            carsGrid.appendChild(card);
        });

        // Add inquiry button click listeners
        const requestCarBtns = carsGrid.querySelectorAll('.request-car-btn');
        requestCarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const carId = parseInt(btn.getAttribute('data-id'));
                const car = carsCatalog.find(c => c.id === carId);
                if (car) {
                    openCarInquiryModal(car);
                }
            });
        });
    }

    function openCarInquiryModal(car) {
        if (!carModalOverlay) return;
        selectedCarForInquiry = car;
        modalCarName.innerText = `${car.brand} ${car.model}`;
        const typeText = car.type === 'eigene' ? 'Eigene Fahrzeuge' : 'In Kundenauftrag';
        modalCarMeta.innerText = `EZ: ${car.ez} | ${car.km} | ${typeText}`;
        modalCarPrice.innerText = car.price;

        // Auto-fill customer info if already cached
        if (wizardState.contact.name) document.getElementById('car-client-name').value = wizardState.contact.name;
        if (wizardState.contact.phone) document.getElementById('car-client-phone').value = wizardState.contact.phone;
        if (wizardState.contact.email) document.getElementById('car-client-email').value = wizardState.contact.email;

        carModalOverlay.classList.add('active');
    }

    function closeCarInquiryModal() {
        if (!carModalOverlay) return;
        carModalOverlay.classList.remove('active');
        selectedCarForInquiry = null;
    }

    if (closeCarModalBtn) closeCarModalBtn.addEventListener('click', closeCarInquiryModal);
    if (cancelCarModalBtn) cancelCarModalBtn.addEventListener('click', closeCarInquiryModal);
    if (carModalOverlay) {
        carModalOverlay.addEventListener('click', (e) => {
            if (e.target === carModalOverlay) {
                closeCarInquiryModal();
            }
        });
    }

    if (carInquiryForm) {
        carInquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const clientName = document.getElementById('car-client-name').value.trim();
            const clientPhone = document.getElementById('car-client-phone').value.trim();
            const clientEmail = document.getElementById('car-client-email').value.trim();
            const clientMessage = document.getElementById('car-client-message').value.trim();

            const emailTo = 'wolfgang.dietz@das-autoservice.de';
            const subject = encodeURIComponent(`Fahrzeuganfrage: ${selectedCarForInquiry.brand} ${selectedCarForInquiry.model}`);
            
            const typeText = selectedCarForInquiry.type === 'eigene' ? 'Eigener Fahrzeugbestand' : 'In Kundenauftrag (Vermittlung)';

            let bodyText = `Hallo Wolfgang Dietz,
            
ich interessiere mich für folgendes Fahrzeugangebot und möchte eine Besichtigung bzw. eine Probefahrt vereinbaren:

=== FAHRZEUGDETAILS ===
Modell: ${selectedCarForInquiry.brand} ${selectedCarForInquiry.model}
Kategorie: ${typeText}
Erstzulassung: ${selectedCarForInquiry.ez}
Kilometerstand: ${selectedCarForInquiry.km}
Leistung: ${selectedCarForInquiry.power}
Getriebe: ${selectedCarForInquiry.transmission}
Kaufpreis: ${selectedCarForInquiry.price}

=== KONTAKTDATEN DES KUNDEN ===
Name: ${clientName}
Telefon: ${clientPhone}
E-Mail: ${clientEmail}

${clientMessage ? `Nachricht des Kunden:\n"${clientMessage}"` : ''}

Bitte teilen Sie mir mit, wann ein Besichtigungstermin möglich wäre.

Mit freundlichen Grüßen,
${clientName}`;

            const body = encodeURIComponent(bodyText);
            
            // Open the email client
            window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;

            // Close modal
            closeCarInquiryModal();

            // Simple feedback alert
            alert('Vielen Dank! Ihre Fahrzeuganfrage wird über Ihr E-Mail-Programm vorbereitet. Bitte senden Sie die generierte E-Mail ab.');
        });
    }

    // Initialize nav buttons state
    updateWizardNav();
});
