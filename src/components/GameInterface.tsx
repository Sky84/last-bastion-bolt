import React from 'react';
import { Shield, Sun, Moon, Sandwich, Droplets, ChevronFirst as FirstAid, Hammer } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { CityMap } from './CityMap';
import { BuildingInterior } from './BuildingInterior';

export const GameInterface: React.FC = () => {
  const { phase, day, baseResources, baseDefense, events, houses, selectedHouse, selectHouse } = useGameStore();

  const selectedBuilding = selectedHouse ? houses.find(h => h.id === selectedHouse) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Dernier Bastion</h1>
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded">
              {phase === 'day' ? <Sun size={20} /> : <Moon size={20} />}
              <span>Jour {day}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="text-blue-400" size={20} />
              <span>{baseDefense}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 grid grid-cols-12 gap-4">
        {/* Resources Panel */}
        <div className="col-span-3 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Ressources</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sandwich className="text-yellow-400" size={20} />
              <span>Nourriture: {baseResources.food}</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="text-blue-400" size={20} />
              <span>Eau: {baseResources.water}</span>
            </div>
            <div className="flex items-center gap-2">
              <FirstAid className="text-red-400" size={20} />
              <span>Médicaments: {baseResources.medicine}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hammer className="text-gray-400" size={20} />
              <span>Matériaux: {baseResources.materials}</span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="col-span-6 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            {selectedBuilding ? 'Intérieur du bâtiment' : 'Carte de la ville'}
          </h2>
          {selectedBuilding ? (
            <BuildingInterior house={selectedBuilding} onExit={() => selectHouse(null)} />
          ) : (
            <CityMap />
          )}
        </div>

        {/* Events Log */}
        <div className="col-span-3 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Journal</h2>
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={index} className="text-sm text-gray-300">
                {event}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
