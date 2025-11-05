/*
  Generate hotel detail pages from /hotels/* folders.
  - Reads images from /hotels/<Hotel>/image/
  - Reads Booking URL from /hotels/<Hotel>/info.md or /hotels/<Hotel>/image/info.md
  - Tries to fetch basic details from Booking (name, description, rating, address)
  - Writes /hotels/<Hotel>/index.html using the site's header/footer and CSS
*/

import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(path.join(__dirname, '..'));
const HOTELS_DIR = path.join(ROOT, 'hotels');

const enc = (s) => encodeURIComponent(s);

function getHotelDirs(baseDir) {
  return fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(name => name.toLowerCase() !== 'image');
}

function findInfoMd(hotelPath) {
  const candidates = [
    path.join(hotelPath, 'info.md'),
    path.join(hotelPath, 'image', 'info.md'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function readBookingUrl(infoMdPath) {
  try {
    if (!infoMdPath) return null;
    const raw = fs.readFileSync(infoMdPath, 'utf-8').trim();
    const match = raw.match(/https?:\/\/www\.booking\.com\/[\S]+/i);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}

async function fetchBookingDetails(url) {
  if (!url) return {};
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SkywardBot/1.0)' } });
    const html = await res.text();
    const $ = load(html);

    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const titleTag = $('title').text() || '';
    const name = ogTitle || titleTag.replace(/\s*-\s*Booking.*$/i, '').trim();

    // Enhanced description extraction from multiple sources
    let description = '';
    
    // Try multiple description sources and combine them
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const mainContent = $('.hp_desc_main_content').first().text().trim() || '';
    const propertyDescription = $('.hp-description-content, .property-description, .hp_desc_important_facilities').first().text().trim() || '';
    const hotelDescription = $('.hotel-description, .property-overview, .hp-hotel-description').first().text().trim() || '';
    
    // Combine descriptions, prioritizing the most detailed ones
    const descriptions = [ogDescription, metaDescription, mainContent, propertyDescription, hotelDescription]
      .filter(desc => desc && desc.length > 20) // Filter out short or empty descriptions
      .map(desc => desc.replace(/\s+/g, ' ').trim()); // Clean up whitespace
    
    // Use the longest description or combine multiple if they're different
    if (descriptions.length > 0) {
      description = descriptions.reduce((longest, current) => 
        current.length > longest.length ? current : longest
      );
      
      // If we have multiple unique descriptions, try to combine them intelligently
      if (descriptions.length > 1) {
        const uniqueDescriptions = [...new Set(descriptions)];
        if (uniqueDescriptions.length > 1) {
          // Combine descriptions that don't overlap significantly
          const combined = uniqueDescriptions.join(' ').replace(/\s+/g, ' ').trim();
          if (combined.length > description.length && combined.length < 1000) {
            description = combined;
          }
        }
      }
    }

    // Try to extract rating details robustly
    const ratingScore = $('.bui-review-score__badge').first().text().trim()
      || $('[data-testid="review-score"]').find('[aria-hidden="true"]').first().text().trim() || '';
    const ratingText = $('.bui-review-score__title').first().text().trim()
      || $('[data-testid="review-score-phrase"]').first().text().trim() || '';
    const rcMatch = html.match(/([0-9,.]+)\s+reviews/i);
    const ratingCount = rcMatch ? rcMatch[1] : ($('.bui-review-score__count').first().text().trim() || $('[data-testid="review-score-subtitle"]').first().text().trim());
    const rating = ratingScore || ($('[data-testid="review-score"]').first().text().trim()) || '';

    const address = $('[data-testid="address"]').first().text().trim()
      || $('.hp_address_subtitle').first().text().trim() || '';

    // Extract GPS coordinates
    let latitude = null;
    let longitude = null;
    
    // Try to extract coordinates from various sources
    const mapScript = $('script').filter((_, el) => {
      const text = $(el).html();
      return text && (text.includes('latitude') || text.includes('longitude') || text.includes('lat') || text.includes('lng'));
    }).html();
    
    if (mapScript) {
      // Try different coordinate patterns
      const latMatch = mapScript.match(/(?:latitude|lat)["']?\s*[:=]\s*["']?(-?\d+\.?\d*)["']?/i);
      const lngMatch = mapScript.match(/(?:longitude|lng|lon)["']?\s*[:=]\s*["']?(-?\d+\.?\d*)["']?/i);
      
      if (latMatch && lngMatch) {
        latitude = parseFloat(latMatch[1]);
        longitude = parseFloat(lngMatch[1]);
      }
    }
    
    // Alternative coordinate extraction from data attributes
    if (!latitude || !longitude) {
      const coordElement = $('[data-lat], [data-lng], [data-latitude], [data-longitude]').first();
      if (coordElement.length) {
        latitude = parseFloat(coordElement.attr('data-lat') || coordElement.attr('data-latitude')) || latitude;
        longitude = parseFloat(coordElement.attr('data-lng') || coordElement.attr('data-longitude')) || longitude;
      }
    }

    // Enhanced amenities and facilities extraction with more sources
    const highlights = [];
    const amenities = [];
    
    // Extract from multiple sources with enhanced selectors
    $('[data-testid="property-highlights"] li, [data-testid="amenities"] li, .hp-highlights li, .property-highlights li').each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length > 2 && !highlights.includes(t)) highlights.push(t);
    });

    // Extract facilities from multiple facility sections
    $('.hp_desc_important_facilities li, .important_facility, .facility-item, .amenity-item, .hp-facilities li').each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length > 2 && !amenities.includes(t) && !highlights.includes(t)) amenities.push(t);
    });

    // Extract from amenities sections with more selectors
    $('.hp-description-highlights-section li, .bui-list__item, .amenities-list li, .facilities-list li, .property-amenities li').each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length > 3 && !amenities.includes(t) && !highlights.includes(t)) amenities.push(t);
    });
    
    // Extract from icon-based amenities
    $('.hp-amenity, .amenity-icon').each((_, el) => {
      const t = $(el).text().trim() || $(el).attr('title') || $(el).attr('alt');
      if (t && t.length > 2 && !amenities.includes(t) && !highlights.includes(t)) amenities.push(t);
    });

    // Extract room types and features
    const roomTypes = [];
    $('.hprt-table tbody tr, .room-type').each((_, el) => {
      const roomName = $(el).find('.hprt-roomtype-link, .room-name').first().text().trim();
      const roomFeatures = [];
      $(el).find('.hprt-roomtype-icon-link, .room-feature').each((_, feature) => {
        const featureText = $(feature).text().trim();
        if (featureText) roomFeatures.push(featureText);
      });
      if (roomName) {
        roomTypes.push({
          name: roomName,
          features: roomFeatures
        });
      }
    });

    // Extract nearby attractions and distances
    const nearbyAttractions = [];
    $('.hp_location_block li, .landmark-distance').each((_, el) => {
      const attraction = $(el).text().trim();
      if (attraction && attraction.length > 5) {
        nearbyAttractions.push(attraction);
      }
    });

    // Extract check-in/check-out times
    const checkInTime = $('.checkin-checkout-policy .checkin time, .check-in-time').first().text().trim() || '';
    const checkOutTime = $('.checkin-checkout-policy .checkout time, .check-out-time').first().text().trim() || '';

    // Extract policies
    const policies = [];
    $('.hp-policies-section li, .policy-item').each((_, el) => {
      const policy = $(el).text().trim();
      if (policy && policy.length > 10) {
        policies.push(policy);
      }
    });

    // Extract languages spoken
    const languages = [];
    $('.hp-languages-spoken li, .language-item').each((_, el) => {
      const lang = $(el).text().trim();
      if (lang) languages.push(lang);
    });

    // Extract property type with multiple selectors
    const propertyType = $('.hp-property-type, .property-category, .hp_hotel_name .hp_hotel_type, [data-testid="property-type"], .bui-badge--property-type')
      .first().text().trim() || 
      (name.toLowerCase().includes('resort') ? 'Resort' : 
       name.toLowerCase().includes('spa') ? 'Spa Hotel' :
       name.toLowerCase().includes('villa') ? 'Villa' :
       name.toLowerCase().includes('apartment') ? 'Apartment' : 'Hotel');

    // Extract star count (e.g., "5-star" or "5 stars") from various patterns
    const starAria = $('[aria-label*="star"]').first().attr('aria-label') || '';
    const mAria = starAria.match(/([1-5])\s*[- ]?\s*star/i);
    const mText = html.match(/([1-5])\s*[- ]?\s*star[s]?\b/i);
    const ratingStarsText = $('.bui-rating, [data-testid="rating-stars"]').first().text() || '';
    const mBlock = ratingStarsText.match(/([1-5])\s*[- ]?\s*star[s]?\b/i);
    const wordMap = { one: 1, two: 2, three: 3, four: 4, five: 5 };
    const mWord = html.match(/\b(one|two|three|four|five)\s*[- ]?\s*star[s]?\b/i);
    const starCount = mAria?.[1] ? parseInt(mAria[1], 10)
      : mText?.[1] ? parseInt(mText[1], 10)
      : mBlock?.[1] ? parseInt(mBlock[1], 10)
      : mWord?.[1] ? wordMap[mWord[1].toLowerCase()] : null;

    // Extract price information if available
    const priceInfo = $('.prco-valign-middle-helper, .price-display').first().text().trim() || '';

    return { 
      name, 
      description, 
      rating, 
      ratingScore, 
      ratingText, 
      ratingCount, 
      address, 
      latitude,
      longitude,
      highlights: highlights.slice(0, 15), 
      amenities: amenities.slice(0, 30),
      roomTypes: roomTypes.slice(0, 12),
      nearbyAttractions: nearbyAttractions.slice(0, 15),
      checkInTime,
      checkOutTime,
      policies: policies.slice(0, 12),
      languages: languages.slice(0, 8),
      propertyType,
      starCount,
      priceInfo
    };
  } catch (e) {
    return {};
  }
}

