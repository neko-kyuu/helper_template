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
    experience: { current: number; max: number };
  };
  equipment?: {
    leftHand: string;
    rightHand: string;
    outfitContent: string;
  };
}

export interface factionPrestige {
  name: string;
  description: string;
  prestige: number;
}

export interface CustomApiConfig {
  apiurl: string;
  key: string;
  model: string;
}

export interface MvuData {
  playerData: {
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
      experience: { current: number; max: number };
    };
    attributes: Record<string, number>;
    equipment: {
      leftHand: string;
      rightHand: string;
      outfitContent: string;
    };
  };
  playerDynamicData: {
    inventory: Record<string, InventoryItem>;
    gold: number;
  };
  followerNPCData: Record<string, NpcData>;
  wardrobe: {
    ownedOutfits: OwnedOutfits;
  };
  archivedData: {
    factionPrestige: Record<string, factionPrestige>;
    bestiary: Record<string, any>;
    anecdotes: Record<string, any>;
    outfitIds: Record<string, string>;
    inventory: Record<string, OutfitData>;
    worldNPC: Record<string, NpcData>;
  };
  worldInfo: {
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
  progressData: {
    questPhase: string;
    partyAttrPoints: Record<string, number>;
    currentQuest: Record<string, any>;
    nextQuest: Record<string, any>;
    pendingQuest: Record<string, any>;
    completedQuest: Record<string, any>;
  };
  system: {
    mainStoryMode: boolean;
    customApi: CustomApiConfig;
  };
}

export type PartyMember = MvuData['playerData'] | NpcData;
