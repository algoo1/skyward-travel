/*
  Generate package detail pages from /packages/* folders.
  - Reads package info from /packages/<Package>/info.md
  - Reads daily images from /packages/<Package>/day X/
  - Reads hero and front images from /packages/<Package>/
  - Writes /packages/<Package>/index.html with daily galleries and activities
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(path.join(__dirname, '..'));
const PACKAGES_DIR = path.join(ROOT, 'packages');

const enc = (s) => encodeURIComponent(s);

function getPackageDirs(baseDir) {
  return fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function parseInfoMd(infoPath) {
  try {
    if (!fs.existsSync(infoPath)) return null;
    
    const content = fs.readFileSync(infoPath, 'utf-8');
    const lines = content.split('\n');
    
    let packageTitle = '';
    let days = [];
    let currentDay = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Extract package title
      if (trimmed.includes('برنامج') || trimmed.includes('Program:')) {
        packageTitle = trimmed.replace(/🌍|🌅|برنامج الرحلة:|Program:/, '').trim();
      }
      
      // Extract day information
      if (trimmed.match(/🗓.*اليوم|🗓.*Day/)) {
        if (currentDay) {
          days.push(currentDay);
        }
        
        const dayMatch = trimmed.match(/اليوم\s+(\S+)|Day\s+(\d+)/);
        const dayNumber = dayMatch ? (dayMatch[1] || dayMatch[2]) : days.length + 1;
        
        currentDay = {
          number: dayNumber,
          title: trimmed.replace(/🗓/, '').trim(),
          activities: []
        };
      } else if (currentDay && trimmed && !trimmed.startsWith('🛶')) {
        // Add activity to current day
        if (trimmed !== '' && !trimmed.match(/^[🌍🌅🗓🛶]/)) {
          currentDay.activities.push(trimmed);
        }
      }
    }
    
    // Add the last day
    if (currentDay) {
      days.push(currentDay);
    }
    
    return {
      title: packageTitle || 'Package Tour',
      days: days
    };
  } catch (error) {
    console.error(`Error parsing info.md: ${error.message}`);
    return null;
  }
}

function getDayImages(packagePath, dayNumber) {
  const dayPath = path.join(packagePath, `day ${dayNumber}`);
  if (!fs.existsSync(dayPath)) return [];
  
  try {
    return fs.readdirSync(dayPath)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort()
      .map(file => ({
        filename: file,
        path: `/packages/${enc(path.basename(packagePath))}/day%20${dayNumber}/${enc(file)}`,
        caption: file.replace(/^\d+[-_]?/, '').replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/[-_]/g, ' ')
      }));
  } catch {
    return [];
  }
}

function getHeroAndFrontImages(packagePath) {
  const packageName = path.basename(packagePath);
  const images = { hero: null, front: null };
  
  try {
    const files = fs.readdirSync(packagePath);
    
    for (const file of files) {
      if (file.startsWith('hero.')) {
        images.hero = `/packages/${enc(packageName)}/${enc(file)}`;
      } else if (file.startsWith('front.')) {
        images.front = `/packages/${enc(packageName)}/${enc(file)}`;
      }
    }
  } catch {
    // Ignore errors
  }
  
  return images;
}

function generatePackageHTML(packageInfo, packageName, images, dayImages) {
  const heroImage = images.hero || '/hotels/Cairo%20Marriott%20Hotel/500324150.jpg';
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${packageInfo.title} — Skyward Travel</title>
    <link rel="stylesheet" href="/styles/styles.css" />
    <style>
      .day-section {
        margin: 2rem 0;
        padding: 1.5rem;
        border-radius: 12px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
      }
      
      .day-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--primary-blue);
      }
      
      .day-title {
        font-size: 1.3rem;
        font-weight: 600;
        color: var(--primary-blue);
        margin: 0;
      }
      
      .day-content {
        display: grid;
        grid-template-columns: 600px 1fr;
        gap: 2rem;
        align-items: start;
      }
      
      .day-activities {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .day-activities li {
        padding: 0.5rem 0;
        padding-right: 1.5rem;
        position: relative;
        color: #333;
        line-height: 1.6;
      }
      
      .day-activities li:before {
        content: "✓";
        position: absolute;
        right: 0;
        color: var(--primary-blue);
        font-weight: bold;
      }
      
      .day-gallery {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #ddd;
        background: #fff;
        transition: all 0.2s ease;
      }
      
      .day-gallery:hover {
        border-color: #ccc;
      }
      
      .gallery-container {
        position: relative;
        width: 100%;
        height: 400px;
        overflow: hidden;
      }
      
      .gallery-slide {
        position: relative;
        display: none;
        width: 100%;
        height: 100%;
      }
      
      .gallery-slide.active {
        display: block;
      }
      
      .gallery-slide img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: none;
      }
      

      
      .gallery-nav {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 6px;
        padding: 6px 12px;
        background: rgba(255,255,255,0.8);
        border-radius: 15px;
        border: 1px solid rgba(0,0,0,0.1);
      }
      
      .gallery-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.8);
        color: #333;
        border: 1px solid rgba(0,0,0,0.1);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all 0.2s ease;
        z-index: 10;
      }
      
      .gallery-arrow:hover {
        background: rgba(255,255,255,0.9);
        transform: translateY(-50%) scale(1.05);
      }
      
      .gallery-arrow.prev {
        left: 10px;
      }
      
      .gallery-arrow.next {
        right: 10px;
      }
      
      .gallery-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255,255,255,0.5);
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid rgba(0,0,0,0.1);
      }
      
      .gallery-dot:hover {
        background: rgba(255,255,255,0.7);
      }
      
      .gallery-dot.active {
        background: rgba(255,255,255,0.9);
        border-color: rgba(0,0,0,0.2);
      }
      

      
      @media (max-width: 1200px) {
        .day-content {
          grid-template-columns: 450px 1fr;
        }
      }
      
      @media (max-width: 900px) {
        .day-content {
          grid-template-columns: 350px 1fr;
        }
      }
      
      @media (max-width: 768px) {
        .day-content {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .gallery-caption {
          font-size: 0.8rem;
          padding: 10px 12px;
          letter-spacing: 0.2px;
        }
      }
      
      @media (max-width: 480px) {
        .gallery-caption {
          font-size: 0.75rem;
          padding: 8px 10px;
          line-height: 1.3;
        }
      }
      
      @media (min-width: 1200px) {
        .gallery-caption {
          font-size: 1rem;
          padding: 14px 18px;
        }
      }
    </style>
  </head>
  <body>
    <div id="site-header"></div>
    <main class="container">
      <section class="hero" style="padding-top:24px;">
        <div>
          <h1>${packageInfo.title}</h1>
          <p data-i18n="hero.subtitle">استكشف مصر من خلال رحلة مميزة تجمع بين التاريخ والثقافة والمغامرة</p>
          <div class="cta-row">
    <a class="btn btn-primary" href="https://wa.me/201126931142" target="_blank" rel="noopener" data-i18n="cta.bookWhatsapp">احجز عبر الواتساب</a>
          </div>
        </div>
        <div class="image-slab">
          <img src="${heroImage}" alt="${packageInfo.title}" loading="lazy"/>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title" data-i18n="package.itinerary">برنامج الرحلة</h2>
        ${packageInfo.days.map(day => {
          const dayImgs = dayImages[day.number] || [];
          return `
          <div class="day-section">
            <div class="day-header">
              <h3 class="day-title">${day.title}</h3>
            </div>
            <div class="day-content">
              ${dayImgs.length > 0 ? `
              <div class="day-gallery" data-day="${day.number}">
                <div class="gallery-container">
                  ${dayImgs.map((img, index) => `
                  <div class="gallery-slide ${index === 0 ? 'active' : ''}">
                    <img src="${img.path}" alt="${img.caption}" loading="lazy"/>
                  </div>
                  `).join('')}
                  ${dayImgs.length > 1 ? `
                  <button class="gallery-arrow prev" data-direction="prev">‹</button>
                  <button class="gallery-arrow next" data-direction="next">›</button>
                  <div class="gallery-nav">
                    ${dayImgs.map((_, index) => `
                    <div class="gallery-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></div>
                    `).join('')}
                  </div>
                  ` : ''}
                </div>
              </div>
              ` : ''}
              <ul class="day-activities">
                ${day.activities.map(activity => `<li>${activity}</li>`).join('')}
              </ul>
            </div>
          </div>
          `;
        }).join('')}
      </section>
    </main>
    <div id="site-footer"></div>
    <script>
      // Gallery functionality
      document.querySelectorAll('.day-gallery').forEach(gallery => {
        const slides = gallery.querySelectorAll('.gallery-slide');
        const dots = gallery.querySelectorAll('.gallery-dot');
        const prevArrow = gallery.querySelector('.gallery-arrow.prev');
        const nextArrow = gallery.querySelector('.gallery-arrow.next');
        
        if (slides.length <= 1) return;
        
        let currentSlide = 0;
        
        function showSlide(index) {
          slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
          });
          dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
          });
        }
        
        function nextSlide() {
          currentSlide = (currentSlide + 1) % slides.length;
          showSlide(currentSlide);
        }
        
        function prevSlide() {
          currentSlide = (currentSlide - 1 + slides.length) % slides.length;
          showSlide(currentSlide);
        }
        
        // Arrow navigation
        if (nextArrow) {
          nextArrow.addEventListener('click', nextSlide);
        }
        
        if (prevArrow) {
          prevArrow.addEventListener('click', prevSlide);
        }
        
        // Dot navigation
        dots.forEach((dot, index) => {
          dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
          });
        });
        
        // Auto-advance slides every 5 seconds
        setInterval(() => {
          nextSlide();
        }, 5000);
      });
    </script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="/scripts/main.js"></script>
  </body>
</html>`;
}

async function generatePackagePage(packageName) {
  const packagePath = path.join(PACKAGES_DIR, packageName);
  const infoPath = path.join(packagePath, 'info.md');
  
  console.log(`Processing package: ${packageName}`);
  
  // Parse package info
  const packageInfo = parseInfoMd(infoPath);
  if (!packageInfo) {
    console.log(`  ⚠️  No valid info.md found for ${packageName}`);
    return;
  }
  
  // Get hero and front images
  const images = getHeroAndFrontImages(packagePath);
  
  // Get daily images
  const dayImages = {};
  for (const day of packageInfo.days) {
    dayImages[day.number] = getDayImages(packagePath, day.number);
  }
  
  // Generate HTML
  const html = generatePackageHTML(packageInfo, packageName, images, dayImages);
  
  // Write HTML file
  const outputPath = path.join(packagePath, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf-8');
  
  console.log(`  ✅ Generated: ${outputPath}`);
}

async function main() {
  console.log('🚀 Generating package pages...\n');
  
  const packageDirs = getPackageDirs(PACKAGES_DIR);
  
  for (const packageName of packageDirs) {
    await generatePackagePage(packageName);
  }
  
  console.log(`\n✨ Generated ${packageDirs.length} package pages!`);
}

main().catch(console.error);