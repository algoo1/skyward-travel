

# 🧭 **Product Requirements Document (PRD) — Skyward Travel Website**

## 1. Project Overview

**Project Name:** Skyward Travel Website
**Client:** Skyward Travel
**Platform:** Static website (HTML / CSS / JS)
**Deployment:** Vercel
**Purpose:** Create a **luxury travel website** similar to *Booking.com* in structure and visual layout — but with Skyward’s own elegant, minimal identity.
The website must be **responsive, multilingual**, and **ready for editing** with placeholder content filled in for every section.

---

## 2. Objectives

1. Deliver a premium, visually consistent user experience across all pages.
2. Implement a unified design (same layout, colors, typography, header/footer).
3. Ensure all pages are **fully responsive** (mobile-first).
4. Build **all sections and pages with placeholder content** that’s ready for real data later.
5. Provide fast loading performance (<2s) with image optimization.
6. Deploy to **Vercel**, ensuring all paths, images, and links work correctly.
7. Deliver with clear **internal documentation** for content updates.
8. Match **Booking-style grid layout and visual presentation** for listings and galleries.

---

## 3. Scope

### In-Scope

* Full static multi-page website build
* All subpages prebuilt with placeholder content
* Responsive and SEO-friendly structure
* Booking-style grids, cards, and image galleries
* Multi-language system (EN / AR / GR)
* Internal documentation for maintenance

### Out-of-Scope

* Backend / CMS
* Prices, payments, or booking engine
* Login / registration
* Video or animation-heavy content

---

## 4. Design Identity

| Element               | Description                                                                             |
| --------------------- | --------------------------------------------------------------------------------------- |
| **Primary Blue**      | `#0057B8`                                                                               |
| **Accent Gold**       | `#FFD700` (hover highlights only)                                                       |
| **Background**        | White `#FFFFFF`                                                                         |
| **Typography**        | Headings: Poppins or Inter (Bold) <br> Body: Inter or Sans-serif (Light)                |
| **Style**             | Minimal, premium, elegant                                                               |
| **Theme Consistency** | Same across all pages — unified colors, fonts, button style, spacing, and header/footer |

---

## 5. Layout & Components

### Global Layout

* Fixed **Header** (logo + menu + language switcher)
* Fixed **Footer** (blue background + white text + WhatsApp CTA)
* Consistent grid system (12-column)
* Centered content max width: 1440px
* Responsive breakpoints:

  * Mobile: ≤768px
  * Tablet: 769–1024px
  * Desktop: ≥1025px

### Shared Components

| Component            | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| **Button Primary**   | Blue bg + white text → hover gold                          |
| **Button Secondary** | White bg + blue border → hover blue                        |
| **Cards**            | Rounded corners, light shadow, hover lift, CTA turns gold  |
| **Image Grid**       | Like Booking.com — rectangular photos, responsive resizing |
| **WhatsApp Button**  | Always visible (fixed bottom-right or repeated in footer)  |

---

## 6. Website Structure

### 🏠 Homepage

* Hero: background image, tagline, CTA “Explore Packages”
* Packages Preview (3–4 cards grid)
* Build Your Plan Teaser (links to Hotels / Activities / Cruises / Restaurants)
* About (with “Founded in 2024”)
* Contact Preview (phone, WhatsApp, email)
* Fixed Footer

---

### 📦 Packages Page

* Grid of packages (image + title + short description + CTA “View Details”)
* Same card layout for all packages
* Each package links to its detail page

---

### 📄 Package Detail Page

* Large hero image
* Full package description + inclusions/exclusions
* Linked hotels (external to Booking.com)
* Image gallery
* CTA → “Book on WhatsApp”

---

### ✨ Build Your Plan Page

Acts as a hub linking to:

* Hotels
* Activities
* Cruises
* Restaurants

Each opens a **category listing page**, built using the same visual style.

---

## 7. Subpages (Unified Design for All)

All four categories follow **exactly the same layout pattern**:

* Full-width header
* Grid of cards (3–4 per row on desktop, 2 on tablet, 1 on mobile)
* Each card:

  * Featured image
  * Name/title
  * Short description (max 2 lines)
  * CTA: “View Details”
