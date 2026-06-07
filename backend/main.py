"""
Anime Discovery Engine - Backend API
FastAPI backend serving anime data from free APIs (AniList, Jikan)
"""
import asyncio
import json
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
from pydantic import BaseModel

# ============== CONFIG ==============
ANILIST_API = "https://graphql.anilist.co"
JIKAN_API = "https://api.jikan.moe/v4"
CACHE_TTL_MINUTES = 30

# In-memory cache
_cache: Dict[str, Dict[str, Any]] = {}

# ============== MODELS ==============
class AnimeCard(BaseModel):
    id: int
    title: str
    title_english: Optional[str] = None
    image: str
    year: Optional[int] = None
    rating: Optional[float] = None
    genres: List[str] = []
    format: str = "TV"
    episodes: Optional[int] = None
    status: str = ""
    description: str = ""

class AnimeDetail(BaseModel):
    id: int
    title: str
    title_english: Optional[str] = None
    image: str
    banner_image: Optional[str] = None
    year: Optional[int] = None
    rating: Optional[float] = None
    mean_score: Optional[float] = None
    genres: List[str] = []
    format: str = "TV"
    episodes: Optional[int] = None
    duration: Optional[int] = None
    status: str = ""
    description: str = ""
    studios: List[str] = []
    directors: List[str] = []
    voice_cast: List[Dict[str, str]] = []
    streaming: List[Dict[str, str]] = []
    trailer_url: Optional[str] = None
    related_anime: List[AnimeCard] = []
    episode_list: List[Dict[str, Any]] = []
    tags: List[str] = []
    source: str = ""
    season: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    genres: List[str] = []
    formats: List[str] = []
    status: List[str] = []
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    rating_min: Optional[float] = None
    episodes_min: Optional[int] = None
    episodes_max: Optional[int] = None
    season: Optional[str] = None
    sort: str = "POPULARITY_DESC"
    page: int = 1
    per_page: int = 20

# ============== CACHE HELPERS ==============
def _cache_key(prefix: str, **kwargs) -> str:
    return f"{prefix}:{json.dumps(kwargs, sort_keys=True)}"

def _get_cached(key: str):
    if key in _cache:
        entry = _cache[key]
        if datetime.now() - entry["time"] < timedelta(minutes=CACHE_TTL_MINUTES):
            return entry["data"]
    return None

def _set_cached(key: str, data: Any):
    _cache[key] = {"data": data, "time": datetime.now()}

# ============== ANILIST QUERIES ==============
SEARCH_ANIME_QUERY = """
query ($search: String, $page: Int, $perPage: Int, $genre_in: [String], $format_in: [MediaFormat], 
       $status_in: [MediaStatus], $seasonYear_greater: Int, $seasonYear_lesser: Int, 
       $averageScore_greater: Int, $episodes_greater: Int, $episodes_lesser: Int,
       $season: MediaSeason, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total currentPage lastPage hasNextPage }
    media(type: ANIME, search: $search, genre_in: $genre_in, format_in: $format_in,
          status_in: $status_in, seasonYear_greater: $seasonYear_greater, 
          seasonYear_lesser: $seasonYear_lesser, averageScore_greater: $averageScore_greater,
          episodes_greater: $episodes_greater, episodes_lesser: $episodes_lesser,
          season: $season, sort: $sort) {
      id
      title { romaji english native }
      coverImage { large medium }
      seasonYear
      averageScore
      genres
      format
      episodes
      status
      description(asHtml: false)
      bannerImage
    }
  }
}
"""

ANIME_DETAIL_QUERY = """
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    coverImage { large medium }
    bannerImage
    seasonYear
    averageScore
    meanScore
    genres
    format
    episodes
    duration
    status
    description(asHtml: false)
    studios { edges { node { name isMain } } }
    staff(page: 1, perPage: 10) { edges { role node { name { full } } } }
    characters(page: 1, perPage: 10) { edges { role node { name { full } voiceActors { languageV2 name { full } } } } }
    trailer { id site }
    streamingEpisodes { title thumbnail url }
    tags { name rank isMediaSpoiler }
    source
    season
    relations { edges { relationType node { id title { romaji english } coverImage { large } seasonYear averageScore genres format episodes status } } }
    externalLinks { url site }
  }
}
"""

