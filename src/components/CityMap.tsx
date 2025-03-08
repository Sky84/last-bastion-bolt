import React from 'react';
import { Home, Store, Building2, Warehouse } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { House } from '../types/game';

const CELL_SIZE = 60;
const GRID_SIZE = 7; // -3 to 3

const getHouseIcon = (type: House['type']) => {
  switch (type) {
    case 'residential':
      return <Home className="text-gray-300" />;
    case 'store':
      return <Store className="text-blue-400" />;
    case 'hospital':
      return <Building2 className="text-red-400" />;
    case 'warehouse':
      return <Warehouse className="text-yellow-400" />;
  }
};

const getHouseLabel = (type: House['type']) => {
  switch (type) {
    case 'residential':
      return 'Maison';
    case 'store':
      return 'Magasin';
    case 'hospital':
      return 'Hôpital';
    case 'warehouse':
      return 'Entrepôt';
  }
};

export const CityMap: React.FC = () => {
  const { houses, playerPosition, movePlayer, exploreHouse, phase, selectHouse } = useGameStore();

  const handleCellClick = (x: number, y: number) => {
    if (phase === 'night') return;
    
    const distance = Math.abs(x - playerPosition.x) + Math.abs(y - playerPosition.y);
    if (distance === 1) {
      movePlayer({ x, y });
      
      const house = houses.find(h => h.position.x === x && h.position.y === y);
      if (house) {
        if (!house.explored) {
          exploreHouse(house.id);
        }
        selectHouse(house.id);
      }
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto">
      <div className="absolute inset-0 grid grid-cols-7 grid-rows-7 gap-1">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const x = (i % GRID_SIZE) - 3;
          const y = Math.floor(i / GRID_SIZE) - 3;
          const house = houses.find(h => h.position.x === x && h.position.y === y);
          const isPlayer = playerPosition.x === x && playerPosition.y === y;
          const isAdjacent = Math.abs(x - playerPosition.x) + Math.abs(y - playerPosition.y) === 1;
          const isClickable = isAdjacent && phase !== 'night';

          return (
            <div
              key={`${x},${y}`}
              className={`
                relative flex items-center justify-center
                ${isPlayer ? 'bg-green-700' : 'bg-gray-800'}
                ${isClickable ? 'cursor-pointer hover:bg-gray-700' : ''}
                ${house?.explored ? 'opacity-50' : ''}
                rounded transition-colors
              `}
              onClick={() => handleCellClick(x, y)}
            >
              {isPlayer ? (
                <div className="text-white font-bold">Vous</div>
              ) : house ? (
                <div className="flex flex-col items-center">
                  {getHouseIcon(house.type)}
                  <span className="text-xs mt-1">{getHouseLabel(house.type)}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
