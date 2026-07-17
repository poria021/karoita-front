import fs from 'fs';
import path from 'path';

function hexToHsl(hex) {
  hex = hex.replace('#', '').toLowerCase();
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  const H = Math.round(h * 360);
  const S = Math.round(s * 1000) / 10;
  const L = Math.round(l * 1000) / 10;
  return `hsl(${H} ${S}% ${L}%)`;
}

const file = path.join('src', 'app', 'globals.css');
let css = fs.readFileSync(file, 'utf8');
const before = (css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
css = css.replace(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g, (match) => hexToHsl(match));
fs.writeFileSync(file, css);
const after = (css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
console.log(`converted ${before - after} hex colors; remaining hex: ${after}`);