* Clicking a card → opens a detail page
* Detail page:

  * Large image hero
  * Description text
  * Feature/facilities list (or itinerary/menu as applicable)
  * Image gallery (Booking-like horizontal scroll or grid)
  * WhatsApp CTA

### 🏨 Hotels

* Grid of hotels (image + title + short description)
* Each opens a hotel detail page with:

  * Description
  * Facilities list
  * Image gallery (Booking-style slider)
  * CTA: “Book via WhatsApp”

### 🎯 Activities

* Grid of experiences
* Each opens a detail page with:

  * Description
  * Location/Duration
  * Image gallery
  * CTA: “Book via WhatsApp”

### 🚢 Cruises

* Grid of cruises
* Each opens a detail page with:

  * Cruise itinerary
  * Multiple images (gallery)
  * CTA: “Book via WhatsApp”

### 🍽 Restaurants

* Grid of restaurants
* Each opens a detail page with:

  * Description
  * Menu preview section
  * Image gallery
  * CTA: “Book via WhatsApp”

✅ All these pages **must be prebuilt** using demo/placeholder content, with proper structure and dummy text ready for editing later.

---

## 8. Multi-language

* 3 languages: English (LTR), Arabic (RTL), Greek (LTR)
* Language switcher in header (persistent)
* Automatic layout flip for RTL languages
* Content stored in `locales/en.json`, `locales/ar.json`, `locales/gr.json`

---

## 9. Technical Requirements

* Static build: HTML, CSS, JS (no frameworks)
* Fully responsive, mobile-first design
* Images optimized (WebP + lazy loading)
* Meta tags and alt text for SEO
* Page load time < 2 seconds
* Lighthouse score ≥ 90
* Clean semantic HTML5
* Deployment on **Vercel**
* HTTPS enforced
* Relative paths for all images

---

## 10. Deployment & QA

### Deployment

* Hosted on **Vercel**
* Verify all images and links work
* Fix known issue: image paths must be relative
* Confirm that `/public` folder is correctly referenced

### QA Checklist

1. ✅ Responsive test (mobile/tablet/desktop)
2. ✅ Header/Footer uniform across all pages
3. ✅ Images load from correct paths
4. ✅ All hover effects consistent
5. ✅ Language switcher works and realigns layout
6. ✅ WhatsApp buttons link correctly
7. ✅ No 404 or broken links
8. ✅ SEO and meta tags verified

---

## 11. Documentation

An internal file `README_INTERNAL.md` will describe:

* Folder & naming structure
* How to add/edit hotels, activities, cruises, restaurants, packages
* How to update translations
* Steps for deployment on Vercel
* How to compress and add new images

---

## 12. Deliverables

| File                             | Description                        |
| -------------------------------- | ---------------------------------- |
| `/index.html`                    | Homepage                           |
| `/packages.html` + `/packages/*` | Packages listing + detail pages    |
| `/build-your-plan.html`          | Hub page linking to subcategories  |
| `/hotels/`                       | All hotel listing and detail pages |
| `/activities/`                   | All activity pages                 |
| `/cruises/`                      | All cruise pages                   |
| `/restaurants/`                  | All restaurant pages               |
| `/contact.html`                  | Contact info                       |
| `/styles/`                       | CSS files (unified design system)  |
| `/assets/`                       | Optimized WebP images              |
| `/locales/`                      | JSON translation files             |
| `/README_INTERNAL.md`            | Internal documentation             |
| ✅ Deployed Version               | Live on Vercel (production)        |

---

## 13. Success Metrics

* Consistent design system across 100% of pages
* Mobile-first responsiveness
* No broken paths or assets after deployment
* Fully functional language switcher
* Lighthouse score ≥ 90
* Loading time < 2 seconds
* Clear structure for future content updates

---

## 14. Summary

This PRD defines the **complete structure, design language, and technical setup** of the Skyward Travel website.
All category pages — Hotels, Activities, Cruises, and Restaurants — will follow one **Booking-style grid system** with **prebuilt content and unified UI**.
The project must be **delivered fully built and editable**, ensuring that Skyward can easily modify texts, images, and items later.
