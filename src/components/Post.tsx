import React, { useState } from 'react';
import { dummyPost } from '../data';
import Products from './Products';
import Author from './Author';
import SignUp from './SignUp';
import '../css/Post.css'; 
import pinterestIcon from "../pinterest.png"; // Using the uploaded Pinterest image

// New component for images with Pinterest Save and Zoom features
const ImageWithActions = ({ src, alt, onZoom }: { src: string, alt: string, onZoom: (src: string) => void }) => {
    
    const handlePinterestClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the zoom modal when clicking the save button
        const url = encodeURIComponent(window.location.href);
        const media = encodeURIComponent(src);
        const description = encodeURIComponent(alt);
        window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank');
    };

    return (
        <div className="image-wrapper-styled" onClick={() => onZoom(src)}>
            <img src={src} alt={alt} className="unit-image" loading="lazy" />
            {/* Pinterest Save Button - Appears on Hover */}
            <button className="pinterest-save-overlay" onClick={handlePinterestClick} aria-label="Save to Pinterest">
                <img src={pinterestIcon} alt="Save" />
            </button>
        </div>
    );
};

const Post: React.FC = () => {
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const pinterestVerticalImage = pinterestIcon;

    const handlePinClick = () => {
        const url = encodeURIComponent(window.location.href);
        const media = encodeURIComponent(pinterestVerticalImage);
        const description = encodeURIComponent(dummyPost.description);
        window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank');
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    };

    const getYoutubeEmbedUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) 
            ? `https://www.youtube.com/embed/${match[2]}` 
            : null;
    };

    return (
        <div className="page-wrapper">
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
                        alt={dummyPost.title}
                        data-pin-description={dummyPost.description}
                        data-pin-media={pinterestVerticalImage}
                        style={{ display: 'none' }} 
                    />

                    <header className="post-header">
                      <span className="meta-date">{formatDate(dummyPost.createdAt.toDate())}</span>
                      <h1 className="post-title">{dummyPost.title}</h1>
                      {/* Hero Image with Actions */}
                      <ImageWithActions src={dummyPost.image} alt={dummyPost.title} onZoom={setZoomedImage} />
                    </header>

                    <section className="post-content">
                      {dummyPost.contentUnits.map((unit, index) => (
                        <div key={index} className="unit-wrapper">
                           {/* TEXT UNIT */}
                           {unit.type === 'text' && <p className="unit-text">{unit.content}</p>}
                           
                           {/* IMAGE UNIT with Actions */}
                           {unit.type === 'image' && (
                                <div>
                                     <ImageWithActions src={unit.content} alt={unit.title || "Visual"} onZoom={setZoomedImage} />
                                     {unit.title && <span className="image-caption">{unit.title}</span>}
                                </div>
                           )}

                           {/* HTML UNIT */}
                           {unit.type === 'html' && (
                               <div className="unit-html" dangerouslySetInnerHTML={{ __html: unit.content }} />
                           )}

                           {/* VIDEO UNIT */}
                           {unit.type === 'video' && (
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