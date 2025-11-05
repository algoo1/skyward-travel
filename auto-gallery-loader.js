/**
 * Auto Gallery Loader System
 * Loads images from predefined lists for each package and day
 */

class AutoGalleryLoader {
    constructor() {
        this.galleries = new Map();
        this.currentSlides = new Map();
        this.imageDatabase = this.initializeImageDatabase();
    }

    /**
     * Image database for each package and day
     */
    initializeImageDatabase() {
        return {
            'grand-egypt-explorer': {
                '1': [
                    '1_Pyramid of Khufu and the Sphinx.jpg',
                    '2_Pyramid of Khufu and the Sphinx (close shot).jpg',
                    '3-The Giza pyramids.jpg',
                    '4- khufu.jpg',
                    '5_A giant ancient Egyptian statue stands in the grand hall of the Grand Egyptian Museum..jpeg',
                    '6_A majestic Egyptian statue stands in a dimly lit hall with a glowing pyramid-shaped wall..png',
                    '7-Gem.jpeg'
                ],
                '2': [
                    '1-alex.jpeg',
                    '2-Citadel of Qaitbay, Alexandria.jpeg',
                    '3-Qaitbay Citadel by the sea.jpeg',
                    '4_Citadel of Qaitbay, Alexandria (1).jpg',
                    '5-Citadel of Qaitbay, Alexandria (2).jpg',
                    '6-Citadel of Qaitbay, Alexandria (4).jpg',
                    '7-Citadel of Qaitbay, Alexandria (5).jpg',
                    '8-Citadel of Qaitbay, Alexandria (3).jpg',
                    '9-Interior of the Greek Orthodox Church of Saint Sabbas, Alexandria.jpeg',
                    '10-Church_of_Saint_Sabbas.jpeg',
                    '11_Alexandria Stadium.jpeg',
                    '12_Bibliotheca Alexandrina.jpg'
                ],
                '3': [
                    '1-Waterfall in the Faiyum Oasis, Egypt.jpeg',
                    '2-Desert rock formations in the White Desert, Faiyum.jpeg',
                    '3-Lake Qarun and palm groves in Faiyum Oasis.jpeg',
                    '4-Dinosaur fossil exhibit at the Faiyum Paleontological Museum.jpeg',
                    '5-Lake Qarun and surrounding desert landscape in Faiyum.jpeg',
                    '6-Winding waterways of the Faiyum Oasis.jpeg',
                    '7-Sunset over Lake Qarun, Faiyum.jpeg',
                    '8-Desert safari in the White Desert, Faiyum.jpeg',
                    '9-Unique rock formations in the White Desert, Faiyum.jpeg',
                    '10-Camping under the stars in the White Desert, Faiyum.jpeg'
                ],
                '4': [
                    '1-Luxor Temple at sunset.jpeg',
                    '2-Karnak Temple complex, Luxor.jpeg',
                    '3-Valley of the Kings, Luxor.jpeg',
                    '4-Tomb of Tutankhamun, Valley of the Kings.jpeg',
                    '5-Hieroglyphs in the Valley of the Kings.jpeg',
                    '6-Colossi of Memnon, Luxor.jpeg',
                    '7-Hatshepsut Temple, Luxor.jpeg',
                    '8-Luxor Temple illuminated at night.jpeg',
                    '9-Hot air balloon over Luxor.jpeg',
                    '10-Nile River cruise near Luxor.jpeg',
                    '11-Traditional felucca sailing on the Nile.jpeg',
                    '12-Luxor Museum artifacts.jpeg',
                    '13-Banana Island, Luxor.jpeg'
                ],
                '5': [
                    '1-Aswan High Dam.jpeg',
                    '2-Philae Temple, Aswan.jpeg',
                    '3-Unfinished Obelisk, Aswan.jpeg',
                    '4-Nubian village, Aswan.jpeg',
                    '5-Elephantine Island, Aswan.jpeg',
                    '6-Felucca sailing around Elephantine Island.jpeg',
                    '7-Aswan Botanical Garden.jpeg',
                    '8-Sunset over the Nile in Aswan.jpeg',
                    '9-Traditional Nubian house.jpeg',
                    '10-Aswan Souk (market).jpeg',
                    '11-Nile cataracts near Aswan.jpeg',
                    '12-Abu Simbel temples.jpeg',
                    '13-Lake Nasser, Abu Simbel.jpeg',
                    '14-Ramses II statue at Abu Simbel.jpeg',
                    '15-Interior of Abu Simbel temple.jpeg',
                    '16-Abu Simbel sound and light show.jpeg',
                    '17-Desert landscape near Abu Simbel.jpeg',
                    '18-Traditional Nubian music performance.jpeg',
                    '19-Aswan corniche along the Nile.jpeg',
                    '20-Granite quarries of Aswan.jpeg',
                    '21-Tombs of the Nobles, Aswan.jpeg',
                    '22-Monastery of St. Simeon, Aswan.jpeg',
                    '23-Kitchener Island, Aswan.jpeg'
                ],
                '6': [
                    '1-Red Sea coral reef.jpeg',
                    '2-Snorkeling in the Red Sea.jpeg',
                    '3-Colorful fish in Red Sea waters.jpeg',
                    '4-Hurghada marina.jpeg',
                    '5-Desert safari near Hurghada.jpeg',
                    '6-Bedouin camp in the Eastern Desert.jpeg',
                    '7-Camel riding in the desert.jpeg',
                    '8-Red Sea sunset.jpeg',
                    '9-Diving with dolphins in the Red Sea.jpeg',
                    '10-Giftun Island, Hurghada.jpeg',
                    '11-Traditional Bedouin dinner.jpeg',
                    '12-Quad biking in the desert.jpeg',
                    '13-Red Sea beach resort.jpeg',
                    '14-Underwater coral garden.jpeg',
                    '15-Desert stargazing experience.jpeg',
                    '16-Traditional fishing boat in the Red Sea.jpeg',
                    '17-Hurghada old town.jpeg',
                    '18-Red Sea aquarium.jpeg',
                    '19-Parasailing over the Red Sea.jpeg',
                    '20-Desert oasis near Hurghada.jpeg'
                ],
                '7': [
                    '1-Cairo skyline.jpeg',
                    '2-Khan el-Khalili bazaar.jpeg',
                    '3-Islamic Cairo architecture.jpeg',
                    '4-Citadel of Saladin, Cairo.jpeg',
                    '5-Mosque of Muhammad Ali, Cairo.jpeg',
                    '6-Coptic Cairo.jpeg',
                    '7-Hanging Church, Old Cairo.jpeg',
                    '8-Ben Ezra Synagogue, Cairo.jpeg',
                    '9-Egyptian Museum, Cairo.jpeg',
                    '10-Tutankhamun mask at Egyptian Museum.jpeg',
                    '11-Nile Corniche, Cairo.jpeg',
                    '12-Traditional coffee house in Cairo.jpeg',
                    '13-Al-Azhar Mosque, Cairo.jpeg',
                    '14-Sultan Hassan Mosque, Cairo.jpeg',
                    '15-Cairo Tower.jpeg',
                    '16-Felucca ride on the Nile in Cairo.jpeg',
                    '17-Traditional Egyptian cuisine.jpeg',
                    '18-Papyrus making demonstration.jpeg'
                ]
            },
            'luxor-aswan-tour': {
                '1': [
                    '1-Luxor Temple at sunset.jpeg',
                    '2-Karnak Temple complex, Luxor.jpeg',
                    '3-Avenue of Sphinxes, Luxor.jpeg',
                    '4-Luxor Temple illuminated at night.jpeg',
                    '5-Hieroglyphs at Karnak Temple.jpeg',
                    '6-Obelisk at Luxor Temple.jpeg',
                    '7-Hypostyle Hall, Karnak Temple.jpeg',
                    '8-Sacred Lake, Karnak Temple.jpeg',
                    '9-Sound and light show at Karnak.jpeg',
                    '10-Traditional horse carriage in Luxor.jpeg'
                ],
                '2': [
                    '1-Valley of the Kings, Luxor.jpeg',
                    '2-Tomb of Tutankhamun, Valley of the Kings.jpeg',
                    '3-Hieroglyphs in the Valley of the Kings.jpeg',
                    '4-Hatshepsut Temple, Luxor.jpeg',
                    '5-Colossi of Memnon, Luxor.jpeg',
                    '6-Hot air balloon over Luxor.jpeg',
                    '7-Valley of the Queens.jpeg',
                    '8-Tomb paintings in Valley of the Kings.jpeg',
                    '9-Deir el-Medina workers village.jpeg',
                    '10-Ramesseum temple, Luxor.jpeg',
                    '11-Medinet Habu temple.jpeg',
                    '12-Luxor West Bank landscape.jpeg'
                ],
                '3': [
                    '1-Edfu Temple dedicated to Horus.jpeg',
                    '2-Kom Ombo Temple.jpeg',
                    '3-Nile cruise ship.jpeg',
                    '4-Traditional felucca sailing.jpeg',
                    '5-Nile River landscape.jpeg',
                    '6-Temple of Sobek and Haroeris, Kom Ombo.jpeg',
                    '7-Crocodile mummies at Kom Ombo.jpeg',
                    '8-Nile sunset from cruise ship.jpeg',
                    '9-Traditional Nubian village.jpeg',
                    '10-Nile cruise dining experience.jpeg',
                    '11-Temple reliefs at Edfu.jpeg',
                    '12-Nile cruise entertainment.jpeg'
                ],
                '4': [
                    '1-Aswan High Dam.jpeg',
                    '2-Philae Temple, Aswan.jpeg',
                    '3-Unfinished Obelisk, Aswan.jpeg',
                    '4-Nubian village, Aswan.jpeg',
                    '5-Elephantine Island, Aswan.jpeg',
                    '6-Abu Simbel temples.jpeg',
                    '7-Ramses II statue at Abu Simbel.jpeg',
                    '8-Interior of Abu Simbel temple.jpeg',
                    '9-Lake Nasser, Abu Simbel.jpeg',
                    '10-Aswan Botanical Garden.jpeg',
                    '11-Traditional Nubian house.jpeg',
                    '12-Aswan Souk (market).jpeg',
                    '13-Felucca sailing around Elephantine Island.jpeg',
                    '14-Sunset over the Nile in Aswan.jpeg',
                    '15-Abu Simbel sound and light show.jpeg'
                ]
            }
        };
    }

