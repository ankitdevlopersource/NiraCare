# HealthHaven Healthcare Logistics

## Features
- Real-time Bed Booking
- Ambulance Tracking & Booking
- Hospital Management System (HMS)
- AI Healthcare Assistant
- Emergency Accident Reporting
- Profile Management with Image Upload
- Gmail-only Registration with OTP Verification

## Setup Instructions

### 1. Environment Variables
Create a `.env` file based on `.env.example` and fill in the following:
- `MONGODB_URI`: Your MongoDB connection string.
- `EMAIL_USER`: Your Gmail address (for sending OTPs).
- `EMAIL_PASS`: Your Gmail App Password (not your regular password).
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API Key.

### 2. Google Maps Integration
To use Google Maps in this application, you need a Google Cloud Project with the following APIs enabled:
- Maps JavaScript API
- Geocoding API
- Places API

**Free Tier:** Google offers a $200 monthly credit which covers a significant amount of usage for small to medium applications. For a completely free alternative, this app already uses **Leaflet.js** with OpenStreetMap in several places.

### 3. Email OTP Setup
To send OTPs via Gmail:
1. Go to your Google Account settings.
2. Enable 2-Step Verification.
3. Search for "App Passwords".
4. Generate a new app password for "Mail" and "Other (Custom Name)".
5. Use this 16-character password in your `.env` as `EMAIL_PASS`.

## Development
```bash
npm install
npm run dev
```

## Production
```bash
npm run build
npm start
```
