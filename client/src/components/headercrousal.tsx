import React from 'react';

interface CarEntry {
  id: number;
  name: string;
  position: string;
  highlight?: 'gold' | 'red' | 'none';
}

interface CarLeaderboardProps {
  entries: CarEntry[];
}

const CarLeaderboard: React.FC<CarLeaderboardProps> = ({ entries }) => {
  return (
    <div className="font-sans text-white bg-[#111] p-5 overflow-x-auto whitespace-nowrap flex gap-4 w-[1570px] max-w-full hide-scrollbar">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`
            inline-block flex-shrink-0 px-4 py-2 rounded-lg bg-[#222]  items-center gap-2
            ${entry.highlight === 'gold' ? 'text-amber-400 font-semibold' : ''}
            ${entry.highlight === 'red' ? 'text-red-400 font-semibold' : ''}
            ${entry.highlight === 'none' || !entry.highlight ? 'text-white' : ''}
          `}
        >
          <span className="text-sm">#{entry.id}</span>
          <span className="font-medium">{entry.name}</span>
          <span className="text-xs text-green-400">▼ {entry.position}</span>
        </div>
      ))}
    </div>
  );
};

export default CarLeaderboard;
