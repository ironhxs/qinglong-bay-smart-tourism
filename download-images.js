const https = require('https');
const fs = require('fs');
const path = require('path');

// URLs of images to download
const imagesToDownload = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/%E8%AE%B8%E9%A9%B8%E9%A9%B8%E5%BA%9C.JPG',
    filename: 'huizhou-architecture.jpg',
    description: 'Huizhou architecture with distinctive horse-head walls'
  },
  {
    url: 'https://www.globalphotos.org/xiamen/20230528/DJI_0931.jpg',
    filename: 'ancient-bridge.jpg',
    description: 'Ancient stone bridge with arches'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/27/%E7%B4%AB%E9%98%B3%E5%8F%A4%E8%A1%97.JPG',
    filename: 'traditional-pavilion.jpg',
    description: 'Traditional Chinese pavilion by the water'
  },
  {
    url: 'https://baike.baidu.com/pic/%E4%B8%9C%E6%B1%89%E9%8E%8F%E9%87%91%E9%95%B6%E5%B5%8C%E5%85%BD%E5%BD%A2%E9%93%9C%E7%9B%92%E7%A0%9A/5365461/1/bd315c6034a85edf6e5f7a4b42540923dc5475d3',
    filename: 'cultural-artifacts.jpg',
    description: 'Ancient Chinese cultural artifacts including ink stone'
  },
  {
    url: 'https://blog.sina.com.cn/s/blog_828c3e7d0102ylqw.html',
    filename: 'ecological-landscape.jpg',
    description: 'Beautiful ecological landscape with mountains and water'
  },
  {
    url: 'https://img.51yuansu.com/pic3/cover/03/99/77/5f3f6f6c50dc7_610.jpg',
    filename: 'avatar.jpg',
    description: 'Avatar for the virtual character (Xiao Qing Hui)'
  }
];

// Download function
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const targetPath = path.join(__dirname, 'frontend', 'public', 'images', filename);
    
    // For URLs that are direct image links
    if (url.endsWith('.jpg') || url.endsWith('.JPG') || url.endsWith('.png') || url.endsWith('.PNG')) {
      const file = fs.createWriteStream(targetPath);
      
      https.get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${filename}`);
          resolve();
        });
      }).on('error', err => {
        fs.unlink(targetPath, () => {}); // Delete the file if there was an error
        reject(err);
      });
    } else {
      // For URLs that are web pages (we'd need to extract the image)
      console.log(`Skipping ${url} - not a direct image link`);
      resolve();
    }
  });
}

// Create placeholder images for those we can't download directly
function createPlaceholderImage(filename, description) {
  const targetPath = path.join(__dirname, 'frontend', 'public', 'images', filename);
  const content = `// Placeholder for ${filename}\n// ${description}`;
  
  fs.writeFileSync(targetPath, content);
  console.log(`Created placeholder: ${filename}`);
}

// Main function to download all images
async function downloadAllImages() {
  console.log('Starting image downloads...');
  
  for (const image of imagesToDownload) {
    try {
      await downloadImage(image.url, image.filename);
    } catch (error) {
      console.error(`Error downloading ${image.filename}: ${error.message}`);
      createPlaceholderImage(image.filename, image.description);
    }
  }
  
  console.log('Image downloads completed!');
}

// Run the download
downloadAllImages(); 