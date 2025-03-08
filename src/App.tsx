import React from 'react';
import { useGameStore } from './store/gameStore';
import { GameInterface } from './components/GameInterface';
import { Auth } from './components/Auth';
import { LobbyList } from './components/LobbyList';
import { Lobby } from './components/Lobby';

function App() {
  const { currentUser, currentLobby, isSupabaseInitialized } = useGameStore();

  if (!isSupabaseInitialized()) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">Connexion à Supabase requise</h1>
          <p className="text-gray-300 mb-6">
            Pour continuer, veuillez cliquer sur le bouton "Connect to Supabase" en haut à droite de l'écran.
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  if (currentLobby) {
    if (currentLobby.started) {
      return <GameInterface />;
    }
    return <Lobby />;
  }

  return <LobbyList />;
}

export default App;
