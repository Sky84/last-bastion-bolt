import React, { useEffect } from 'react';
import { Auth } from './components/Auth';
import { useGameStore } from './store/gameStore';
import { Lobby } from './components/Lobby';
import { LobbyList } from './components/LobbyList';
import { GameInterface } from './components/GameInterface';
import { BuildingInterior } from './components/BuildingInterior';
import { CityMap } from './components/CityMap';
import toast from 'react-hot-toast';

function App() {
  const { currentUser, currentLobby, phase, isSupabaseInitialized } = useGameStore();

  useEffect(() => {
    if (!isSupabaseInitialized()) {
      console.error("Supabase n'a pas été initialisé correctement.");
    } else {
      console.log("Supabase initialisé.");
    }

    const testSupabase = async () => {
      const { isSupabaseInitialized } = useGameStore.getState();
      if (isSupabaseInitialized()) {
        const supabase = useGameStore.getState().isSupabaseInitialized();
        const supabaseClient = useGameStore.getState().isSupabaseInitialized() && useGameStore.getState().isSupabaseInitialized();

        if (supabaseClient) {
          try {
            const { data, error } = await (supabaseClient as any).from('lobbies').select('*').limit(1);
            if (error) {
              console.error("Erreur de test Supabase:", error);
            } else {
              console.log("Test Supabase réussi:", data);
            }
          } catch (e) {
            console.error("Erreur lors du test de Supabase:", e);
          }
        } else {
          console.error("Client Supabase non disponible pour le test.");
        }
      } else {
        console.error("Supabase non initialisé, impossible de lancer le test.");
      }
    };

    testSupabase();
  }, []);


  return (
    <div className="App">
      {phase === 'initial' && !currentUser && <Auth />}
      {phase === 'initial' && currentUser && !currentLobby && <LobbyList />}
      {phase === 'lobby' && <Lobby />}
      {phase === 'city' && <CityMap />}
      {phase === 'building' && <BuildingInterior />}
      {phase === 'day' && <GameInterface />}
      {phase === 'night' && <GameInterface />}
    </div>
  );
}

export default App;