TRENDING_QUERY = """
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total currentPage lastPage hasNextPage }
    media(type: ANIME, sort: TRENDING_DESC) {
      id
      title { romaji english native }
      coverImage { large medium }
      seasonYear
      averageScore
      genres
      format
      episodes
      status
      description(asHtml: false)
      bannerImage
    }
  }
}
"""

GENRES_QUERY = """
query { GenreCollection }
"""

# ============== STREAMING DATA (Manual mapping for popular titles) ==============
# Since JustWatch requires partner tokens, we use a curated mapping + fallback
STREAMING_DB = {
    # Attack on Titan
    16498: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/attack-on-titan", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/70299043", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/attack-on-titan", "type": "subscription"},
        {"platform": "Funimation", "url": "https://www.funimation.com/shows/attack-on-titan/", "type": "subscription"},
    ],
    # Demon Slayer
    101922: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/demon-slayer-kimetsu-no-yaiba", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/81091393", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/demon-slayer-kimetsu-no-yaiba", "type": "subscription"},
    ],
    # Jujutsu Kaisen
    113415: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/jujutsu-kaisen", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/81278456", "type": "subscription"},
    ],
    # One Piece
    21: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/one-piece", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/80107103", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/one-piece", "type": "subscription"},
        {"platform": "Funimation", "url": "https://www.funimation.com/shows/one-piece/", "type": "subscription"},
    ],
    # Naruto
    20: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/naruto", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/70205012", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/naruto", "type": "subscription"},
    ],
    # Death Note
    1535: [
        {"platform": "Netflix", "url": "https://www.netflix.com/title/70204970", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/death-note", "type": "subscription"},
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/death-note", "type": "subscription"},
    ],
    # Fullmetal Alchemist: Brotherhood
    5114: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/fullmetal-alchemist-brotherhood", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/70204981", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/fullmetal-alchemist-brotherhood", "type": "subscription"},
    ],
    # Spy x Family
    140960: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/spy-x-family", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/81511410", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/spy-x-family", "type": "subscription"},
    ],
    # Chainsaw Man
    127230: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/chainsaw-man", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/chainsaw-man", "type": "subscription"},
    ],
    # Assassination Classroom
    20755: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/assassination-classroom", "type": "subscription"},
        {"platform": "Funimation", "url": "https://www.funimation.com/shows/assassination-classroom/", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/assassination-classroom", "type": "subscription"},
    ],
    # Sakamoto desu ga?
    21507: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/havent-you-heard-im-sakamoto", "type": "subscription"},
        {"platform": "HIDIVE", "url": "https://www.hidive.com/tv/havent-you-heard-im-sakamoto", "type": "subscription"},
    ],
    # Re:Zero
    21355: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/rezero-starting-life-in-another-world-", "type": "subscription"},
    ],
    # Steins;Gate
    9253: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/steinsgate", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/steinsgate", "type": "subscription"},
    ],
    # Your Name (Movie)
    21519: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/your-name", "type": "subscription"},
        {"platform": "Amazon Prime", "url": "https://www.amazon.com/Your-Name-Makoto-Shinkai/dp/B071G4F9Z9", "type": "rent"},
    ],
    # A Silent Voice
    28851: [
        {"platform": "Netflix", "url": "https://www.netflix.com/title/80223226", "type": "subscription"},
        {"platform": "Amazon Prime", "url": "https://www.amazon.com/Silent-Voice-Miyu-Irino/dp/B0767MNQ7J", "type": "rent"},
    ],
    # Hunter x Hunter
    11061: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/hunter-x-hunter", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/70300435", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/hunter-x-hunter", "type": "subscription"},
    ],
    # My Hero Academia
    21459: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/my-hero-academia", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/80135674", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/my-hero-academia", "type": "subscription"},
        {"platform": "Funimation", "url": "https://www.funimation.com/shows/my-hero-academia/", "type": "subscription"},
    ],
    # Vinland Saga
    101348: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/vinland-saga", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/81249833", "type": "subscription"},
        {"platform": "Amazon Prime", "url": "https://www.amazon.com/Vinland-Saga-Season-1/dp/B07TNV7J8Q", "type": "subscription"},
    ],
    # Tokyo Ghoul
    22319: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/tokyo-ghoul", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/tokyo-ghoul", "type": "subscription"},
        {"platform": "Funimation", "url": "https://www.funimation.com/shows/tokyo-ghoul/", "type": "subscription"},
    ],
    # Cowboy Bebop
    1: [
        {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com/cowboy-bebop", "type": "subscription"},
        {"platform": "Netflix", "url": "https://www.netflix.com/title/80001305", "type": "subscription"},
        {"platform": "Hulu", "url": "https://www.hulu.com/series/cowboy-bebop", "type": "subscription"},
    ],
}

