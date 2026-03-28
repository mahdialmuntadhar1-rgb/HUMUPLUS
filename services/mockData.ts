import type { Business, BusinessPostcard, Event, Post, Story } from '../types';

export type GovernorateId =
  | 'all'
  | 'baghdad'
  | 'basra'
  | 'erbil'
  | 'sulaymaniyah'
  | 'dohuk'
  | 'nineveh'
  | 'anbar'
  | 'babil'
  | 'karbala'
  | 'najaf'
  | 'qadisiyyah'
  | 'wasit'
  | 'maysan'
  | 'dhi_qar'
  | 'muthanna'
  | 'diyala'
  | 'kirkuk'
  | 'salah_al_din';

const now = new Date();
const fromNow = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

const byGovernorate: Record<Exclude<GovernorateId, 'all'>, {
  stories: Story[];
  posts: Post[];
  postcards: BusinessPostcard[];
  featured: Business[];
  events: Event[];
}> = {
  baghdad: {
    stories: [
      { id: 9001, avatar: 'https://picsum.photos/seed/bg-story-1/120', name: 'Al-Mutanabbi', thumbnail: 'https://picsum.photos/seed/bg-story-thumb-1/400/711', userName: 'Al-Mutanabbi Street Books', type: 'business', aiVerified: true, isLive: true, media: ['https://picsum.photos/seed/bg-story-media-1/1080/1920', 'https://picsum.photos/seed/bg-story-media-2/1080/1920'], timeAgo: '35m ago', governorate: 'baghdad' },
      { id: 9002, avatar: 'https://picsum.photos/seed/bg-story-2/120', name: 'Karrada Walk', thumbnail: 'https://picsum.photos/seed/bg-story-thumb-2/400/711', userName: 'Karrada Night Walk', type: 'community', media: ['https://picsum.photos/seed/bg-story-media-3/1080/1920'], timeAgo: '2h ago', governorate: 'baghdad' },
    ],
    posts: [
      { id: 'mock-bg-1', businessId: 'mock-baghdad-cafe', businessName: 'Shanasheel Café', businessAvatar: 'https://picsum.photos/seed/bg-post-avatar-1/120', caption: 'Tonight: oud live set at 8:30 PM on Abu Nawas 🌙', imageUrl: 'https://picsum.photos/seed/bg-post-image-1/800/600', createdAt: fromNow(3), likes: 84, isVerified: true, governorate: 'baghdad' },
      { id: 'mock-bg-2', businessId: 'mock-baghdad-bistro', businessName: 'Dar Al-Masgouf', businessAvatar: 'https://picsum.photos/seed/bg-post-avatar-2/120', caption: 'Fresh masgouf by the river — family tables available tonight.', imageUrl: 'https://picsum.photos/seed/bg-post-image-2/800/600', createdAt: fromNow(8), likes: 51, governorate: 'baghdad' },
    ],
    postcards: [
      { id: 'pc-bg-1', title: 'Nahar Roastery', city: 'Baghdad', neighborhood: 'Karrada', governorate: 'baghdad', category_tag: 'Cafe', phone: '+964 770 220 3300', instagram: '@naharroastery.iq', hero_image: 'https://picsum.photos/seed/bg-pc-1/800/500', image_gallery: ['https://picsum.photos/seed/bg-pc-1a/800/500'], postcard_content: 'Specialty coffee, Iraqi dates desserts, and quiet co-working mornings.', google_maps_url: 'https://maps.google.com/?q=Karrada,Baghdad', rating: 4.7, review_count: 238, verified: true },
    ],
    featured: [
      { id: 'fb-bg-1', name: 'Baghdad Skyline Lounge', nameAr: 'صالة سكايلاين بغداد', category: 'events_entertainment', rating: 4.8, governorate: 'baghdad', city: 'Baghdad', isFeatured: true, isPremium: true, isVerified: true, reviewCount: 312, status: 'open', imageUrl: 'https://picsum.photos/seed/bg-feature-1/800/500' },
      { id: 'fb-bg-2', name: 'Al-Rasheed Courtyard', nameAr: 'فناء الرشيد', category: 'food_drink', rating: 4.6, governorate: 'baghdad', city: 'Baghdad', isFeatured: true, isVerified: true, reviewCount: 201, status: 'open', imageUrl: 'https://picsum.photos/seed/bg-feature-2/800/500' },
    ],
    events: [
      { id: 'ev-bg-1', image: 'https://picsum.photos/seed/bg-event-1/800/500', title: 'Baghdad Riverfront Night Market', date: new Date('2026-04-03T18:30:00.000Z'), venue: 'Abu Nawas', attendees: 420, price: 0, category: 'entertainment', governorate: 'baghdad', aiRecommended: true },
    ],
  },
  basra: {
    stories: [{ id: 9101, avatar: 'https://picsum.photos/seed/bs-story-1/120', name: 'Shatt Walk', thumbnail: 'https://picsum.photos/seed/bs-story-thumb-1/400/711', userName: 'Basra Corniche', type: 'community', media: ['https://picsum.photos/seed/bs-story-media-1/1080/1920'], timeAgo: '1h ago', governorate: 'basra' }],
    posts: [{ id: 'mock-bs-1', businessId: 'mock-basra-seafood', businessName: 'Shatt Seafood House', businessAvatar: 'https://picsum.photos/seed/bs-post-avatar-1/120', caption: 'Fresh hammour landing now. Dinner service starts at 6 PM.', imageUrl: 'https://picsum.photos/seed/bs-post-image-1/800/600', createdAt: fromNow(5), likes: 63, governorate: 'basra' }],
    postcards: [{ id: 'pc-bs-1', title: 'Corniche Tea House', city: 'Basra', neighborhood: 'Ashar', governorate: 'basra', category_tag: 'Cafe', phone: '+964 781 111 2233', hero_image: 'https://picsum.photos/seed/bs-pc-1/800/500', image_gallery: ['https://picsum.photos/seed/bs-pc-1a/800/500'], postcard_content: 'Riverside tea, cardamom coffee, and sunset seats overlooking Shatt al-Arab.', google_maps_url: 'https://maps.google.com/?q=Basra Corniche', rating: 4.5, review_count: 182, verified: true }],
    featured: [{ id: 'fb-bs-1', name: 'Basra Corniche Hotel', nameAr: 'فندق كورنيش البصرة', category: 'hotels_stays', rating: 4.4, governorate: 'basra', city: 'Basra', isFeatured: true, isVerified: true, reviewCount: 149, status: 'open', imageUrl: 'https://picsum.photos/seed/bs-feature-1/800/500' }],
    events: [{ id: 'ev-bs-1', image: 'https://picsum.photos/seed/bs-event-1/800/500', title: 'Date Harvest Culinary Fair', date: new Date('2026-04-06T16:00:00.000Z'), venue: 'Basra International Fairgrounds', attendees: 270, price: 10000, category: 'food', governorate: 'basra' }],
  },
  erbil: {
    stories: [{ id: 9201, avatar: 'https://picsum.photos/seed/er-story-1/120', name: 'Citadel Walk', thumbnail: 'https://picsum.photos/seed/er-story-thumb-1/400/711', userName: 'Erbil Citadel Tours', type: 'community', media: ['https://picsum.photos/seed/er-story-media-1/1080/1920'], timeAgo: '55m ago', governorate: 'erbil' }],
    posts: [{ id: 'mock-er-1', businessId: 'mock-erbil-bakery', businessName: 'Qaysari Bazaar Bakery', businessAvatar: 'https://picsum.photos/seed/er-post-avatar-1/120', caption: 'Fresh nan and simit from 6:00 AM every day in the bazaar.', imageUrl: 'https://picsum.photos/seed/er-post-image-1/800/600', createdAt: fromNow(4), likes: 72, governorate: 'erbil' }],
    postcards: [{ id: 'pc-er-1', title: 'Citadel View Café', city: 'Erbil', neighborhood: 'Qaysari', governorate: 'erbil', category_tag: 'Cafe', phone: '+964 750 987 1122', hero_image: 'https://picsum.photos/seed/er-pc-1/800/500', image_gallery: ['https://picsum.photos/seed/er-pc-1a/800/500'], postcard_content: 'Terrace seating with Erbil Citadel panorama and Kurdish breakfast sets.', google_maps_url: 'https://maps.google.com/?q=Erbil Citadel', rating: 4.8, review_count: 420, verified: true }],
    featured: [{ id: 'fb-er-1', name: 'Sami Park Family Hub', nameAr: 'مركز سامي بارك العائلي', nameKu: 'هەبێ فامیلی سامی پارک', category: 'events_entertainment', rating: 4.7, governorate: 'erbil', city: 'Erbil', isFeatured: true, isPremium: true, isVerified: true, reviewCount: 501, status: 'open', imageUrl: 'https://picsum.photos/seed/er-feature-1/800/500' }],
    events: [{ id: 'ev-er-1', image: 'https://picsum.photos/seed/er-event-1/800/500', title: 'Erbil Open-Air Film Night', date: new Date('2026-04-11T19:30:00.000Z'), venue: 'Sami Abdulrahman Park', attendees: 360, price: 5000, category: 'entertainment', governorate: 'erbil' }],
  },
  sulaymaniyah: {
    stories: [{ id: 9301, avatar: 'https://picsum.photos/seed/sl-story-1/120', name: 'Azmar Coffee', thumbnail: 'https://picsum.photos/seed/sl-story-thumb-1/400/711', userName: 'Azmar Specialty', type: 'business', media: ['https://picsum.photos/seed/sl-story-media-1/1080/1920'], timeAgo: '3h ago', governorate: 'sulaymaniyah' }],
    posts: [{ id: 'mock-sl-1', businessId: 'mock-suli-books', businessName: 'Slemani Book House', businessAvatar: 'https://picsum.photos/seed/sl-post-avatar-1/120', caption: 'Tonight reading club: contemporary Kurdish poetry at 7 PM.', imageUrl: 'https://picsum.photos/seed/sl-post-image-1/800/600', createdAt: fromNow(6), likes: 40, governorate: 'sulaymaniyah' }],
    postcards: [{ id: 'pc-sl-1', title: 'Salim Street Espresso', city: 'Sulaymaniyah', neighborhood: 'Salim Street', governorate: 'sulaymaniyah', category_tag: 'Cafe', phone: '+964 771 998 4455', hero_image: 'https://picsum.photos/seed/sl-pc-1/800/500', image_gallery: ['https://picsum.photos/seed/sl-pc-1a/800/500'], postcard_content: 'Late-night espresso bar with local pastry collaborations.', google_maps_url: 'https://maps.google.com/?q=Salim Street,Sulaymaniyah', rating: 4.6, review_count: 204, verified: true }],
    featured: [{ id: 'fb-sl-1', name: 'Slemani Culture House', nameAr: 'بيت الثقافة السليمانية', nameKu: 'ماڵی کولتووری سلێمانی', category: 'culture_heritage', rating: 4.7, governorate: 'sulaymaniyah', city: 'Sulaymaniyah', isFeatured: true, isVerified: true, reviewCount: 188, status: 'open', imageUrl: 'https://picsum.photos/seed/sl-feature-1/800/500' }],
    events: [{ id: 'ev-sl-1', image: 'https://picsum.photos/seed/sl-event-1/800/500', title: 'Slemani Indie Music Session', date: new Date('2026-04-09T18:00:00.000Z'), venue: 'Slemani Cultural Center', attendees: 190, price: 7500, category: 'entertainment', governorate: 'sulaymaniyah' }],
  },
  dohuk: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  nineveh: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  anbar: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  babil: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  karbala: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  najaf: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  qadisiyyah: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  wasit: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  maysan: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  dhi_qar: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  muthanna: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  diyala: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  kirkuk: { stories: [], posts: [], postcards: [], featured: [], events: [] },
  salah_al_din: { stories: [], posts: [], postcards: [], featured: [], events: [] },
};

