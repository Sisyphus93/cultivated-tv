# CULTIVATED TV 📺

**A quiet, editorial discovery dashboard for Stremio power users.**

[**🚀 Launch App**](https://cultivated-tv.vercel.app/)

![App Screenshot](https://raw.githubusercontent.com/Sisyphus93/cultivated-tv/refs/heads/main/homepage.jpg)

> The screenshot above shows the original "noir" build. The current UI is a light, print-inspired
> editorial theme — cream paper, Playfair Display headlines and dark-ink accents.

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
*   **Multi-Language:** Select several original languages at once (e.g., *English + Korean + Japanese*), or exclude the ones you don't want (everything *except* Anime staples like Japanese). Click a language once to include it, again to exclude it.
*   **Logic Control:** Toggle between **MATCH: ANY** (Broad) and **MATCH: ALL** (Strict) logic.
*   **Era Slider:** A dual-handle slider to filter by specific decades, with decade presets (1900–2031).
*   **Live filter pills:** Each pill (Rating, Votes, Years, Language, Sort) opens an inline panel and shows the result count as you tweak it.

### 🔗 Stremio Deep Linking
Found something you like? Click the **"Play on Stremio"** button to instantly open the show in your desktop or mobile Stremio app.

### 📊 The Library (Watchlist)
A local, privacy-focused watchlist that lets you:
*   **Sort by "Shortest Binge":** Clear your backlog by knocking out short shows first.
*   **Track Stats:** See your total "Binge Liability" in hours, right in the toolbar.

### 📰 Editorial Aesthetic
A light, print-inspired interface: warm paper (`#F6F4F0`), Playfair Display headlines paired with
Inter for interface text, hairline rules and a single dark-ink accent colour. Posters and the wide
hero banner carry the mood so the layout itself stays calm and readable.

### 🧭 More Worlds to Explore
Under every result set, a poster rail suggests adjacent titles drawn from TMDb recommendations —
so one good show leads to the next.

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
*   **Styling:** Tailwind CSS (custom editorial palette: paper / ink / line)
*   **Typefaces:** Playfair Display + Inter, self-hosted via `@fontsource` (no external font requests)
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
