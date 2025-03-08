import { create } from 'zustand';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GameState, GamePhase, Resource, House, Position, Player, Lobby } from '../types/game';

let supabase: SupabaseClient | null = null;

const initializeSupabase = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    return true;
  }
  return false;
};

const generateRooms = (type: House['type']) => {
  const rooms = [];
  
  switch (type) {
    case 'residential':
      rooms.push(
        { name: 'Salon', description: 'Un salon poussiéreux avec des meubles renversés.' },
        { name: 'Cuisine', description: 'Une cuisine avec des placards potentiellement utiles.', loot: ['food', 'water'] },
        { name: 'Chambre', description: 'Une chambre avec un lit défait.', loot: ['medicine'] }
      );
      break;
    case 'store':
      rooms.push(
        { name: 'Zone principale', description: 'Les rayons du magasin sont en désordre.', loot: ['food', 'water'] },
        { name: 'Réserve', description: 'Une réserve avec des étagères.', loot: ['materials'] }
      );
      break;
    case 'hospital':
      rooms.push(
        { name: 'Accueil', description: 'Le bureau d\'accueil est couvert de papiers.' },
        { name: 'Pharmacie', description: 'Une pharmacie avec des étagères vides.', loot: ['medicine'] },
        { name: 'Salle de soins', description: 'Une salle de soins avec du matériel médical.', loot: ['medicine'] }
      );
      break;
    case 'warehouse':
      rooms.push(
        { name: 'Entrepôt principal', description: 'Un grand espace rempli d\'étagères.', loot: ['materials'] },
        { name: 'Zone de stockage', description: 'Une zone de stockage sécurisée.', loot: ['materials', 'food'] }
      );
      break;
  }
  
  return rooms;
};

const generateHouses = (): House[] => {
  const houses: House[] = [];
  const positions = new Set<string>();
  const types: House['type'][] = ['residential', 'store', 'hospital', 'warehouse'];

  while (houses.length < 10) {
    const x = Math.floor(Math.random() * 7) - 3;
    const y = Math.floor(Math.random() * 7) - 3;
    const posKey = `${x},${y}`;

    if (!positions.has(posKey) && !(x === 0 && y === 0)) {
      const type = types[Math.floor(Math.random() * types.length)];
      positions.add(posKey);
      houses.push({
        id: `house-${houses.length}`,
        position: { x, y },
        type,
        explored: false,
        lootable: true,
        rooms: generateRooms(type)
      });
    }
  }

  return houses;
};

interface GameStore extends GameState {
  setPhase: (phase: GamePhase) => void;
  addResource: (type: Resource, amount: number) => void;
  updateBaseDefense: (value: number) => void;
  addEvent: (event: string) => void;
  movePlayer: (position: Position) => void;
  exploreHouse: (houseId: string) => void;
  selectHouse: (houseId: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  createLobby: (name: string, maxPlayers: number) => Promise<void>;
  joinLobby: (lobbyId: string) => Promise<void>;
  leaveLobby: () => Promise<void>;
  setReady: (ready: boolean) => Promise<void>;
  startGame: () => Promise<void>;
  isSupabaseInitialized: () => boolean;
  updateLobbySettings: (settings: any) => Promise<void>;
  kickPlayer: (playerId: string) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'initial',
  day: 1,
  survivors: [
    {
      id: 'survivor-1',
      name: 'Jean',
      health: 100,
      morale: 80,
      skills: ['médecine'],
      inventory: { food: 0, water: 0, medicine: 0, materials: 0 },
      position: { x: -2, y: 1 }
    },
    {
      id: 'survivor-2',
      name: 'Marie',
      health: 90,
      morale: 75,
      skills: ['combat'],
      inventory: { food: 0, water: 0, medicine: 0, materials: 0 },
      position: { x: 2, y: -1 }
    }
  ],
  baseResources: {
    food: 10,
    water: 15,
    medicine: 5,
    materials: 20
  },
  baseDefense: 50,
  events: [],
  houses: generateHouses(),
  playerPosition: { x: 0, y: 0 },
  selectedHouse: null,
  currentUser: null,
  currentLobby: null,

  isSupabaseInitialized: () => {
    return initializeSupabase();
  },

  setPhase: (phase) => set({ phase }),
  addResource: (type, amount) => 
    set((state) => ({
      baseResources: {
        ...state.baseResources,
        [type]: state.baseResources[type] + amount
      }
    })),
  updateBaseDefense: (value) => set({ baseDefense: value }),
  addEvent: (event) => 
    set((state) => ({ events: [event, ...state.events].slice(0, 50) })),
  movePlayer: (position) =>
    set((state) => ({ playerPosition: position })),
  exploreHouse: (houseId) =>
    set((state) => ({
      houses: state.houses.map(house =>
        house.id === houseId ? { ...house, explored: true } : house
      )
    })),
  selectHouse: (houseId) =>
    set({ selectedHouse: houseId }),

  signIn: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Please connect to Supabase using the "Connect to Supabase" button.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        set({
          currentUser: {
            id: data.user.id,
            name: profile.name,
            ready: false
          }
        });
      }
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    if (!supabase) {
      throw new Error('Please connect to Supabase using the "Connect to Supabase" button.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    
    if (data.user) {
      await supabase
        .from('profiles')
        .insert([{ id: data.user.id, name }]);

      set({
        currentUser: {
          id: data.user.id,
          name,
          ready: false
        }
      });
    }
  },

  signOut: async () => {
    if (!supabase) {
      throw new Error('Please connect to Supabase using the "Connect to Supabase" button.');
    }

    await supabase.auth.signOut();
    set({ currentUser: null, currentLobby: null });
  },

  createLobby: async (name: string, maxPlayers: number) => {
    if (!supabase) {
      throw new Error('Please connect to Supabase using the "Connect to Supabase" button.');
    }

    const { currentUser } = get();
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('lobbies')
      .insert([{
        name,
        host: currentUser.id,
        max_players: maxPlayers,
        started: false,
        settings: {
          difficulty: 'normal',
          nightLength: 5,
          startingResources: 'normal'
        }
      }])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      const lobby: Lobby = {
        id: data.id,
        name: data.name,
        host: data.host,
        players: [{ ...currentUser, ready: false }],
        maxPlayers: data.max_players,
        started: false,
        settings: data.settings
      };
      set({ currentLobby: lobby });
    }
  },