# Default streaming suggestions for unknown anime
DEFAULT_STREAMING = [
    {"platform": "Crunchyroll", "url": "https://www.crunchyroll.com", "type": "subscription"},
    {"platform": "Netflix", "url": "https://www.netflix.com", "type": "subscription"},
    {"platform": "Hulu", "url": "https://www.hulu.com", "type": "subscription"},
    {"platform": "Funimation", "url": "https://www.funimation.com", "type": "subscription"},
    {"platform": "HIDIVE", "url": "https://www.hidive.com", "type": "subscription"},
]

# ============== API CLIENT ==============
async def anilist_request(query: str, variables: Dict[str, Any]) -> Dict[str, Any]:
    cache_key = _cache_key("anilist", query=query[:50], vars=json.dumps(variables, sort_keys=True))
    cached = _get_cached(cache_key)
    if cached:
        return cached

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            ANILIST_API,
            json={"query": query, "variables": variables},
            headers={"Content-Type": "application/json", "Accept": "application/json"}
        )
        if response.status_code == 429:
            await asyncio.sleep(2)
            response = await client.post(
                ANILIST_API,
                json={"query": query, "variables": variables},
                headers={"Content-Type": "application/json", "Accept": "application/json"}
            )
        response.raise_for_status()
        data = response.json()
        _set_cached(cache_key, data)
        return data

# ============== TRANSFORMERS ==============
def transform_anime_card(media: Dict) -> Dict[str, Any]:
    return {
        "id": media.get("id"),
        "title": media.get("title", {}).get("romaji", "Unknown"),
        "title_english": media.get("title", {}).get("english"),
        "image": media.get("coverImage", {}).get("large") or media.get("coverImage", {}).get("medium", ""),
        "year": media.get("seasonYear"),
        "rating": (media.get("averageScore") or 0) / 10 if media.get("averageScore") else None,
        "genres": media.get("genres", []),
        "format": media.get("format", "TV"),
        "episodes": media.get("episodes"),
        "status": media.get("status", "").replace("_", " ").title(),
        "description": (media.get("description") or "").replace("<br>", " ").replace("<i>", "").replace("</i>", ""),
        "banner_image": media.get("bannerImage"),
    }

