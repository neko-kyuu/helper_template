import { InventoryItem, QualityType, SlotType, TierType } from './itemConstants';

export type WithId<T> = T & {
  id: string;
};

export interface EquipmentItem {
  id: string;
  name: string;
  quality: QualityType;
  material: string;
  slot: SlotType;
  tier: TierType;
}

export interface Slots {
  head: EquipmentItem | null;
  bodyInner: EquipmentItem | null;
  bodyArmor: EquipmentItem | null;
  hands: EquipmentItem | null;
  legsInner: EquipmentItem | null;
  legsArmor: EquipmentItem | null;
  feet: EquipmentItem | null;
  cloak: EquipmentItem | null;
  neck: EquipmentItem | null;
  ring: EquipmentItem | null;
  belt: EquipmentItem | null;
  extra: EquipmentItem[];
}

export interface OutfitData {
  name: string;
  type: string;
  description: string;
  wearer: string | null;
  slots: Slots;
}

export interface Outfit extends OutfitData {
  id: string;
}

export type OwnedOutfits = Record<string, OutfitData>;

export interface NpcData {
  character: {
    name: string;
    level: number;
    gender: string;
    race: string;
    height?: string;
    build?: string;
    appearance?: string;
    personality?: string;
  };
  attributes: Record<string, number>;
  meta: {
    relationship: string;
    favorability: number;
    description: string;
    title?: string;
    favorabilityTowardsNPCs?: Record<string, number>;
  };
  status?: {
    health: { current: number; max: number };
    mood: { current: number; max: number };
    arousal: { current: number; max: number };
  };
  equipment?: {
    leftHand: string;
    rightHand: string;
    outfit: string;
    outfitContent: string;
  };
}

export interface factionPrestige {
  name: string;
  description: string;
  prestige: number;
}

export interface MvuData {
  PlayerData: {
    character: {
      name: string;
      level: number;
      gender: string;
      race: string;
      height: string;
      build: string;
      appearance: string;
      personality: string;
    };
    status: {
      health: { current: number; max: number };
      mood: { current: number; max: number };
      arousal: { current: number; max: number };
    };
    attributes: Record<string, number>;
    equipment: {
      leftHand: string;
      rightHand: string;
      outfit: string;
      outfitContent: string;
    };
    progress: {
      questPhase: string;
      partyExperience: { current: number; max: number };
      partyAttrPoints: number;
      currentQuest: Record<string, any>;
      nextQuest: Record<string, any>;
      pendingQuest: Record<string, any>;
      completedQuest: Record<string, any>;
    };
    settings: {
      date: string;
      time: string;
      weather: string;
      currentRegion: string;
      currentLocation: string;
      nearbyNPC: Record<string, NpcData>;
      factionPrestige: Record<string, factionPrestige>;
      bestiary: Record<string, any>;
      anecdotes: Record<string, any>;
    };
  };
  PlayerDynamicData: {
    inventory: Record<string, InventoryItem>;
    clothingAttributes: {
      defense: number;
      comfort: number;
      warmth: number;
      social: number;
      weight: number;
    };
    gold: number;
  };
  FollowerNPCData: Record<string, NpcData>;
  Wardrobe: {
    ownedOutfits: OwnedOutfits;
  };
  ArchivedData: {
    factionPrestige: Record<string, factionPrestige>;
    bestiary: Record<string, any>;
    anecdotes: Record<string, any>;
  };
}

export type PartyMember = MvuData['PlayerData'] | NpcData;
