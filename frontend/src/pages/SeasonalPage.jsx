import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import { api } from '../utils/api';

const SeasonalPage = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentSeason = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter'][currentMonth];

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [season, setSeason] = useState(currentSeason);
  const [year, setYear] = useState(currentYear);

  const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];

  const fetchSeasonal = useCallback(async (page = 1, isLoadMore = false) => {
    setLoading(true);
    try {
      const data = await api.getSeasonal(season.toUpperCase(), year, page, 20);
      if (isLoadMore) {
        setAnimeList(prev => [...prev, ...data.results]);
      } else {
        setAnimeList(data.results);
      }
      setPageInfo(data.page_info);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch seasonal:', error);
    } finally {
      setLoading(false);
    }
  }, [season, year]);

  useEffect(() => {
    fetchSeasonal(1);
    window.scrollTo(0, 0);
  }, [fetchSeasonal]);

  const handleLoadMore = () => {
    if (pageInfo.has_next_page && !loading) {
      fetchSeasonal(currentPage + 1, true);
    }
  };

  const handleSeasonChange = (newSeason) => {
    setSeason(newSeason);
    setCurrentPage(1);
  };

  const handleYearChange = (delta) => {
    setYear(prev => prev + delta);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-anime-darker pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-anime-text mb-4">Seasonal Anime</h1>

          {/* Season Selector */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-anime-card border border-anime-border rounded-xl p-1">
              <button
                onClick={() => handleYearChange(-1)}
                className="p-2 hover:bg-anime-darker rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-anime-text" />
              </button>
              <span className="px-4 py-2 font-bold text-anime-text min-w-[80px] text-center">{year}</span>
              <button
                onClick={() => handleYearChange(1)}
                className="p-2 hover:bg-anime-darker rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-anime-text" />
              </button>
            </div>

            <div className="flex gap-1">
              {seasons.map(s => (
                <button
                  key={s}
                  onClick={() => handleSeasonChange(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    season === s
                      ? 'bg-anime-accent text-white'
                      : 'bg-anime-card text-anime-muted border border-anime-border hover:text-anime-text'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
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

export default SeasonalPage;
