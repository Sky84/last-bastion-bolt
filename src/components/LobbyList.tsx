import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Users, Plus, LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const LobbyList: React.FC = () => {
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLobbyName, setNewLobbyName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const { createLobby, joinLobby, signOut } = useGameStore();

  useEffect(() => {
    const fetchLobbies = async () => {
      const { data } = await supabase
        .from('lobbies')
        .select('*')
        .eq('started', false);
      
      if (data) setLobbies(data);
    };

    fetchLobbies();

    const subscription = supabase
      .channel('lobbies')
      .on('*', () => {
        fetchLobbies();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLobby(newLobbyName, maxPlayers);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100">Lobbies disponibles</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={20} />
              Créer un lobby
            </button>
            <button
              onClick={() => signOut()}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <LogOut size={20} />
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {lobbies.map((lobby) => (
            <div
              key={lobby.id}
              className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-100">{lobby.name}</h2>
                <p className="text-gray-400 flex items-center gap-2">
                  <Users size={16} />
                  {lobby.current_players}/{lobby.max_players} joueurs
                </p>
              </div>
              <button
                onClick={() => joinLobby(lobby.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Rejoindre
              </button>
            </div>
          ))}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-100">Créer un nouveau lobby</h2>
              <form onSubmit={handleCreateLobby} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du lobby
                  </label>
                  <input
                    type="text"
                    value={newLobbyName}
                    onChange={(e) => setNewLobbyName(e.target.value)}
                    className="bg-gray-700 text-gray-100 w-full px-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre maximum de joueurs
                  </label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="bg-gray-700 text-gray-100 w-full px-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    {[2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} joueurs</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
