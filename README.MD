# Meta Lead Ads → React Native Real-Time PoC

## Overview
This project demonstrates a real-time pipeline where leads submitted via Meta Lead Ads are instantly displayed in a React Native mobile app without any manual refresh.

## Tech Stack
- Backend: Node.js (Express)
- Realtime: Socket.IO
- Mobile App: React Native (Expo)
- API: Meta Graph API
- Tunneling: ngrok

## Architecture Flow
Meta Lead Form → Webhook → Backend → Graph API → Socket.IO → React Native App

## How It Works
1. A user submits a lead form on Meta.
2. Meta sends a webhook event containing a `leadgen_id`.
3. The backend receives the webhook and fetches full lead details using the Meta Graph API.
4. The backend emits the lead data via Socket.IO.
5. The React Native app receives the event and updates the UI in real-time.

## Setup

### Backend
```bash
npm install
node server.js

Create a .env file:

PORT=
META_VERIFY_TOKEN=
PAGE_ACCESS_TOKEN=

### Mobile App
npm install
npm start

Update socket URL in env

http://YOUR_LOCAL_IP:3000