def transform_anime_detail(media: Dict) -> Dict[str, Any]:
    # Studios
    studios = []
    for edge in media.get("studios", {}).get("edges", []):
        if edge.get("node"):
            studios.append(edge["node"].get("name", ""))

    # Directors
    directors = []
    for edge in media.get("staff", {}).get("edges", []):
        role = edge.get("role", "").lower()
        if "director" in role or "chief director" in role:
            if edge.get("node"):
                directors.append(edge["node"].get("name", {}).get("full", ""))

    # Voice cast
    voice_cast = []
    for edge in media.get("characters", {}).get("edges", []):
        char_node = edge.get("node", {})
        char_name = char_node.get("name", {}).get("full", "")
        for va in char_node.get("voiceActors", []):
            va_name = va.get("name", {}).get("full", "")
            language = va.get("languageV2", "Japanese")
            voice_cast.append({
                "character": char_name,
                "voice_actor": va_name,
                "language": language
            })

    # Trailer
    trailer = media.get("trailer")
    trailer_url = None
    if trailer:
        site = trailer.get("site", "")
        vid_id = trailer.get("id", "")
        if site == "youtube" and vid_id:
            trailer_url = f"https://www.youtube.com/embed/{vid_id}"

    # Related anime
    related = []
    for edge in media.get("relations", {}).get("edges", []):
        rel_type = edge.get("relationType", "").replace("_", " ").title()
        node = edge.get("node", {})
        if node and node.get("type") == "ANIME":
            related.append({
                "id": node.get("id"),
                "title": node.get("title", {}).get("romaji", "Unknown"),
                "title_english": node.get("title", {}).get("english"),
                "image": node.get("coverImage", {}).get("large") or node.get("coverImage", {}).get("medium", ""),
                "year": node.get("seasonYear"),
                "rating": (node.get("averageScore") or 0) / 10 if node.get("averageScore") else None,
                "genres": node.get("genres", []),
                "format": node.get("format", "TV"),
                "episodes": node.get("episodes"),
                "status": node.get("status", "").replace("_", " ").title(),
                "description": "",
                "relation_type": rel_type,
            })

    # Episodes
    episodes = []
    for ep in media.get("streamingEpisodes", [])[:50]:
        episodes.append({
            "title": ep.get("title", ""),
            "thumbnail": ep.get("thumbnail", ""),
            "url": ep.get("url", ""),
        })

    # Tags
    tags = [t.get("name", "") for t in media.get("tags", []) if not t.get("isMediaSpoiler", False)]

    # Streaming
    anime_id = media.get("id")
    streaming = STREAMING_DB.get(anime_id, DEFAULT_STREAMING)

    # External links for streaming
    for link in media.get("externalLinks", []):
        site = link.get("site", "").lower()
        url = link.get("url", "")
        if any(p in site for p in ["crunchyroll", "netflix", "hulu", "funimation", "hidive", "prime", "amazon"]):
            platform = site.title()
            if "prime" in site or "amazon" in site:
                platform = "Amazon Prime"
            elif "crunchyroll" in site:
                platform = "Crunchyroll"
            elif "netflix" in site:
                platform = "Netflix"
            elif "hulu" in site:
                platform = "Hulu"
            elif "funimation" in site:
                platform = "Funimation"
            elif "hidive" in site:
                platform = "HIDIVE"

            # Check if already exists
            if not any(s["platform"] == platform for s in streaming):
                streaming.append({"platform": platform, "url": url, "type": "subscription"})

    return {
        "id": media.get("id"),
        "title": media.get("title", {}).get("romaji", "Unknown"),
        "title_english": media.get("title", {}).get("english"),
        "image": media.get("coverImage", {}).get("large") or media.get("coverImage", {}).get("medium", ""),
        "banner_image": media.get("bannerImage"),
        "year": media.get("seasonYear"),
        "rating": (media.get("averageScore") or 0) / 10 if media.get("averageScore") else None,
        "mean_score": (media.get("meanScore") or 0) / 10 if media.get("meanScore") else None,
        "genres": media.get("genres", []),
        "format": media.get("format", "TV"),
        "episodes": media.get("episodes"),
        "duration": media.get("duration"),
        "status": media.get("status", "").replace("_", " ").title(),
        "description": (media.get("description") or "").replace("<br>", " ").replace("<i>", "").replace("</i>", ""),
        "studios": studios,
        "directors": directors,
        "voice_cast": voice_cast[:15],
        "streaming": streaming,
        "trailer_url": trailer_url,
        "related_anime": related[:10],
        "episode_list": episodes,
        "tags": tags[:20],
        "source": media.get("source", "").replace("_", " ").title(),
        "season": media.get("season", "").title() if media.get("season") else None,
    }

# ============== FASTAPI APP ==============
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Anime Discovery Engine API starting...")
    yield
    # Shutdown
    print("👋 API shutting down...")

app = FastAPI(
    title="Anime Discovery Engine API",
    description="Full-stack anime search & discovery with OTT availability",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Anime Discovery Engine API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "cache_size": len(_cache)}

