export interface EventData {
  id?: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  fullDescription?: string;
  date?: string;
  time?: string;
  location?: string;
  rulebookUrl?: string;
  bannerUrl?: string;
  content?: string;
  readTime?: string;
  prizePool?: string;
  entryFee?: string;
  prizes?: {
    first: string;
    second: string;
    third: string;
  };
  participationFee?: string;
  teamSize?: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  registrationOpen?: boolean;
  rules?: string[];
}

// Transform database event to EventData format
function transformEvent(dbEvent: any): EventData {
  return {
    id: dbEvent.id,
    slug: dbEvent.slug,
    title: dbEvent.name,
    shortDescription: dbEvent.brief,
    category: 'technology', // Default category, can be extended later
    fullDescription: dbEvent.description,
    content: dbEvent.content,
    location: dbEvent.venue,
    rulebookUrl: dbEvent.rulebook_url,
    bannerUrl: dbEvent.banner_url,
    prizePool: dbEvent.prize_amount ? `₹${dbEvent.prize_amount.toLocaleString()}` : undefined,
    entryFee: dbEvent.entry_fee > 0 ? `₹${dbEvent.entry_fee.toLocaleString()}` : 'Free',
    teamSize: dbEvent.min_team_size === dbEvent.max_team_size 
      ? `${dbEvent.min_team_size}` 
      : `${dbEvent.min_team_size}-${dbEvent.max_team_size}`,
    minTeamSize: dbEvent.min_team_size,
    maxTeamSize: dbEvent.max_team_size,
    registrationOpen: dbEvent.registration_open,
    date: dbEvent.start_time ? new Date(dbEvent.start_time).toLocaleDateString() : undefined,
    time: dbEvent.start_time ? new Date(dbEvent.start_time).toLocaleTimeString() : undefined,
    rules: dbEvent.rules || [],
  };
}

export async function getAllEvents(): Promise<EventData[]> {
  try {
    const response = await fetch('/api/events', {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return (data.events || []).map(transformEvent);
  } catch {
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<EventData | null> {
  try {
    const response = await fetch(`/api/events/${slug}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.event ? transformEvent(data.event) : null;
  } catch {
    return null;
  }
}
