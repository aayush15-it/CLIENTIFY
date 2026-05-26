# CLIENTIFY

**Smarter client acquisition starts here.**

---

## Overview

CLIENTIFY is a full-stack AI-powered company intelligence platform designed to streamline client acquisition.
It integrates market research, decision-maker identification, competitor analysis, outreach planning etc. into a single system.

The platform uses a modular **agent-based backend architecture** combined with a **React-based frontend dashboard** to deliver structured and actionable insights.

---

## Tech Stack

**Frontend**

* React (Vite)
* JavaScript (JSX)
* CSS

**Backend**

* Node.js
* Express.js

---

## Project Structure

```id="4c3r2a"
CLIENTIFY/
│
├── client/                  # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/                  # Backend (Node.js)
│   ├── agents/
│   ├── utils/
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

### Run the Application

Backend (from the root directory):

```bash
npm run dev
```

Frontend (from the client directory):

```bash
cd client
npm run dev
```

---

## System Features

* Structured company intelligence generation
* Identification of key decision-makers
* Competitor landscape analysis
* Outreach strategy formulation
* Centralized dashboard for insights

---

## Screenshots

<p align="center">
  <img src="./screenshots/Screenshot (53).png" width="30%" />
  <img src="./screenshots/Screenshot (54).png" width="30%" />
  <img src="./screenshots/Screenshot (55).png" width="30%" />
</p>

<p align="center">
  <img src="./screenshots/Screenshot (56).png" width="30%" />
  <img src="./screenshots/Screenshot (57).png" width="30%" />
  <img src="./screenshots/Screenshot (58).png" width="30%" />
</p>

---

## Notes

* Ensure Node.js is installed before running
* Frontend and backend should be executed in separate terminals
* Sensitive files (like `.env`) are excluded via `.gitignore`