function readImages(hotelPath) {
  const imgDir1 = path.join(hotelPath, 'image');
  const imgDir2 = hotelPath; // fallback if images are directly under hotel dir
  const dir = fs.existsSync(imgDir1) ? imgDir1 : imgDir2;
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
}

function renderHtml({ hotelName, bookingUrl, heroImage, images, details }) {
  const title = hotelName;
  const desc = details?.description || CUSTOM_DESCRIPTIONS[hotelName] || 'A curated stay with premium amenities.';
  const ratingScore = details?.ratingScore || details?.rating || '';
  const ratingText = details?.ratingText || '';
  const ratingCount = details?.ratingCount || '';
  const address = details?.address || '';
  const highlights = (details?.highlights || []).slice(0, 12);
  const amenities = (details?.amenities || []).slice(0, 20);
  const roomTypes = (details?.roomTypes || []).slice(0, 8);
  const nearbyAttractions = (details?.nearbyAttractions || []).slice(0, 10);
  const policies = (details?.policies || []).slice(0, 8);
  const languages = (details?.languages || []).slice(0, 6);
  const propertyType = details?.propertyType || 'Hotel';
  const checkInTime = details?.checkInTime || '';
  const checkOutTime = details?.checkOutTime || '';
  const starCount = details?.starCount || 0;
  const latitude = details?.latitude || null;
  const longitude = details?.longitude || null;

  // Booking.com style breadcrumb
  const breadcrumb = `
    <nav class="breadcrumb">
      <a href="/">Home</a>
      <span class="separator">></span>
      <a href="/hotels/">Hotels</a>
      <span class="separator">></span>
      <span class="current">${title}</span>
    </nav>`;

  // Cruise-style rating display (right side of header)
  const ratingDisplay = ratingScore ? `
    <div class="hotel-rating">
      <div class="rating-score">${ratingScore}</div>
      <div class="rating-text">
        <div class="rating-label">${ratingText || 'Excellent'}</div>
        <div class="rating-reviews">${ratingCount || '0'} reviews</div>
      </div>
    </div>` : '';

  // Removed: Booking.com-style "Most popular facilities" section

  // Booking.com style photo gallery
  const photoGallery = images.length ? `
    <div class="booking-gallery">
      <div class="main-photo">
        <img src="/hotels/${enc(hotelName)}/image/${enc(images[0])}" alt="${title}" />
        <button class="photo-count-btn" data-gallery="${enc(hotelName)}">
          <i data-lucide="camera"></i>
          Show all ${images.length} photos
        </button>
      </div>
      <div class="photo-grid">
        ${images.slice(1, 5).map(img => `
          <div class="photo-item">
            <img src="/hotels/${enc(hotelName)}/image/${enc(img)}" alt="${title}" />
          </div>
        `).join('')}
      </div>
    </div>` : '';

  // Cruise-style Facilities section (10 items, 5 per row)
  const DEFAULT_FACILITIES = [
    { icon: 'bed', label: 'Deluxe Rooms' },
    { icon: 'crown', label: 'Royal Suites' },
    { icon: 'glass-water', label: 'Panoramic Lounge' },
    { icon: 'waves', label: 'Sun Deck Pool' },
    { icon: 'sparkles', label: 'Jacuzzi Area' },
    { icon: 'utensils', label: 'Fine Dining' },
    { icon: 'dumbbell', label: 'Fitness Center' },
    { icon: 'wifi', label: 'Wi‑Fi Access' },
    { icon: 'shopping-bag', label: 'Gift Shop' },
    { icon: 'ticket', label: 'Folklore Shows' },
  ];

  const pickIconFor = (t) => {
    const s = (t || '').toLowerCase();
    if (/(wifi|wi\s*-?fi|internet)/.test(s)) return 'wifi';
    if (/(pool|swim|rooftop)/.test(s)) return 'waves';
    if (/(spa|sauna|jacuzzi|hot\s*tub)/.test(s)) return 'sparkles';
    if (/(fitness|gym)/.test(s)) return 'dumbbell';
    if (/(restaurant|dining|breakfast|buffet|food)/.test(s)) return 'utensils';
    if (/(bar|lounge|drink)/.test(s)) return 'glass-water';
    if (/(suite)/.test(s)) return 'crown';
    if (/(room|bed|cabin)/.test(s)) return 'bed';
    if (/(shop|boutique|souvenir)/.test(s)) return 'shopping-bag';
    if (/(show|entertainment|performance|folklore)/.test(s)) return 'ticket';
    return 'check-circle';
  };

  // Build up to 10 facilities from highlights/amenities, fallback to defaults
  const rawFacilities = [...(details?.highlights || []), ...(details?.amenities || [])]
    .map(x => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean);
  const uniqueFacilities = [];
  for (const f of rawFacilities) {
    if (!uniqueFacilities.includes(f)) uniqueFacilities.push(f);
    if (uniqueFacilities.length >= 10) break;
  }
  const facilitiesItems = uniqueFacilities.length
    ? uniqueFacilities.map(label => ({ icon: pickIconFor(label), label }))
    : DEFAULT_FACILITIES;

  const facilitiesSection = `
      <section class="booking-facilities">
        <div class="container">
          <h3>Facilities</h3>
          <div class="facilities-grid">
            ${facilitiesItems.map(it => `
              <div class="facility-item"><i class="facility-icon" data-lucide="${it.icon}"></i><span>${it.label}</span></div>
            `).join('')}
          </div>
        </div>
      </section>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} — Skyward Travel</title>
    <link rel="stylesheet" href="/styles/styles.css" />
  </head>
  <body>
    <div id="site-header"></div>

    <main class="container">
      ${breadcrumb}
      
      <!-- Hotel Header Section -->
      <section class="booking-header">
        <div class="hotel-info">
          <div class="hotel-badges">
            ${starCount ? `<div class="star-rating">${Array.from({ length: starCount }).map(() => '<i data-lucide="star"></i>').join('')}</div>` : ''}
          </div>
          <h1 class="hotel-title">${title}</h1>
          ${address ? `<p class="hotel-location">${address}</p>` : ''}
        </div>
        ${ratingDisplay}
      </section>

      <!-- Photo Gallery -->
      ${photoGallery}

      <!-- Facilities Section -->
      ${facilitiesSection}

      <!-- Main Content -->
      <section class="booking-content">
        <div class="content-main">
          <div class="property-description">
            <h2>About this property</h2>
            <p>${desc}</p>
          </div>

          

          <!-- Additional Amenities -->
          ${amenities.length ? `
          <div class="additional-amenities">
            <h3>All facilities & services</h3>
            <div class="amenities-detailed-grid">
              ${amenities.map(a => `
                <div class="amenity-detailed-item">
                  <i data-lucide="check-circle-2"></i>
                  <span>${a}</span>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          <!-- Room Types -->
          ${roomTypes.length ? `
          <div class="room-types-section">
            <h3>Available room types</h3>
            <div class="room-types-grid">
              ${roomTypes.map(room => `
                <div class="room-type-card">
                  <h4 class="room-name">${room.name}</h4>
                  ${room.features.length ? `
                    <div class="room-features">
                      ${room.features.map(feature => `
                        <span class="room-feature-tag">${feature}</span>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          <!-- Check-in/Check-out Information -->
          ${(checkInTime || checkOutTime) ? `
          <div class="checkin-checkout-info">
            <h3>Check-in & Check-out</h3>
            <div class="checkin-checkout-grid">
              ${checkInTime ? `
                <div class="checkin-info">
                  <i data-lucide="clock"></i>
                  <div>
                    <strong>Check-in:</strong>
                    <span>${checkInTime}</span>
                  </div>
                </div>
              ` : ''}
              ${checkOutTime ? `
                <div class="checkout-info">
                  <i data-lucide="clock"></i>
                  <div>
                    <strong>Check-out:</strong>
                    <span>${checkOutTime}</span>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>` : ''}

          <!-- Nearby Attractions -->
          ${nearbyAttractions.length ? `
          <div class="nearby-attractions">
            <h3>What's nearby</h3>
            <div class="attractions-list">
              ${nearbyAttractions.map(attraction => `
                <div class="attraction-item">
                  <i data-lucide="map-pin"></i>
                  <span>${attraction}</span>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          <!-- Languages Spoken -->
          ${languages.length ? `
          <div class="languages-section">
            <h3>Languages spoken</h3>
            <div class="languages-list">
              ${languages.map(lang => `
                <span class="language-tag">${lang}</span>
              `).join('')}
            </div>
          </div>` : ''}

          <!-- Hotel Policies -->
          ${policies.length ? `
          <div class="hotel-policies">
            <h3>Hotel policies</h3>
            <div class="policies-list">
              ${policies.map(policy => `
                <div class="policy-item">
                  <i data-lucide="info"></i>
                  <span>${policy}</span>
                </div>
              `).join('')}
            </div>
          </div>` : ''}
        </div>
      </section>
    </main>

    <div id="site-footer"></div>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="/scripts/main.js"></script>
  </body>
</html>`;
}

function renderListingHtml(items) {
  const cards = items.map(i => `
          <a class="card card--uniform" href="/hotels/${enc(i.name)}/">
            <div class="card-image">
              ${i.heroImage ? `<img src="/hotels/${enc(i.name)}/image/${enc(i.heroImage)}" alt="${i.title}" loading="lazy" />` : ''}
            </div>
            <div class="card-body">
              ${i.starCount ? `<div class="card-stars">${Array.from({ length: i.starCount }).map(() => '<i data-lucide="star"></i>').join('')}</div>` : ''}
              <h3>${i.title}</h3>
              ${i.ratingCount ? `<p class="reviews-count">${i.ratingCount} reviews</p>` : ''}
            </div>
            <div class="card-actions">${i.ratingScore ? `<span class="rating-badge">${i.ratingScore}</span>` : '<span></span>'}<span class="btn btn-primary" data-i18n="cta.viewDetails">View Details</span></div>
          </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hotels — Skyward Travel</title>
    <link rel="stylesheet" href="/styles/styles.css" />
  </head>
  <body>
    <div id="site-header"></div>
    <section class="hero-banner" style="background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.35)), url('/hotels/Four%20Seasons%20Hotel/image/309415011.jpg');">
      <div class="container">
        <h1>Luxury Hotels &amp; Resorts</h1>
        <p>Handpicked premium accommodations offering exceptional comfort and unforgettable experiences.</p>
      </div>
    </section>
    <main class="container">
      <section class="section">
        <h2 class="section-title">Hotels</h2>
        <p class="section-subtitle">Browse our curated selection and view full details.</p>
        <div class="grid grid-3">
${cards}
        </div>
      </section>
    </main>
    <div id="site-footer"></div>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="/scripts/main.js"></script>
  </body>
</html>`;
}

function parseRegionFromBookingUrl(url) {
  if (!url) return 'Other';
  try {
    const u = url.toLowerCase();
    const qIdx = u.indexOf('?');
    const query = qIdx !== -1 ? u.slice(qIdx + 1) : '';
    const getParam = (name) => {
      const m = query.match(new RegExp(`(?:^|[&])${name}=([^&]+)`));
      return m ? decodeURIComponent(m[1]) : '';
    };
    const label = getParam('label') || '';
    const destType = getParam('dest_type') || '';
    const destId = getParam('dest_id') || '';
    const cityParam = getParam('city') || '';
    const regionParam = getParam('region') || '';

    const hay = [u, label, destType, destId, cityParam, regionParam].join(' ');

    const matchers = [
      { re: /\bsharm(?:[-\s]*el[-\s]*sheikh)?\b/, region: 'Sharm El Sheikh' },
      { re: /\bsouth[-\s]?sinai\b/, region: 'Sharm El Sheikh' },
      { re: /\bnabq\b/, region: 'Sharm El Sheikh' },
      { re: /\bsharks?\s*bay\b/, region: 'Sharm El Sheikh' },
      { re: /\bum+m?\s*el\s*sid\b|\bum\s*sid\b/, region: 'Sharm El Sheikh' },

      { re: /\bhurghada\b/, region: 'Hurghada' },
      { re: /\bmagawish\b/, region: 'Hurghada' },
      { re: /\bmakadi\b/, region: 'Makadi Bay' },
      { re: /\bred[-\s]?sea\b/, region: 'Hurghada' },

      { re: /\balex(?:andria)?\b|\b-?alex-?\b/, region: 'Alexandria' },
      { re: /\bsan\s*stefano\b|\bmontazah\b|\braml\b|\bsaad\s*zaghloul\b/, region: 'Alexandria' },

      { re: /\bcairo\b/, region: 'Cairo' },
      { re: /\bgiza\b/, region: 'Giza' },

      { re: /\bain[-\s]?sokhna\b|\bsokhna\b/, region: 'Ain Sokhna' },
      { re: /\bras\s*(sudr|sidr)\b/, region: 'Ras Sudr' },
    ];

    for (const m of matchers) {
      if (m.re.test(hay)) return m.region;
    }
    return 'Other';
  } catch {
    return 'Other';
  }
}

function detectRegionFromItem(i) {
  const fromUrl = parseRegionFromBookingUrl(i.bookingUrl);
  if (fromUrl !== 'Other') return fromUrl;
  const t = `${i.location || ''} ${i.title || ''}`.toLowerCase();
  if (t.includes('cairo')) return 'Cairo';
  if (t.includes('alexandria')) return 'Alexandria';
  if (t.includes('sharm')) return 'Sharm El Sheikh';
  if (t.includes('hurghada')) return 'Hurghada';
  if (t.includes('makadi')) return 'Makadi Bay';
  if (t.includes('giza')) return 'Giza';
  if (t.includes('sokhna') || t.includes('ain sokhna')) return 'Ain Sokhna';
  return 'Other';
}

function groupAndSort(listItems) {
  const withGroup = listItems.map(i => {
    const curated = CURATED[i.name];
    const fromUrl = parseRegionFromBookingUrl(i.bookingUrl);
    const fallback = detectRegionFromItem(i);
    let base = fromUrl !== 'Other' ? fromUrl : fallback;
    if (base === 'Giza') base = 'Cairo';
    const groupTitle = curated?.group || mapRegionToGroupTitle(base);
    const source = curated?.group ? 'curated' : (fromUrl !== 'Other' ? 'booking_url' : 'address/title');
    console.log(`Classified "${i.title}" -> ${groupTitle} via ${source}`);
    return { ...i, groupTitle };
  });
  const groups = {};
  for (const i of withGroup) {
    if (!groups[i.groupTitle]) groups[i.groupTitle] = [];
    groups[i.groupTitle].push(i);
  }
  const sortItems = arr => arr.sort((a, b) => {
    const scA = a.starCount || 0;
    const scB = b.starCount || 0;
    if (scB !== scA) return scB - scA;
    const rsA = parseFloat(a.ratingScore) || 0;
    const rsB = parseFloat(b.ratingScore) || 0;
    return rsB - rsA;
  });
  const REGION_ORDER_TITLES = [
    'Cairo',
    'Sharm El Sheikh',
    'Hurghada & Makadi Bay',
    'Alexandria',
    'Ain Sokhna / Ras Sudr',
    'Other'
  ];
  return REGION_ORDER_TITLES
    .filter(r => groups[r]?.length)
    .map(r => ({ title: r, items: sortItems(groups[r]) }));
}

function renderListingHtmlGrouped(sections) {
  const renderCard = (i) => `
          <a class="card card--uniform" href="/hotels/${enc(i.name)}/">
            <div class="card-image">
              ${i.heroImage ? `<img src="/hotels/${enc(i.name)}/image/${enc(i.heroImage)}" alt="${i.title}" loading="lazy" />` : ''}
            </div>
            <div class="card-body">
              ${i.starCount ? `<div class="card-stars">${Array.from({ length: i.starCount }).map(() => '<i data-lucide="star"></i>').join('')}</div>` : ''}
              <h3>${i.title}</h3>
              ${i.cardNote ? `<p class="card-note">${i.cardNote}</p>` : ''}
              ${i.ratingCount ? `<p class="reviews-count">${i.ratingCount} reviews</p>` : ''}
            </div>
            <div class="card-actions">${i.ratingScore ? `<span class="rating-badge">${i.ratingScore}</span>` : '<span></span>'}<span class="btn btn-primary" data-i18n="cta.viewDetails">View Details</span></div>
          </a>`;

  const sectionsHtml = sections.map(sec => `
        <div class="listing-group">
        <h3 class="section-title section-title--group">${sec.title}</h3>
        <div class="grid grid-3 listing-grid">
${sec.items.map(renderCard).join('\n')}
        </div>
        </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hotels — Skyward Travel</title>
    <link rel="stylesheet" href="/styles/styles.css" />
  </head>
  <body>
    <div id="site-header"></div>
    <section class="hero-banner" style="background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.35)), url('/hotels/Four%20Seasons%20Hotel/image/309415011.jpg');">
      <div class="container">
        <h1>Luxury Hotels &amp; Resorts</h1>
        <p>Handpicked premium accommodations offering exceptional comfort and unforgettable experiences.</p>
      </div>
    </section>
    <main class="container">
      <section class="section">
        <p class="section-subtitle">Browse our curated selection and view full details.</p>
${sectionsHtml}
      </section>
    </main>
    <div id="site-footer"></div>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="/scripts/main.js"></script>
  </body>
</html>`;
}

async function main() {
  const hotels = getHotelDirs(HOTELS_DIR);
  console.log(`Found ${hotels.length} hotel folders.`);
  const listItems = [];
  for (const hotel of hotels) {
    const hotelPath = path.join(HOTELS_DIR, hotel);
    const infoPath = findInfoMd(hotelPath);
    const bookingUrl = readBookingUrl(infoPath);
    const images = readImages(hotelPath);
    const heroImage = images[0] || null;
    const cardImages = images.slice(0, 3);
    const details = await fetchBookingDetails(bookingUrl);

    const html = renderHtml({ hotelName: hotel, bookingUrl, heroImage, images, details });
    const outPath = path.join(hotelPath, 'index.html');
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`Generated: ${outPath}`);

    const loc = (details?.address || '').split(',').slice(0, 2).map(s => s.trim()).join(', ');
    listItems.push({
      name: hotel,
      title: hotel,
      location: loc || '',
      bookingUrl,
      ratingScore: details?.ratingScore || '',
      ratingText: details?.ratingText || '',
      ratingCount: details?.ratingCount || '',
      heroImage,
      cardImages,
      starCount: details?.starCount || 0,
      cardNote: deriveCardNote(hotel, loc || ''),
    });
  }

  const sections = groupAndSort(listItems);
  const listHtml = renderListingHtmlGrouped(sections);
  const listOut = path.join(HOTELS_DIR, 'index.html');
  fs.writeFileSync(listOut, listHtml, 'utf-8');
  console.log(`Generated listing: ${listOut}`);
}

function deriveCardNote(name, loc) {
  const cur = CURATED[name];
  if (cur?.note) return cur.note;
  return loc || '';
}

function mapRegionToGroupTitle(region) {
  switch (region) {
    case 'Sharm El Sheikh': return 'Sharm El Sheikh';
    case 'Cairo':
    case 'Giza': return 'Cairo';
    case 'Hurghada':
    case 'Makadi Bay': return 'Hurghada & Makadi Bay';
    case 'Alexandria': return 'Alexandria';
    case 'Ain Sokhna':
    case 'Ras Sudr': return 'Ain Sokhna / Ras Sudr';
    default: return 'Other';
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

// خريطة تصنيف منسّقة بالعربية بناءً على قائمتك
// Custom descriptions for specific hotels
const CUSTOM_DESCRIPTIONS = {
  'Rixos Premium Magawish Suites and Villas- Ultra All-Inclusive': `This Luxurious Premium Ultra all-inclusive resort in Hurghada offers only suites and villas with beachfront accommodation with total landscape area of 255.000 m2. It features 1km private sandy beach, 30 Swimming pools (9 types), 1 main buffet restaurant, 7 a-la-carte restaurants, 14 bars and free Wi-Fi in the entire property. This 5-star hotel offers private beach and pool cabanas upon request.

All suites and villas are with a scenic garden sitting, pool and sea views. Each flat TV, safe box, mini bar (refilled daily), Espresso machine, pillow menu, bath amenities.

Guests can enjoy authentic a-la-carte restaurants' cuisines, Brazilian at "La Churrascaria", Turkish at "Lalezar", Far Eastern at "Asian", Fresh Seafood at "Salt", International at "People's" and "Turquoise" the main restaurant with a wide variety.

Rixos Premium Magawish Suites & Villas offers a great variety of activities for all ages such as beach and pool activities, tennis courts, mini football, kids' pools, modern fitness center, diving center, horse riding and more. At "Exclusive Sports Club" professional trainers for yoga, Zumba, aqua aerobics, dance lessons, pilates and crossfit. "Rixy Kids Club" for kids features master classes, craft room, mini disco, children's cinema, playground and themed days. "Anjana Spa" offers a variety of full body massage and care rituals performed by professional therapists, featuring Turkish hammam, private massage rooms, steam rooms, Jacuzzi and sauna, peeling and compresses, complex spa services, hairdresser and beauty salon.`
};

const CURATED = {
  'Crowne Plaza': { group: 'Cairo' },
  'Hotel Flamenco Cairo': { group: 'Cairo' },
  'Sofitel Cairo Nile El Gezirah': { group: 'Cairo' },
  'Steigenberger Pyramids Cairo': { group: 'Cairo' },
  'Cairo Marriott Hotel': { group: 'Cairo' },
  'Ramses Hilton Hotel': { group: 'Cairo' },

  'Concorde El Salam Sharm El Sheikh Front Hotel': { group: 'Sharm El Sheikh' },
  'Monte Carlo Sharm Resort & Spa': { group: 'Sharm El Sheikh' },
  'Pickalbatros Royal Moderna Sharm Aqua Park': { group: 'Sharm El Sheikh' },
  'Rixos Premium Seagate': { group: 'Sharm El Sheikh' },
  'Rixos Radamis Sharm El Sheikh': { group: 'Sharm El Sheikh' },
  'Safir Sharm Waterfalls Resort': { group: 'Sharm El Sheikh' },
  'Sultan Gardens Resort Sharm El Sheikh': { group: 'Sharm El Sheikh' },
  'Steigenberger Alcazar': { group: 'Sharm El Sheikh' },

  'Xanadu Makadi Bay - High Class All Inclusive': { group: 'Hurghada & Makadi Bay' },
  'Serenity Alma Heights - Ex Serenity Fun City': { group: 'Hurghada & Makadi Bay' },
  'Serenity Alpha Beach': { group: 'Hurghada & Makadi Bay' },
  'Rixos Premium Magawish Suites and Villas- Ultra All-Inclusive': { group: 'Hurghada & Makadi Bay' },
  'Sunrise Aqua Joy Resort': { group: 'Hurghada & Makadi Bay' },
  'Sunrise Crystal Bay Resort': { group: 'Hurghada & Makadi Bay' },
  'Pickalbatros White Beach Resort': { group: 'Hurghada & Makadi Bay' },

  'Four Seasons Hotel': { group: 'Alexandria' },
  'Rixos Montaza Alexandria': { group: 'Alexandria' },
  'Steigenberger Cecil Hotel Alexandria': { group: 'Alexandria' },
  'Le Metropole Luxury Heritage': { group: 'Alexandria' },

  'Coral Sea Beach and Aqua Park': { group: 'Ain Sokhna / Ras Sudr' },
};