import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import { api } from '../utils/api';

const TopRatedPage = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTopRated = useCallback(async (page = 1, isLoadMore = false) => {
    setLoading(true);
    try {
      const data = await api.getTopRated(page, 20);
      if (isLoadMore) {
        setAnimeList(prev => [...prev, ...data.results]);
      } else {
        setAnimeList(data.results);
      }
      setPageInfo(data.page_info);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch top rated:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopRated(1);
    window.scrollTo(0, 0);
  }, [fetchTopRated]);

  const handleLoadMore = () => {
    if (pageInfo.has_next_page && !loading) {
      fetchTopRated(currentPage + 1, true);
    }
  };

  return (
    <div className="min-h-screen bg-anime-darker pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-anime-text mb-2">Top Rated</h1>
          <p className="text-anime-muted">The highest rated anime of all time</p>
        </div>

        {loading && animeList.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {animeList.map((anime, index) => (
                <AnimeCard key={`${anime.id}-${index}`} anime={anime} index={index} />
              ))}
            </div>

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
  );
};

export default TopRatedPage;
