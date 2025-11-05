# Skyward Travel — Internal Maintenance Guide

This project is a static, multi-page site (HTML/CSS/JS) designed to mirror Booking-style grids and galleries. It ships with a unified design system, a language switcher (EN/AR/GR), and placeholder content across all pages.

## Structure

```
/index.html                Home
/packages.html             Packages listing
/packages/*                Package detail pages
/build-your-plan.html      Hub for Hotels / Activities / Cruises / Restaurants
/hotels/                   Hotels listing + detail pages
/activities/               Activities listing + detail pages
/cruises/                  Cruises listing + detail pages
/restaurants/              Restaurants listing + detail pages
/contact.html              Contact page
/styles/styles.css         Design system
/scripts/main.js           Header/footer + i18n + WhatsApp float
/locales/en.json           English translations
/locales/ar.json           Arabic translations (RTL)
/locales/gr.json           Greek translations
```

## Editing Content

- Text: Prefer editing translation strings in `/locales/*.json` for nav, hero, CTAs, and section titles. Page-specific paragraphs can be edited directly in the HTML.
- Images: Use relative paths. Existing demo images live under `/hotels/...`. To add new assets, place them under `/assets/` (recommended) or the relevant category folder and reference them relatively from the page.
- Cards: Duplicate an `<a class="card">` block within a listing page and update the `href`, image, and texts.

## Translations

- Languages supported: `en`, `ar`, `gr`.
- Strings are loaded at runtime from `/locales/<lang>.json`.
- Arabic automatically flips the layout to RTL (`<html dir="rtl">`).
- To add a language: create `/locales/<new>.json` with the same keys and update `supported` in `scripts/main.js`.

## WhatsApp CTA

- A floating WhatsApp button appears on every page.
- Update the phone number in `scripts/main.js` (`wa.me/201234567890`).
- You can also add page-specific CTAs by using the `data-i18n="cta.bookWhatsapp"` label.

## Deployment (Vercel)

1. Ensure all paths are relative (they are) and start with `/` for shared assets.
2. Deploy the project root to Vercel as a static site.
3. Verify pages load, images resolve, and language switcher works. RTL should flip automatically for Arabic.
4. Optional: place heavy images under `/assets/` as `.webp` for better performance.

## Image Optimization

- Use compressed `.webp` when possible. If adding large `.jpg/.png`, compress with a tool like Squoosh.
- Always set `loading="lazy"` on images (already used).

## Adding New Items

- Hotels/Activities/Cruises/Restaurants:
  - Add a new card in the category `index.html` and create a matching detail page using an existing one as a template.
  - Keep titles short (max 2 lines) and descriptions concise.

## Notes

- This is a static build (no backend). All interactions are client-side.
- Keep the design consistent—buttons, card radius, spacing, and colors match `/styles/styles.css`.
- Do not change filenames unless necessary; links use root-relative paths for reliability.