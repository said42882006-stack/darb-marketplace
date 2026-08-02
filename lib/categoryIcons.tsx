import {
  Home, Car, Palmtree, Waves, Truck, Fuel, Package,
  UserRound, CarTaxiFront, Bike, Sailboat, Boxes, LucideIcon,
} from "lucide-react";
import { CategoryId } from "./constants";

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  homes: Home,
  cars: Car,
  chalets: Palmtree,
  resorts: Waves,
  trucks: Truck,
  oil_transport: Fuel,
  delivery: Package,
  mandoob: UserRound,
  taxi: CarTaxiFront,
  bikes: Bike,
  boats: Sailboat,
  other: Boxes,
};
