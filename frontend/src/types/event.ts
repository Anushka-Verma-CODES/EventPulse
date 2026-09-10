export interface EventItem {
  id: string;
  name: string;
  date: string;
  venue: string;
  category: string;        // "Tech Fest" | "Workshop" | "Cultural" etc.
  shortDescription: string;
  fullDescription: string;
  capacityTotal: number;
  capacityRegistered: number;
  isRegistered: boolean;
}