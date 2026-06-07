const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async searchAnime(params) {
    return this.request('/api/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getAnimeDetail(id) {
    return this.request(`/api/anime/${id}`);
  }

  async getTrending(page = 1, perPage = 20) {
    return this.request(`/api/trending?page=${page}&per_page=${perPage}`);
  }

  async getGenres() {
    return this.request('/api/genres');
  }

  async getSeasonal(season, year, page = 1, perPage = 20) {
    return this.request(`/api/seasonal?season=${season}&year=${year}&page=${page}&per_page=${perPage}`);
  }

  async getTopRated(page = 1, perPage = 20) {
    return this.request(`/api/top-rated?page=${page}&per_page=${perPage}`);
  }

  async vibeSearch(vibe, page = 1, perPage = 20) {
    return this.request(`/api/vibe-search?vibe=${encodeURIComponent(vibe)}&page=${page}&per_page=${perPage}`);
  }
}

export const api = new ApiClient();
