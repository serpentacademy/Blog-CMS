// data.ts
import art2 from "./logo.png"

import art from "./logo2.jpg"
export type ContentUnit = {
  type: 'text' | 'html' | 'image' | 'video';
  title?: string;
  content: string; // URL for media, text for others
};

export type Post = {
  title: string;
  slug: string;
  contentUnits: ContentUnit[];
  views: number;
  createdAt: { toDate: () => Date }; // Mocking Firestore Timestamp
  updatedAt: { toDate: () => Date };
  image: string;
  description: string;
};

// A Gen Z / Aesthetic focused dummy post
export const dummyPost: Post = {
  title: "The Art of Digital Minimalism",
  slug: "art-of-digital-minimalism",
  description: "Curating your digital space for clarity, creativity, and calm in a noisy world.",
  image: art2, // Minimalist desk
  views: 12403,
  createdAt: { toDate: () => new Date('2025-10-15') },
  updatedAt: { toDate: () => new Date('2025-10-16') },
  contentUnits: [
    {
      type: 'text',
      title: "Why Declutter?",
      content: "Your digital environment impacts your mental state just as much as your physical one. A messy desktop is a messy mind."
    },
    {
      type: 'image',
      title: "Workspace Goals",
      content: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop"
    },
    {
      type: 'html',
      title: "The 3-Step Method",
      content: "<p>1. <strong>Delete</strong> unused apps.<br>2. <strong>Organize</strong> files into broad categories.<br>3. <strong>Digitize</strong> paper notes immediately.</p>"
    },
    {
      type: 'text',
      title: "Final Thought",
      content: "Minimalism isn't about having less. It's about making room for more of what matters."
    },
        {
      type: 'video',
      title: "Final Thought",
      content: "https://www.youtube.com/watch?v=p3l7fgvrEKM"
    }
  ]
};

// data.ts (Add this to your existing data file)

export interface Product {
  name: string;
  url: string;
  description: string;
  image: string;
}

export const dummyProducts: Product[] = [
  {
    name: "Product 1",
    url: "#",
    description: "A guide to deep work in the digital age.",
    image: art2
  },
  {
    name: "Cyber Deck UI",
    url: "#",
    description: "Premium React component kit.",
    image: art2
  },
  {
    name: "Digital Zen",
    url: "#",
    description: "Minimalist wallpapers pack.",
    image: art2
  }
];

export const authorData = {
  name: "Author",
  bio: "Building digital Empire. I write about nature, aesthetics, and the future of creativity.",
  image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop"
};