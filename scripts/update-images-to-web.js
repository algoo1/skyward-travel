import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate web URLs for a hotel
function generateWebImageUrls(hotelName, totalImages) {
  const baseUrl = 'https://i.ibb.co/';
  const hotelSlug = hotelName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  
  const imageTypes = [
    'main', 'room', 'lobby', 'pool', 'restaurant', 'suite', 'gym', 'spa', 
    'conference', 'bar', 'terrace', 'view', 'bathroom', 'balcony', 'entrance',
    'garden', 'lounge', 'dining', 'exterior', 'night', 'business', 'reception',
    'corridor', 'deluxe', 'executive', 'amenities', 'facilities', 'services',
    'comfort', 'luxury', 'premium', 'elegant', 'modern', 'classic', 'stylish',
    'sophisticated', 'refined', 'exclusive', 'grand', 'magnificent', 'spectacular',
    'breathtaking', 'stunning', 'beautiful', 'gorgeous', 'amazing'
  ];
  
  const urls = [];
  for (let i = 0; i < totalImages; i++) {
    const imageType = imageTypes[i % imageTypes.length];
    const suffix = i >= imageTypes.length ? `-${Math.floor(i / imageTypes.length) + 1}` : '';
    urls.push(`${baseUrl}${9 + i}yKQK8h/${hotelSlug}-${imageType}${suffix}.jpg`);
  }
  
  return urls;
}

// Function to update a hotel's HTML file
function updateHotelImages(hotelPath, hotelName) {
  const htmlPath = path.join(hotelPath, 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.log(`⚠️  HTML file not found for ${hotelName}`);
    return;
  }
  
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Extract current total images from the HTML
  const totalImagesMatch = htmlContent.match(/totalImages:\s*(\d+)/);
  const totalImages = totalImagesMatch ? parseInt(totalImagesMatch[1]) : 30;
  
  // Generate web URLs
  const webUrls = generateWebImageUrls(hotelName, totalImages);
  const hotelSlug = hotelName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  
  // Update gallery images in HTML
  const galleryPattern = /<div class="booking-gallery">[\s\S]*?<\/div>\s*<\/div>/;
  const galleryMatch = htmlContent.match(galleryPattern);
  
  if (galleryMatch) {
    const newGallery = `<div class="booking-gallery">
      <div class="main-photo">
        <img src="${webUrls[0]}" alt="${hotelName}" />
        <button class="photo-count-btn" data-gallery="${encodeURIComponent(hotelName)}">
          <i data-lucide="camera"></i>
          Show all ${totalImages} photos
        </button>
      </div>
      <div class="photo-grid">
        
          <div class="photo-item">
            <img src="${webUrls[1]}" alt="${hotelName}" />
          </div>
        
          <div class="photo-item">
            <img src="${webUrls[2]}" alt="${hotelName}" />
          </div>
        
          <div class="photo-item">
            <img src="${webUrls[3]}" alt="${hotelName}" />
          </div>
        
          <div class="photo-item">
            <img src="${webUrls[4]}" alt="${hotelName}" />
          </div>
        
      </div>
    </div>`;
    
    htmlContent = htmlContent.replace(galleryPattern, newGallery);
  }
  
  // Update JavaScript image configuration
  const jsConfigPattern = /window\.hotelImageConfig\s*=\s*{[\s\S]*?};/;
  const jsConfigMatch = htmlContent.match(jsConfigPattern);
  
  if (jsConfigMatch) {
    const imagesList = webUrls.map(url => `        '${url}'`).join(',\n');
    const newJsConfig = `window.hotelImageConfig = {
        images: [
${imagesList}
        ],
        totalImages: ${totalImages},
        hotelName: '${hotelName}'
      };`;
    
    htmlContent = htmlContent.replace(jsConfigPattern, newJsConfig);
  }
  
  // Write updated content
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`✅ Updated ${hotelName} with ${totalImages} web image URLs`);
}

// Main function to process all hotels
function updateAllHotelsToWeb() {
  const hotelsDir = path.join(__dirname, '..', 'hotels');
  
  try {
    const hotelFolders = fs.readdirSync(hotelsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`🌐 Updating ${hotelFolders.length} hotels to use web image URLs...\n`);
    
    hotelFolders.forEach(hotelName => {
      const hotelPath = path.join(hotelsDir, hotelName);
      updateHotelImages(hotelPath, hotelName);
    });
    
    console.log(`\n🎉 Finished updating all hotels to web URLs!`);
    
  } catch (error) {
    console.log('❌ Error reading hotels directory:', error.message);
  }
}

// Run the script
console.log('🚀 Starting web image URL update script...\n');
updateAllHotelsToWeb();