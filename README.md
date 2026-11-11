# iNCO Creative Hub website

One-page cinematic website prototype built from the iNCO Creative Hub Website Design Creative Brief.

Live site: https://sumo69moodley.github.io/inco-creative-hub/

Sections: 01 Home landing (paint film intro), 02 Our work (3D film-reel ring over a YouTube background), 03 Services book, 04 Spaces, 05 Clients and contact.

- Header background: assets/video/paint-film3-hd.mp4 (made from the original paint-film3 upload: trimmed to loop cleanly and upscaled to 1080p with Real-ESRGAN; the original is in the git history).
- Kept for later use: assets/video/walkthrough.mp4 / .webm (Our Work background fallback).
- Change the Our Work YouTube background: edit YT_ID near the top of the script in index.html.
- - Placeholders (client logos, contact details, studio address, enquiry destination) stay until iNCO supplies the approved content.
  -

## Files and service pages (Nov 2026)

- `index.html` is the main page and the single source for all content. Styles are in `assets/css/site.css`, scripts in `assets/js/site.js` (shared by every page).
- Service pages `vodcasting.html`, `videography.html`, `photography.html` and `events.html` are generated from `index.html` (booklet text and photo, that service's packages panel, nav, contact, enquiry drawer). **After editing any of those in `index.html`, run `python3 tools/build_pages.py` and commit the regenerated pages.** Don't edit the service pages by hand.
- Rates & packages sit in the Pricing section of the main page (no pop-up). The booking form moves under whichever package's "Book this" is pressed, on the main page or a service page.
- `sitemap.xml` and `robots.txt` are written by the same script. Update `BASE` in `tools/build_pages.py` (and the canonical link in `index.html`) when the site moves to its own domain.

