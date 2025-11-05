/**
 * نظام عرض الصور الديناميكي للفنادق
 * Hotel Dynamic Image Gallery System
 */

class HotelImageGallery {
    constructor(hotelName, containerId = 'image-gallery') {
        this.hotelName = hotelName;
        this.containerId = containerId;
        this.images = [];
        this.currentImageIndex = 0;
        this.isLoading = false;
        this.supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        this.init();
    }

    /**
     * تهيئة النظام
     */
    async init() {
        try {
            await this.loadImages();
            this.createGalleryHTML();
            this.bindEvents();
        } catch (error) {
            this.handleError('فشل في تهيئة معرض الصور', error);
        }
    }

    /**
     * تحميل الصور من مجلد الفندق
     */
    async loadImages() {
        this.isLoading = true;
        const imagePath = `/hotels/${encodeURIComponent(this.hotelName)}/image/`;
        
        try {
            // محاولة الحصول على قائمة الصور من الخادم
            const response = await fetch(imagePath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            this.images = this.parseImagesFromHTML(html, imagePath);
            
            if (this.images.length === 0) {
                throw new Error('لم يتم العثور على صور في مجلد الفندق');
            }
            
        } catch (error) {
            // في حالة فشل التحميل، استخدم الصور المحددة مسبقاً
            this.loadFallbackImages();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * استخراج أسماء الصور من HTML
     */
    parseImagesFromHTML(html, basePath) {
        const images = [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // البحث عن روابط الصور في صفحة الفهرس
        const links = doc.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            const extension = href.split('.').pop()?.toLowerCase();
            
            if (this.supportedFormats.includes(extension)) {
                images.push({
                    src: basePath + href,
                    name: href,
                    alt: `${this.hotelName} - ${href}`
                });
            }
        });
        
        return images;
    }

    /**
     * تحميل الصور الاحتياطية من التكوين الموجود
     */
    loadFallbackImages() {
        if (window.hotelImageConfig && window.hotelImageConfig.images) {
            this.images = window.hotelImageConfig.images.map((src, index) => ({
                src: src,
                name: `image-${index + 1}`,
                alt: `${this.hotelName} - صورة ${index + 1}`
            }));
        } else {
            // صور افتراضية في حالة عدم وجود أي تكوين
            this.images = [
                {
                    src: 'https://picsum.photos/800/600?random=1',
                    name: 'default-1',
                    alt: `${this.hotelName} - صورة افتراضية`
                }
            ];
        }
    }

    /**
     * إنشاء HTML لمعرض الصور
     */
    createGalleryHTML() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`لم يتم العثور على العنصر: ${this.containerId}`);
            return;
        }

