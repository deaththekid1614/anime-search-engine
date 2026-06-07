import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

const Sidebar = ({ filters, onFilterChange, onVibeSearch, isOpen, onClose }) => {
  const [genres, setGenres] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    genres: true,
    format: true,
    status: true,
    year: true,
    rating: true,
    episodes: true,
    season: true,
  });
  const [vibeQuery, setVibeQuery] = useState('');

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const data = await api.getGenres();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGenreToggle = (genre) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    onFilterChange({ ...filters, genres: newGenres });
  };

  const handleFormatToggle = (format) => {
    const newFormats = filters.formats.includes(format)
      ? filters.formats.filter(f => f !== format)
      : [...filters.formats, format];
    onFilterChange({ ...filters, formats: newFormats });
  };

  const handleStatusToggle = (status) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange({ ...filters, status: newStatus });
  };

  const handleVibeSubmit = (e) => {
    e.preventDefault();
    if (vibeQuery.trim()) {
      onVibeSearch(vibeQuery.trim());
      setVibeQuery('');
    }
  };

  const formats = ['TV', 'Movie', 'OVA', 'ONA', 'Special'];
  const statuses = ['Releasing', 'Finished', 'Not Yet Released'];
  const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
  const sortOptions = [
    { value: 'POPULARITY_DESC', label: 'Most Popular' },
    { value: 'SCORE_DESC', label: 'Highest Rated' },
    { value: 'TRENDING_DESC', label: 'Trending Now' },
    { value: 'START_DATE_DESC', label: 'Newest First' },
    { value: 'START_DATE', label: 'Oldest First' },
    { value: 'FAVOURITES_DESC', label: 'Most Favorited' },
  ];

  const SectionHeader = ({ title, section, icon: Icon }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full py-2 text-sm font-semibold text-anime-text hover:text-anime-accent transition-colors"
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {title}
      </span>
      {expandedSections[section] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>
  );

  const sidebarContent = (
    <div className="space-y-4">
      {/* Vibe Search */}
      <div className="p-4 bg-gradient-to-br from-anime-accent/10 to-purple-500/10 rounded-xl border border-anime-accent/20">
        <h3 className="text-sm font-semibold text-anime-accent mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Vibe Search
        </h3>
        <form onSubmit={handleVibeSubmit}>
          <input
            type="text"
            value={vibeQuery}
            onChange={(e) => setVibeQuery(e.target.value)}
            placeholder="e.g., assassinations with fun"
            className="input-field text-sm mb-2"
          />
          <button type="submit" className="w-full btn-primary text-sm py-2 justify-center">
            <Sparkles className="w-4 h-4" />
            Find Matches
          </button>
        </form>
        <p className="text-xs text-anime-muted mt-2">
          Try: "depressing isekai", "wholesome found family", "dark fantasy"
        </p>
      </div>

      {/* Sort */}
      <div>
        <SectionHeader title="Sort By" section="sort" />
        {expandedSections.sort !== false && (
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
            className="w-full mt-2 input-field text-sm py-2"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Genres */}
      <div className="border-t border-anime-border/50 pt-4">
        <SectionHeader title="Genres" section="genres" />
        {expandedSections.genres && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => handleGenreToggle(genre)}
                className={`filter-chip ${filters.genres.includes(genre) ? 'active' : ''}`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Format */}
      <div className="border-t border-anime-border/50 pt-4">
        <SectionHeader title="Format" section="format" />
        {expandedSections.format && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {formats.map(format => (
              <button
                key={format}
                onClick={() => handleFormatToggle(format)}
                className={`filter-chip ${filters.formats.includes(format) ? 'active' : ''}`}
              >
                {format}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="border-t border-anime-border/50 pt-4">
        <SectionHeader title="Status" section="status" />
        {expandedSections.status && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => handleStatusToggle(status)}
                className={`filter-chip ${filters.status.includes(status) ? 'active' : ''}`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Year Range */}
      <div className="border-t border-anime-border/50 pt-4">
        <SectionHeader title="Year Range" section="year" />
        {expandedSections.year && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-anime-muted mb-1 block">From</label>
              <input
                type="number"
                value={filters.yearMin || ''}
                onChange={(e) => onFilterChange({ ...filters, yearMin: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="1990"
                className="input-field text-sm py-2"
              />
            </div>
            <div>
              <label className="text-xs text-anime-muted mb-1 block">To</label>
              <input
                type="number"
                value={filters.yearMax || ''}
                onChange={(e) => onFilterChange({ ...filters, yearMax: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="2024"
                className="input-field text-sm py-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-t border-anime-border/50 pt-4">
        <SectionHeader title="Minimum Rating" section="rating" />
        {expandedSections.rating && (
          <div className="mt-2">
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filters.ratingMin || 0}
              onChange={(e) => onFilterChange({ ...filters, ratingMin: parseFloat(e.target.value) })}
              className="w-full accent-anime-accent"
            />
            <div className="flex justify-between text-xs text-anime-muted mt-1">
              <span>Any</span>
              <span className="text-anime-accent font-semibold">{filters.ratingMin || 0}+</span>
              <span>10</span>
            </div>
          </div>
        )}
      </div>

      {/* Episodes */}
      <div className="border-t border-anime-border/50 pt-4">
        <SectionHeader title="Episodes" section="episodes" />
        {expandedSections.episodes && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-anime-muted mb-1 block">Min</label>
              <input
                type="number"
                value={filters.episodesMin || ''}
                onChange={(e) => onFilterChange({ ...filters, episodesMin: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="1"
                className="input-field text-sm py-2"
              />
            </div>
            <div>
              <label className="text-xs text-anime-muted mb-1 block">Max</label>
              <input
                type="number"
                value={filters.episodesMax || ''}
                onChange={(e) => onFilterChange({ ...filters, episodesMax: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="∞"
                className="input-field text-sm py-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Season */}
      <div className="border-t border-anime-border/50 pt-4">
        <SectionHeader title="Season" section="season" />
        {expandedSections.season && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {seasons.map(season => (
              <button
                key={season}
                onClick={() => onFilterChange({ ...filters, season: filters.season === season ? null : season })}
                className={`filter-chip ${filters.season === season ? 'active' : ''}`}
              >
                {season}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <div className="border-t border-anime-border/50 pt-4">
        <button
          onClick={() => onFilterChange({
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
          })}
          className="w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-anime-darker border-r border-anime-border z-50 overflow-y-auto p-4 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Filter className="w-5 h-5 text-anime-accent" />
                Filters
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-anime-card rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
