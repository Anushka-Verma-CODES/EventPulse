import type { EventItem } from '../../../types/event';

const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt_001',
    name: 'Ascend — Tech Fest',
    date: 'Sat, 21 Mar 2026',
    venue: 'Main Campus, Thapar',
    category: 'Tech Fest',
    shortDescription: 'A two-day celebration of tech, code, and innovation.',
    fullDescription:
      'Ascend brings together hackathons, tech talks, robotics demos, and startup pitches from across the region. Open to all students with valid college ID.',
    capacityTotal: 1000,
    capacityRegistered: 742,
    isRegistered: false,
  },
  {
    id: 'evt_002',
    name: 'CodeCraft Workshop',
    date: 'Wed, 4 Feb 2026',
    venue: 'CS Block, Room 204',
    category: 'Workshop',
    shortDescription: 'Hands-on full-stack workshop for beginners.',
    fullDescription:
      'A 3-hour hands-on session covering React basics, REST APIs, and deploying your first app. Laptops required. Limited seats.',
    capacityTotal: 60,
    capacityRegistered: 58,
    isRegistered: false,
  },
  {
    id: 'evt_003',
    name: 'Rhythms — Cultural Night',
    date: 'Fri, 13 Feb 2026',
    venue: 'Open Air Theatre',
    category: 'Cultural',
    shortDescription: 'Music, dance, and drama performances by student clubs.',
    fullDescription:
      'An evening of performances from the music, dance, and theatre societies, followed by an open mic session. Free entry for all students.',
    capacityTotal: 2000,
    capacityRegistered: 1310,
    isRegistered: true,
  },
];

export async function getEvents(): Promise<EventItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_EVENTS;
}

export async function getEventById(id: string): Promise<EventItem | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_EVENTS.find((e) => e.id === id);
}

export async function registerForEvent(id: string): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: MOCK_EVENTS.some((event) => event.id === id) };
}