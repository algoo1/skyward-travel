import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get all image files from a directory
function getImageFiles(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    }).sort();
  } catch (error) {
    console.log(`❌ Error reading directory ${dirPath}:`, error.message);
    return [];
  }
}

// Function to update hotel HTML file with correct image list
function updateHotelImages(hotelPath, hotelName) {
  const imagePath = path.join(hotelPath, 'image');
  const htmlPath = path.join(hotelPath, 'index.html');
  
  // Get all image files
  const imageFiles = getImageFiles(imagePath);
  
  if (imageFiles.length === 0) {
    console.log(`⚠️  No images found for ${hotelName}`);
    return;
  }
  
  console.log(`📸 Found ${imageFiles.length} images for ${hotelName}`);
  
  // Read the HTML file
  let htmlContent;
  try {
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
  } catch (error) {
    console.log(`❌ Error reading ${htmlPath}:`, error.message);
    return;
  }
  
  // Generate the gallery images array
  const galleryImagesArray = imageFiles.map(file => `'image/${file}'`).join(',\n        ');
  
  // Create the script injection
  const scriptInjection = `
    <script>
      // Hotel-specific image configuration
      window.hotelImageConfig = {
        images: [
        ${galleryImagesArray}
        ],
        totalImages: ${imageFiles.length},
        hotelName: '${hotelName}'
      };
      
      console.log('🏨 Loaded ${imageFiles.length} images for ${hotelName}');
    </script>`;
  
  // Find where to inject the script (before the main.js script)
  const mainScriptPattern = /<script src="\/scripts\/main\.js"><\/script>/;
  
  if (mainScriptPattern.test(htmlContent)) {
    // Replace the main.js script line with our injection + main.js
    const updatedContent = htmlContent.replace(
      mainScriptPattern,
      scriptInjection + '\n    <script src="/scripts/main.js"></script>'
    );
    
    // Write the updated content back
    try {
      fs.writeFileSync(htmlPath, updatedContent, 'utf8');
      console.log(`✅ Updated ${hotelName} with ${imageFiles.length} images`);
    } catch (error) {
      console.log(`❌ Error writing ${htmlPath}:`, error.message);
    }
  } else {
    console.log(`⚠️  Could not find main.js script tag in ${hotelName}`);
  }
}

// Main function to process all hotels
function fixAllHotelImages() {
  const hotelsDir = path.join(__dirname, '..', 'hotels');
  
  try {
    const hotelFolders = fs.readdirSync(hotelsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`🏨 Found ${hotelFolders.length} hotels to process...\n`);
    
    hotelFolders.forEach(hotelName => {
      const hotelPath = path.join(hotelsDir, hotelName);
      updateHotelImages(hotelPath, hotelName);
    });
    
    console.log(`\n🎉 Finished processing all hotels!`);
    
  } catch (error) {
    console.log('❌ Error reading hotels directory:', error.message);
  }
}

// Run the script
console.log('🚀 Starting hotel images fix script...\n');
fixAllHotelImages();