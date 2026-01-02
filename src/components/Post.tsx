import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, app } from '../firebase'; 
import Products from './Products';
import Author from './Author';
import SignUp from './SignUp';
import { Eye } from 'lucide-react';
import '../css/Post.css';
import pinterestIcon from "../pinterest.png";

// --- Interfaces ---
interface ContentUnit {
    typeO?: string; 
    type?: string; 
    title?: string;
    content: string;
}

interface PostData {
    title: string;
    slug: string;
    contentUnits: ContentUnit[];
    views: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    image: string;
    description: string;
    categories?: string[];
    labels?: string[];
}

// --- Image Helper Component ---
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

// --- Main Component ---
const Post: React.FC = () => {
    const { postSlug } = useParams();
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    
    // [FIX] Use useRef instead of useState. 
    // This tracks the ID synchronously to prevent double-calls in StrictMode.
    const lastIncrementedId = useRef<string | null>(null);

    const pinterestVerticalImage = pinterestIcon;

    // --- Fetch & Increment Logic ---
    useEffect(() => {
        const fetchAndIncrementPost = async () => {
            if (!postSlug) return;
            
            setLoading(true);
            try {
                // 1. Fetch Post Data
                const q = query(
                    collection(db, "posts"), 
                    where("slug", "==", postSlug)
                );
                
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docSnapshot = querySnapshot.docs[0];
                    const docData = docSnapshot.data() as PostData;
                    const docId = docSnapshot.id;

                    setPost(docData);
                    console.log("📄 Document Loaded. ID:", docId);

                    // 2. Increment View Count
                    // [FIX] Check if this specific ID has already been incremented in this session
                    if (lastIncrementedId.current !== docId) {
                        // Immediately lock this ID so subsequent renders don't trigger it
                        lastIncrementedId.current = docId;

                        const functions = getFunctions(app);
                        const incrementView = httpsCallable(functions, 'incrementPostView');
                        
                        incrementView({ postId: docId })
                            .then((result) => {
                                console.log("✅ Cloud Function Success:", result.data);
                            })
                            .catch((err) => {
                                console.error("❌ Cloud Function Error:", err);
                                // Optional: Reset ref if it failed, so user can try again on refresh
                                // lastIncrementedId.current = null; 
                            });
                    } else {
                        console.log("ℹ️ View already incremented for this ID, skipping.");
                    }
                } else {
                    console.warn("⚠️ No post found with slug:", postSlug);
                    setPost(null);
                }
            } catch (error) {
                console.error("❌ Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndIncrementPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postSlug]); 

    // --- Handlers & Helpers ---
    const handlePinClick = () => {
        if (!post) return;
        const url = encodeURIComponent(window.location.href);
        const media = encodeURIComponent(pinterestVerticalImage);
        const description = encodeURIComponent(post.description);
        window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank');
    };

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return "";
        return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(timestamp.toDate());
    };

    const getYoutubeEmbedUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    // --- Render States ---
    if (loading) return <div className="page-wrapper" style={{textAlign: 'center', marginTop: '100px'}}>Loading content...</div>;
    if (!post) return <div className="page-wrapper" style={{textAlign: 'center', marginTop: '100px'}}>Post not found.</div>;

    return (
        <div className="page-wrapper">
            <br />
            {zoomedImage && (
                <div className="image-zoom-modal" onClick={() => setZoomedImage(null)}>
                    <div className="modal-content">
                        <img src={zoomedImage} alt="Zoomed" className="zoomed-image" />
                    </div>
                </div>
            )}

            <div className="clean-grid-layout">
               
               {/* Left Sidebar */}
               <div className="layout-sidebar left">
                    <Products />
               </div>

               {/* Main Content */}
               <main className="layout-main">
                 <article className="post-container">
                   {/* Hidden Pinterest Image */}
                   <img src={pinterestVerticalImage} alt={post.title} style={{ display: 'none' }} data-pin-media={pinterestVerticalImage} />

                   {/* Categories */}
                   {post.categories && post.categories.length > 0 && (
                        <div className="post-categories">
                            {post.categories.map((cat, idx) => (
                                <a href={"/category/"+cat} key={idx}><span className="category-pill">{cat} </span></a>
                            ))}
                        </div>
                   )}

                   <header className="post-header">
                     {/* Metadata Row */}
                     <div className="meta-data-row" style={{display:'flex', gap:'15px', color:'#666', fontSize:'0.85rem', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                        <span className="meta-date">{formatDate(post.createdAt)}</span>
                        <span className="meta-views" style={{display:'flex', alignItems:'center', gap:'5px'}}>
                            <Eye size={14} /> {post.views ? post.views.toLocaleString() : 0} Views
                        </span>
                     </div>

                     <h1 className="post-title">{post.title}</h1>
                     <ImageWithActions src={post.image} alt={post.title} onZoom={setZoomedImage} />
                   </header>

                   <div className="post-content-body">
                     {post.contentUnits && post.contentUnits.map((unit, index) => {
                       // Normalize type key (legacy support)
                       const type = (unit.typeO || unit.type || 'text').toLowerCase();

                       return (
                         <div key={index} className="unit-wrapper">
                            
                            {/* Text */}
                            {type === 'text' && <p className="unit-text">{unit.content}</p>}
                            
                            {/* Image */}
                            {type === 'image' && (
                                 <div>
                                      <ImageWithActions src={unit.content} alt={unit.title || "Visual"} onZoom={setZoomedImage} />
                                      {unit.title && <span className="image-caption">{unit.title}</span>}
                                 </div>
                            )}

                            {/* HTML */}
                            {type === 'html' && (
                                <div className="unit-html" dangerouslySetInnerHTML={{ __html: unit.content }} />
                            )}

                            {/* Video */}
                            {type === 'video' && (
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
                       );
                     })}
                   </div>

                    {/* Labels */}
                    {post.labels && post.labels.length > 0 && (
                        <div className="post-labels-section">
                            <span className="labels-title">Tags:</span>
                            <div className="labels-list">
                                {post.labels.map((label, idx) => (
                                    <span key={idx} className="label-tag">#{label} </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Pinterest Button */}
                    <div className="pinterest-action-area">
                       <button className="love-pin-button" onClick={handlePinClick}>
                            <img width="73px" src={pinterestIcon} alt="" />
                          <span>Help us spread the <strong>LOVE</strong> share on Pinterest</span>
                       </button>
                    </div>
                 </article>
               </main>

               {/* Right Sidebar */}
               <aside className="layout-sidebar right">
                   <Author />
               </aside>

           </div>
       </div>
    );
};

export default Post;