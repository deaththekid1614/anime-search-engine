# Anime Search Engine 🎌

A fast, lightweight anime discovery web app built for anime fans who are tired of slow, cluttered platforms.

---

## 🎯 Problem Statement

Finding anime online is frustrating:
- **Slow loading** — cover images take forever to render, killing the browsing experience
- **Cluttered UI** — most sites are overloaded with ads and unnecessary features
- **No instant search** — results don't update as you type; you have to hit enter and wait
- **Poor mobile experience** — grids break on phones, making browsing painful
- **No offline persistence** — your watchlist disappears when you close the tab

## 💡 Our Solution

This app solves these problems with a clean, performance-first approach:

| Problem | Solution |
|---------|----------|
| Slow image loading | **Lazy loading + Intersection Observer** — images load only when they enter the viewport, with blur-up placeholders for instant perceived performance |
| Cluttered UI | **Minimal, distraction-free design** — no ads, no bloat, just anime |
| Slow search | **Debounced real-time search** — results update as you type (300ms debounce) without hammering the API |
| Broken mobile layout | **Responsive CSS Grid** — adapts from 1 column (mobile) to 5 columns (desktop) seamlessly |
| Lost watchlist | **localStorage persistence** — your favorites stay saved across sessions |

---

## 🚀 Features

- ⚡ **Instant Search** — real-time results as you type
- 🎛️ **Smart Filters** — filter by genre, year, rating, status, type
- 🖼️ **Optimized Images** — lazy-loaded with blur placeholders
- 📱 **Fully Responsive** — works on mobile, tablet, desktop
- 🌗 **Dark/Light Theme** — toggle with persistent preference
- 💾 **Watchlist** — save favorites to localStorage
- 📊 **Anime Details** — rich info view with synopsis, characters, recommendations

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API:** [Jikan API](https://jikan.moe/) (MyAnimeList unofficial API)
- **No build step, no dependencies** — just open `index.html`

---

## 📦 Quick Start

```bash
git clone https://github.com/deaththekid1614/anime-search-engine.git
cd anime-search-engine

# Serve with any static server
python3 -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000`

---

## 🏗️ Project Structure

```
anime-search-engine/
├── index.html
├── css/
│   ├── main.css
│   ├── components.css
│   ├── anime-grid.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── search.js
│   ├── ui.js
│   ├── image-loader.js
│   └── storage.js
└── README.md
```

---

## 🔑 GitHub Token Setup

To push code, generate a Personal Access Token:

1. Go to [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. **Note:** `Anime Search Engine`
3. **Scopes:** ✅ `repo`
4. **Generate & copy** the token (shown once only!)
5. Use it as your password when `git push` asks

---

## 📝 Future Updates

- [ ] User auth & cloud watchlist
- [ ] PWA with offline support
- [ ] Voice search
- [ ] Anime recommendation engine

---

**Built for the anime community.** 🙏
