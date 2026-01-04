# CULTIVATED TV 📺

**The "Noir" Discovery Dashboard for Stremio Power Users.**

[**🚀 Launch App**](https://cultivated-tv.vercel.app/)

![App Screenshot](https://raw.githubusercontent.com/Sisyphus93/cultivated-tv/refs/heads/main/homepage.jpg)

## 🧐 What is this?
**Cultivated TV** is a custom-built discovery engine designed to replace the standard Stremio browsing experience. It focuses on deep filtering, data transparency, and binge planning.

It was built to answer three questions:
1. *"How long will this show actually take to finish?"*
2. *"Can I find a Sci-Fi show that ISN'T an Anime?"*
3. *"Can I filter my backlog by the shortest binge time?"*

## ✨ Key Features

### 📉 Binge Liability Calculator
Stop guessing. The app calculates the total runtime of every show (e.g., *The Office* = 140 Hours, *Chernobyl* = 5 Hours) so you know the commitment before you start.

### 🔍 Precision Filtering
Standard filters aren't enough. Cultivated TV offers:
*   **Include/Exclude:** Want *Action* but hate *Superhero* movies? You can strictly exclude genres.
*   **Logic Control:** Toggle between **MATCH: ANY** (Broad) and **MATCH: ALL** (Strict) logic.
*   **Era Slider:** A dual-handle slider to filter by specific decades (1900–2031).

### 🔗 Stremio Deep Linking
Found something you like? Click the **"Play on Stremio"** button to instantly open the show in your desktop or mobile Stremio app.

### 📊 The Library (Watchlist)
A local, privacy-focused watchlist that lets you:
*   **Sort by "Shortest Binge":** Clear your backlog by knocking out short shows first.
*   **Track Stats:** See your total "Binge Liability" in hours.

### 🔦 "Noir" Aesthetic
A clean, dark-mode-first UI designed to minimize distractions. The interface uses a "Ghost" design language—buttons and metadata only appear when you interact with the content.

---

## 🔐 Privacy & BYOK (Bring Your Own Key)
This application is **Client-Side Only**. There is no backend server tracking your searches.

To use the app, you need a **TMDB API Key**.
1.  The app uses *your* key to fetch data directly from The Movie Database.
2.  Your key is stored in your browser's `localStorage`.
3.  It is never sent to any third-party server.

[**👉 Get a free TMDB API Key here**](https://www.themoviedb.org/settings/api)

---

## 🛠️ Tech Stack
*   **Framework:** React 18 + Vite
*   **Styling:** Tailwind CSS (Custom "Noir" Config)
*   **Icons:** Lucide React
*   **Data:** TMDB API V3
*   **Deployment:** Vercel

## 💻 Running Locally
If you want to run this code on your own machine:

1.  **Clone the repo**
    ```bash
    git clone https://github.com/Sisyphus93/cultivated-tv.git
    cd cultivated-tv
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the server**
    ```bash
    npm run dev
    ```

## 🤝 Feedback
This project was "vibe coded" as a personal tool, but I'm open to feedback from the Stremio community!
Feel free to open an Issue if you find a bug or have a feature request for v1.3.