        container.innerHTML = `
            <div class="hotel-gallery">
                <div class="gallery-header">
                    <h3>صور ${this.hotelName}</h3>
                    <div class="gallery-counter">
                        <span class="current-image">1</span> / <span class="total-images">${this.images.length}</span>
                    </div>
                </div>
                
                <div class="main-image-container">
                    <div class="image-loading" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p>جاري تحميل الصورة...</p>
                    </div>
                    
                    <div class="main-image-wrapper">
                        <img class="main-image" src="${this.images[0]?.src}" alt="${this.images[0]?.alt}" />
                        <div class="image-overlay">
                            <button class="zoom-btn" title="تكبير الصورة">
                                <i data-lucide="zoom-in"></i>
                            </button>
                        </div>
                    </div>
                    
                    <button class="nav-btn prev-btn" title="الصورة السابقة">
                        <i data-lucide="chevron-left"></i>
                    </button>
                    <button class="nav-btn next-btn" title="الصورة التالية">
                        <i data-lucide="chevron-right"></i>
                    </button>
                </div>
                
                <div class="thumbnail-container">
                    <div class="thumbnails">
                        ${this.createThumbnailsHTML()}
                    </div>
                </div>
                
                <div class="gallery-error" style="display: none;">
                    <div class="error-icon">⚠️</div>
                    <h4>خطأ في تحميل الصور</h4>
                    <p class="error-message"></p>
                    <button class="retry-btn">إعادة المحاولة</button>
                </div>
            </div>
            
            <!-- نافذة التكبير -->
            <div class="zoom-modal" style="display: none;">
                <div class="zoom-overlay"></div>
                <div class="zoom-content">
                    <img class="zoom-image" src="" alt="" />
                    <button class="zoom-close" title="إغلاق">
                        <i data-lucide="x"></i>
                    </button>
                    <div class="zoom-controls">
                        <button class="zoom-in" title="تكبير">
                            <i data-lucide="zoom-in"></i>
                        </button>
                        <button class="zoom-out" title="تصغير">
                            <i data-lucide="zoom-out"></i>
                        </button>
                        <button class="zoom-reset" title="إعادة تعيين">
                            <i data-lucide="maximize"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.addGalleryStyles();
    }

    /**
     * إنشاء HTML للصور المصغرة
     */
    createThumbnailsHTML() {
        return this.images.map((image, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${image.src}" alt="${image.alt}" loading="lazy" />
            </div>
        `).join('');
    }

    /**
     * ربط الأحداث
     */
    bindEvents() {
        const container = document.getElementById(this.containerId);
        
        // أزرار التنقل
        container.querySelector('.prev-btn')?.addEventListener('click', () => this.previousImage());
        container.querySelector('.next-btn')?.addEventListener('click', () => this.nextImage());
        
        // الصور المصغرة
        container.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.addEventListener('click', () => this.goToImage(index));
        });
        
        // زر التكبير
        container.querySelector('.zoom-btn')?.addEventListener('click', () => this.openZoom());
        
        // نافذة التكبير
        const zoomModal = container.querySelector('.zoom-modal');
        zoomModal?.querySelector('.zoom-close')?.addEventListener('click', () => this.closeZoom());
        zoomModal?.querySelector('.zoom-overlay')?.addEventListener('click', () => this.closeZoom());
        zoomModal?.querySelector('.zoom-in')?.addEventListener('click', () => this.zoomIn());
        zoomModal?.querySelector('.zoom-out')?.addEventListener('click', () => this.zoomOut());
        zoomModal?.querySelector('.zoom-reset')?.addEventListener('click', () => this.resetZoom());
        
        // زر إعادة المحاولة
        container.querySelector('.retry-btn')?.addEventListener('click', () => this.retry());
        
        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // تحميل الأيقونات
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * الانتقال للصورة السابقة
     */
    previousImage() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.updateCurrentImage();
    }

    /**
     * الانتقال للصورة التالية
     */
    nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.updateCurrentImage();
    }

    /**
     * الانتقال لصورة محددة
     */
    goToImage(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentImageIndex = index;
            this.updateCurrentImage();
        }
    }

    /**
     * تحديث الصورة الحالية
     */
    updateCurrentImage() {
        const container = document.getElementById(this.containerId);
        const mainImage = container.querySelector('.main-image');
        const currentCounter = container.querySelector('.current-image');
        const thumbnails = container.querySelectorAll('.thumbnail');
        
        if (mainImage && this.images[this.currentImageIndex]) {
            // إظهار مؤشر التحميل
            this.showLoading(true);
            
            // تحديث الصورة الرئيسية
            mainImage.onload = () => this.showLoading(false);
            mainImage.onerror = () => this.handleImageError(mainImage);
            mainImage.src = this.images[this.currentImageIndex].src;
            mainImage.alt = this.images[this.currentImageIndex].alt;
            
            // تحديث العداد
            if (currentCounter) {
                currentCounter.textContent = this.currentImageIndex + 1;
            }
            
            // تحديث الصور المصغرة
            thumbnails.forEach((thumb, index) => {
                thumb.classList.toggle('active', index === this.currentImageIndex);
            });
        }
    }

    /**
     * فتح نافذة التكبير
     */
    openZoom() {
        const container = document.getElementById(this.containerId);
        const zoomModal = container.querySelector('.zoom-modal');
        const zoomImage = zoomModal.querySelector('.zoom-image');
        
        if (zoomModal && zoomImage && this.images[this.currentImageIndex]) {
            zoomImage.src = this.images[this.currentImageIndex].src;
            zoomImage.alt = this.images[this.currentImageIndex].alt;
            zoomModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.resetZoom();
        }
    }

    /**
     * إغلاق نافذة التكبير
     */
    closeZoom() {
        const container = document.getElementById(this.containerId);
        const zoomModal = container.querySelector('.zoom-modal');
        
        if (zoomModal) {
            zoomModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * تكبير الصورة
     */
    zoomIn() {
        const zoomImage = document.querySelector('.zoom-image');
        if (zoomImage) {
            const currentScale = parseFloat(zoomImage.style.transform.replace(/[^\d.]/g, '') || '1');
            const newScale = Math.min(currentScale * 1.2, 3);
            zoomImage.style.transform = `scale(${newScale})`;
        }
    }

    /**
     * تصغير الصورة
     */
    zoomOut() {
        const zoomImage = document.querySelector('.zoom-image');
        if (zoomImage) {
            const currentScale = parseFloat(zoomImage.style.transform.replace(/[^\d.]/g, '') || '1');
            const newScale = Math.max(currentScale / 1.2, 0.5);
            zoomImage.style.transform = `scale(${newScale})`;
        }
    }

    /**
     * إعادة تعيين التكبير
     */
    resetZoom() {
        const zoomImage = document.querySelector('.zoom-image');
        if (zoomImage) {
            zoomImage.style.transform = 'scale(1)';
        }
    }

    /**
     * معالجة اختصارات لوحة المفاتيح
     */
    handleKeyboard(event) {
        const zoomModal = document.querySelector('.zoom-modal');
        const isZoomOpen = zoomModal && zoomModal.style.display !== 'none';
        
        switch (event.key) {
            case 'ArrowLeft':
                if (!isZoomOpen) this.previousImage();
                break;
            case 'ArrowRight':
                if (!isZoomOpen) this.nextImage();
                break;
            case 'Escape':
                if (isZoomOpen) this.closeZoom();
                break;
            case ' ':
                if (!isZoomOpen) {
                    event.preventDefault();
                    this.nextImage();
                }
                break;
        }
    }

    /**
     * إظهار/إخفاء مؤشر التحميل
     */
    showLoading(show) {
        const container = document.getElementById(this.containerId);
        const loading = container.querySelector('.image-loading');
        const mainWrapper = container.querySelector('.main-image-wrapper');
        
        if (loading && mainWrapper) {
            loading.style.display = show ? 'flex' : 'none';
            mainWrapper.style.opacity = show ? '0.5' : '1';
        }
    }

    /**
     * معالجة خطأ تحميل الصورة
     */
    handleImageError(imgElement) {
        this.showLoading(false);
        imgElement.src = 'https://picsum.photos/800/600?random=' + Date.now();
        imgElement.alt = 'صورة بديلة - فشل في تحميل الصورة الأصلية';
    }

    /**
     * معالجة الأخطاء العامة
     */
    handleError(message, error) {
        console.error(message, error);
        
        const container = document.getElementById(this.containerId);
        const errorDiv = container?.querySelector('.gallery-error');
        const errorMessage = container?.querySelector('.error-message');
        
        if (errorDiv && errorMessage) {
            errorMessage.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    /**
     * إعادة المحاولة
     */
    async retry() {
        const container = document.getElementById(this.containerId);
        const errorDiv = container?.querySelector('.gallery-error');
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        
        await this.init();
    }

    /**
     * إضافة الأنماط CSS
     */
    addGalleryStyles() {
        if (document.getElementById('hotel-gallery-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'hotel-gallery-styles';
        styles.textContent = `
            .hotel-gallery {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .gallery-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e0e0e0;
            }
            
            .gallery-header h3 {
                margin: 0;
                color: #333;
                font-size: 1.5rem;
            }
            
            .gallery-counter {
                background: #f5f5f5;
                padding: 5px 15px;
                border-radius: 20px;
                font-weight: bold;
                color: #666;
            }
            
            .main-image-container {
                position: relative;
                margin-bottom: 20px;
                background: #f9f9f9;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            .main-image-wrapper {
                position: relative;
                transition: opacity 0.3s ease;
            }
            
            .main-image {
                width: 100%;
                height: 500px;
                object-fit: cover;
                display: block;
                transition: transform 0.3s ease;
            }
            
            .main-image:hover {
                transform: scale(1.02);
            }
            
            .image-overlay {
                position: absolute;
                top: 10px;
                right: 10px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .main-image-container:hover .image-overlay {
                opacity: 1;
            }
            
            .zoom-btn {
                background: rgba(0,0,0,0.7);
                color: white;
                border: none;
                padding: 10px;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .zoom-btn:hover {
                background: rgba(0,0,0,0.9);
            }
            
            .nav-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0,0,0,0.7);
                color: white;
                border: none;
                padding: 15px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                opacity: 0;
            }
            
            .main-image-container:hover .nav-btn {
                opacity: 1;
            }
            
            .prev-btn {
                left: 15px;
            }
            
            .next-btn {
                right: 15px;
            }
            
            .nav-btn:hover {
                background: rgba(0,0,0,0.9);
                transform: translateY(-50%) scale(1.1);
            }
            
            .thumbnail-container {
                overflow-x: auto;
                padding: 10px 0;
            }
            
            .thumbnails {
                display: flex;
                gap: 10px;
                padding: 10px 0;
            }
            
            .thumbnail {
                flex-shrink: 0;
                width: 100px;
                height: 70px;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                border: 3px solid transparent;
                transition: all 0.3s ease;
            }
            
            .thumbnail:hover {
                transform: scale(1.05);
                border-color: #007bff;
            }
            
            .thumbnail.active {
                border-color: #007bff;
                box-shadow: 0 0 10px rgba(0,123,255,0.5);
            }
            
            .thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .image-loading {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 10px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .gallery-error {
                text-align: center;
                padding: 40px;
                background: #f8f9fa;
                border-radius: 10px;
                border: 1px solid #dee2e6;
            }
            
            .error-icon {
                font-size: 3rem;
                margin-bottom: 15px;
            }
            
            .gallery-error h4 {
                color: #dc3545;
                margin-bottom: 10px;
            }
            
            .error-message {
                color: #6c757d;
                margin-bottom: 20px;
            }
            
            .retry-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .retry-btn:hover {
                background: #0056b3;
            }
            
            /* نافذة التكبير */
            .zoom-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .zoom-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.9);
            }
            
            .zoom-content {
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .zoom-image {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                transition: transform 0.3s ease;
                cursor: grab;
            }
            
            .zoom-image:active {
                cursor: grabbing;
            }
            
            .zoom-close {
                position: absolute;
                top: -50px;
                right: -50px;
                background: rgba(255,255,255,0.2);
                color: white;
                border: none;
                padding: 15px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                transition: background 0.3s ease;
            }
            
            .zoom-close:hover {
                background: rgba(255,255,255,0.3);
            }
            
            .zoom-controls {
                position: absolute;
                bottom: -60px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 10px;
            }
            
            .zoom-controls button {
                background: rgba(255,255,255,0.2);
                color: white;
                border: none;
                padding: 12px;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .zoom-controls button:hover {
                background: rgba(255,255,255,0.3);
            }
            
            /* تصميم متجاوب */
            @media (max-width: 768px) {
                .hotel-gallery {
                    padding: 10px;
                }
                
                .gallery-header {
                    flex-direction: column;
                    gap: 10px;
                    text-align: center;
                }
                
                .main-image {
                    height: 300px;
                }
                
                .nav-btn {
                    padding: 10px;
                }
                
                .thumbnail {
                    width: 80px;
                    height: 60px;
                }
                
                .zoom-close {
                    top: 10px;
                    right: 10px;
                }
                
                .zoom-controls {
                    bottom: 10px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// تصدير الكلاس للاستخدام العام
window.HotelImageGallery = HotelImageGallery;