    /**
     * Initialize all galleries on the page
     */
    async initializeGalleries() {
        const galleryContainers = document.querySelectorAll('[data-gallery-day]');
        const packagePath = this.getPackagePath();
        
        for (const container of galleryContainers) {
            const dayNumber = container.getAttribute('data-gallery-day');
            if (dayNumber) {
                await this.loadGalleryForDay(container, packagePath, dayNumber);
            }
        }
    }

    /**
     * Get the current package path from URL
     */
    getPackagePath() {
        const path = window.location.pathname;
        return path.includes('grand-egypt-explorer') ? 'grand-egypt-explorer' : 'luxor-aswan-tour';
    }

    /**
     * Load gallery for a specific day
     */
    async loadGalleryForDay(container, packagePath, dayNumber) {
        try {
            const images = this.getImagesForDay(packagePath, dayNumber);
            if (images && images.length > 0) {
                this.createGallery(container, images, dayNumber);
                this.setupGalleryControls(container, dayNumber);
            } else {
                this.createEmptyGallery(container);
            }
        } catch (error) {
            console.error(`Error loading gallery for day ${dayNumber}:`, error);
            this.createEmptyGallery(container);
        }
    }

    /**
     * Get images for a specific package and day
     */
    getImagesForDay(packagePath, dayNumber) {
        const packageData = this.imageDatabase[packagePath];
        if (packageData && packageData[dayNumber]) {
            return packageData[dayNumber].map(imageName => {
                return `/packages/${packagePath}/day ${dayNumber}/${imageName}`;
            });
        }
        return [];
    }

