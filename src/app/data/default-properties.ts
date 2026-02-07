export interface DefaultProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  images?: string[];
  videos?: string[];
  features?: string[];
}

export const defaultProperties: DefaultProperty[] = [
  {
    id: 'default_1',
    title: 'Modern Luxury Villa',
    location: 'Lekki Phase 1, Lagos',
    price: 'â‚¦85,000,000',
    type: 'Sale',
    images: [
      'https://images.unsplash.com/photo-1638369022547-1c763b1b9b3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZXxlbnwxfHx8fDE3NjczNTI3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    bedrooms: 5,
    bathrooms: 4,
    area: '450 sqm',
    description: 'Stunning modern villa with premium finishes',
    features: ['Swimming Pool', 'Garden', 'Parking'],
  },
  {
    id: 'default_2',
    title: 'Luxury Apartment',
    location: 'Victoria Island, Lagos',
    price: 'â‚¦3,500,000/yr',
    type: 'Rent',
    images: [
      'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njc0MDc1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    bedrooms: 3,
    bathrooms: 3,
    area: '200 sqm',
    description: 'Elegant apartment with modern amenities',
    features: ['Gym', '24/7 Security', 'Elevator'],
  },
  {
    id: 'default_3',
    title: 'Contemporary Villa',
    location: 'Banana Island, Lagos',
    price: 'â‚¦150,000,000',
    type: 'Sale',
    images: [
      'https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NzQyMDEwM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    bedrooms: 6,
    bathrooms: 5,
    area: '600 sqm',
    description: 'Ultra-luxury waterfront property',
    features: ['Private Beach', 'Boat Dock', 'Cinema Room'],
  },
  {
    id: 'default_4',
    title: 'Premium Penthouse',
    location: 'Ikoyi, Lagos',
    price: 'â‚¦8,000,000/yr',
    type: 'Rent',
    images: [
      'https://images.unsplash.com/photo-1606723325559-ad1bffa19bde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBwZW50aG91c2V8ZW58MXx8fHwxNzY3NDc3NDkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    bedrooms: 4,
    bathrooms: 4,
    area: '350 sqm',
    description: 'Spectacular penthouse with city views',
    features: ['Rooftop Terrace', 'Smart Home', 'Concierge'],
  },
  {
    id: 'default_5',
    title: 'Executive Estate',
    location: 'Lekki Phase 2, Lagos',
    price: 'â‚¦120,000,000',
    type: 'Sale',
    images: [
      'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZWFsJTIwZXN0YXRlfGVufDF8fHx8MTc2NzM5Mjk1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    bedrooms: 5,
    bathrooms: 5,
    area: '500 sqm',
    description: 'Gated estate with premium security',
    features: ['Club House', 'Tennis Court', 'Playground'],
  },
  {
    id: 'default_6',
    title: 'Commercial Building',
    location: 'Marina, Lagos',
    price: 'â‚¦250,000,000',
    type: 'Sale',
    images: [
      'https://images.unsplash.com/photo-1694702740570-0a31ee1525c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZ3xlbnwxfHx8fDE3Njc0NDcyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    bedrooms: 0,
    bathrooms: 10,
    area: '2000 sqm',
    description: 'Prime commercial property in business district',
    features: ['Parking Lot', 'Backup Generator', 'High-Speed Internet'],
  },
  {
    id: 'default_7',
    title: 'Oceanview Airbnb Retreat',
    location: 'Oniru, Lagos',
    price: 'Ã¢â€šÂ¦120,000/night',
    type: 'Airbnb',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtb2Rlcm4lMjBhaXJibmIlMjBhcGFydG1lbnR8ZW58MXx8fHwxNzY3NDc3NDkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    bedrooms: 2,
    bathrooms: 2,
    area: '120 sqm',
    description: 'Luxury short-stay apartment with skyline views',
    features: ['Self Check-In', 'High-Speed Wi-Fi', 'Fully Equipped Kitchen', 'Daily Cleaning'],
  },
];
