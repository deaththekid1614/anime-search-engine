# 🚀 Anime Discovery Engine - Setup Guide

## Quick Start (One Command)

```bash
cd anime-discovery-engine
./start.sh
```

This starts both backend and frontend automatically!

---

## Manual Setup

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Git** (optional)

### Step 1: Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
# Linux/Mac:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python main.py
```

Backend runs at: `http://localhost:8000`

API docs at: `http://localhost:8000/docs`

### Step 2: Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Your MacBook Air 2015 Specs

Based on your system (Intel i5-5250U, 8GB RAM, Zorin OS 16.3):

| Component | Your Spec | Requirement | Status |
|-----------|-----------|-------------|--------|
| CPU | Intel i5-5250U (2 cores) | Any modern CPU | ✅ Good |
| RAM | 8GB | 4GB minimum | ✅ Good |
| OS | Zorin OS 16.3 (Ubuntu-based) | Linux/Mac/Windows | ✅ Perfect |
| Python | Should be pre-installed | 3.8+ | ✅ Check with `python3 --version` |
| Node.js | May need install | 18+ | ⚠️ Install if needed |

### Install Node.js on Zorin OS

```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should show v20.x.x
npm --version
```

---

## How It Works (Free & No API Keys!)

### Data Source: AniList API
- **Completely FREE** - no API key required
- **Rate limit**: 90 requests/minute (plenty for personal use)
- **Data**: 15,000+ anime titles, ratings, genres, episodes, trailers
- **Updates**: Real-time data from AniList's database

### Streaming Availability
- Curated database for **20+ popular anime** with direct links
- Falls back to generic platform links for unknown titles
- Uses AniList's external links when available

### Architecture
```
Browser → React Frontend → FastAPI Backend → AniList API
                ↓                    ↓
           localStorage          In-Memory Cache
        (Watchlist/History)      (30 min TTL)
```

---

## Features Checklist

| Feature | Status | Details |
|---------|--------|---------|
| Smart Search | ✅ | Title search + vibe search |
| Genre Filters | ✅ | Multi-select from AniList genres |
| Format Filter | ✅ | TV, Movie, OVA, ONA, Special |
| Status Filter | ✅ | Releasing, Finished, Not Yet Released |
| Year Range | ✅ | Min/Max year input |
| Rating Filter | ✅ | Slider 0-10 |
| Episode Count | ✅ | Min/Max episodes |
| Season Filter | ✅ | Winter, Spring, Summer, Fall |
| Sort Options | ✅ | 6 sorting options |
| Vibe Search | ✅ | 40+ vibe keywords mapped |
| Anime Cards | ✅ | Poster, rating, format, episodes, status |
| Detail Page | ✅ | Synopsis, stats, trailer, tabs |
| Episode List | ✅ | Thumbnails, titles, links |
| Cast & Staff | ✅ | Voice actors, directors, studios |
| Related Anime | ✅ | Sequels, prequels, spin-offs |
| Streaming Links | ✅ | Netflix, Crunchyroll, Hulu, etc. |
| Watchlist | ✅ | localStorage persistence |
| Search History | ✅ | localStorage persistence |
| Mobile Responsive | ✅ | Collapsible sidebar, grid layouts |
| Dark Theme | ✅ | Custom anime-centric color scheme |
| Loading States | ✅ | Skeleton cards, spinners |
| Infinite Scroll | ✅ | Load more button |
| Trending Page | ✅ | Most popular right now |
| Top Rated Page | ✅ | Highest rated all time |
| Seasonal Page | ✅ | Browse by season/year |

---

## Customization

### Add More Streaming Links

Edit `backend/main.py` and add entries to `STREAMING_DB`:

```python
STREAMING_DB = {
    # Your anime ID from AniList: [platform links]
    12345: [
        {"platform": "Netflix", "url": "https://netflix.com/...", "type": "subscription"},
        {"platform": "Crunchyroll", "url": "https://crunchyroll.com/...", "type": "subscription"},
    ],
}
```

Find anime IDs at: `https://anilist.co/anime/[ID]`

### Add More Vibe Keywords

Edit `backend/main.py` in the `vibe_keywords` dictionary:

```python
vibe_keywords = {
    "your vibe": {"search": "search term", "genres": ["Genre1", "Genre2"]},
}
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
sudo lsof -t -i:8000 | xargs kill -9

# Kill process on port 5173
sudo lsof -t -i:5173 | xargs kill -9
```

### CORS Errors
The backend already has CORS enabled for all origins. If you still get errors:
```python
# In backend/main.py, change allow_origins to specific URL:
allow_origins=["http://localhost:5173"]
```

### Slow Loading
- First load fetches from AniList API
- Subsequent loads use cached data (30 min TTL)
- Images are lazy-loaded

### npm install fails
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Deployment (Optional)

### Backend (Render/Railway/Heroku)
```bash
# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > backend/Procfile
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Upload dist/ folder to your hosting
```

---

## File Size

| Component | Size |
|-----------|------|
| Backend Code | ~15 KB |
| Frontend Code | ~35 KB |
| Dependencies | ~50 MB (backend) + ~100 MB (frontend) |
| **Total Project** | **~150 MB** |

Fits easily on your 8GB RAM MacBook Air!

---

## Next Steps

1. ✅ Run `./start.sh` to start both servers
2. ✅ Open `http://localhost:5173` in browser
3. ✅ Try searching "assassinations with fun"
4. ✅ Click on Assassination Classroom
5. ✅ Check streaming links and episode list
6. ✅ Save to watchlist
7. ✅ Explore trending, top rated, seasonal pages

**Enjoy your ultimate anime discovery dashboard! 🎌**
