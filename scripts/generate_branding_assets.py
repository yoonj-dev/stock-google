#!/usr/bin/env python3
"""
Generate Branding Assets for Alphabet on Tap (stock-google)
- Favicon (SVG, PNG 32x32, ICO)
- App Icons (192x192, 512x512, apple-touch-icon 180x180)
- Logo (SVG)
- Web App Manifest (manifest.json)
- ads.txt
"""

import math
import os
from PIL import Image, ImageDraw

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "public")
ICONS_DIR = os.path.join(PUBLIC_DIR, "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

# 1. Generate Favicon SVG (Vector representation of Google 4-color prism with financial vector)
FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="trendGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#60A5FA" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect x="4" y="4" width="92" height="92" rx="24" fill="url(#bg)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

  <!-- Google Prism Ring Arcs -->
  <!-- Blue (Right-Top) -->
  <path d="M 50 18 A 32 32 0 0 1 82 50 L 72 50 A 22 22 0 0 0 50 28 Z" fill="#4285F4"/>
  <!-- Green (Right-Bottom) -->
  <path d="M 82 50 A 32 32 0 0 1 50 82 L 50 72 A 22 22 0 0 0 72 50 Z" fill="#34A853"/>
  <!-- Yellow (Left-Bottom) -->
  <path d="M 50 82 A 32 32 0 0 1 18 50 L 28 50 A 22 22 0 0 0 50 72 Z" fill="#FBBC05"/>
  <!-- Red (Left-Top) -->
  <path d="M 18 50 A 32 32 0 0 1 50 18 L 50 28 A 22 22 0 0 0 28 50 Z" fill="#EA4335"/>

  <!-- Center Financial Dynamic Bar & Trend Arrow -->
  <!-- Candle 1 -->
  <line x1="38" y1="42" x2="38" y2="62" stroke="#EA4335" stroke-width="2" stroke-linecap="round"/>
  <rect x="35" y="46" width="6" height="12" rx="1.5" fill="#EA4335"/>

  <!-- Candle 2 (Breakout) -->
  <line x1="50" y1="34" x2="50" y2="58" stroke="#34A853" stroke-width="2" stroke-linecap="round"/>
  <rect x="47" y="38" width="6" height="14" rx="1.5" fill="#34A853"/>

  <!-- Candle 3 (Surge) -->
  <line x1="62" y1="26" x2="62" y2="52" stroke="#4285F4" stroke-width="2" stroke-linecap="round"/>
  <rect x="59" y="30" width="6" height="16" rx="1.5" fill="#4285F4"/>

  <!-- Upward Momentum Vector Line -->
  <path d="M 28 66 Q 48 54 74 24" fill="none" stroke="url(#trendGrad)" stroke-width="3.5" stroke-linecap="round" filter="url(#glow)"/>
  <polygon points="76,21 68,23 74,29" fill="#60A5FA"/>
</svg>
"""

with open(os.path.join(PUBLIC_DIR, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(FAVICON_SVG.strip())

# 2. Generate Brand Logo SVG
LOGO_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" fill="none">
  <defs>
    <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="logoTrend" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#60A5FA" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
  </defs>

  <!-- Left Icon Mark (64x64) -->
  <g transform="translate(0, 0)">
    <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#logoBg)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    <!-- Google 4-Color Ring -->
    <path d="M 32 14 A 18 18 0 0 1 50 32 L 44 32 A 12 12 0 0 0 32 20 Z" fill="#4285F4"/>
    <path d="M 50 32 A 18 18 0 0 1 32 50 L 32 44 A 12 12 0 0 0 44 32 Z" fill="#34A853"/>
    <path d="M 32 50 A 18 18 0 0 1 14 32 L 20 32 A 12 12 0 0 0 32 44 Z" fill="#FBBC05"/>
    <path d="M 14 32 A 18 18 0 0 1 32 14 L 32 20 A 12 12 0 0 0 20 32 Z" fill="#EA4335"/>
    <!-- Candlestick + Vector Line -->
    <rect x="25" y="27" width="3" height="8" rx="1" fill="#EA4335"/>
    <rect x="31" y="23" width="3" height="10" rx="1" fill="#34A853"/>
    <rect x="37" y="19" width="3" height="11" rx="1" fill="#4285F4"/>
    <path d="M 20 42 Q 31 34 46 16" stroke="url(#logoTrend)" stroke-width="2.5" stroke-linecap="round"/>
    <polygon points="47,14 42,16 45,19" fill="#60A5FA"/>
  </g>

  <!-- Typography: Alphabet on Tap -->
  <text x="72" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Pretendard', sans-serif" font-size="20" font-weight="800" letter-spacing="-0.02em" fill="url(#textGrad)">Alphabet</text>
  
  <!-- "on Tap" Badge Pill -->
  <rect x="174" y="16" width="66" height="22" rx="11" fill="#4285F4" fill-opacity="0.15" stroke="#4285F4" stroke-opacity="0.4" stroke-width="1"/>
  <text x="184" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Pretendard', sans-serif" font-size="11" font-weight="700" fill="#60A5FA" letter-spacing="0.04em">ON TAP</text>

  <!-- Subtitle / Dual Stock Marker -->
  <text x="73" y="49" font-family="-apple-system, BlinkMacSystemFont, 'JetBrains Mono', monospace" font-size="10.5" font-weight="600" fill="#94A3B8" letter-spacing="0.08em">GOOGL <tspan fill="#64748B">·</tspan> GOOG <tspan fill="#34A853">●</tspan> AI RADAR</text>
</svg>
"""

with open(os.path.join(PUBLIC_DIR, "logo.svg"), "w", encoding="utf-8") as f:
    f.write(LOGO_SVG.strip())


# 3. High-resolution Icon Rendering Function using Pillow
def render_icon_image(size: int) -> Image.Image:
    # Supersampling 2x for ultra smooth antialiasing
    scale = 2
    actual_size = size * scale
    img = Image.new("RGBA", (actual_size, actual_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = int(actual_size * 0.04)
    radius = int(actual_size * 0.24)

    # Background Squircle with subtle gradient
    x0, y0 = margin, margin
    x1, y1 = actual_size - margin, actual_size - margin

    for i in range(y0, y1):
        progress = (i - y0) / (y1 - y0)
        r = int(15 * (1 - progress) + 3 * progress)
        g = int(23 * (1 - progress) + 7 * progress)
        b = int(42 * (1 - progress) + 18 * progress)
        # Draw horizontal slice clipped by squircle
        draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=(15, 23, 42, 255))
    
    # Outer subtle glow border
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, outline=(255, 255, 255, 30), width=int(scale * 1.5))

    cx = actual_size / 2
    cy = actual_size / 2
    outer_r = actual_size * 0.32
    inner_r = actual_size * 0.22

    # Draw 4 colored ring segments
    # Blue: top-right (270 to 360)
    # Green: bottom-right (0 to 90)
    # Yellow: bottom-left (90 to 180)
    # Red: top-left (180 to 270)
    colors = [
        (66, 133, 244, 255),   # Blue
        (52, 168, 83, 255),    # Green
        (251, 188, 5, 255),    # Yellow
        (234, 67, 53, 255),    # Red
    ]

    segments = [
        (270, 360, colors[0]),
        (0, 90, colors[1]),
        (90, 180, colors[2]),
        (180, 270, colors[3]),
    ]

    for start_deg, end_deg, color in segments:
        for deg in range(start_deg, end_deg):
            rad = math.radians(deg)
            for r_step in range(int(inner_r), int(outer_r)):
                px = int(cx + r_step * math.cos(rad))
                py = int(cy + r_step * math.sin(rad))
                if 0 <= px < actual_size and 0 <= py < actual_size:
                    draw.point((px, py), fill=color)

    # Candlestick bars in center
    # Candle 1 (Red)
    c1_x = int(cx - actual_size * 0.12)
    c1_w = int(actual_size * 0.06)
    draw.line([(c1_x, int(cy - actual_size * 0.1)), (c1_x, int(cy + actual_size * 0.12))], fill=(234, 67, 53, 255), width=int(scale * 2))
    draw.rounded_rectangle([c1_x - c1_w // 2, int(cy - actual_size * 0.04), c1_x + c1_w // 2, int(cy + actual_size * 0.08)], radius=int(scale * 2), fill=(234, 67, 53, 255))

    # Candle 2 (Green)
    c2_x = int(cx)
    c2_w = int(actual_size * 0.06)
    draw.line([(c2_x, int(cy - actual_size * 0.16)), (c2_x, int(cy + actual_size * 0.08))], fill=(52, 168, 83, 255), width=int(scale * 2))
    draw.rounded_rectangle([c2_x - c2_w // 2, int(cy - actual_size * 0.12), c2_x + c2_w // 2, int(cy + actual_size * 0.04)], radius=int(scale * 2), fill=(52, 168, 83, 255))

    # Candle 3 (Blue)
    c3_x = int(cx + actual_size * 0.12)
    c3_w = int(actual_size * 0.06)
    draw.line([(c3_x, int(cy - actual_size * 0.24)), (c3_x, int(cy + actual_size * 0.04))], fill=(66, 133, 244, 255), width=int(scale * 2))
    draw.rounded_rectangle([c3_x - c3_w // 2, int(cy - actual_size * 0.20), c3_x + c3_w // 2, int(cy - actual_size * 0.02)], radius=int(scale * 2), fill=(66, 133, 244, 255))

    # Upward Trend Vector Line
    trend_pts = []
    p0 = (cx - actual_size * 0.22, cy + actual_size * 0.18)
    p1 = (cx, cy + actual_size * 0.04)
    p2 = (cx + actual_size * 0.24, cy - actual_size * 0.26)

    for t in [i / 40.0 for i in range(41)]:
        # Quadratic bezier
        bx = (1 - t)**2 * p0[0] + 2 * (1 - t) * t * p1[0] + t**2 * p2[0]
        by = (1 - t)**2 * p0[1] + 2 * (1 - t) * t * p1[1] + t**2 * p2[1]
        trend_pts.append((bx, by))

    for i in range(len(trend_pts) - 1):
        pct = i / len(trend_pts)
        r = int(52 * (1 - pct) + 96 * pct)
        g = int(211 * (1 - pct) + 165 * pct)
        b = int(153 * (1 - pct) + 250 * pct)
        draw.line([trend_pts[i], trend_pts[i+1]], fill=(r, g, b, 255), width=int(scale * 3.5))

    # Downscale smoothly to final size
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

# Generate PNGs and ICO
print("[1/5] Generating Icon-512.png...")
img_512 = render_icon_image(512)
img_512.save(os.path.join(ICONS_DIR, "Icon-512.png"), "PNG")

print("[2/5] Generating Icon-192.png...")
img_192 = render_icon_image(192)
img_192.save(os.path.join(ICONS_DIR, "Icon-192.png"), "PNG")

print("[3/5] Generating apple-touch-icon.png...")
img_180 = render_icon_image(180)
img_180.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), "PNG")

print("[4/5] Generating favicon.png...")
img_32 = render_icon_image(32)
img_32.save(os.path.join(PUBLIC_DIR, "favicon.png"), "PNG")

print("[5/5] Generating favicon.ico...")
img_512.save(os.path.join(PUBLIC_DIR, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# 4. Generate Web App Manifest
MANIFEST = """{
  "name": "Alphabet on Tap - GOOGL & GOOG Dual Intelligence",
  "short_name": "Alphabet on Tap",
  "description": "Alphabet (GOOGL/GOOG) All-in-One Dual Stock Intelligence, Real-time Local LLM Synthesis & TradingView Hub",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#09090b",
  "icons": [
    {
      "src": "/icons/Icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/Icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
"""
with open(os.path.join(PUBLIC_DIR, "manifest.json"), "w", encoding="utf-8") as f:
    f.write(MANIFEST.strip())

# 5. Generate ads.txt
ADS_TXT = "google.com, pub-3683251602683857, DIRECT, f08c47fec0942fa0\n"
with open(os.path.join(PUBLIC_DIR, "ads.txt"), "w", encoding="utf-8") as f:
    f.write(ADS_TXT)

print("All branding assets generated successfully!")
