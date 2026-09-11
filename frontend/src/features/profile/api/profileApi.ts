import type { User } from '../../../types/user';
import type { EventItem } from '../../../types/event';
import { getEvents } from '../../events/api/eventsApi';

const MOCK_USER: User = {
  id: 'usr_001',
  name: 'Anushka Verma',
  email: 'anushka.verma@thapar.edu',
  avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSqbrT41MPsNfEh01aHFAAaG1HtMVGe57qOmBQQEiigGoZh4Q-PS_sN-ch&s=10',
  rollNumber: '102103xxx',
  branch: 'Computer Science Engineering',
  joinedDate: 'Aug 2023',
};

export async function getCurrentUser(): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_USER;
}

export async function getMyRegisteredEvents(): Promise<EventItem[]> {
  const allEvents = await getEvents();
  return allEvents.filter((e) => e.isRegistered);
}