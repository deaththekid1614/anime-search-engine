import React from 'react';
import { ExternalLink } from 'lucide-react';

const platformConfig = {
  'Netflix': { className: 'netflix', icon: 'N' },
  'Crunchyroll': { className: 'crunchyroll', icon: 'C' },
  'Hulu': { className: 'hulu', icon: 'H' },
  'Funimation': { className: 'funimation', icon: 'F' },
  'Amazon Prime': { className: 'prime', icon: 'P' },
  'HIDIVE': { className: 'hidive', icon: 'H' },
};

const StreamingBadge = ({ platform, url, type }) => {
  const config = platformConfig[platform] || { className: 'default', icon: platform[0] };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`streaming-badge ${config.className}`}
    >
      <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
        {config.icon}
      </span>
      <span>{platform}</span>
      <ExternalLink className="w-3 h-3 opacity-60" />
    </a>
  );
};

export default StreamingBadge;
