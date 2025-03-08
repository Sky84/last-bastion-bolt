import { create } from 'zustand';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { GamePhase, BaseResources, House, GameEvent } from '../types/game';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface GameState {
  currentUser: SupabaseUser | null;
  currentLobbyId: string | null;
  phase: GamePhase;
  day: number;
  baseResources: BaseResources;
  baseDefense: number;
  events: GameEvent[];
  houses: House[];
  selectedHouse: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  createLobby: (name: string, maxPlayers: number) => Promise<void>;
  joinLobby: (lobbyId: string) => Promise<void>;
  leaveLobby: () => Promise<void>;
  startGame: () => Promise<void>;
  selectHouse: (houseId: string | null) => void;
  isSupabaseInitialized: () => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentUser: null,
  currentLobbyId: null,
  phase: 'initial',
  day: 1,
  baseResources: { food: 10, water: 10, medicine: 5, materials: 10 },
  baseDefense: 50,
  events: [],
  houses: [
    { id: 'house1', type: 'habitation', level: 1, residents: 1 },
    { id: 'house2', type: 'commerce', level: 1, residents: 0 },
    { id: 'house3', type: 'industrie', level: 1, residents: 0 },
    { id: 'house4', type: 'ferme', level: 1, residents: 0 },
    { id: 'house5', type: 'hopital', level: 1, residents: 0 },
    { id: 'house6', type: 'police', level: 1, residents: 0 },
  ],
  selectedHouse: null,
  isSupabaseInitialized: () => {
    return !!supabase;
  },
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(`Erreur de connexion: ${error.message}`, { duration: 3000 });
        console.error("Supabase sign-in error:", error);
        throw error;
      }
      set({ currentUser: data.user });
    } catch (error) {
      console.error("Sign-in failed:", error);
      throw error;
    }
  },
  signUp: async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) {
        toast.error(`Erreur d'inscription: ${error.message}`, { duration: 3000 });
        console.error("Supabase sign-up error:", error);
        throw error;
      }
      console.log("Supabase sign-up data:", data); // Log signup data
      set({ currentUser: data.user });
    } catch (error) {
      console.error("Sign-up failed:", error);
      throw error;
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(`Erreur de déconnexion: ${error.message}`, { duration: 3000 });
        console.error("Supabase sign-out error:", error);
        throw error;
      }
      set({ currentUser: null });
    } catch (error) {
      console.error("Sign-out failed:", error);
      throw error;
    }
  },
  createLobby: async (name, maxPlayers) => {
    try {
      const user = get().currentUser;
      console.log("Current User in createLobby:", user); // Log currentUser in createLobby
      if (!user) throw new Error("Utilisateur non connecté");
      const { data, error } = await supabase
        .from('lobbies')
        .insert([{ name, host_id: user.id, max_players: maxPlayers }]) // Include max_players here
        .select()
        .single();
      if (error) {
        toast.error(`Erreur lors de la création du lobby: ${error.message}`, { duration: 3000 });
        console.error("Supabase create lobby error:", error);
        throw error;
      }
      set({ currentLobbyId: data.id, phase: 'lobby' });
    } catch (error) {
      console.error("Create lobby failed:", error);
      throw error;
    }
  },
  joinLobby: async (lobbyId: string) => {
    try {
      set({ currentLobbyId: lobbyId, phase: 'lobby' });
      // Ici, vous pouvez ajouter la logique pour réellement rejoindre le lobby dans la base de données si nécessaire
    } catch (error) {
      toast.error(`Erreur lors de la tentative de rejoindre le lobby.`, { duration: 3000 });
      console.error("Join lobby failed:", error);
    }
  },
  leaveLobby: async () => {
    try {
      set({ currentLobbyId: null, phase: 'initial' });
      // Ici, vous pouvez ajouter la logique pour quitter réellement le lobby dans la base de données si nécessaire
    } catch (error) {
      toast.error(`Erreur lors de la tentative de quitter le lobby.`, { duration: 3000 });
      console.error("Leave lobby failed:", error);
    }
  },
  startGame: async () => {
    try {
      set({ phase: 'city' });
    } catch (error) {
      toast.error(`Erreur lors du démarrage de la partie.`, { duration: 3000 });
      console.error("Start game failed:", error);
    }
  },
  selectHouse: (houseId) => {
    set({ selectedHouse: houseId, phase: houseId ? 'building' : 'city' });
  },
}));
