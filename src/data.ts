import { Product, Slide } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max Space Black',
    brand: 'Apple',
    price: 1199,
    image: 'https://images.unsplash.com/photo-1611791485440-24e8fc395914?auto=format&fit=crop&q=80&w=600',
    description: 'Pro Camera. 12GB RAM. All-day Battery.',
    colors: ['#1A1A1A', '#F3F3F3', '#4B4B4B'],
    accentColor: '#ffffff'
  },
  {
    id: '2',
    name: 'iPhone 15 Pro Silver',
    brand: 'Apple',
    price: 999,
    image: 'https://images.unsplash.com/photo-1611404179374-124b8989a3df?auto=format&fit=crop&q=80&w=600',
    description: 'A total powerhouse with an advanced dual-camera system.',
    colors: ['#F3F3F3', '#1A1A1A', '#4B4B4B'],
    accentColor: '#e0e0e0'
  },
  {
    id: '3',
    name: 'iPhone 14 Pro Deep Purple',
    brand: 'Apple',
    price: 1099,
    image: 'https://images.unsplash.com/photo-1664478546384-d57ffe74a195?auto=format&fit=crop&q=80&w=600',
    description: 'Forged in titanium. A monumental leap in performance.',
    colors: ['#4B2E5C', '#1A1A1A', '#F3F3F3'],
    accentColor: '#a855f7'
  },
  {
    id: '4',
    name: 'iPhone 15 Mint Green',
    brand: 'Apple',
    price: 799,
    image: 'https://images.unsplash.com/photo-1591337676273-9bf4639b56da?auto=format&fit=crop&q=80&w=600',
    description: 'The all-new mint edition. Bright. New. Better.',
    colors: ['#98FF98', '#1A1A1A', '#F3F3F3'],
    accentColor: '#4ade80'
  }
];

export const initialSlides: Slide[] = [
  {
    id: 1,
    titleLines: ["WHO WANTS THE", "BEST-SELLING PHONE?"],
    accentText: "THE IPHONE 15 PRO IN DEEP PURPLE.",
    specs: "Pro Camera. 12GB RAM. All-day Battery.",
    color: "#a855f7",
    image: "https://images.unsplash.com/photo-1664478546384-d57ffe74a195?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: 2,
    titleLines: ["BRIGHT.", "NEW.", "BETTER."],
    accentText: "THE ALL-NEW IPHONE 15 IN MINT GREEN.",
    specs: "Next-gen processor. Ultra-bright display.",
    color: "#4ade80",
    image: "https://images.unsplash.com/photo-1591337676273-9bf4639b56da?auto=format&fit=crop&q=80&w=1200",
  }
];
