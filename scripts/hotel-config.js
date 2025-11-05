/**
 * ملف تكوين نظام معرض الصور للفنادق
 * Hotel Image Gallery Configuration
 */

window.HotelGalleryConfig = {
    // إعدادات عامة
    settings: {
        // عدد الصور المحملة في البداية
        initialLoadCount: 10,
        
        // عدد الصور المحملة عند التمرير
        lazyLoadCount: 5,
        
        // تأخير التحميل بالميلي ثانية
        loadDelay: 100,
        
        // جودة الصور المصغرة
        thumbnailQuality: 'medium',
        
        // تفعيل التحميل التدريجي
        enableLazyLoading: true,
        
        // تفعيل التخزين المؤقت
        enableCaching: true,
        
        // مدة التخزين المؤقت بالدقائق
        cacheExpiry: 30
    },
    
    // قائمة الفنادق المتاحة
    hotels: {
        'Four Seasons Hotel': {
            name: 'فندق فور سيزونز',
            nameEn: 'Four Seasons Hotel',
            imagePath: '/hotels/Four Seasons Hotel/image/',
            description: 'فندق فاخر يقدم أرقى الخدمات والإطلالات الخلابة',
            totalImages: 46,
            featured: true
        },
        'Crowne Plaza': {
            name: 'فندق كراون بلازا',
            nameEn: 'Crowne Plaza',
            imagePath: '/hotels/Crowne Plaza/image/',
            description: 'فندق عصري في قلب المدينة مع مرافق متميزة',
            totalImages: 35,
            featured: true
        },
        'Cairo Marriott Hotel': {
            name: 'فندق كايرو ماريوت',
            nameEn: 'Cairo Marriott Hotel',
            imagePath: '/hotels/Cairo Marriott Hotel/image/',
            description: 'فندق تاريخي أنيق على ضفاف النيل',
            totalImages: 42,
            featured: true
        },
        'Hilton Cairo Heliopolis': {
            name: 'فندق هيلتون القاهرة هليوبوليس',
            nameEn: 'Hilton Cairo Heliopolis',
            imagePath: '/hotels/Hilton Cairo Heliopolis/image/',
            description: 'فندق حديث بالقرب من المطار مع مرافق شاملة',
            totalImages: 28,
            featured: false
        },
        'Steigenberger Hotel El Tahrir': {
            name: 'فندق شتايجنبرجر التحرير',
            nameEn: 'Steigenberger Hotel El Tahrir',
            imagePath: '/hotels/Steigenberger Hotel El Tahrir/image/',
            description: 'فندق أنيق في وسط القاهرة مع إطلالة على النيل',
            totalImages: 31,
            featured: false
        }
    },
    
    // الصور الاحتياطية في حالة فشل التحميل
    fallbackImages: [
        'https://picsum.photos/800/600?random=1',
        'https://picsum.photos/800/600?random=2',
        'https://picsum.photos/800/600?random=3',
        'https://picsum.photos/800/600?random=4',
        'https://picsum.photos/800/600?random=5'
    ],
    
    // أنواع الملفات المدعومة
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
    
    // رسائل النظام
    messages: {
        loading: 'جاري تحميل الصور...',
        error: 'حدث خطأ في تحميل الصور',
        noImages: 'لا توجد صور متاحة لهذا الفندق',
        retry: 'إعادة المحاولة',
        zoomIn: 'تكبير',
        zoomOut: 'تصغير',
        close: 'إغلاق',
        previous: 'السابق',
        next: 'التالي',
        of: 'من'
    },
    
    // إعدادات التكبير
    zoom: {
        minScale: 0.5,
        maxScale: 3.0,
        step: 0.2,
        duration: 300
    },
    
    // إعدادات الرسوم المتحركة
    animation: {
        duration: 300,
        easing: 'ease-in-out',
        fadeInDuration: 200,
        slideTransition: 'transform 0.3s ease'
    },
    
    // إعدادات الاستجابة
    responsive: {
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        },
        thumbnailSizes: {
            mobile: { width: 80, height: 60 },
            tablet: { width: 100, height: 70 },
            desktop: { width: 120, height: 80 }
        }
    },
    
    // اختصارات لوحة المفاتيح
    keyboard: {
        enabled: true,
        shortcuts: {
            nextImage: ['ArrowRight', 'Space'],
            previousImage: ['ArrowLeft'],
            closeZoom: ['Escape'],
            zoomIn: ['+', '='],
            zoomOut: ['-'],
            resetZoom: ['0']
        }
    },
    
    // إعدادات إمكانية الوصول
    accessibility: {
        enabled: true,
        announceImageChanges: true,
        focusManagement: true,
        highContrast: false
    }
};

/**
 * دالة مساعدة للحصول على تكوين فندق محدد
 */
window.getHotelConfig = function(hotelName) {
    return window.HotelGalleryConfig.hotels[hotelName] || null;
};

/**
 * دالة مساعدة للحصول على قائمة الفنادق المميزة
 */
window.getFeaturedHotels = function() {
    const hotels = window.HotelGalleryConfig.hotels;
    return Object.keys(hotels).filter(key => hotels[key].featured);
};

/**
 * دالة مساعدة للحصول على رسالة نظام
 */
window.getMessage = function(key) {
    return window.HotelGalleryConfig.messages[key] || key;
};

/**
 * دالة مساعدة لتحديد حجم الشاشة
 */
window.getScreenSize = function() {
    const width = window.innerWidth;
    const breakpoints = window.HotelGalleryConfig.responsive.breakpoints;
    
    if (width <= breakpoints.mobile) return 'mobile';
    if (width <= breakpoints.tablet) return 'tablet';
    return 'desktop';
};

/**
 * دالة مساعدة للحصول على حجم الصور المصغرة حسب الشاشة
 */
window.getThumbnailSize = function() {
    const screenSize = window.getScreenSize();
    return window.HotelGalleryConfig.responsive.thumbnailSizes[screenSize];
};

// تصدير التكوين للاستخدام في وحدات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.HotelGalleryConfig;
}