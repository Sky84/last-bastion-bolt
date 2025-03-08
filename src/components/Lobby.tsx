import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Users, ArrowLeft, Play, UserCheck, UserX, Settings, UserMinus, Bell, Crown } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export const Lobby: React.FC = () => {
  const { currentLobby, currentUser, leaveLobby, setReady, startGame, updateLobbySettings, kickPlayer } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(currentLobby?.maxPlayers || 4);
  const [gameSettings, setGameSettings] = useState({
    difficulty: 'normal',
    nightLength: 5,
    startingResources: 'normal'
  });

  useEffect(() => {
    // Subscribe to lobby updates
    if (currentLobby) {
      const handlePlayerJoin = (player: any) => {
        toast.success(`${player.name} a rejoint le lobby`);
      };

      const handlePlayerLeave = (player: any) => {
        toast.error(`${player.name} a quitté le lobby`);
      };

      const handleSettingsChange = () => {
        toast.info('Les paramètres du lobby ont été modifiés');
      };

      // Clean up on unmount
      return () => {
        // Cleanup subscriptions
      };
    }
  }, [currentLobby]);

  if (!currentLobby || !currentUser) return null;

  const isHost = currentLobby.host === currentUser.id;
  const currentPlayer = currentLobby.players.find(p => p.id === currentUser.id);
  const allPlayersReady = currentLobby.players.every(p => p.ready);
  const canStartGame = isHost && (allPlayersReady || true); // Host can force start

  const handleKickPlayer = (playerId: string) => {
    if (isHost && playerId !== currentUser.id) {
      kickPlayer(playerId);
      toast.success('Joueur expulsé');
    }
  };

  const handleSettingsSave = () => {
    if (isHost) {
      updateLobbySettings({
        maxPlayers,
        ...gameSettings
      });
      setShowSettings(false);
      toast.success('Paramètres mis à jour');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <Toaster position="top-right" />
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={leaveLobby}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-100">{currentLobby.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Users size={20} />
              <span>{currentLobby.players.length}/{currentLobby.maxPlayers} joueurs</span>
            </div>
            {isHost && (
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
              >
                <Settings size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Joueurs</h2>
          <div className="space-y-4">
            {currentLobby.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-gray-700 p-4 rounded"
              >
                <div className="flex items-center gap-3">
                  {player.id === currentLobby.host && (
                    <Crown className="text-yellow-500" size={20} />
                  )}
                  <span className="text-gray-100">{player.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  {player.ready ? (
                    <UserCheck className="text-green-500" size={20} />
                  ) : (
                    <UserX className="text-red-500" size={20} />
                  )}
                  {isHost && player.id !== currentUser.id && (
                    <button
                      onClick={() => handleKickPlayer(player.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <UserMinus size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            {!isHost && (
              <button
                onClick={() => setReady(!currentPlayer?.ready)}
                className={`px-6 py-2 rounded font-medium flex items-center gap-2 ${
                  currentPlayer?.ready
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {currentPlayer?.ready ? (
                  <>
                    <UserX size={20} />
                    Pas prêt
                  </>
                ) : (
                  <>
                    <UserCheck size={20} />
                    Prêt
                  </>
                )}
              </button>
            )}
            {isHost && (
              <button
                onClick={startGame}
                className="px-6 py-2 rounded font-medium flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play size={20} />
                Démarrer la partie
              </button>
            )}
          </div>
        </div>

        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-100">Paramètres du lobby</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre maximum de joueurs
                  </label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="bg-gray-700 text-gray-100 w-full px-4 py-2 rounded border border-gray-600"
                  >
                    {[2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} joueurs</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={gameSettings.difficulty}
                    onChange={(e) => setGameSettings({...gameSettings, difficulty: e.target.value})}
                    className="bg-gray-700 text-gray-100 w-full px-4 py-2 rounded border border-gray-600"
                  >
                    <option value="easy">Facile</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée de la nuit (minutes)
                  </label>
                  <input
                    type="number"
                    value={gameSettings.nightLength}
                    onChange={(e) => setGameSettings({...gameSettings, nightLength: Number(e.target.value)})}
                    min="1"
                    max="10"
                    className="bg-gray-700 text-gray-100 w-full px-4 py-2 rounded border border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ressources de départ
                  </label>
                  <select
                    value={gameSettings.startingResources}
                    onChange={(e) => setGameSettings({...gameSettings, startingResources: e.target.value})}
                    className="bg-gray-700 text-gray-100 w-full px-4 py-2 rounded border border-gray-600"
                  >
                    <option value="scarce">Rares</option>
                    <option value="normal">Normales</option>
                    <option value="abundant">Abondantes</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSettingsSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