@app.post("/api/search")
async def search_anime(req: SearchRequest):
    """Search anime with filters and semantic-like query matching"""
    cache_key = _cache_key("search", **req.model_dump())
    cached = _get_cached(cache_key)
    if cached:
        return cached

    # Map format strings
    format_map = {
        "TV": "TV", "TV_SHORT": "TV_SHORT", "MOVIE": "MOVIE",
        "SPECIAL": "SPECIAL", "OVA": "OVA", "ONA": "ONA",
        "MUSIC": "MUSIC", "NOVEL": "NOVEL", "ONE_SHOT": "ONE_SHOT"
    }
    format_in = [format_map.get(f.upper(), f.upper()) for f in req.formats if f.upper() in format_map]

    # Map status
    status_map = {
        "ONGOING": "RELEASING", "COMPLETED": "FINISHED",
        "NOT_YET_RELEASED": "NOT_YET_RELEASED", "CANCELLED": "CANCELLED",
        "HIATUS": "HIATUS"
    }
    status_in = [status_map.get(s.upper(), s.upper()) for s in req.status if s.upper() in status_map]

    # Map sort
    sort_map = {
        "POPULARITY_DESC": "POPULARITY_DESC",
        "SCORE_DESC": "SCORE_DESC",
        "TRENDING_DESC": "TRENDING_DESC",
        "START_DATE_DESC": "START_DATE_DESC",
        "START_DATE": "START_DATE",
        "TITLE_ENGLISH": "TITLE_ENGLISH",
        "TITLE_ENGLISH_DESC": "TITLE_ENGLISH_DESC",
        "FAVOURITES_DESC": "FAVOURITES_DESC",
    }
    sort = sort_map.get(req.sort, "POPULARITY_DESC")

    variables = {
        "search": req.query if req.query else None,
        "page": req.page,
        "perPage": req.per_page,
        "genre_in": req.genres if req.genres else None,
        "format_in": format_in if format_in else None,
        "status_in": status_in if status_in else None,
        "seasonYear_greater": req.year_min,
        "seasonYear_lesser": req.year_max,
        "averageScore_greater": int(req.rating_min * 10) if req.rating_min else None,
        "episodes_greater": req.episodes_min,
        "episodes_lesser": req.episodes_max,
        "season": req.season.upper() if req.season else None,
        "sort": [sort],
    }

    # Remove None values
    variables = {k: v for k, v in variables.items() if v is not None}

    try:
        result = await anilist_request(SEARCH_ANIME_QUERY, variables)
        page_data = result.get("data", {}).get("Page", {})
        media_list = page_data.get("media", [])
        page_info = page_data.get("pageInfo", {})

        response = {
            "results": [transform_anime_card(m) for m in media_list],
            "page_info": {
                "total": page_info.get("total", 0),
                "current_page": page_info.get("currentPage", 1),
                "last_page": page_info.get("lastPage", 1),
                "has_next_page": page_info.get("hasNextPage", False),
            }
        }
        _set_cached(cache_key, response)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/api/anime/{anime_id}")
async def get_anime_detail(anime_id: int):
    """Get detailed anime info by ID"""
    cache_key = _cache_key("detail", id=anime_id)
    cached = _get_cached(cache_key)
    if cached:
        return cached

    try:
        result = await anilist_request(ANIME_DETAIL_QUERY, {"id": anime_id})
        media = result.get("data", {}).get("Media")
        if not media:
            raise HTTPException(status_code=404, detail="Anime not found")

        detail = transform_anime_detail(media)
        _set_cached(cache_key, detail)
        return detail
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch anime: {str(e)}")

@app.get("/api/trending")
async def get_trending(page: int = Query(1, ge=1), per_page: int = Query(20, ge=1, le=50)):
    """Get trending anime"""
    cache_key = _cache_key("trending", page=page, per_page=per_page)
    cached = _get_cached(cache_key)
    if cached:
        return cached

    try:
        result = await anilist_request(TRENDING_QUERY, {"page": page, "perPage": per_page})
        page_data = result.get("data", {}).get("Page", {})
        media_list = page_data.get("media", [])
        page_info = page_data.get("pageInfo", {})

        response = {
            "results": [transform_anime_card(m) for m in media_list],
            "page_info": {
                "total": page_info.get("total", 0),
                "current_page": page_info.get("currentPage", 1),
                "last_page": page_info.get("lastPage", 1),
                "has_next_page": page_info.get("hasNextPage", False),
            }
        }
        _set_cached(cache_key, response)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trending: {str(e)}")

@app.get("/api/genres")
async def get_genres():
    """Get all available genres"""
    cache_key = _cache_key("genres")
    cached = _get_cached(cache_key)
    if cached:
        return cached

    try:
        result = await anilist_request(GENRES_QUERY, {})
        genres = result.get("data", {}).get("GenreCollection", [])
        response = {"genres": genres}
        _set_cached(cache_key, response)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch genres: {str(e)}")

