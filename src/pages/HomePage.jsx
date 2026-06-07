import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ChevronDown, Loader2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import AnimeCard from '../components/AnimeCard';
import Sidebar from '../components/Sidebar';
import SkeletonCard from '../components/SkeletonCard';
import { api } from '../utils/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVibeSearch, setIsVibeSearch] = useState(false);

  const [filters, setFilters] = useState({
    genres: [],
    formats: [],
    status: [],
    yearMin: null,
    yearMax: null,
    ratingMin: null,
    episodesMin: null,
    episodesMax: null,
    season: null,
    sort: 'POPULARITY_DESC',
  });

  const fetchAnime = useCallback(async (page = 1, isLoadMore = false) => {
    setLoading(true);
    try {
      let data;

      if (isVibeSearch && searchQuery) {
        data = await api.vibeSearch(searchQuery, page, 20);
      } else if (searchQuery) {
        data = await api.searchAnime({
          query: searchQuery,
          ...filters,
          page,
          per_page: 20,
        });
      } else {
        data = await api.getTrending(page, 20);
      }

      if (isLoadMore) {
        setAnimeList(prev => [...prev, ...data.results]);
      } else {
        setAnimeList(data.results);
      }

      setPageInfo(data.page_info);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch anime:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, isVibeSearch]);

  useEffect(() => {
    fetchAnime(1);
  }, [fetchAnime]);

  // Debounced filter change
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isVibeSearch) {
        fetchAnime(1);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [filters, fetchAnime, isVibeSearch]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsVibeSearch(false);
    setCurrentPage(1);
    fetchAnime(1);
  };

  const handleVibeSearch = (vibe) => {
    setSearchQuery(vibe);
    setIsVibeSearch(true);
    setCurrentPage(1);
    fetchAnime(1);
  };

  const handleLoadMore = () => {
    if (pageInfo.has_next_page && !loading) {
      fetchAnime(currentPage + 1, true);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setIsVibeSearch(false);
  };

  return (
    <div className="min-h-screen bg-anime-darker">
      {/* Hero Section */}
      <div className="relative pt-24 pb-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-anime-accent/5 to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="gradient-text">Discover Your Next</span>
            <br />
            <span className="text-anime-text">Anime Obsession</span>
          </h1>
          <p className="text-anime-muted text-lg mb-8 max-w-xl mx-auto">
            Search by title, genre, or describe the vibe you're looking for. 
            Find where to watch on your favorite streaming platforms.
          </p>

          <SearchBar 
            onSearch={handleSearch} 
            initialValue={searchQuery}
            onVibeSearch={handleVibeSearch}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex gap-6">
          {/* Sidebar */}
          <Sidebar 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onVibeSearch={handleVibeSearch}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 bg-anime-card border border-anime-border rounded-lg hover:border-anime-accent/50 transition-colors"
                >
                  <Filter className="w-5 h-5 text-anime-text" />
                </button>

                <h2 className="text-xl font-bold text-anime-text">
                  {isVibeSearch ? (
                    <span className="flex items-center gap-2">
                      Vibe: <span className="text-anime-accent">"{searchQuery}"</span>
                    </span>
                  ) : searchQuery ? (
                    <span>Results for "{searchQuery}"</span>
                  ) : (
                    'Trending Now'
                  )}
                </h2>

                {!loading && (
                  <span className="text-sm text-anime-muted">
                    {pageInfo.total?.toLocaleString() || animeList.length} results
                  </span>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {(filters.genres.length > 0 || filters.formats.length > 0 || filters.status.length > 0 || filters.yearMin || filters.yearMax || filters.ratingMin) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.genres.map(g => (
                  <span key={g} className="px-2 py-1 text-xs bg-anime-accent/20 text-anime-accent rounded-full border border-anime-accent/30">
                    {g}
                  </span>
                ))}
                {filters.formats.map(f => (
                  <span key={f} className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                    {f}
                  </span>
                ))}
                {filters.status.map(s => (
                  <span key={s} className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                    {s}
                  </span>
                ))}
                {(filters.yearMin || filters.yearMax) && (
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                    {filters.yearMin || 'Any'} - {filters.yearMax || 'Any'}
                  </span>
                )}
                {filters.ratingMin > 0 && (
                  <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                    {filters.ratingMin}+ Rating
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            {loading && animeList.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : animeList.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-anime-text mb-2">No results found</h3>
                <p className="text-anime-muted">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {animeList.map((anime, index) => (
                    <AnimeCard key={`${anime.id}-${index}`} anime={anime} index={index} />
                  ))}
                </div>

                {/* Load More */}
                {pageInfo.has_next_page && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Load More
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
