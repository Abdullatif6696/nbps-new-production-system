export interface RawMaterial {
  id: string;
  batchNumber: string;
  width: number; // mm
  weight: number; // kg
  materialType: string;
  isRemnant: boolean;
  entryDate: string; // ISO Date
}

export interface OrderItem {
  id: string;
  customerName: string;
  requiredWidth: number; // mm
  targetWeight: number; // kg
  isFulfilled: boolean;
  dueDate: string; // ISO Date
}

export interface OptimizationPlan {
  rollId: string;
  selectedRoll: RawMaterial;
  cuts: OrderItem[];
  bladePositions: number[]; // Positions in mm from left edge
  wasteWidth: number; // mm
  usedWidth: number; // mm
  efficiency: number; // percentage
}

export type ThemeMode = 'light' | 'dark';

export interface AppState {
  inventory: RawMaterial[];
  orders: OrderItem[];
  theme: ThemeMode;
}