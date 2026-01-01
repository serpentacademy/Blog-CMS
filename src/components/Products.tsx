import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; 
import { Flame, Clock, ArrowRight } from 'lucide-react';
import '../css/Products.css'; // We will create this specific CSS file

// Define the data interface locally or import it if you have a shared types file
interface SidebarPost {
  id: string;
  title: string;
  slug: string;
  image: string;
  views: number;
  createdAt: any; // Using any to handle both Firestore Timestamp and Date safely
}

const Products: React.FC = () => {
  const [posts, setPosts] = useState<SidebarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'latest' | 'hot'>('latest');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopPosts = async () => {
      setLoading(true);
      try {
        const postsRef = collection(db, "posts");
        
        // Dynamic Sort Field
        // 'hot' = Sort by views desc
        // 'latest' = Sort by createdAt desc
        const sortField = filter === 'hot' ? 'views' : 'createdAt';
        
        const q = query(
          postsRef, 
          orderBy(sortField, "desc"), 
          limit(3)
        );

        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SidebarPost[];

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching top posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPosts();
  }, [filter]);

  return (
    <div className="sidebar-widget-container">
      
      {/* Widget Header with Filters */}
      <div className="widget-header">
        <h3 className="sidebar-title">Must Read</h3>
        
        <div className="widget-filters">
          <button 
            className={`icon-filter-btn ${filter === 'latest' ? 'active' : ''}`} 
            onClick={() => setFilter('latest')}
            aria-label="Latest posts"
            title="Latest"
          >
            <Clock size={16} />
          </button>
          <button 
            className={`icon-filter-btn ${filter === 'hot' ? 'active' : ''}`} 
            onClick={() => setFilter('hot')}
            aria-label="Most popular posts"
            title="Popular"
          >
            <Flame size={16} />
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="widget-content">
        {loading ? (
          // Skeleton Loading State
          [1, 2, 3].map((i) => (
            <div key={i} className="mini-post-skeleton">
              <div className="skeleton-thumb"></div>
              <div className="skeleton-lines">
                <div className="s-line short"></div>
                <div className="s-line long"></div>
              </div>
            </div>
          ))
        ) : (
          // Real Data List
          posts.map((post) => (
            <div 
              key={post.id} 
              className="mini-post-card" 
              onClick={() => navigate(`/post/${post.slug}`)} // Navigates to /post/{postSlug}
            >
              <div className="mini-thumb-wrapper">
                <img src={post.image} alt={post.title} className="mini-thumb" loading="lazy" />
              </div>
              
              <div className="mini-info">
                <h4 className="mini-title">{post.title}</h4>
                <span className="mini-read-more">Read <ArrowRight size={12} /></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;