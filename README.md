# Mini Hotel Management System — Frontend

This repository contains the React frontend for the Mini Hotel Management System. It provides:

- A client-facing hotel listing (cards) with filters and details
- An admin dashboard for creating, editing and deleting hotels
- SweetAlert2 dialogs for confirmations and feedback
- Image normalization helpers for a variety of backend image path formats

---

## Quick Start

1. Install dependencies

```powershell
npm install
```

2. Run the development server

```powershell
npm start
```

Open http://localhost:3000 (the app redirects `/` → `/hotel`).

3. Build for production

```powershell
npm run build
```

4. Run tests (once)

```powershell
npm test -- --watchAll=false
```

---

## Routes

- Client hotel listing: `/hotel` (root `/` redirects here)
- Admin dashboard (hotel management): `/admin/hotel`

Clicking "Edit" on a client card navigates to the admin form and pre-fills the hotel details.

---

## Features

- Client page (cards): image, name, city, price per night, star rating, amenities, View/Edit/Delete
- Filter sidebar: search by name, city dropdown, amenities checkboxes, price min/max, and star rating dropdown
- Filter reset restores the full list and uses dynamic min/max price bounds derived from loaded data
- Admin page: add/update hotel form, list table with actions
- SweetAlert2 used for success, error, and confirmation dialogs
- Image helpers normalize: absolute URLs, data URIs, `/storage/` paths, `storage/` paths, and `public/` paths

---

## Admin sidebar & navigation

- Admin brand links to admin dashboard (`/admin/hotel`) and shows a quick "View site" link that opens the client listing (`/hotel`) in a new tab
- Nav items use absolute admin routes (e.g., `/admin/hotel`) to avoid path ambiguity
- Accessibility: `aria-label`, `title`, and keyboard-friendly toggles are included

---

## Backend expectations

- API base: `http://localhost:8000`
- Hotels endpoint (GET/POST/PUT/DELETE): `http://localhost:8000/api/hotels`
- Images are expected to be available at `http://localhost:8000/storage/...` when returned as storage paths

If your backend uses a different host or storage path, update the image helper in `src/page/cliemt/hotel/HotelPage.js` and `src/page/admin/hotel/Hotel.js`.

---

## Troubleshooting

- Images not loading: check `image` / `image_url` fields returned by the API and adjust the helper if needed
- No hotels shown: ensure the backend API is running and returns a JSON array
- Routing problems: check `src/App.js` for redirects and route entries

---

## File locations (important)

- `src/service/HotelService.js` — API client
- `src/page/cliemt/hotel/HotelPage.js` — client list & filters (note folder name: `cliemt`)
- `src/page/admin/hotel/Hotel.js` — admin page (form + list)
- `src/page/admin/sidebar.js` — admin navigation

---

If you'd like, I can also append screenshots, a Postman collection for the API, or a short demo script to the README. Tell me which you'd prefer.
