import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, History, TrendingUp } from 'lucide-react';

const SearchBar = ({ onSearch, initialValue = '', onVibeSearch }) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const suggestions = [
    "assassinations with fun",
    "depressing isekai",
    "wholesome found family",
    "dark fantasy horror",
    "mind bending thriller",
    "epic shounen battle",
    "relaxing slice of life",
    "intense psychological",
    "cute romance comedy",
    "post-apocalyptic survival",
    "time travel sci-fi",
    "samurai historical",
    "mecha space opera",
    "supernatural mystery",
    "sports underdog story",
  ];

  const searchHistory = JSON.parse(localStorage.getItem('animeSearchHistory') || '[]');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Save to history
      const history = JSON.parse(localStorage.getItem('animeSearchHistory') || '[]');
      const newHistory = [query.trim(), ...history.filter(h => h !== query.trim())].slice(0, 10);
      localStorage.setItem('animeSearchHistory', JSON.stringify(newHistory));

      onSearch(query.trim());
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleVibeClick = (suggestion) => {
    if (onVibeSearch) {
      onVibeSearch(suggestion);
      setQuery(suggestion);
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center transition-all duration-300 ${
          isFocused ? 'scale-[1.02]' : ''
        }`}>
          <Search className={`absolute left-4 w-5 h-5 transition-colors ${
            isFocused ? 'text-anime-accent' : 'text-anime-muted'
          }`} />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            placeholder="Search anime or describe a vibe..."
            className={`w-full pl-12 pr-12 py-4 bg-anime-card border-2 rounded-2xl text-lg text-anime-text placeholder-anime-muted focus:outline-none transition-all duration-300 ${
              isFocused 
                ? 'border-anime-accent shadow-lg shadow-anime-accent/20' 
                : 'border-anime-border hover:border-anime-border/80'
            }`}
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 p-1 rounded-full hover:bg-anime-darker transition-colors"
            >
              <X className="w-5 h-5 text-anime-muted" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-anime-card border border-anime-border rounded-2xl shadow-xl shadow-black/50 overflow-hidden z-50 animate-fade-in">
          {/* Vibe Suggestions */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-anime-accent" />
              <span className="text-sm font-semibold text-anime-accent">Vibe Search Suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleVibeClick(suggestion)}
                  className="px-3 py-1.5 text-sm bg-anime-darker border border-anime-border rounded-full text-anime-muted hover:border-anime-accent/50 hover:text-anime-accent transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <>
              <div className="border-t border-anime-border/50" />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-anime-muted" />
                  <span className="text-sm font-semibold text-anime-muted">Recent Searches</span>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-anime-darker text-left text-sm text-anime-text transition-colors"
                    >
                      <History className="w-4 h-4 text-anime-muted" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
