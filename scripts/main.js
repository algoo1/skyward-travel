// Skyward Travel - Core UI & i18n
const Skyward = (() => {
  const supported = ["en", "ar", "gr"];
  const cache = {};

  // Inject Google Fonts globally (Poppins + Inter)
  const injectFonts = () => {
    if (document.querySelector('link[data-fonts="google-poppins-inter"]')) return;
    const head = document.head;
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    head.appendChild(preconnect1);
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    head.appendChild(preconnect2);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Poppins:wght@700;800&display=swap';
    link.setAttribute('data-fonts', 'google-poppins-inter');
    head.appendChild(link);
  };

  // Ensure responsive viewport is enforced and consistent
  const ensureViewportMeta = () => {
    const head = document.head;
    let viewport = document.querySelector('meta[name="viewport"]');
    const desired = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover';
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = desired;
      head.prepend(viewport);
    } else {
      // Normalize content while preserving leading tokens like maximum-scale if present
      const current = (viewport.getAttribute('content') || '').toLowerCase();
      const hasWidth = current.includes('width=device-width');
      const hasInitial = current.includes('initial-scale');
      const hasFit = current.includes('viewport-fit=cover');
      const hasMaxScale = current.includes('maximum-scale');
      const hasUserScale = current.includes('user-scalable');
      let tokens = [];
      if (!hasWidth) tokens.push('width=device-width');
      if (!hasInitial) tokens.push('initial-scale=1');
      if (!hasMaxScale) tokens.push('maximum-scale=5');
      if (!hasUserScale) tokens.push('user-scalable=yes');
      if (!hasFit) tokens.push('viewport-fit=cover');
      if (tokens.length) {
        const merged = [current, tokens.join(', ')].filter(Boolean).join(', ').replace(/\s+,/g, ',').trim();
        viewport.setAttribute('content', merged);
      }
    }
  };

  const getLang = () => {
    const saved = localStorage.getItem("lang");
    const urlParam = new URLSearchParams(window.location.search).get("lang");
    const initial = (urlParam && supported.includes(urlParam)) ? urlParam : (saved || "en");
    if (!supported.includes(initial)) return "en";
    return initial;
  };

  const setLang = async (lang) => {
    if (!supported.includes(lang)) return;
    localStorage.setItem("lang", lang);
    await applyLang(lang);
  };

  const loadLocale = async (lang) => {
    if (cache[lang]) return cache[lang];
    // Always use absolute path to locales folder
    const basePath = '/locales';
    console.log('Loading locale from:', `${basePath}/${lang}.json`);
    const res = await fetch(`${basePath}/${lang}.json`);
    const json = await res.json();
    cache[lang] = json;
    return json;
  };

  const getByPath = (obj, path) => {
    return path.split('.').reduce((o, k) => (o || {})[k], obj);
  };

  const translateDom = (dict) => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getByPath(dict, key);
      if (typeof val === 'string') el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getByPath(dict, key);
      if (typeof val === 'string') el.setAttribute('placeholder', val);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      const val = getByPath(dict, key);
      if (typeof val === 'string') el.setAttribute('aria-label', val);
    });
  };

  const applyDir = (lang) => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  };

  const renderHeader = (lang) => {
    const current = window.location.pathname.replace(/\/index\.html$/, '/');
    const mkLink = (href, key) => {
      const path = href;
      const isActive = current === href || current === `${href}index.html`;
      return `<a href="${path}" class="${isActive ? 'active' : ''}" data-i18n="${key}"></a>`;
    };
    const headerHtml = `
      <div class="site-header-wrapper">
        <div class="container site-header">
          <a class="logo" href="/" aria-label="Skyward Travel home">
            <img src="/logo_rm.png" alt="Skyward Travel" />
          </a>
          <nav class="nav" aria-label="Main navigation">
            ${mkLink('/', 'nav.home')}
            ${mkLink('/packages.html', 'nav.packages')}
            ${mkLink('/build-your-plan.html', 'nav.build')}
          </nav>
        </div>
      </div>`;
    const mount = document.getElementById('site-header');
    if (mount) mount.innerHTML = headerHtml;
  };

  const renderFooter = () => {
    const footerHtml = `
      <footer class="site-footer">
        <div class="container footer-inner">
          <div>
            <h4>About Skyward</h4>
            <p data-i18n="footer.tagline"></p>
            <div class="footer-logo">
              <img src="/2%20logo_rm.png" alt="Skyward Travel" />
            </div>
          </div>
          <div>
            <h4 data-i18n="footer.quickLinks"></h4>
            <ul class="footer-links">
              <li><a href="/hotels/" data-i18n="footer.links.hotels"></a></li>
              <li><a href="/activities/" data-i18n="footer.links.activities"></a></li>
              <li><a href="/cruises/" data-i18n="footer.links.cruises"></a></li>
              <li><a href="/packages.html" data-i18n="nav.packages"></a></li>
              <li><a href="/build-your-plan.html" data-i18n="nav.build"></a></li>
            </ul>
          </div>
          <div>
            <h4 data-i18n="footer.contactHeading"></h4>
            <ul class="footer-links">
              <li><i data-lucide="phone"></i><span>+20 112 693 1142</span></li>
              <li><i data-lucide="mail"></i><span>info@skywardtours.site</span></li>
              <li><i data-lucide="map-pin"></i><span>St. 9, Mokattam, Cairo, Egypt</span></li>
            </ul>
          </div>
          <div>
            <h4 data-i18n="footer.getInTouch"></h4>
            <p data-i18n="footer.whatsappText"></p>
            <a class="btn btn-whatsapp" href="https://wa.me/201126931142" target="_blank" rel="noopener" data-i18n="cta.chatWhatsapp"></a>
          </div>
        </div>
        <div class="container footer-meta">
          <div>© 2025 Skyward Travel. Founded in 2024. All rights reserved.</div>
          <div>
            <a href="#" data-i18n="footer.imprint"></a> · 
            <a href="#" data-i18n="footer.privacy"></a>
          </div>
        </div>
      </footer>`;
    const mount = document.getElementById('site-footer');
    if (mount) mount.innerHTML = footerHtml;
  };

  const renderWhatsappFloat = () => {
    const el = document.createElement('div');
    el.className = 'whatsapp-float';
    const msg = encodeURIComponent('Hello Skyward Travel! I would like to book.');
    el.innerHTML = `<a href="https://wa.me/201126931142?text=${msg}" target="_blank" rel="noopener" data-i18n="cta.whatsapp"></a>`;
    document.body.appendChild(el);
  };

  // Lazy-load a lightweight Markdown parser and render info.md into the page
  const escapeHtml = (str) => {
    try {
      return str.replace(/[&<>"']/g, (ch) => (
        ch === '&' ? '&amp;' :
        ch === '<' ? '&lt;' :
        ch === '>' ? '&gt;' :
        ch === '"' ? '&quot;' : '&#39;'
      ));
    } catch (_) { return str; }
  };
  const ensureMarkedLoaded = () => {
    return new Promise((resolve, reject) => {
      if (window.marked) return resolve();
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  };

  // Detect lines that should be treated as headings based on emoji at start/end
  // Use Unicode Extended_Pictographic to catch most emoji, and handle variation selector (FE0F)
  const EP_START_RE = /^\p{Extended_Pictographic}/u;
  const EP_END_RE = /\p{Extended_Pictographic}\uFE0F?$/u;
  const isEmojiHeadingLine = (line) => {
    if (!line) return false;
    const trimmed = line.replace(/\r/g, '');
    return EP_START_RE.test(trimmed) || EP_END_RE.test(trimmed);
  };

  // Convert emoji-heading lines into Markdown headings while preserving text
  const convertEmojiHeadings = (text) => {
    try {
      const lines = text.split(/\n/);
      return lines.map(l => {
        if (isEmojiHeadingLine(l)) {
          // Keep the line exactly; just mark it as an H3 in markdown
          return `### ${l}`;
        }
        return l;
      }).join('\n');
    } catch (_) {
      return text;
    }
  };

  // Plain-text fallback renderer: build HTML with emoji headings preserved
  const renderPlainWithEmoji = (text) => {
    try {
      const lines = text.split(/\n/);
      const parts = [];
      for (const line of lines) {
        if (line.trim() === '') {
          parts.push('<br/>');
          continue;
        }
        if (isEmojiHeadingLine(line)) {
          parts.push(`<h3 class="md-emoji-heading"><span style="white-space:pre-wrap">${escapeHtml(line)}</span></h3>`);
        } else {
          parts.push(`<p class="md-paragraph"><span style="white-space:pre-wrap">${escapeHtml(line)}</span></p>`);
        }
      }
      return parts.join('\n');
    } catch (_) {
      return `<pre class="md-fallback" style="white-space:pre-wrap;word-break:break-word;margin:0;color:var(--text-dark);font-size:15px;line-height:1.7;">${escapeHtml(text)}</pre>`;
    }
  };

  const loadInfoMarkdown = async () => {
    try {
      const container = document.querySelector('.property-description');
      if (!container) return; // Only apply on pages that have the description block

      // Normalize base path: ensure trailing slash even if URL lacks it
      let basePath = window.location.pathname.replace(/\/index\.html$/, '/');
      if (!basePath.endsWith('/')) basePath += '/';
      const candidates = [
        `${basePath}info.md`,
        `${basePath}image/info.md`
      ];

      let mdText = null;
      for (const url of candidates) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            mdText = await res.text();
            break;
          }
        } catch (err) {
          // Continue to next candidate
        }
      }

      // Fallback: check for inline script tag containing Markdown
      if (!mdText) {
        const inlineMd = document.querySelector('script#info-md, script[type="text/markdown"], script[type="text/plain"][data-md]');
        if (inlineMd) {
          mdText = inlineMd.textContent || inlineMd.innerText || '';
        }
      }

      if (!mdText) return; // No info.md found; keep existing content

      let html;
      try {
        await ensureMarkedLoaded();
        if (window.marked && typeof window.marked.parse === 'function') {
          // Ensure emoji-heading lines render as actual headings
          const mdWithHeadings = convertEmojiHeadings(mdText);
          // Customize heading rendering to preserve spacing on emoji titles
          try {
            if (typeof window.marked.use === 'function') {
              window.marked.use({
                renderer: {
                  heading(arg1, arg2) {
                    let level = arg2 || (arg1 && typeof arg1 === 'object' ? (arg1.depth || arg1.level || 3) : 3);
                    const text = (arg1 && typeof arg1 === 'object') ? (arg1.text || arg1.raw || '') : String(arg1 ?? '');
                    return `<h${level} class="md-emoji-heading"><span style="white-space:pre-wrap">${escapeHtml(text)}</span></h${level}>`;
                  }
                }
              });
            } else if (typeof window.marked.Renderer === 'function') {
              const renderer = new window.marked.Renderer();
              renderer.heading = function (arg1, arg2) {
                let level = arg2 || (arg1 && typeof arg1 === 'object' ? (arg1.depth || arg1.level || 3) : 3);
                const text = (arg1 && typeof arg1 === 'object') ? (arg1.text || arg1.raw || '') : String(arg1 ?? '');
                return `<h${level} class="md-emoji-heading"><span style="white-space:pre-wrap">${escapeHtml(text)}</span></h${level}>`;
              };
              if (typeof window.marked.setOptions === 'function') {
                window.marked.setOptions({ renderer });
              }
            }
          } catch (_) {}
          html = window.marked.parse(mdWithHeadings);
        } else {
          throw new Error('Marked not available');
        }
      } catch (mdErr) {
        console.warn('marked load/parse failed; using plain-text fallback', mdErr);
        // Fallback: custom render preserving emoji headings and spacing
        html = renderPlainWithEmoji(mdText);
      }

      // Preserve existing section heading (e.g., "About this activity")
      const heading = container.querySelector('h2, h3, h4');
      const mdWrap = document.createElement('div');
      mdWrap.className = 'md-content';
      mdWrap.innerHTML = html;

      if (heading) {
        // Remove all nodes except the heading, then append markdown below it
        const kids = Array.from(container.childNodes);
        for (const node of kids) {
          if (node !== heading) container.removeChild(node);
        }
        container.appendChild(mdWrap);
      } else {
        // If no heading exists, create a sensible default
        const h = document.createElement('h2');
        h.textContent = 'About this activity';
        container.innerHTML = '';
        container.appendChild(h);
        container.appendChild(mdWrap);
      }
    } catch (err) {
      console.warn('loadInfoMarkdown error:', err);
    }
  };

  // Feature flag: disable auto-injected Booking link section on hotel pages
  const ENABLE_HOTEL_BOOKING_LINK_SECTION = false;

  // Hotels: extract info from booking link inside info.md (or image/info.md)
  const loadHotelInfoFromLink = async () => {
    try {
      // Disabled globally per request: remove booking link meta from all hotels
      if (!ENABLE_HOTEL_BOOKING_LINK_SECTION) return;
      const container = document.querySelector('.property-description');
      if (!container) return;
      const isHotel = /^\/hotels\//.test(window.location.pathname);
      if (!isHotel) return;

      const basePath = window.location.pathname.replace(/\/index\.html$/, '/');
      const candidates = [
        `${basePath}info.md`,
        `${basePath}image/info.md`
      ];

      let mdText = null;
      for (const url of candidates) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) { mdText = await res.text(); break; }
        } catch (_) {}
      }

      if (!mdText) return;

      const urlMatch = mdText.match(/https?:\/\/\S+/);
      if (!urlMatch) return; // No link present; keep existing content

      let parsed;
      try { parsed = new URL(urlMatch[0]); } catch (_) { return; }

      // Derive hotel name and destination from link
      let hotelName = '';
      let destination = '';
      if (/\/hotel\//.test(parsed.pathname)) {
        const slug = decodeURIComponent(parsed.pathname.split('/').pop() || '').replace(/\.html$/, '');
        hotelName = slug.replace(/[-_]+/g, ' ').trim();
      } else {
        hotelName = (parsed.searchParams.get('ss') || '').trim();
      }
      destination = (parsed.searchParams.get('ss') || '').trim();

      const adults = parsed.searchParams.get('group_adults') || parsed.searchParams.get('req_adults');
      const children = parsed.searchParams.get('group_children') || parsed.searchParams.get('req_children');
      const rooms = parsed.searchParams.get('no_rooms') || '';
      const source = parsed.hostname || 'booking.com';

      const infoHtml = `
        <div class="hotel-link-info">
          ${hotelName ? `<p><strong>${escapeHtml(hotelName)}</strong></p>` : ''}
          ${destination && destination.toLowerCase() !== hotelName.toLowerCase() ? `<p>${escapeHtml(destination)}</p>` : ''}
          <p><a href="${escapeHtml(parsed.href)}" target="_blank" rel="noopener noreferrer nofollow">Open booking link</a></p>
          <div class="link-meta" style="display:flex;gap:10px;flex-wrap:wrap;font-size:13px;color:var(--text-muted);">
            ${adults ? `<span>Adults: ${escapeHtml(adults)}</span>` : ''}
            ${children ? `<span>Children: ${escapeHtml(children)}</span>` : ''}
            ${rooms ? `<span>Rooms: ${escapeHtml(rooms)}</span>` : ''}
            <span>Source: ${escapeHtml(source)}</span>
          </div>
        </div>`;

      const heading = container.querySelector('h2, h3, h4');
      const wrap = document.createElement('div');
      wrap.className = 'md-content';
      wrap.innerHTML = infoHtml;

      const nonHeadingEls = Array.from(container.children).filter(el => !(el.tagName || '').match(/^H[2-4]$/));
      const hasMeaningfulContent = nonHeadingEls.some(el => ((el.textContent || '').trim().length > 30));

      if (heading) {
        if (hasMeaningfulContent) {
          // Keep existing description and append booking link meta after it
          container.appendChild(wrap);
        } else {
          // No meaningful content; replace with link meta
          const kids = Array.from(container.childNodes);
          for (const node of kids) { if (node !== heading) container.removeChild(node); }
          container.appendChild(wrap);
        }
      } else {
        const h = document.createElement('h2');
        h.textContent = 'About this property';
        container.innerHTML = '';
        container.appendChild(h);
        container.appendChild(wrap);
      }
    } catch (err) {
      console.warn('loadHotelInfoFromLink error:', err);
    }
  };

  // Smart info loader: use link-extraction for hotels, markdown for others
  const loadSmartInfo = async () => {
    const isHotel = /^\/hotels\//.test(window.location.pathname);
    if (isHotel) {
      // Respect feature flag: skip injecting booking link section
      if (ENABLE_HOTEL_BOOKING_LINK_SECTION) {
        await loadHotelInfoFromLink();
      }
    } else {
      await loadInfoMarkdown();
    }
  };

  const applyLang = async (lang) => {
    applyDir(lang);
    renderHeader(lang);
    renderFooter();
    const dict = await loadLocale(lang);
    translateDom(dict);
    if (window.lucide) window.lucide.createIcons();
  };

  const initAlbumSliders = () => {
    document.querySelectorAll('.album-frame').forEach(frame => {
      const imgs = Array.from(frame.querySelectorAll('.album-image'));
      if (imgs.length === 0) return;
      let idx = 0;
      const show = (i) => {
        imgs.forEach((el, j) => el.classList.toggle('active', j === i));
        idx = i;
      };
      show(0);
      frame.querySelector('.album-btn.prev')?.addEventListener('click', () => show((idx - 1 + imgs.length) % imgs.length));
      frame.querySelector('.album-btn.next')?.addEventListener('click', () => show((idx + 1) % imgs.length));
    });
  };

  // Thresholds to consider an image "small" by dimensions
  const MIN_IMAGE_WIDTH = 500;
  const MIN_IMAGE_HEIGHT = 350;

  // Resolve base URL for current page's image folder robustly
  const getImageBaseUrl = () => {
    const path = window.location.pathname;
    const dir = path.endsWith('.html') ? path.slice(0, path.lastIndexOf('/')) : path;
    return `${window.location.origin}${dir}/image`;
  };

  // Discover images by fetching the folder index HTML (works with directory listing servers)
  const discoverImagesFromFolder = async () => {
    const baseUrl = getImageBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/`, { method: 'GET' });
      if (!res.ok) return [];
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = Array.from(doc.querySelectorAll('a[href]'))
        .map(a => a.getAttribute('href'))
        .filter(Boolean)
        .map(h => decodeURIComponent(h.split('?')[0]));
      const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
      let files = links.filter(h => allowed.test(h)).map(h => h.replace(/^.*\//, ''));
      // Filter by typical small/thumbnail name patterns
      const isSmallName = (name) => /(^|[_.-])(tiny|small|thumb|thumbnail|mini|min|icon|sm|xs)([_.-]|$)/i.test(name);
      files = files.filter(f => !isSmallName(f));

      // Filter by dimensions by actually loading each image
      const keep = [];
      for (const f of files) {
        const url = `${baseUrl}/${encodeURIComponent(f)}`;
        try {
          const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = url;
          });
          const w = img.naturalWidth || 0;
          const h = img.naturalHeight || 0;
          if (w >= MIN_IMAGE_WIDTH && h >= MIN_IMAGE_HEIGHT) {
            keep.push(f);
          }
        } catch (_) {
          // Skip files that fail to load
        }
      }
      return keep;
    } catch (err) {
      console.warn('discoverImagesFromFolder failed:', err);
      return [];
    }
  };

  const initPhotoGallery = async () => {
    // Handle regular gallery containers
    const galleryContainers = document.querySelectorAll('.gallery-composite, .gallery-grid');
    if (galleryContainers.length) {
      const first = galleryContainers[0];
      const imgNodes = Array.from(first.querySelectorAll('img'));
      if (imgNodes.length) {
        // Build config from currently visible images only
        let imageFiles = imgNodes.map(img => {
          const src = img.getAttribute('src') || '';
          const m = src.match(/\/image\/([^\/?#]+)(?:\?.*)?$/);
          return m ? m[1] : (src.split('/').pop() || '').split('?')[0];
        }).filter(Boolean);
        // Exclude small/thumbnail images by filename pattern
        const isSmallName = (name) => /(^|[_.-])(tiny|small|thumb|thumbnail|mini|min|icon|sm|xs)([_.-]|$)/i.test(name);
        imageFiles = imageFiles.filter(f => !isSmallName(f));
        // Prefer using the folder discovery if available
        const folderFiles = await discoverImagesFromFolder();
        if (folderFiles.length) {
          imageFiles = folderFiles;
        }
        const pageTitle = document.querySelector('h1')?.textContent || 'gallery';
        window.hotelImageConfig = { hotelName: pageTitle, images: imageFiles };

        imgNodes.forEach((img, index) => {
          img.style.cursor = 'pointer';
          img.addEventListener('click', () => {
            const src = img.getAttribute('src') || '';
            const m = src.match(/\/image\/([^\/?#]+)(?:\?.*)?$/);
            const fname = m ? m[1] : (src.split('/').pop() || '').split('?')[0];
            const targetIdx = window.hotelImageConfig.images.indexOf(fname);
            showPhotoModal(targetIdx >= 0 ? targetIdx : 0);
          });
        });
      }
    }

    // Handle hotel booking gallery
    const bookingGallery = document.querySelector('.booking-gallery');
    if (bookingGallery) {
      await initHotelPhotoGallery(bookingGallery);
    }
  };

  const initHotelPhotoGallery = async (galleryContainer) => {
    console.log('initHotelPhotoGallery called', galleryContainer);
    // Get hotel name from the gallery button or page
    const photoCountBtn = galleryContainer.querySelector('.photo-count-btn');
    const hotelName = photoCountBtn?.getAttribute('data-gallery') || 
                     document.querySelector('h1')?.textContent || 
                     'hotel';
    console.log('Hotel name:', hotelName, 'Photo count button:', photoCountBtn);
    
    // Prefer using images from the folder index with dimension filtering
    let imageFileNames = await discoverImagesFromFolder();
    
    // Fallback to visible images only if folder discovery fails
    if (!imageFileNames.length) {
      const visibleImages = Array.from(galleryContainer.querySelectorAll('img'));
      imageFileNames = visibleImages.map(img => {
        const src = img.getAttribute('src') || '';
        const m = src.match(/\/image\/([^\/?#]+)(?:\?.*)?$/);
        return m ? m[1] : (src.split('/').pop() || '').split('?')[0];
      }).filter(Boolean);
      const isSmallName = (name) => /(^|[_.-])(tiny|small|thumb|thumbnail|mini|min|icon|sm|xs)([_.-]|$)/i.test(name);
      imageFileNames = imageFileNames.filter(f => !isSmallName(f));
    }
    window.hotelImageConfig = { hotelName, images: imageFileNames };
    
    // Add click handlers to visible images and map to folder-based index
    const visibleImages = Array.from(galleryContainer.querySelectorAll('img'));
    console.log('Adding click handlers to', visibleImages.length, 'images');
    visibleImages.forEach((img) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        const src = img.getAttribute('src') || '';
        const m = src.match(/\/image\/([^\/?#]+)(?:\?.*)?$/);
        const fname = m ? m[1] : (src.split('/').pop() || '').split('?')[0];
        const idx = window.hotelImageConfig.images.indexOf(fname);
        showPhotoModal(idx >= 0 ? idx : 0);
      });
    });
    
    if (photoCountBtn) {
      console.log('Adding click handler to photo count button');
      photoCountBtn.addEventListener('click', () => {
        console.log('Photo count button clicked');
        showPhotoModal(0);
      });
    }
  };

  // دالة لتحديث عدد الصور في الزر
  function updatePhotoCount() {
    const photoCountBtn = document.querySelector('.photo-count-btn');
    if (!photoCountBtn) return;
    
    const imageCount = (window.hotelImageConfig && Array.isArray(window.hotelImageConfig.images))
      ? window.hotelImageConfig.images.length
      : (typeof photoModalInstance?.totalImages === 'number' ? photoModalInstance.totalImages : 0);

    photoCountBtn.innerHTML = imageCount > 0
      ? `<i class="fas fa-images"></i> Show all photos (${imageCount})`
      : `<i class="fas fa-images"></i> Show all photos`;
  }

  // النافذة المنبثقة الجديدة - مبرمجة من الصفر
  let currentImageIndex = 0;
  let galleryImages = [];

  // Modern Photo Modal Class using ES6+ features
  class PhotoModal {
    constructor() {
      // Use hotel-specific image configuration if available, otherwise fallback to Four Seasons
      if (window.hotelImageConfig && window.hotelImageConfig.images) {
        this.imageFiles = window.hotelImageConfig.images.map(img => img.replace('image/', ''));
        console.log(`🏨 Loaded ${this.imageFiles.length} images for ${window.hotelImageConfig.hotelName || 'this hotel'}`);
      } else {
        // Fallback to Four Seasons Hotel images
        this.imageFiles = [
          '213146628.jpg', '213146711.jpg', '229001871.jpg', '229001879.jpg', '229001989.jpg',
          '306070976.jpg', '306072867.jpg', '306072881.jpg', '306072893.jpg', '306079707.jpg',
          '309409220.jpg', '309412468 (1).jpg', '309412468.jpg', '309415002.jpg', '309415003.jpg',
          '309415004.jpg', '309415011.jpg', '309415014.jpg', '309415016.jpg', '309415018.jpg',
          '309415020.jpg', '309415026.jpg', '309415030.jpg', '309415089.jpg', '373497796.jpg',
          '373497815.jpg', '383675110.jpg', '591878948.jpg', '591879655.jpg', '591880274.jpg',
          '591881428.jpg', '591881432.jpg', '591881475.jpg', '591881478.jpg', '591881486.jpg',
          '591881896.jpg', '591881897.jpg', '591881927.jpg', '591882326.jpg', '591882621.jpg',
          '591882654.jpg', '591883413.jpg', '591883492.jpg', '591883494 (1).jpg', '591883494.jpg',
          '591884249.jpg'
        ];
        console.log('⚠️ Using fallback Four Seasons Hotel images');
      }
      
      this.currentIndex = 0;
      this.modal = null;
      this.imageElement = null;
      this.counterElement = null;
      this.isLoading = false;
      
      // Bind methods to preserve 'this' context
      this.handleKeyPress = this.handleKeyPress.bind(this);
      this.handleModalClick = this.handleModalClick.bind(this);
      this.close = this.close.bind(this);
      this.previous = this.previous.bind(this);
      this.next = this.next.bind(this);
    }
    
    get baseUrl() {
      return getImageBaseUrl();
    }
    
    get imageUrls() {
      return this.imageFiles.map(filename => `${this.baseUrl}/${filename}`);
    }
    
    get totalImages() {
      return this.imageFiles.length;
    }
    
    // Promise-based image loading with fetch API
    async loadImageWithFetch(url) {
      try {
        console.log('🔄 Loading image with Fetch API:', url);
        
        // First, check if the image exists using fetch
        const response = await fetch(url, { method: 'HEAD' });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // If fetch succeeds, create a promise for image loading
        return new Promise((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => {
            console.log('✅ Image loaded successfully:', url);
            resolve(img);
          };
          
          img.onerror = () => {
            console.error('❌ Image failed to load:', url);
            reject(new Error('Image failed to load'));
          };
          
          img.src = url;
        });
        
      } catch (error) {
        console.error('❌ Fetch failed for image:', url, error);
        throw error;
      }
    }
    
    // Create modal structure using modern DOM methods
    createModalStructure() {
      // Remove any existing modal
      this.close();
      
      // Create modal container
      this.modal = document.createElement('div');
      this.modal.className = 'photo-modal-modern';
      
      // Apply styles using CSS custom properties
      Object.assign(this.modal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '999999',
        opacity: '0',
        transition: 'opacity 0.3s ease-in-out'
      });
      
      // Create content container
      const content = document.createElement('div');
      content.className = 'modal-content-modern';
      Object.assign(content.style, {
        position: 'relative',
        maxWidth: '98vw',
        maxHeight: '98vh',
        width: '90vw',
        height: '90vh',
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 15px 50px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      });
      
      // Create close button
      const closeBtn = this.createButton('×', this.close, {
        position: 'absolute',
        top: '15px',
        right: '20px',
        fontSize: '28px',
        color: '#666',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        zIndex: '1000000'
      });
      
      // Create navigation buttons
      const prevBtn = this.createButton('‹', this.previous, {
        position: 'absolute',
        left: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '32px',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        cursor: 'pointer',
        zIndex: '1000000',
        transition: 'background-color 0.2s'
      });
      
      const nextBtn = this.createButton('›', this.next, {
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '32px',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        cursor: 'pointer',
        zIndex: '1000000',
        transition: 'background-color 0.2s'
      });
      
      // Create image element
      this.imageElement = document.createElement('img');
      this.imageElement.className = 'modal-image-modern';
      Object.assign(this.imageElement.style, {
        maxWidth: '100%',
        maxHeight: '85vh',
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
        borderRadius: '10px',
        transition: 'opacity 0.3s ease-in-out',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)'
      });
      
      // Create loading indicator
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'loading-indicator';
      loadingDiv.textContent = 'Loading...';
      Object.assign(loadingDiv.style, {
        display: 'none',
        padding: '20px',
        fontSize: '16px',
        color: '#666'
      });
      
      // Create counter
      this.counterElement = document.createElement('div');
      this.counterElement.className = 'modal-counter-modern';
      Object.assign(this.counterElement.style, {
        marginTop: '15px',
        padding: '10px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: 'bold'
      });
      
      // Assemble the modal
      content.appendChild(closeBtn);
      content.appendChild(prevBtn);
      content.appendChild(nextBtn);
      content.appendChild(loadingDiv);
      content.appendChild(this.imageElement);
      content.appendChild(this.counterElement);
      
      this.modal.appendChild(content);
      document.body.appendChild(this.modal);
      
      // Add event listeners
      document.addEventListener('keydown', this.handleKeyPress);
      this.modal.addEventListener('click', this.handleModalClick);
      
      // Animate in
      requestAnimationFrame(() => {
        this.modal.style.opacity = '1';
      });
      
      return { loadingDiv };
    }
    
    createButton(text, onClick, styles) {
      const button = document.createElement('button');
      button.textContent = text;
      button.onclick = onClick;
      Object.assign(button.style, styles);
      
      // Add hover effects
      button.onmouseenter = () => {
        if (styles.backgroundColor) {
          button.style.backgroundColor = styles.backgroundColor.replace('0.6', '0.8');
        }
      };
      button.onmouseleave = () => {
        if (styles.backgroundColor) {
          button.style.backgroundColor = styles.backgroundColor;
        }
      };
      
      return button;
    }
    
    async show(imageIndex = 0) {
      console.log('🚀 Opening modern photo modal with index:', imageIndex);
      // Refresh images from current config at open time
      if (window.hotelImageConfig && Array.isArray(window.hotelImageConfig.images)) {
        this.imageFiles = window.hotelImageConfig.images
          .map(img => (img || '').split('/').pop().split('?')[0])
          .filter(Boolean);
      }
      // Fallback: derive from DOM if config missing
      if (!this.imageFiles || this.imageFiles.length === 0) {
        const domImgs = Array.from(document.querySelectorAll('.booking-gallery img, .gallery-grid img, .gallery-composite img'));
        this.imageFiles = domImgs.map(img => {
          const src = img.getAttribute('src') || '';
          const m = src.match(/\/image\/([^\/?#]+)(?:\?.*)?$/);
          return m ? m[1] : (src.split('/').pop() || '').split('?')[0];
        }).filter(Boolean);
      }

      // Exclude small/thumbnail images by filename pattern first
      const isSmallName = (name) => /(^|[_.-])(tiny|small|thumb|thumbnail|mini|min|icon|sm|xs)([_.-]|$)/i.test(name);
      this.imageFiles = this.imageFiles.filter(f => !isSmallName(f));

      // Additional filter by file size via HEAD request (skip very small files)
      const SMALL_FILE_THRESHOLD = 70000; // ~70 KB
      try {
        const filtered = [];
        for (const fname of this.imageFiles) {
          const url = `${this.baseUrl}/${encodeURIComponent(fname)}`;
          try {
            const head = await fetch(url, { method: 'HEAD' });
            if (!head.ok) {
              filtered.push(fname);
              continue;
            }
            const lenHeader = head.headers.get('content-length');
            const len = lenHeader ? parseInt(lenHeader, 10) : NaN;
            if (Number.isFinite(len) && len > 0 && len < SMALL_FILE_THRESHOLD) {
              // Skip very small files (likely thumbnails)
              continue;
            }
            filtered.push(fname);
          } catch (_) {
            // If HEAD fails, keep the file to avoid over-filtering
            filtered.push(fname);
          }
        }
        this.imageFiles = filtered;
      } catch (e) {
        console.warn('Size-based filter failed, proceeding without it:', e);
      }
      
      this.currentIndex = Math.max(0, Math.min(imageIndex, this.totalImages - 1));
      
      const { loadingDiv } = this.createModalStructure();
      document.body.style.overflow = 'hidden';
      
      await this.loadCurrentImage(loadingDiv);
    }
    
    async loadCurrentImage(loadingDiv = null) {
      if (this.isLoading) return;
      
      this.isLoading = true;
      const currentUrl = this.imageUrls[this.currentIndex];
      
      // Show loading indicator
      if (loadingDiv) {
        loadingDiv.style.display = 'block';
        this.imageElement.style.opacity = '0';
      }
      
      try {
        // Use fetch API to load image
        const loadedImage = await this.loadImageWithFetch(currentUrl);
        
        // Update image element
        this.imageElement.src = loadedImage.src;
        this.imageElement.alt = `Hotel photo ${this.currentIndex + 1}`;
        
        // Update counter
        this.updateCounter();
        
        // Hide loading and show image
        if (loadingDiv) {
          loadingDiv.style.display = 'none';
        }
        this.imageElement.style.opacity = '1';
        
      } catch (error) {
        console.error('❌ Failed to load image:', currentUrl, error);
        
        // Show error state
        this.imageElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Yp9mE2LXZiNix2Kkg2LrZitixINmF2KrYp9it2Kk8L3RleHQ+PC9zdmc+';
        this.imageElement.alt = 'Failed to load image';
        
        if (loadingDiv) {
          loadingDiv.style.display = 'none';
        }
        this.imageElement.style.opacity = '1';
        this.updateCounter();
      }
      
      this.isLoading = false;
    }
    
    updateCounter() {
      if (this.counterElement) {
        this.counterElement.textContent = `${this.currentIndex + 1} / ${this.totalImages}`;
      }
    }
    
    async previous() {
      if (this.isLoading) return;
      this.currentIndex = (this.currentIndex - 1 + this.totalImages) % this.totalImages;
      await this.loadCurrentImage();
    }
    
    async next() {
      if (this.isLoading) return;
      this.currentIndex = (this.currentIndex + 1) % this.totalImages;
      await this.loadCurrentImage();
    }
    
    close() {
      if (this.modal) {
        this.modal.style.opacity = '0';
        setTimeout(() => {
          if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
          }
          this.modal = null;
          this.imageElement = null;
          this.counterElement = null;
        }, 300);
      }
      
      document.body.style.overflow = '';
      document.removeEventListener('keydown', this.handleKeyPress);
    }
    
    handleKeyPress(event) {
      switch (event.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          this.previous();
          break;
        case 'ArrowRight':
          this.next();
          break;
      }
    }
    
    handleModalClick(event) {
      if (event.target === this.modal) {
        this.close();
      }
    }
  }
  
  // Create global instance
  const photoModalInstance = new PhotoModal();
  
  // Legacy function for compatibility
  function showPhotoModal(imageIndex = 0) {
    photoModalInstance.show(imageIndex);
  }
  


  // Legacy functions for compatibility with new PhotoModal class
  function closePhotoModal() {
    photoModalInstance.close();
  }

  function previousImage() {
    photoModalInstance.previous();
  }

  function nextImage() {
    photoModalInstance.next();
  }

  function updateModalImage() {
    // This function is now handled internally by the PhotoModal class
    // Keeping for compatibility but functionality moved to PhotoModal.loadCurrentImage()
    console.log('updateModalImage called - handled by PhotoModal class');
  }

  function handleKeyPress(e) {
    if (e.key === 'Escape') {
      closePhotoModal();
    } else if (e.key === 'ArrowLeft') {
      previousImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  }

  // جعل الدوال متاحة عالمياً
  window.closePhotoModal = closePhotoModal;
  window.previousImage = previousImage;
  window.nextImage = nextImage;

  // Fix layout: ensure day-activities lives inside day-content and after gallery
  const fixDayContentLayout = () => {
    try {
      const sections = document.querySelectorAll('.day-section');
      sections.forEach(sec => {
        const content = sec.querySelector('.day-content');
        if (!content) return;
        
        // Find activities list inside or outside content
        let activities = content.querySelector('ul.day-activities');
        if (!activities) {
          const candidate = sec.querySelector('ul.day-activities');
          // إذا كانت القائمة موجودة في القسم لكنها ليست داخل .day-content، انقلها
          if (candidate && !content.contains(candidate)) {
            activities = candidate;
            content.appendChild(activities);
          }
        }
        if (!activities) return;

        // تأكد من ترتيب العناصر: المعرض أولاً ثم الأنشطة
        const gallery = content.querySelector('.day-gallery');
        if (gallery && gallery.nextElementSibling !== activities) {
          content.insertBefore(activities, gallery.nextSibling);
        }
      });
    } catch (err) {
      console.warn('fixDayContentLayout error:', err);
    }
  };

  // تنظيف الأقسام الفارغة أو غير المكتملة في صفحات الفنادق
  const cleanupEmptyHotelSections = () => {
    try {
      const isHotel = /^\/hotels\//.test(window.location.pathname);
      if (!isHotel) return;

      // إزالة قسم "عن هذا العقار" إذا كان الوصف افتراضيًا أو فارغًا
      const about = document.querySelector('.property-description');
      const aboutP = about?.querySelector('p');
      if (about && aboutP) {
        const txt = (aboutP.textContent || '').trim();
        const fallback = 'A curated stay with premium amenities.';
        if (!txt || txt === fallback) {
          about.remove();
        }
      }

      // أقسام تُزال إذا كانت بلا عناصر معنوية
      const defs = [
        { sel: '.additional-amenities', itemSel: '.amenity-detailed-item' },
        { sel: '.room-types-section', itemSel: '.room-type-card' },
        { sel: '.nearby-attractions', itemSel: '.attraction-item' },
        { sel: '.languages-section', itemSel: '.language-tag' },
        { sel: '.hotel-policies', itemSel: '.policy-item' },
      ];
      defs.forEach(({ sel, itemSel }) => {
        const section = document.querySelector(sel);
        if (!section) return;
        const count = section.querySelectorAll(itemSel).length;
        if (count === 0) section.remove();
      });

      // تنظيف عام: إزالة الحاويات الخالية من النص أو العناصر المرئية
      const contentMain = document.querySelector('.booking-content .content-main');
      if (contentMain) {
        Array.from(contentMain.children).forEach(el => {
          const text = (el.textContent || '').trim();
          const hasVisual = el.querySelector('img, video, .facility-item, .amenity-detailed-item, .room-type-card, .attraction-item, .language-tag, .policy-item');
          if (!text && !hasVisual) el.remove();
        });
      }
    } catch (err) {
      console.warn('cleanupEmptyHotelSections error:', err);
    }
  };

  const initMobileNavigation = () => {
    // إضافة زر القائمة المحمولة والقائمة نفسها إلى الهيدر
    const header = document.querySelector('.site-header');
    if (!header) return;

    // التحقق من وجود الزر مسبقاً
    if (header.querySelector('.mobile-menu-toggle')) return;

    // إنشاء زر القائمة المحمولة
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;

    // إنشاء القائمة المحمولة
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    
    const nav = header.querySelector('.nav');
    const langSwitcher = header.querySelector('.lang-switcher');
    
    if (nav) {
      const navLinks = Array.from(nav.querySelectorAll('a'));
      const mobileNavContent = document.createElement('div');
      mobileNavContent.className = 'mobile-nav-content';
      
      // نسخ روابط التنقل
      navLinks.forEach(link => {
        const mobileLink = link.cloneNode(true);
        mobileNavContent.appendChild(mobileLink);
      });
      
      // إضافة مبدل اللغة للهواتف المحمولة
      if (langSwitcher) {
        const mobileLangSwitcher = document.createElement('div');
        mobileLangSwitcher.className = 'mobile-lang-switcher';
        const langSelect = langSwitcher.querySelector('select');
        if (langSelect) {
          const mobileLangSelect = langSelect.cloneNode(true);
          mobileLangSwitcher.appendChild(mobileLangSelect);
          mobileNavContent.appendChild(mobileLangSwitcher);
        }
      }
      
      mobileNav.appendChild(mobileNavContent);
    }

    // إضافة العناصر إلى الهيدر
    header.appendChild(mobileToggle);
    header.parentElement.appendChild(mobileNav);

    // إضافة وظائف التفاعل
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
    });

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('active');
      }
    });

    // إغلاق القائمة عند النقر على رابط
    mobileNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        mobileNav.classList.remove('active');
      }
    });
  };

  const init = async () => {
    ensureViewportMeta();
    injectFonts();
    const lang = getLang();

    // Ensure header/footer are injected even if translations fail
    try {
      renderHeader(lang);
      renderFooter();
    } catch (err) {
      console.warn('Header/footer injection error:', err);
    }

    // Apply language and translations with graceful fallback
    try {
      await applyLang(lang);
    } catch (err) {
      console.warn('applyLang failed, continuing without translations:', err);
    }

    // Aggressively remove any previously injected booking link/meta blocks
    try {
      const isHotel = /^\/hotels\//.test(window.location.pathname);
      if (isHotel) {
        const toRemove = [
          '.hotel-link-info',
          '.property-description .md-content',
          '.property-description .link-meta'
        ];
        toRemove.forEach(sel => document.querySelectorAll(sel).forEach(el => el.remove()));
        // Remove standalone anchors labeled "Open booking link"
        document.querySelectorAll('.property-description a').forEach(a => {
          if ((a.textContent || '').trim().toLowerCase() === 'open booking link') {
            const parent = a.closest('.md-content') || a.parentElement;
            (parent || a).remove();
          }
        });
      }
    } catch (cleanupErr) {
      console.warn('cleanup booking link section error:', cleanupErr);
    }

    initMobileNavigation();
    initAlbumSliders();
    await initPhotoGallery();
    fixDayContentLayout();
    
    // تحديث عدد الصور في الزر
    await updatePhotoCount();

    // Load info: hotels from booking link, others from Markdown
    await loadSmartInfo();

    // تنظيف الأقسام الفارغة بعد تحميل المحتوى الذكي
    cleanupEmptyHotelSections();

    // Remove hotel price block from hero (Starting from / Contact for rates)
    try {
      const isHotel = /^\/hotels\//.test(window.location.pathname);
      if (isHotel) {
        document.querySelectorAll('.booking-actions .price-info').forEach(el => el.remove());
        document.querySelectorAll('.booking-actions .btn.btn-booking').forEach(el => el.remove());

        // Unify hotel header to match cruise header
        try {
          const headerEl = document.querySelector('.booking-header');
          const infoEl = headerEl?.querySelector('.hotel-info');
          if (headerEl && infoEl) {
            // Remove hotel-type badge to match cruises
            const typeEl = infoEl.querySelector('.hotel-type');
            if (typeEl) typeEl.remove();

            // Convert location-info block to a simple paragraph like cruises
            const locInfo = infoEl.querySelector('.location-info');
            const addrText = locInfo?.querySelector('span')?.textContent?.trim() || '';
            if (addrText) {
              const titleEl = infoEl.querySelector('.hotel-title');
              const p = document.createElement('p');
              p.className = 'hotel-location';
              p.textContent = addrText;
              if (titleEl && titleEl.parentNode) {
                titleEl.parentNode.insertBefore(p, titleEl.nextSibling);
              } else {
                infoEl.appendChild(p);
              }
            }
            if (locInfo) locInfo.remove();

            // Build right-side rating block like cruises
            const existingRight = headerEl.querySelector('.hotel-rating');
            if (!existingRight) {
              // Try to read from existing booking-rating (if present) else fallback
              const bookingRating = infoEl.querySelector('.booking-rating');
              const score = bookingRating?.querySelector('.rating-badge')?.textContent?.trim();
              const text = bookingRating?.querySelector('.rating-text')?.textContent?.trim();
              const count = bookingRating?.querySelector('.rating-count')?.textContent?.trim();
              const titleEl = infoEl.querySelector('.hotel-title');
              const hotelName = (titleEl?.textContent || '').trim();
              const RATINGS = {
                'Cairo Marriott Hotel': { score: '8.7', text: 'Excellent', count: '1,788 reviews' },
              };
              const r = score ? { score, text, count } : RATINGS[hotelName];
              if (r && r.score) {
                const html = `
                  <div class="hotel-rating">
                    <div class="rating-score">${r.score}</div>
                    <div class="rating-text">
                      <div class="rating-label">${r.text || ''}</div>
                      <div class="rating-reviews">${r.count || ''}</div>
                    </div>
                  </div>`;
                const temp = document.createElement('div');
                temp.innerHTML = html.trim();
                const ratingNode = temp.firstElementChild;
                headerEl.appendChild(ratingNode);
              }
              // Remove old left-side booking-rating if exists
              if (bookingRating) bookingRating.remove();
            }

            // Remove booking-actions in hotel header to match cruises layout
            const bookingActions = headerEl.querySelector('.booking-actions');
            if (bookingActions) bookingActions.remove();
          }
        } catch (err) {
          console.warn('hotel header unification error:', err);
        }
      }
    } catch (err) {
      console.warn('price-info removal error:', err);
    }

    // Ensure no photo modal is open on page load
    const existingModal = document.querySelector('.photo-modal');
    if (existingModal) {
      existingModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  return { init, setLang };
})();

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', Skyward.init);
} else {
  Skyward.init();
}