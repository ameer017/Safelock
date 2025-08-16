const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '../public/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate SVG icons for different sizes
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#35d07f" rx="4"/>
  <text x="${size / 2}" y="${size / 2 + size / 8}" font-family="Arial, sans-serif" font-size="${size / 3}" font-weight="bold" text-anchor="middle" fill="white">C</text>
</svg>`;

  const svgPath = path.join(assetsDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg.trim());
  console.log(`Generated ${svgPath}`);
});

console.log('\nIcon generation complete!');
console.log('To convert SVG to PNG, you can:');
console.log('1. Use an online converter like https://convertio.co/svg-png/');
console.log('2. Use ImageMagick: convert icon-16.svg icon-16.png');
console.log('3. Use a browser to open the SVG and save as PNG');
console.log('4. Use a design tool like Figma, Sketch, or Adobe Illustrator');
