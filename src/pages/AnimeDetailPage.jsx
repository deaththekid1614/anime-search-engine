import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, Clock, Calendar, Tv, Film, ArrowLeft, Play, 
  Users, Building2, UserCheck, ExternalLink, ChevronRight,
  Heart, Share2, Bookmark, BookOpen
} from 'lucide-react';
import { api } from '../utils/api';
import StreamingBadge from '../components/StreamingBadge';
import AnimeCard from '../components/AnimeCard';

const AnimeDetailPage = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnimeDetail();
    checkWatchlist();
    window.scrollTo(0, 0);
  }, [id]);

  const checkWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem('animeWatchlist') || '[]');
    setIsWatchlisted(watchlist.includes(parseInt(id)));
  };

  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem('animeWatchlist') || '[]');
    const animeId = parseInt(id);

    if (watchlist.includes(animeId)) {
      const newList = watchlist.filter(wid => wid !== animeId);
      localStorage.setItem('animeWatchlist', JSON.stringify(newList));
      setIsWatchlisted(false);
    } else {
      watchlist.push(animeId);
      localStorage.setItem('animeWatchlist', JSON.stringify(watchlist));
      setIsWatchlisted(true);
    }
  };

  const fetchAnimeDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAnimeDetail(parseInt(id));
      setAnime(data);
    } catch (err) {
      setError('Failed to load anime details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDescription = (desc) => {
    if (!desc) return 'No description available.';
    return desc.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-anime-darker pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-anime-card rounded-lg mb-6" />
            <div className="flex gap-8">
              <div className="w-72 h-[400px] bg-anime-card rounded-xl" />
              <div className="flex-1 space-y-4">
                <div className="h-10 w-3/4 bg-anime-card rounded-lg" />
                <div className="h-6 w-1/2 bg-anime-card rounded-lg" />
                <div className="h-32 w-full bg-anime-card rounded-lg" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-anime-card rounded-full" />
                  <div className="h-8 w-20 bg-anime-card rounded-full" />
                  <div className="h-8 w-20 bg-anime-card rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-anime-darker pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-anime-text mb-2">{error || 'Anime not found'}</h2>
          <Link to="/" className="btn-primary inline-flex mt-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'episodes', label: `Episodes (${anime.episodes || '?'})` },
    { id: 'cast', label: 'Cast & Staff' },
    { id: 'related', label: 'Related' },
  ];

  return (
    <div className="min-h-screen bg-anime-darker">
      {/* Banner */}
      {anime.banner_image && (
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
          <img 
            src={anime.banner_image} 
            alt={anime.title}
            className="w-full h-full object-cover"
            onError={(e) => e.target.style.display = 'none'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-anime-darker via-anime-darker/60 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-anime-muted hover:text-anime-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Poster & Quick Info */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="anime-card overflow-hidden mb-4">
                <img 
                  src={anime.image} 
                  alt={anime.title}
                  className="w-full aspect-[3/4] object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x400/1a1a2e/e94560?text=No+Image';
                  }}
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={toggleWatchlist}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    isWatchlisted 
                      ? 'bg-anime-accent text-white' 
                      : 'bg-anime-card text-anime-text border border-anime-border hover:border-anime-accent/50'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                  {isWatchlisted ? 'Saved' : 'Watchlist'}
                </button>
                <button className="p-2.5 bg-anime-card border border-anime-border rounded-lg hover:border-anime-accent/50 transition-colors">
                  <Share2 className="w-4 h-4 text-anime-text" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="glass-panel rounded-xl p-4 space-y-3">
                {anime.rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-anime-muted flex items-center gap-2">
                      <Star className="w-4 h-4 text-anime-warning" />
                      Rating
                    </span>
                    <span className="text-sm font-bold text-anime-text">{anime.rating.toFixed(1)}/10</span>
                  </div>
                )}
                {anime.mean_score && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-anime-muted flex items-center gap-2">
                      <Heart className="w-4 h-4 text-anime-accent" />
                      Mean Score
                    </span>
                    <span className="text-sm font-bold text-anime-text">{anime.mean_score.toFixed(1)}/10</span>
                  </div>
                )}
                {anime.episodes && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-anime-muted flex items-center gap-2">
                      <Tv className="w-4 h-4" />
                      Episodes
                    </span>
                    <span className="text-sm font-bold text-anime-text">{anime.episodes}</span>
                  </div>
                )}
                {anime.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-anime-muted flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duration
                    </span>
                    <span className="text-sm font-bold text-anime-text">{anime.duration} min</span>
                  </div>
                )}
                {anime.year && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-anime-muted flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Year
                    </span>
                    <span className="text-sm font-bold text-anime-text">{anime.year}</span>
                  </div>
                )}
                {anime.season && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-anime-muted flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Season
                    </span>
                    <span className="text-sm font-bold text-anime-text">{anime.season} {anime.year}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-anime-muted flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Format
                  </span>
                  <span className="text-sm font-bold text-anime-text">{anime.format}</span>
                </div>
                {anime.source && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-anime-muted flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Source
                    </span>
                    <span className="text-sm font-bold text-anime-text">{anime.source}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-anime-text mb-2">
              {anime.title_english || anime.title}
            </h1>
            {anime.title_english && anime.title !== anime.title_english && (
              <p className="text-anime-muted text-lg mb-4">{anime.title}</p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres?.map(genre => (
                <Link
                  key={genre}
                  to={`/?genre=${genre}`}
                  className="px-3 py-1 bg-anime-card border border-anime-border rounded-full text-sm text-anime-muted hover:border-anime-accent/50 hover:text-anime-accent transition-colors"
                >
                  {genre}
                </Link>
              ))}
              {anime.tags?.slice(0, 5).map(tag => (
                <span key={tag} className="px-3 py-1 bg-anime-darker border border-anime-border rounded-full text-sm text-anime-muted">
                  {tag}
                </span>
              ))}
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                anime.status === 'Releasing' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : anime.status === 'Finished'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-anime-card text-anime-muted border border-anime-border'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  anime.status === 'Releasing' ? 'bg-green-400 animate-pulse' : 'bg-blue-400'
                }`} />
                {anime.status}
              </span>
            </div>

            {/* Trailer */}
            {anime.trailer_url && (
              <div className="mb-6">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-anime-card border border-anime-border">
                  <iframe
                    src={anime.trailer_url}
                    title={`${anime.title} Trailer`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Streaming Platforms */}
            {anime.streaming && anime.streaming.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-anime-text mb-3 flex items-center gap-2">
                  <Play className="w-5 h-5 text-anime-accent" />
                  Where to Watch
                </h3>
                <div className="flex flex-wrap gap-2">
                  {anime.streaming.map((platform, index) => (
                    <StreamingBadge
                      key={index}
                      platform={platform.platform}
                      url={platform.url}
                      type={platform.type}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-anime-border mb-6">
              <div className="flex gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-anime-accent text-anime-accent'
                        : 'border-transparent text-anime-muted hover:text-anime-text'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'overview' && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-bold text-anime-text mb-3">Synopsis</h3>
                  <p className="text-anime-muted leading-relaxed mb-8">
                    {formatDescription(anime.description)}
                  </p>

                  {/* Studios */}
                  {anime.studios?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-anime-text mb-3 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-anime-accent" />
                        Studios
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {anime.studios.map(studio => (
                          <span key={studio} className="px-3 py-1.5 bg-anime-card border border-anime-border rounded-lg text-sm text-anime-text">
                            {studio}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Directors */}
                  {anime.directors?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-anime-text mb-3 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-anime-accent" />
                        Directors
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {anime.directors.map(director => (
                          <span key={director} className="px-3 py-1.5 bg-anime-card border border-anime-border rounded-lg text-sm text-anime-text">
                            {director}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'episodes' && (
                <div className="animate-fade-in">
                  {anime.episode_list && anime.episode_list.length > 0 ? (
                    <div className="space-y-3">
                      {anime.episode_list.map((episode, index) => (
                        <div 
                          key={index}
                          className="flex gap-4 p-4 bg-anime-card border border-anime-border rounded-xl hover:border-anime-accent/30 transition-colors"
                        >
                          <div className="w-24 h-16 flex-shrink-0 bg-anime-darker rounded-lg overflow-hidden">
                            <img 
                              src={episode.thumbnail || anime.image} 
                              alt={episode.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/120x80/1a1a2e/e94560?text=EP';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-anime-accent bg-anime-accent/10 px-2 py-0.5 rounded">
                                EP {index + 1}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-anime-text line-clamp-1">
                              {episode.title || `Episode ${index + 1}`}
                            </h4>
                          </div>
                          {episode.url && (
                            <a 
                              href={episode.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 p-2 bg-anime-darker rounded-lg hover:bg-anime-accent/20 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-anime-accent" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📺</div>
                      <p className="text-anime-muted">Episode list not available for this title.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cast' && (
                <div className="animate-fade-in">
                  {anime.voice_cast && anime.voice_cast.length > 0 ? (
                    <div className="space-y-3">
                      {anime.voice_cast.map((cast, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-4 p-4 bg-anime-card border border-anime-border rounded-xl"
                        >
                          <div className="w-10 h-10 bg-anime-darker rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-anime-muted" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-anime-text">{cast.character}</p>
                            <p className="text-xs text-anime-muted">
                              voiced by {cast.voice_actor} ({cast.language})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">🎭</div>
                      <p className="text-anime-muted">Cast information not available.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'related' && (
                <div className="animate-fade-in">
                  {anime.related_anime && anime.related_anime.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {anime.related_anime.map((related, index) => (
                        <AnimeCard key={related.id} anime={related} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">🔗</div>
                      <p className="text-anime-muted">No related anime found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;
