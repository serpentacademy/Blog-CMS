import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase'; 
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
        
        // Query: Sort by filter, Limit to 9 (3x3 grid)
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
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filter]);

  // Helper to format date safely
  const formatDate = (ts: Timestamp) => {
    if (!ts || !ts.toDate) return ""; 
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
           {/* Display 9 skeletons for loading state */}
           {[...Array(9)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
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
                   <span className="meta-item"><Eye size={14} /> {post.views?.toLocaleString() || 0}</span>
                </div>
                
                <h3 className="card-title">{post.title}</h3>
                <p className="card-excerpt">{post.description ? post.description.substring(0, 100) + "..." : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;