@app.get("/api/seasonal")
async def get_seasonal(
    season: str = Query("SUMMER"),
    year: int = Query(2024),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50)
):
    """Get seasonal anime"""
    cache_key = _cache_key("seasonal", season=season, year=year, page=page, per_page=per_page)
    cached = _get_cached(cache_key)
    if cached:
        return cached

    query = """
    query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {
          id
          title { romaji english native }
          coverImage { large medium }
          seasonYear
          averageScore
          genres
          format
          episodes
          status
          description(asHtml: false)
          bannerImage
        }
      }
    }
    """

    try:
        result = await anilist_request(query, {
            "season": season.upper(),
            "seasonYear": year,
            "page": page,
            "perPage": per_page
        })
        page_data = result.get("data", {}).get("Page", {})
        media_list = page_data.get("media", [])
        page_info = page_data.get("pageInfo", {})

        response = {
            "results": [transform_anime_card(m) for m in media_list],
            "page_info": {
                "total": page_info.get("total", 0),
                "current_page": page_info.get("currentPage", 1),
                "last_page": page_info.get("lastPage", 1),
                "has_next_page": page_info.get("hasNextPage", False),
            }
        }
        _set_cached(cache_key, response)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch seasonal: {str(e)}")

@app.get("/api/top-rated")
async def get_top_rated(page: int = Query(1, ge=1), per_page: int = Query(20, ge=1, le=50)):
    """Get top rated anime"""
    cache_key = _cache_key("top_rated", page=page, per_page=per_page)
    cached = _get_cached(cache_key)
    if cached:
        return cached

    query = """
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, sort: SCORE_DESC, minScore: 70) {
          id
          title { romaji english native }
          coverImage { large medium }
          seasonYear
          averageScore
          genres
          format
          episodes
          status
          description(asHtml: false)
          bannerImage
        }
      }
    }
    """

    try:
        result = await anilist_request(query, {"page": page, "perPage": per_page})
        page_data = result.get("data", {}).get("Page", {})
        media_list = page_data.get("media", [])
        page_info = page_data.get("pageInfo", {})

        response = {
            "results": [transform_anime_card(m) for m in media_list],
            "page_info": {
                "total": page_info.get("total", 0),
                "current_page": page_info.get("currentPage", 1),
                "last_page": page_info.get("lastPage", 1),
                "has_next_page": page_info.get("hasNextPage", False),
            }
        }
        _set_cached(cache_key, response)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top rated: {str(e)}")