  updateLobbySettings: async (settings: any) => {
    if (!supabase) {
      throw new Error('Please connect to Supabase using the "Connect to Supabase" button.');
    }

    const { currentLobby } = get();
    if (!currentLobby) return;

    const { error } = await supabase
      .from('lobbies')
      .update({ settings })
      .eq('id', currentLobby.id);

    if (error) throw error;

    set((state) => ({
      currentLobby: {
        ...state.currentLobby!,
        settings
      }
    }));
  },

  kickPlayer: async (playerId: string) => {
    if (!supabase) {
      throw new Error('Please connect to Supabase using the "Connect to Supabase" button.');
    }

    const { currentLobby } = get();
    if (!currentLobby) return;

    const { error } = await supabase
      .from('lobby_players')
      .delete()
      .match({
        lobby_id: currentLobby.id,
        player_id: playerId
      });

    if (error) throw error;

    set((state) => ({
      currentLobby: {
        ...state.currentLobby!,
        players: state.currentLobby!.players.filter(p => p.id !== playerId)
      }
    }));
  },

  joinLobby: async (lobbyId: string) => {
    if (!supabase) {
      throw new Error('Please connect to Supabase using the "Connect to Supabase" button.');
    }

    const { currentUser } = get();
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('lobby_players')
      .insert([{
        lobby_id: lobbyId,
        player_id: currentUser.id,
        ready: false
      }]);

    if (error) throw error;

    // Subscribe to lobby updates
    const lobbySubscription = supabase
      .channel(`lobby:${lobbyId}`)
      .on('*', (payload) => {
        // Update lobby state based on real-time changes
        if (payload.new) {
          set((state) => ({
            currentLobby: {
              ...state.currentLobby!,
              ...payload.new
            }
          }));
        }
      })
      .subscribe();
  },

  leaveLobby: async () => {
    if (!supabase) {
      throw new Error('Please connect to Supabase using the "Connect to Supabase" button.');
    }

    const { currentUser, currentLobby } = get();
    if (!currentUser || !currentLobby) return;

    await supabase
      .from('lobby_players')
      .delete()
      .match({ 
        lobby_id: currentLobby.id,
        player_id: currentUser.id
      });

    set({ currentLobby: null });
  },

  setReady: async (ready: boolean) => {
    if (!supabase) {
      throw new Error('Please connect to Supabase using the "Connect to Supabase" button.');
    }

    const { currentUser, currentLobby } = get();
    if (!currentUser || !currentLobby) return;

    await supabase
      .from('lobby_players')
      .update({ ready })
      .match({
        lobby_id: currentLobby.id,
        player_id: currentUser.id
      });

    set((state) => ({
      currentLobby: {
        ...state.currentLobby!,
        players: state.currentLobby!.players.map(p =>
          p.id === currentUser.id ? { ...p, ready } : p
        )
      }
    }));
  },

  startGame: async () => {
    if (!supabase) {
      throw new Error('Please connect to Supabase using the "Connect to Supabase" button.');
    }

    const { currentLobby } = get();
    if (!currentLobby) return;

    await supabase
      .from('lobbies')
      .update({ started: true })
      .eq('id', currentLobby.id);

    set((state) => ({
      currentLobby: {
        ...state.currentLobby!,
        started: true
      },
      phase: 'day'
    }));
  }
}));
