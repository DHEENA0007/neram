# Neram

Node.js + React app for Panchapakshi day/night tables with admin and user portals.

## What it does

- Admin portal for creating application users and disabling accounts.
- User portal for choosing a date, place, and one of the five birds.
- Live place search through Open-Meteo geocoding.
- Sunrise and sunset lookup through `api.sunrise-sunset.org`.
- Table generation from the bundled Pancha Pakshi dataset.
- No axios. All client requests use `fetch`.

## Run it

Open two terminals and run these commands separately:

Terminal 1:

```bash
npm install
npm run dev
```

Terminal 2:

```bash
npm run dev:client
```

Production build:

```bash
npm run build
npm start
```

The app starts with a seeded admin account:

- Username: `admin`
- Password: `admin123`

## Notes

- The backend expects `curl` to be available for the external astronomy and geocoding API calls.
- Default server port is `3001`, and the Vite dev server runs on `5174`.
- `npm run dev` starts the server only.
