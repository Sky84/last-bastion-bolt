import React from 'react';
import { DoorClosed, User, Package } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { House, Survivor } from '../types/game';

interface BuildingInteriorProps {
  house: House;
  onExit: () => void;
}

const ResourceIcon: Record<string, JSX.Element> = {
  food: <span className="text-yellow-400">🍖</span>,
  water: <span className="text-blue-400">💧</span>,
  medicine: <span className="text-red-400">💊</span>,
  materials: <span className="text-gray-400">🔧</span>
};

export const BuildingInterior: React.FC<BuildingInteriorProps> = ({ house, onExit }) => {
  const { survivors } = useGameStore();
  const presentSurvivors = survivors.filter(
    s => s.position.x === house.position.x && s.position.y === house.position.y
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">{house.type === 'residential' ? 'Maison' : 
          house.type === 'store' ? 'Magasin' :
          house.type === 'hospital' ? 'Hôpital' : 'Entrepôt'}</h3>
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          <DoorClosed size={16} />
          Sortir
        </button>
      </div>

      {/* Present Survivors */}
      {presentSurvivors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2 text-gray-400">Survivants présents</h4>
          <div className="space-y-2">
            {presentSurvivors.map(survivor => (
              <div key={survivor.id} className="flex items-center gap-3 bg-gray-700 p-2 rounded">
                <User size={16} className="text-blue-400" />
                <div>
                  <div className="font-medium">{survivor.name}</div>
                  <div className="text-xs text-gray-400">
                    Santé: {survivor.health}% | Moral: {survivor.morale}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rooms */}
      <div className="flex-1">
        <h4 className="text-sm font-semibold mb-2 text-gray-400">Pièces</h4>
        <div className="space-y-3">
          {house.rooms.map((room, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium">{room.name}</h5>
                  <p className="text-sm text-gray-400 mt-1">{room.description}</p>
                </div>
                {room.loot && (
                  <div className="flex gap-1">
                    {room.loot.map((resource, i) => (
                      <div key={i} className="flex items-center">
                        {ResourceIcon[resource]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
