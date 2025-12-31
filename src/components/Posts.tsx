import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure you have this configured
import { Calendar, Eye, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import '../css/Posts.css';

// --- Type Definitions ---
export interface PostData {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  views: number;
  createdAt: Timestamp;
}

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'latest' | 'trending'>('latest');
  const navigate = useNavigate();

  // --- Firestore Fetch Logic ---
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const postsRef = collection(db, "posts");
        
        // Dynamic Query based on filter
        const sortField = filter === 'trending' ? 'views' : 'createdAt';
        const q = query(postsRef, orderBy(sortField, "desc"), limit(9));

        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PostData[];

        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
        // Fallback dummy data for visual testing if DB fails/is empty
        setPosts(dummyPosts); 
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filter]);

  // Helper to format date
  const formatDate = (ts: Timestamp) => {
    // Check if ts exists to prevent crash on dummy data
    if (!ts || !ts.toDate) return "Oct 24, 2025"; 
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(ts.toDate());
  };

  return (
    <div className="posts-page-wrapper">
      
      {/* Header & Filter */}
      <div className="posts-header-row">
        <h1 className="posts-headline">All Writings</h1>
        
        <div className="filter-toggle">
           <button 
             className={`filter-btn ${filter === 'latest' ? 'active' : ''}`}
             onClick={() => setFilter('latest')}
           >
             <Clock size={16} /> Latest
           </button>
           <button 
             className={`filter-btn ${filter === 'trending' ? 'active' : ''}`}
             onClick={() => setFilter('trending')}
           >
             <TrendingUp size={16} /> Popular
           </button>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="loading-grid">
           {[1,2,3].map(i => <div key={i} className="skeleton-card"></div>)}
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post.id} className="post-card" onClick={() => navigate(`/post/${post.slug}`)}>
              <div className="card-image-wrapper">
                <img src={post.image} alt={post.title} className="card-image" loading="lazy" />
                <div className="card-overlay">
                   <span>Read Article <ArrowRight size={14} /></span>
                </div>
              </div>
              
              <div className="card-content">
                <div className="card-meta">
                   <span className="meta-item"><Calendar size={14} /> {formatDate(post.createdAt)}</span>
                   <span className="meta-item"><Eye size={14} /> {post.views.toLocaleString()}</span>
                </div>
                
                <h3 className="card-title">{post.title}</h3>
                <p className="card-excerpt">{post.description.substring(0, 100)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Dummy Data for Preview ---
const dummyPosts: PostData[] = [
  {
    id: '1', title: 'The Art of Digital Minimalism', slug: 'digital-minimalism',
    description: 'Curating your digital space for clarity, creativity, and calm in a noisy world.',
    image: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=800',
    views: 1204, createdAt: { toDate: () => new Date() } as Timestamp
  },
  {
    id: '2', title: 'Designing for the Future', slug: 'design-future',
    description: 'How cyberpunk aesthetics are influencing modern UI design trends.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800',
    views: 850, createdAt: { toDate: () => new Date() } as Timestamp
  },
  {
    id: '3', title: 'Flow State Engineering', slug: 'flow-state',
    description: 'Practical tips to hack your brain into deep work mode instantly.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800',
    views: 3200, createdAt: { toDate: () => new Date() } as Timestamp
  },
];

export default Posts;