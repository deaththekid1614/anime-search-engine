import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import TrendingPage from './pages/TrendingPage';
import TopRatedPage from './pages/TopRatedPage';
import SeasonalPage from './pages/SeasonalPage';

function App() {
  return (
    <div className="min-h-screen bg-anime-darker">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/top-rated" element={<TopRatedPage />} />
        <Route path="/seasonal" element={<SeasonalPage />} />
        <Route path="/anime/:id" element={<AnimeDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
