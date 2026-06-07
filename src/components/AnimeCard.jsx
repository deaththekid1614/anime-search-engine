import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Tv, Film, Clock } from 'lucide-react';

const AnimeCard = ({ anime, index = 0 }) => {
  const formatIcons = {
    'TV': Tv,
    'TV_SHORT': Tv,
    'MOVIE': Film,
    'OVA': Play,
    'ONA': Play,
    'SPECIAL': Star,
    'MUSIC': Play,
  };

  const FormatIcon = formatIcons[anime.format] || Tv;

  return (
    <Link to={`/anime/${anime.id}`} className="anime-card group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
        <img
          src={anime.image || '/placeholder.jpg'}
          alt={anime.title}
          className="anime-card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x400/1a1a2e/e94560?text=No+Image';
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-anime-darker via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Rating Badge */}
        {anime.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-anime-darker/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-anime-border">
            <Star className="w-3 h-3 text-anime-warning fill-anime-warning" />
            <span className="text-xs font-bold text-anime-text">{anime.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Format Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-anime-darker/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-anime-border">
          <FormatIcon className="w-3 h-3 text-anime-accent" />
          <span className="text-xs font-medium text-anime-text">{anime.format}</span>
        </div>

        {/* Episodes Badge */}
        {anime.episodes && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-anime-darker/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-anime-border">
            <Clock className="w-3 h-3 text-anime-muted" />
            <span className="text-xs text-anime-muted">{anime.episodes} eps</span>
          </div>
        )}

        {/* Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 bg-anime-accent/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-anime-accent/30 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-anime-text line-clamp-2 group-hover:text-anime-accent transition-colors">
          {anime.title_english || anime.title}
        </h3>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {anime.year && (
            <span className="text-xs text-anime-muted">{anime.year}</span>
          )}

          {anime.genres?.slice(0, 2).map((genre) => (
            <span key={genre} className="text-xs px-2 py-0.5 bg-anime-darker rounded-full text-anime-muted border border-anime-border">
              {genre}
            </span>
          ))}
        </div>

        {anime.status && (
          <div className="mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              anime.status === 'Releasing' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : anime.status === 'Finished'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-anime-card text-anime-muted border border-anime-border'
            }`}>
              {anime.status}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default AnimeCard;
