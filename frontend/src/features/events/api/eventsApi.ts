import type { EventItem, NewEventInput } from '../../../types/event';

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt_ascend2026',
    name: 'Ascend — Tech Fest',
    date: 'Sat, 21 Mar 2026',
    venue: 'Main Campus Lawn',
    category: 'Tech Fest',
    shortDescription: 'A 1-day festival of hacking, demos, and innovation.',
    fullDescription:
      'Join Ascend for a full day of product demos, startup talks, and a student hack challenge with live judging and networking opportunities.',
    capacityTotal: 250,
    capacityRegistered: 166,
    isRegistered: false,
    imageUrl: 'https://images.squarespace-cdn.com/content/v1/5fce63270356d927d7eecdbd/7ae672e3-5dae-4987-9478-709fe2f3c993/event_.jpg?format=2500w',
    gates: [
      { id: 'g0', name: 'North Gate' },
      { id: 'g1', name: 'Main Gate' },
    ],
  },
  {
    id: 'evt_aiworkshop',
    name: 'AI for Builders Workshop',
    date: 'Tue, 24 Mar 2026',
    venue: 'Innovation Lab',
    category: 'Workshop',
    shortDescription: 'Hands-on sessions on practical AI workflows and prototyping.',
    fullDescription:
      'Learn how to build with AI tools using real app demos, prompt engineering patterns, and workflow design for student teams.',
    capacityTotal: 80,
    capacityRegistered: 52,
    isRegistered: true,
    imageUrl: 'https://www.zartis.com/wp-content/uploads/2026/03/ccl-5-1024x576.jpeg',
    gates: [{ id: 'g0', name: 'Lab Entrance' }],
  },
  {
    id: 'evt_cultrave',
    name: 'Cultrave Night',
    date: 'Fri, 27 Mar 2026',
    venue: 'Auditorium',
    category: 'Cultural',
    shortDescription: 'An evening of music, dance, and campus performances.',
    fullDescription:
      'Experience a vibrant cultural showcase featuring dance, vocal performances, and live music from student groups across campus.',
    capacityTotal: 180,
    capacityRegistered: 142,
    isRegistered: false,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6ugCL1bDuhur8OFzXMoYCxlp2C_gv2eWZqbN7yaZqbgtcCFFMaFTwLlo&s=10',
    gates: [{ id: 'g0', name: 'Auditorium Gate' }],
  },
    {
    id: 'evt_009',
    name: 'Robotics Showdown',
    date: 'Sat, 14 Mar 2026',
    venue: 'Mechanical Block Ground',
    category: 'Tech Fest',
    shortDescription: 'Student-built bots compete head to head.',
    fullDescription:
      'Teams battle custom-built robots in an obstacle and combat arena. Open registration for competitors, free entry for spectators. Judged rounds followed by a knockout final.',
    capacityTotal: 400,
    capacityRegistered: 220,
    isRegistered: false,
    imageUrl: 'https://media.ahmedabadmirror.com/am/uploads/mediaGallery/image/1713814135427.jpg-org',
    gates: [{ id: 'g1', name: 'Gate A — Main' }, { id: 'g2', name: 'Gate B — Side' }],
  },
  {
    id: 'evt_010',
    name: 'AI/ML Bootcamp',
    date: 'Sat, 28 Feb 2026',
    venue: 'CS Block, Seminar Hall',
    category: 'Workshop',
    shortDescription: 'Full-day intro to machine learning fundamentals.',
    fullDescription:
      'Covers regression, classification, and a hands-on model-training session using Python. No prior ML experience required, basic Python knowledge expected. Certificate of participation provided.',
    capacityTotal: 80,
    capacityRegistered: 76,
    isRegistered: false,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGvH7W4a42owWTp7J9Ozu2alZ4GYEJ_cDvzxst0dcAI4af9Ia9jx6dx5vk&s=10',
    gates: [{ id: 'g1', name: 'Main Entry' }],
  },
  {
    id: 'evt_011',
    name: 'Battle of Bands',
    date: 'Fri, 6 Mar 2026',
    venue: 'Open Air Theatre',
    category: 'Cultural',
    shortDescription: 'Campus bands compete for the top spot.',
    fullDescription:
      'Six shortlisted student bands perform live, judged by a panel including a local music producer. Audience choice award also up for grabs via live voting.',
    capacityTotal: 800,
    capacityRegistered: 505,
    isRegistered: false,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNvuJklQN8J1swt_TcmHirVFFaJ2pXWNFVCyGBLHBzSg&s',
    gates: [{ id: 'g1', name: 'Gate A — North' }, { id: 'g2', name: 'Gate B — South' }],
  },
  {
    id: 'evt_012',
    name: 'Resume & LinkedIn Clinic',
    date: 'Wed, 18 Feb 2026',
    venue: 'Placement Cell Office',
    category: 'Workshop',
    shortDescription: 'One-on-one resume review with placement mentors.',
    fullDescription:
      'Drop-in sessions where placement cell mentors and senior students review your resume and LinkedIn profile live and suggest improvements. First-come, first-served slots.',
    capacityTotal: 30,
    capacityRegistered: 9,
    isRegistered: false,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR_fSQMk6KhcxiYy2-F9-XzbmglTaIWjr4ODpnd-YDnAqXR6FPCZklknoF&s=10',
    gates: [{ id: 'g1', name: 'Main Entry' }],
  },
];

export async function getEvents(): Promise<EventItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [...MOCK_EVENTS];
}

export async function getEventById(eventId: string): Promise<EventItem | null> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return MOCK_EVENTS.find((event) => event.id === eventId) ?? null;
}

export async function registerForEvent(eventId: string): Promise<{ success: boolean; message?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const event = MOCK_EVENTS.find((item) => item.id === eventId);
  if (!event) {
    return { success: false, message: 'Event not found.' };
  }

  if (event.capacityRegistered >= event.capacityTotal) {
    return { success: false, message: 'This event is already full.' };
  }

  event.capacityRegistered += 1;
  event.isRegistered = true;
  return { success: true, message: 'Registration successful.' };
}

export async function createEvent(input: NewEventInput): Promise<EventItem> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newEvent: EventItem = {
    id: `evt_${Date.now()}`,
    name: input.name,
    date: input.date,
    venue: input.venue,
    category: input.category,
    shortDescription: input.shortDescription,
    fullDescription: input.fullDescription,
    capacityTotal: input.capacityTotal,
    capacityRegistered: 0,
    isRegistered: false,
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(input.name)}/600/400`,
    gates: input.gates.map((name, i) => ({ id: `g${i}`, name })),
  };

  MOCK_EVENTS.push(newEvent);
  return newEvent;
}