import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
HOTELS_DIR = os.path.join(ROOT, 'hotels')

# Inline style block (added only if not present)
STYLE_BLOCK = '''\n    <style>\n      /* Facilities: unified CSS Grid (5 cols desktop, 2 cols mobile), no flex */\n      .booking-facilities .facilities-list {\n        display: grid;\n        grid-template-columns: repeat(5, 1fr);\n        gap: 12px;\n        margin: 0;\n        padding: 0;\n      }\n      .booking-facilities .facility {\n        display: grid;\n        grid-template-columns: 24px 1fr;\n        align-items: center;\n        gap: 8px;\n        padding: 10px;\n        border: 1px solid #e5e7eb;\n        border-radius: 8px;\n        box-sizing: border-box;\n        background: #fff;\n      }\n      .booking-facilities .facility .emoji {\n        font-size: 18px;\n        line-height: 1;\n      }\n      .booking-facilities .facility .label {\n        font-size: 14px;\n      }\n      .facilities, .facilities-wrapper {\n        display: block !important;\n        overflow-x: visible !important;\n        width: 100% !important;\n      }\n      @media (max-width: 768px) {\n        .booking-facilities .facilities-list {\n          grid-template-columns: repeat(2, 1fr);\n          gap: 10px;\n        }\n      }\n    </style>\n'''

DEFAULT_LABELS = [
    'City view', 'Swimming pool', 'Free Wifi', 'Bathtub', 'Air conditioning',
    '24-hour front desk', 'Key card access', 'Daily housekeeping',
    'Non-smoking rooms', 'Safe'
]

def pick_emoji(label: str) -> str:
    """Return a text-presentation emoji (monochrome via VS15 where supported)."""
    s = label.lower()
    VS15 = "\uFE0E"  # text presentation selector (monochrome)
    if 'city' in s and 'view' in s: return '🏙' + VS15
    if 'pool' in s or 'swimming' in s: return '🏊' + VS15
    if 'wifi' in s: return '📶' + VS15
    if 'bath' in s or 'bathtub' in s: return '🛁' + VS15
    if 'air' in s and 'condition' in s: return '❄' + VS15
    if 'front desk' in s or '24-hour' in s: return '🛎' + VS15
    if 'key' in s or 'access' in s: return '🔑' + VS15
    if 'housekeeping' in s: return '🧹' + VS15
    if 'non-smoking' in s: return '🚭' + VS15
    if 'safe' in s or 'security' in s: return '🔒' + VS15
    if 'beach' in s: return '🏖' + VS15
    if 'spa' in s: return '💆' + VS15
    if 'fitness' in s or 'gym' in s: return '🏋' + VS15
    if 'restaurant' in s or 'dining' in s or 'bar' in s: return '🍽' + VS15
    # Fallback: use heavy check as text glyph instead of colored check button
    return '✔' + VS15

FACILITIES_SECTION_RE = re.compile(
    r"(<section\s+class=\"booking-facilities\"[\s\S]*?<div\s+class=\"container\">[\s\S]*?<h3>Facilities</h3>)([\s\S]*?)(</div>\s*</section>)",
    re.IGNORECASE
)

SPAN_LABEL_RE = re.compile(r"<span>(.*?)</span>", re.IGNORECASE)

def extract_labels(middle: str):
    labels = SPAN_LABEL_RE.findall(middle)
    if not labels:
        labels = re.findall(r"<li[^>]*>\s*([^<]+)\s*</li>", middle, re.IGNORECASE)
    # Trim and dedupe
    cleaned = []
    for lbl in labels:
        lbl = lbl.strip()
        if lbl and lbl not in cleaned:
            cleaned.append(lbl)
        if len(cleaned) >= 10:
            break
    return cleaned

def build_facilities(labels):
    if not labels:
        labels = DEFAULT_LABELS
    return '\n'.join(
        f'            <div class="facility"><span class="emoji">{pick_emoji(lbl)}</span><span class="label">{lbl}</span></div>'
        for lbl in labels[:10]
    )

def transform_facilities(html: str) -> str:
    m = FACILITIES_SECTION_RE.search(html)
    if not m:
        return html
    prefix, middle, suffix = m.groups()

    labels = extract_labels(middle)
    facilities_items = build_facilities(labels)

    new_grid = (
        "          <div class=\"facilities-list\">\n" +
        facilities_items +
        "\n          </div>\n"
    )

    new_section = prefix + "\n" + new_grid + suffix
    html = FACILITIES_SECTION_RE.sub(new_section, html)

    # Inject STYLE_BLOCK before </head> if not already present
    if 'booking-facilities .facilities-list' not in html:
        html = re.sub(r"</head>", STYLE_BLOCK + "\n  </head>", html, count=1, flags=re.IGNORECASE)

    return html

def main():
    changed = 0
    for name in os.listdir(HOTELS_DIR):
        path = os.path.join(HOTELS_DIR, name)
        if not os.path.isdir(path):
            continue
        index_path = os.path.join(path, 'index.html')
        if not os.path.isfile(index_path):
            continue
        with open(index_path, 'r', encoding='utf-8') as f:
            html = f.read()
        new_html = transform_facilities(html)
        if new_html != html:
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(new_html)
            changed += 1
            print(f"Updated: {index_path}")
    print(f"Done. Updated {changed} hotel pages.")

if __name__ == '__main__':
    main()