import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Calendar, Eye, ArrowRight, Folder } from 'lucide-react';
import '../css/Category.css';

// --- Type Definitions ---
interface PostData {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  views: number;
  createdAt: Timestamp;
  categories: string[];
}

const Category: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper to capitalize first letter for display title
  const displayTitle = categorySlug 
    ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ') 
    : 'Category';

  useEffect(() => {
    const fetchPostsByCategory = async () => {
      setLoading(true);
      try {
        const postsRef = collection(db, "posts");
        
        // Query: Find posts where 'categories' array contains the slug (case-sensitive usually)
        // Note: Ensure your Firestore data matches the URL casing (e.g. "Creativity" vs "creativity")
        const q = query(postsRef, where("categories", "array-contains", categorySlug)); // Or displayTitle if stored Capitalized

        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PostData[];

        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchPostsByCategory();
    }
  }, [categorySlug]);

  const formatDate = (ts: Timestamp) => {
    if (!ts || !ts.toDate) return ""; 
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(ts.toDate());
  };

  return (
    <div className="category-page-wrapper">
      
      {/* Category Header */}
      <div className="category-header">
        <span className="category-label">Browsing Category</span>
        <h1 className="category-title">{displayTitle}</h1>
        <p className="category-count">{posts.length} {posts.length === 1 ? 'Article' : 'Articles'} Found</p>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="loading-grid">
           {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
        </div>
      ) : (
        <>
          {posts.length > 0 ? (
            <div className="category-grid">
              {posts.map((post) => (
                <div key={post.id} className="cat-post-card" onClick={() => navigate(`/post/${post.slug}`)}>
                  <div className="cat-image-wrapper">
                    <img src={post.image} alt={post.title} className="cat-card-image" loading="lazy" />
                    <div className="cat-overlay">
                       <span>Read <ArrowRight size={14} /></span>
                    </div>
                  </div>
                  
                  <div className="cat-card-content">
                    <div className="cat-meta">
                       <span className="meta-item"><Calendar size={14} /> {formatDate(post.createdAt)}</span>
                       {/* Optional: Show other categories */}
                       {post.categories && post.categories.length > 0 && (
                           <span className="meta-item"><Folder size={14} /> {post.categories[0]}</span>
                       )}
                    </div>
                    
                    <h3 className="cat-card-title">{post.title}</h3>
                    <p className="cat-card-excerpt">
                        {post.description ? post.description.substring(0, 80) + "..." : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
                <h3>No posts found in "{displayTitle}"</h3>
                <button onClick={() => navigate('/posts')}>View All Posts</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Category;