const fallbackOrder: Exclude<GovernorateId, 'all'>[] = ['baghdad', 'erbil', 'basra', 'sulaymaniyah'];

const takeFallback = <T,>(selector: (bucket: (typeof byGovernorate)[Exclude<GovernorateId, 'all'>]) => T[]): T[] =>
  fallbackOrder.flatMap((gov) => selector(byGovernorate[gov]));

export const mockData = {
  stories(governorate: GovernorateId): Story[] {
    if (governorate === 'all') return takeFallback((b) => b.stories);
    const current = byGovernorate[governorate]?.stories || [];
    return current.length > 0 ? current : takeFallback((b) => b.stories).slice(0, 2);
  },
  posts(governorate: GovernorateId): Post[] {
    if (governorate === 'all') return takeFallback((b) => b.posts);
    const current = byGovernorate[governorate]?.posts || [];
    return current.length > 0 ? current : takeFallback((b) => b.posts).slice(0, 2);
  },
  postcards(governorate: GovernorateId): BusinessPostcard[] {
    if (governorate === 'all') return takeFallback((b) => b.postcards);
    const current = byGovernorate[governorate]?.postcards || [];
    return current.length > 0 ? current : takeFallback((b) => b.postcards).slice(0, 2);
  },
  featured(governorate: GovernorateId): Business[] {
    if (governorate === 'all') return takeFallback((b) => b.featured);
    const current = byGovernorate[governorate]?.featured || [];
    return current.length > 0 ? current : takeFallback((b) => b.featured).slice(0, 2);
  },
  events(governorate: GovernorateId): Event[] {
    if (governorate === 'all') return takeFallback((b) => b.events);
    const current = byGovernorate[governorate]?.events || [];
    return current.length > 0 ? current : takeFallback((b) => b.events).slice(0, 2);
  },
};
