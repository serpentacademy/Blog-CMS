import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // 1. Import useParams to get the slug
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'; // 2. Firestore imports
import { db } from '../firebase'; // Ensure this points to your firebase config
import Products from './Products';
import Author from './Author';
import SignUp from './SignUp';
import '../css/Post.css';
import pinterestIcon from "../pinterest.png";

// --- Types based on your Data Model ---
interface ContentUnit {
    typeO: string; // 'text' | 'html' | 'image' | 'video'
    title?: string;
    content: string;
}

interface PostData {
    title: string;
    slug: string;
    contentUnits: ContentUnit[];
    views: number;
    createdAt: Timestamp; // Firestore Timestamp
    updatedAt: Timestamp;
    image: string;
    description: string;
}

// Component for images with Pinterest Save and Zoom features
const ImageWithActions = ({ src, alt, onZoom }: { src: string, alt: string, onZoom: (src: string) => void }) => {
    
    const handlePinterestClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        const url = encodeURIComponent(window.location.href);
        const media = encodeURIComponent(src);
        const description = encodeURIComponent(alt);
        window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank');
    };

    return (
        <div className="image-wrapper-styled" onClick={() => onZoom(src)}>
            <img src={src} alt={alt} className="unit-image" loading="lazy" />
            <button className="pinterest-save-overlay" onClick={handlePinterestClick} aria-label="Save to Pinterest">
                <img src={pinterestIcon} alt="Save" />
            </button>
        </div>
    );
};

const Post: React.FC = () => {
    const { postSlug } = useParams(); // Get slug from URL
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    
    const pinterestVerticalImage = pinterestIcon; // Or use post.image if you prefer

    // --- Fetch Data from Firestore ---
    useEffect(() => {
        const fetchPost = async () => {
            if (!postSlug) return;
            
            setLoading(true);
            try {
                // Query the 'posts' collection where 'slug' matches the URL
                const q = query(
                    collection(db, "posts"), 
                    where("slug", "==", postSlug)
                );
                
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    // We take the first match (slugs should be unique)
                    const docData = querySnapshot.docs[0].data() as PostData;
                    setPost(docData);
                } else {
                    console.log("No such document!");
                    setPost(null);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postSlug]);

    const handlePinClick = () => {
        if (!post) return;
        const url = encodeURIComponent(window.location.href);
        const media = encodeURIComponent(pinterestVerticalImage);
        const description = encodeURIComponent(post.description);
        window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank');
    };

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate(); // Convert Firestore Timestamp to JS Date
        return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    };

    const getYoutubeEmbedUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11)
            ? `https://www.youtube.com/embed/${match[2]}`
            : null;
    };

    // --- Loading State ---
    if (loading) {
        return <div className="page-wrapper" style={{textAlign: 'center', marginTop: '100px'}}>Loading content...</div>;
    }

    // --- Not Found State ---
    if (!post) {
        return <div className="page-wrapper" style={{textAlign: 'center', marginTop: '100px'}}>Post not found.</div>;
    }

    return (
        <div className="page-wrapper">
            <br></br>
            {/* Full-screen Zoom Modal */}
            {zoomedImage && (
                <div className="image-zoom-modal" onClick={() => setZoomedImage(null)}>
                    <div className="modal-content">
                        <img src={zoomedImage} alt="Zoomed" className="zoomed-image" />
                    </div>
                </div>
            )}

            {/* Clean Grid Layout */}
            <div className="clean-grid-layout">
               
               {/* LEFT: PRODUCTS */}
               <div className="layout-sidebar left">
                    <Products />
               </div>

               {/* CENTER: CONTENT */}
               <main className="layout-main">
                 <article className="post-container">
                   {/* Hidden Pinterest Image */}
                   <img
                       src={pinterestVerticalImage}
                       alt={post.title}
                       data-pin-description={post.description}
                       data-pin-media={pinterestVerticalImage}
                       style={{ display: 'none' }}
                   />

                   <header className="post-header">
                     <span className="meta-date">{formatDate(post.createdAt)}</span>
                     <h1 className="post-title">{post.title}</h1>
                     {/* Hero Image with Actions */}
                     <ImageWithActions src={post.image} alt={post.title} onZoom={setZoomedImage} />
                   </header>

                   <section className="post-content">
                     {post.contentUnits && post.contentUnits.map((unit, index) => (
                       <div key={index} className="unit-wrapper">
                          {/* TEXT UNIT */}
                          {unit.typeO === 'text' && <p className="unit-text">{unit.content}</p>}
                         
                          {/* IMAGE UNIT with Actions */}
                          {unit.typeO === 'image' && (
                               <div>
                                    <ImageWithActions src={unit.content} alt={unit.title || "Visual"} onZoom={setZoomedImage} />
                                    {unit.title && <span className="image-caption">{unit.title}</span>}
                               </div>
                          )}

                          {/* HTML UNIT */}
                          {unit.typeO === 'html' && (
                              <div className="unit-html" dangerouslySetInnerHTML={{ __html: unit.content }} />
                          )}

                          {/* VIDEO UNIT */}
                          {unit.typeO === 'video' && (
                            <div className="video-wrapper-styled">
                               {getYoutubeEmbedUrl(unit.content) ? (
                                   <iframe
                                       src={getYoutubeEmbedUrl(unit.content)!}
                                       title={unit.title}
                                       frameBorder="0"
                                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                       allowFullScreen
                                       className="unit-iframe"
                                   ></iframe>
                               ) : (
                                   <video controls className="unit-video-native" src={unit.content} />
                               )}
                               {unit.title && <span className="video-caption">{unit.title}</span>}
                            </div>
                          )}
                       </div>
                     ))}
                   </section>

                    {/* BEAUTIFUL RED PINTEREST BUTTON */}
                    <div className="pinterest-action-area">
                       <button className="love-pin-button" onClick={handlePinClick}>
                            <img width="73px" src={pinterestIcon} alt="" />
                          <span>Help us spread the <strong>LOVE</strong> share on Pinterest</span>
                       </button>
                    </div>
                 </article>
               </main>

               {/* RIGHT: AUTHOR & SIGNUP */}
               <aside className="layout-sidebar right">
                   <Author />
                   <SignUp />
               </aside>

           </div>
       </div>
    );
};

export default Post;