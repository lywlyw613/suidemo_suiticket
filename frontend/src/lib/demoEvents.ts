// Demo Event Data - 用於展示功能
export interface DemoEvent {
  id: string;
  name: string;
  description: string;
  category: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  heroImageUrl?: string;
  ticketTypes: DemoTicketType[];
  saleStartTime: string;
  saleEndTime: string;
  maxTicketsPerBuyer: number;
}

export interface DemoTicketType {
  id: string;
  name: string;
  price: number; // SUI
  quantity: number;
  description: string;
  seatRange?: string;
  isListed: boolean;
}

export const demoEvent: DemoEvent = {
  id: 'demo-taipei-jazz-2026',
  name: 'Taipei Neo-Jazz Night 2026: Rhythms of the City',
  category: 'Music',
  startTime: '2026-02-01T19:30:00+08:00',
  endTime: '2026-02-01T22:00:00+08:00',
  venueName: 'National Concert Hall, Taipei',
  venueAddress: 'No. 21-1, Zhongshan S. Rd., Zhongzheng Dist., Taipei City 100, Taiwan',
  description: `Immerse yourself in an evening of soulful melodies and improvisation at the "Taipei Neo-Jazz Night 2026." Held at the prestigious National Concert Hall, this exclusive gala features a lineup of Taiwan's top jazz virtuosos and international guest artists. Experience the fusion of classic swing and modern electronic jazz in an acoustically perfect setting. Secure your spot on the blockchain and enjoy a night of unforgettable rhythm.`,
  saleStartTime: '2026-01-03T00:00:00+08:00',
  saleEndTime: '2026-01-31T23:59:00+08:00',
  maxTicketsPerBuyer: 4,
  ticketTypes: [
    {
      id: 'vvip-prestige',
      name: 'VVIP - Prestige',
      price: 150,
      quantity: 300,
      description: '[Ground Floor Front] Closest to the stage. Includes backstage pass & NFT.',
      seatRange: 'A1 - J30 (Rows A through J, Seats 1-30)',
      isListed: true,
    },
    {
      id: 'grand-tier-standard',
      name: 'Grand Tier - Standard',
      price: 80,
      quantity: 919,
      description: '[Ground Floor Mid/Back] Excellent acoustics and main floor view.',
      seatRange: 'K1 - EE32 (Rows K through EE, Seats 1-32 approx)',
      isListed: true,
    },
    {
      id: 'balcony-experience',
      name: 'Balcony - Experience',
      price: 35,
      quantity: 500,
      description: '[Upper Levels 2 & 3] Panoramic views from the balconies.',
      seatRange: 'L2-A1 - L3-F42 (Level 2 & Level 3 balcony seating)',
      isListed: true,
    },
    {
      id: 'organizer-reserve',
      name: 'Organizer Reserve',
      price: 0,
      quantity: 303,
      description: '[VIP Boxes / Side Tiers] Not for public sale.',
      seatRange: 'BOX-A1 - BOX-F50 (Private boxes and held tiers)',
      isListed: false,
    },
  ],
};

export function getDemoEvent(eventId: string): DemoEvent | null {
  if (eventId === demoEvent.id) {
    return demoEvent;
  }
  return null;
}

export function getAllDemoEvents(): DemoEvent[] {
  return [demoEvent];
}