@app.get("/api/vibe-search")
async def vibe_search(
    vibe: str = Query(..., description="Natural language vibe query"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50)
):
    """
    Semantic-like vibe search using keyword mapping.
    Maps natural language vibes to genre/tag combinations.
    """
    vibe_lower = vibe.lower()

    # Vibe to search mapping
    vibe_keywords = {
        "assassination": {"search": "assassin", "genres": ["Action", "Thriller"]},
        "fun": {"search": "comedy", "genres": ["Comedy"]},
        "depressing": {"search": "tragedy", "genres": ["Drama", "Psychological"]},
        "wholesome": {"search": "slice of life", "genres": ["Slice of Life", "Comedy"]},
        "found family": {"search": "family", "genres": ["Slice of Life", "Drama"]},
        "isekai": {"search": "isekai", "genres": ["Fantasy", "Adventure"]},
        "dark": {"search": "dark fantasy", "genres": ["Fantasy", "Horror", "Thriller"]},
        "mind bending": {"search": "psychological", "genres": ["Psychological", "Mystery", "Thriller"]},
        "romance": {"search": "romance", "genres": ["Romance"]},
        "action": {"search": "action", "genres": ["Action"]},
        "horror": {"search": "horror", "genres": ["Horror", "Thriller"]},
        "mecha": {"search": "mecha", "genres": ["Mecha", "Sci-Fi", "Action"]},
        "sports": {"search": "sports", "genres": ["Sports"]},
        "music": {"search": "music", "genres": ["Music"]},
        "supernatural": {"search": "supernatural", "genres": ["Supernatural", "Fantasy"]},
        "school": {"search": "school", "genres": ["School", "Slice of Life"]},
        "military": {"search": "military", "genres": ["Military", "Action"]},
        "mystery": {"search": "mystery", "genres": ["Mystery", "Thriller"]},
        "sci-fi": {"search": "sci-fi", "genres": ["Sci-Fi"]},
        "fantasy": {"search": "fantasy", "genres": ["Fantasy", "Adventure"]},
        "thriller": {"search": "thriller", "genres": ["Thriller", "Mystery"]},
        "psychological": {"search": "psychological", "genres": ["Psychological", "Thriller"]},
        "adventure": {"search": "adventure", "genres": ["Adventure", "Action"]},
        "drama": {"search": "drama", "genres": ["Drama"]},
        "comedy": {"search": "comedy", "genres": ["Comedy"]},
        "sad": {"search": "tragedy", "genres": ["Drama", "Romance"]},
        "happy": {"search": "comedy", "genres": ["Comedy", "Slice of Life"]},
        "intense": {"search": "intense", "genres": ["Action", "Thriller"]},
        "relaxing": {"search": "iyashikei", "genres": ["Slice of Life", "Fantasy"]},
        "epic": {"search": "epic", "genres": ["Action", "Adventure", "Fantasy"]},
        "cute": {"search": "cute", "genres": ["Slice of Life", "Comedy"]},
        "gore": {"search": "gore", "genres": ["Horror", "Action"]},
        "time travel": {"search": "time travel", "genres": ["Sci-Fi", "Thriller"]},
        "revenge": {"search": "revenge", "genres": ["Action", "Drama", "Thriller"]},
        "survival": {"search": "survival", "genres": ["Action", "Thriller", "Horror"]},
        "game": {"search": "game", "genres": ["Game", "Fantasy"]},
        "parody": {"search": "parody", "genres": ["Comedy", "Parody"]},
        "demons": {"search": "demons", "genres": ["Supernatural", "Action", "Fantasy"]},
        "vampires": {"search": "vampire", "genres": ["Supernatural", "Horror", "Action"]},
        "magic": {"search": "magic", "genres": ["Fantasy", "Magic"]},
        "space": {"search": "space", "genres": ["Sci-Fi", "Space"]},
        "martial arts": {"search": "martial arts", "genres": ["Action", "Martial Arts"]},
        "police": {"search": "police", "genres": ["Action", "Police", "Mystery"]},
        "historical": {"search": "historical", "genres": ["Historical", "Drama"]},
        "samurai": {"search": "samurai", "genres": ["Action", "Samurai", "Historical"]},
        "shounen": {"search": "shounen", "genres": ["Action", "Adventure", "Shounen"]},
        "seinen": {"search": "seinen", "genres": ["Seinen", "Psychological", "Drama"]},
        "shoujo": {"search": "shoujo", "genres": ["Romance", "Shoujo", "Drama"]},
        "josei": {"search": "josei", "genres": ["Josei", "Drama", "Romance"]},
    }

    search_term = vibe_lower
    genres = []

    for keyword, mapping in vibe_keywords.items():
        if keyword in vibe_lower:
            search_term = mapping["search"]
            genres = mapping["genres"]
            break

    # Also check for combinations
    if "assassin" in vibe_lower and "fun" in vibe_lower:
        search_term = "assassination classroom"
        genres = ["Action", "Comedy"]
    elif "depressing" in vibe_lower and "isekai" in vibe_lower:
        search_term = "re:zero"
        genres = ["Drama", "Fantasy"]
    elif "wholesome" in vibe_lower and "family" in vibe_lower:
        search_term = "spy x family"
        genres = ["Slice of Life", "Comedy", "Action"]
    elif "mind" in vibe_lower and "bend" in vibe_lower:
        search_term = "steins gate"
        genres = ["Sci-Fi", "Thriller"]
    elif "dark" in vibe_lower and "fantasy" in vibe_lower:
        search_term = "berserk"
        genres = ["Fantasy", "Horror", "Action"]
    elif "epic" in vibe_lower and "battle" in vibe_lower:
        search_term = "attack on titan"
        genres = ["Action", "Drama", "Fantasy"]

    req = SearchRequest(
        query=search_term,
        genres=genres,
        page=page,
        per_page=per_page,
        sort="POPULARITY_DESC"
    )

    return await search_anime(req)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
