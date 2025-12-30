// src/Post.tsx
import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { analytics } from './firebase'; // Import your firebase config
import { logEvent } from 'firebase/analytics';

const Post = () => {
  // 1. Grab the "id" from the URL (e.g. "pinterest-seo-strategy")
  const { id } = useParams<{ id: string }>();

  // 2. Track that this view happened in Firebase Analytics
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_title: id,
        page_path: `/post/${id}`
      });
      console.log(`Analytics logged for: ${id}`);
    }
  }, [id]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ fontSize: '14px', color: '#666' }}>← Back to Home</Link>
      
      <h1 style={{ marginTop: '20px', textTransform: 'capitalize' }}>
        {id?.replace(/-/g, ' ')}
      </h1>
      
      <p>
        This is where the content for the post <strong>"{id}"</strong> would go. 
        In a real app, you would use this ID to fetch data from Firestore.
      </p>

      {/* Example of a Pinterest-ready vertical image placeholder */}
      <div style={{ 
        width: '100%', 
        height: '400px', 
        backgroundColor: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: '30px'
      }}>
        Vertical Image Placeholder
      </div>
    </div>
  );
};

export default Post;