    /**
     * Generate alt text for image
     */
    generateAltText(imageName) {
        return imageName
            .replace(/\.(jpg|jpeg|png|gif)$/i, '')
            .replace(/[-_]/g, ' ')
            .replace(/^\d+[-_]?/, '')
            .trim();
    }

    /**
     * Create gallery HTML structure
     */
    createGallery(container, images, dayNumber) {
        const galleryHTML = `
            <div class="gallery-container" data-day="${dayNumber}">
                <div class="gallery-slides">
                    ${images.map((imagePath, index) => `
                        <div class="gallery-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                            <img src="${imagePath}" alt="${this.generateAltText(imagePath)}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
                <button class="gallery-prev" data-day="${dayNumber}">‹</button>
                <button class="gallery-next" data-day="${dayNumber}">›</button>
                <div class="gallery-indicators">
                    ${images.map((_, index) => `
                        <button class="gallery-indicator ${index === 0 ? 'active' : ''}" data-slide="${index}" data-day="${dayNumber}"></button>
                    `).join('')}
                </div>
                <div class="gallery-counter">
                    <span class="current-slide">1</span> / <span class="total-slides">${images.length}</span>
                </div>
            </div>
        `;
        
        container.innerHTML = galleryHTML;
        this.galleries.set(dayNumber, images);
        this.currentSlides.set(dayNumber, 0);
    }

    /**
     * Create empty gallery placeholder
     */
    createEmptyGallery(container) {
        container.innerHTML = `
            <div class="gallery-container empty">
                <p>No images available for this day</p>
            </div>
        `;
    }

    /**
     * Setup gallery controls (navigation, indicators, keyboard, touch)
     */
    setupGalleryControls(container, dayNumber) {
        // Navigation buttons
        const prevBtn = container.querySelector('.gallery-prev');
        const nextBtn = container.querySelector('.gallery-next');
        const indicators = container.querySelectorAll('.gallery-indicator');

        if (prevBtn) prevBtn.addEventListener('click', () => this.previousSlide(dayNumber));
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide(dayNumber));

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(dayNumber, index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousSlide(dayNumber);
            if (e.key === 'ArrowRight') this.nextSlide(dayNumber);
        });

        // Touch controls
        this.setupTouchControls(container, dayNumber);
        
        // Auto-play
        this.setupAutoPlay(container, dayNumber);
    }

    /**
     * Setup touch controls for mobile
     */
    setupTouchControls(container, dayNumber) {
        let startX = 0;
        let endX = 0;

        const slides = container.querySelector('.gallery-slides');
        if (!slides) return;

        slides.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        slides.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    this.nextSlide(dayNumber);
                } else {
                    this.previousSlide(dayNumber);
                }
            }
        });
    }

    /**
     * Setup auto-play functionality
     */
    setupAutoPlay(container, dayNumber, interval = 5000) {
        let autoPlayTimer;

        const startAutoPlay = () => {
            autoPlayTimer = setInterval(() => {
                this.nextSlide(dayNumber);
            }, interval);
        };

        const stopAutoPlay = () => {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = null;
            }
        };

        // Start auto-play
        startAutoPlay();

        // Pause on hover
        container.addEventListener('mouseenter', stopAutoPlay);
        container.addEventListener('mouseleave', startAutoPlay);

        // Pause on touch
        container.addEventListener('touchstart', stopAutoPlay);
        container.addEventListener('touchend', () => {
            setTimeout(startAutoPlay, 3000); // Resume after 3 seconds
        });
    }

    /**
     * Navigate to previous slide
     */
    previousSlide(dayNumber) {
        const images = this.galleries.get(dayNumber);
        if (!images) return;

        const currentIndex = this.currentSlides.get(dayNumber) || 0;
        const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        this.goToSlide(dayNumber, newIndex);
    }

    /**
     * Navigate to next slide
     */
    nextSlide(dayNumber) {
        const images = this.galleries.get(dayNumber);
        if (!images) return;

        const currentIndex = this.currentSlides.get(dayNumber) || 0;
        const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        this.goToSlide(dayNumber, newIndex);
    }

    /**
     * Navigate to specific slide
     */
    goToSlide(dayNumber, slideIndex) {
        const container = document.querySelector(`[data-gallery-day="${dayNumber}"] .gallery-container`);
        if (!container) return;

        const slides = container.querySelectorAll('.gallery-slide');
        const indicators = container.querySelectorAll('.gallery-indicator');
        const counter = container.querySelector('.current-slide');

        // Update slides
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === slideIndex);
        });

        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === slideIndex);
        });

        // Update counter
        if (counter) {
            counter.textContent = slideIndex + 1;
        }

        // Update current slide index
        this.currentSlides.set(dayNumber, slideIndex);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const galleryLoader = new AutoGalleryLoader();
    galleryLoader.initializeGalleries();
});

// Make class available globally
window.AutoGalleryLoader = AutoGalleryLoader;