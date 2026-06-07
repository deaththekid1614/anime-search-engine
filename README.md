# Anime Discovery Engine

A full-stack anime search & discovery web application with OTT streaming availability, genre filters, vibe search, and detailed anime pages.

## Features

- **Smart Search & Discovery**: Natural language vibe search (e.g., "assassinations with fun")
- **Genre & Preference Sidebar**: Multi-select genre filters, format, status, year range, rating, episodes
- **Anime Detail Pages**: Full synopsis, episodes, ratings, studios, directors, voice cast, trailer
- **OTT Platform Availability**: Shows where to watch on Netflix, Crunchyroll, Hulu, Funimation, Amazon Prime, HIDIVE
- **Trending, Top Rated, Seasonal** browsing
- **Watchlist**: Save anime to localStorage
- **Search History**: Persistent search history
- **Dark Mode UI**: Inspired by AniList/MyAnimeList modern designs
- **Responsive**: Mobile-friendly with collapsible sidebar

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router + Lucide Icons
- **Backend**: FastAPI (Python) + httpx
- **Data Source**: AniList GraphQL API (free, no API key needed)
- **Streaming Data**: Curated database + external links from AniList

## Project Structure

```
anime-discovery-engine/
├── backend/
│   ├── main.py              # FastAPI backend
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # API client
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
# Or: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Access the App

Open your browser and go to `http://localhost:5173`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | POST | Search anime with filters |
| `/api/anime/{id}` | GET | Get anime details |
| `/api/trending` | GET | Get trending anime |
| `/api/genres` | GET | Get all genres |
| `/api/seasonal` | GET | Get seasonal anime |
| `/api/top-rated` | GET | Get top rated anime |
| `/api/vibe-search` | GET | Vibe-based search |

## Vibe Search Examples

Try these natural language queries:
- "assassinations with fun" → Assassination Classroom, Sakamoto desu ga?
- "depressing isekai" → Re:Zero, Grimgar
- "wholesome found family" → Spy x Family, Barakamon
- "dark fantasy horror" → Berserk, Tokyo Ghoul
- "mind bending thriller" → Steins;Gate, Death Note
- "epic shounen battle" → Attack on Titan, Demon Slayer

## Streaming Platforms Supported

- Netflix
- Crunchyroll
- Hulu
- Funimation
- Amazon Prime Video
- HIDIVE

## Notes

- The app uses AniList API which is free and requires no API key
- Streaming availability data is curated for popular titles and enriched with external links from AniList
- Data is cached in-memory for 30 minutes to reduce API calls
- Watchlist and search history are stored in browser localStorage

## License

MIT
