import fs from 'fs';
import path from 'path';

// Generate SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#0300b0" />
  <circle cx="256" cy="256" r="180" fill="#111827" />
  <path d="M160 160 L352 256 L160 352 Z" fill="#F59E0B" />
  <text x="256" y="440" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#FFFFFF" text-anchor="middle">MDIA LAB</text>
</svg>`;

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), svgContent);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), svgContent);

console.log('Icons generated successfully.');
