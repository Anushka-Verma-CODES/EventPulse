export interface Gate {
  id: string;
  name: string;
}

export interface EventItem {
  id: string;
  name: string;
  date: string;
  venue: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  capacityTotal: number;
  capacityRegistered: number;
  isRegistered: boolean;
  imageUrl: string;
  gates: Gate[];
}

export interface NewEventInput {
  name: string;
  date: string;
  venue: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  capacityTotal: number;
  gates: string[];
}