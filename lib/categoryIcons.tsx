import {
  Building2, Trees, Palmtree, Waves, BedDouble,
  Car, Bike, Sailboat,
  UserRound, Truck, Construction, HardHat, Warehouse,
  Boxes, LucideIcon,
} from "lucide-react";
import { CategoryId } from "./constants";

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  real_estate: Building2,
  land: Trees,
  chalets: Palmtree,
  resorts: Waves,
  hotels: BedDouble,
  cars: Car,
  bikes: Bike,
  boats: Sailboat,
  mandoob: UserRound,
  transport: Truck,
  cranes: Construction,
  heavy_equipment: HardHat,
  caravan: Warehouse,
  other: Boxes,
};
