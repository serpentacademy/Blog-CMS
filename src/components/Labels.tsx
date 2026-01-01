import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, ChevronDown, Calendar, ArrowRight, X, Tag } from 'lucide-react';
import '../css/Labels.css';

// --- Types ---
interface LabelDoc {
  Labels: string[]; // Matches the specific document structure /labels/all
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  views: number;
  createdAt: Timestamp;
  labels: string[]; // Matches the field in your Post document
}

const Labels: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [allLabels, setAllLabels] = useState<string[]>([]);
  const [filteredLabels, setFilteredLabels] = useState<string[]>([]); // For the dropdown filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  
  const [posts, setPosts] = useState<PostData[]>([]);
  
  // Loading States
  const [loadingLabels, setLoadingLabels] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  // UI State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Labels from /labels/all on Mount
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        // Pointing to the specific single document
        const docRef = doc(db, "labels", "all");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as LabelDoc;
          // Sort alphabetically
          const sorted = (data.Labels || []).sort();
          setAllLabels(sorted);
          setFilteredLabels(sorted);
        } else {
            console.log("No labels document found at /labels/all");
        }
      } catch (error) {
        console.error("Error fetching labels:", error);
      } finally {
        setLoadingLabels(false);
      }
    };
    fetchLabels();
  }, []);

  // 2. Fetch Posts when a Label is Selected
  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedLabel) {
        setPosts([]);
        return;
      }

      setLoadingPosts(true);
      try {
        const postsRef = collection(db, "posts");
        // Query: array-contains checks if the selected string is inside the 'labels' array on the post
        const q = query(
            postsRef, 
            where("labels", "array-contains", selectedLabel),
            limit(9)
        );

        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PostData[];

        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [selectedLabel]);

  // Handle Search Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsDropdownOpen(true);
    
    // Filter the list based on input
    const filtered = allLabels.filter(label => 
      label.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredLabels(filtered);
  };

  // Handle Selection
  const selectLabel = (label: string) => {
    setSelectedLabel(label);
    setSearchQuery(label);
    setIsDropdownOpen(false);
  };

  // Clear Selection
  const clearSelection = () => {
    setSelectedLabel(null);
    setSearchQuery('');
    setFilteredLabels(allLabels);
    setPosts([]);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (ts: Timestamp) => {
    if (!ts || !ts.toDate) return ""; 
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(ts.toDate());
  };

  return (
    <div className="labels-page-wrapper">
      
      {/* --- HEADER & SEARCH AREA --- */}
      <div className="labels-header-section">
        <h1 className="labels-headline">Filter by Tag</h1>
        <p className="labels-subhead">Select a label to find related articles.</p>

        {/* Searchable Dropdown */}
        <div className="search-dropdown-container" ref={dropdownRef}>
            <div className="search-input-wrapper">
                <Tag className="search-icon" size={20} />
                <input 
                    type="text" 
                    className="label-search-input" 
                    placeholder="Search labels..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDropdownOpen(true)}
                />
                {searchQuery && (
                    <button className="clear-btn" onClick={clearSelection}>
                        <X size={16} />
                    </button>
                )}
                <button className="chevron-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <ChevronDown size={20} />
                </button>
            </div>

            {/* The Dropdown List */}
            {isDropdownOpen && (
                <ul className="label-dropdown-list">
                    {loadingLabels ? (
                        <li className="label-dropdown-item loading">Loading...</li>
                    ) : filteredLabels.length > 0 ? (
                        filteredLabels.map((label, index) => (
                            <li 
                                key={index} 
                                className="label-dropdown-item" 
                                onClick={() => selectLabel(label)}
                            >
                                {label}
                            </li>
                        ))
                    ) : (
                        <li className="label-dropdown-item empty">No labels found</li>
                    )}
                </ul>
            )}
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="labels-results-area">
        {loadingPosts ? (
             <div className="loading-grid">
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
             </div>
        ) : selectedLabel ? (
            <>
                <h3 className="results-label">
                    Tagged with <span className="highlight">#{selectedLabel}</span>
                </h3>
                
                {posts.length > 0 ? (
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
                            </div>
                            
                            <h3 className="card-title">{post.title}</h3>
                            <p className="card-excerpt">{post.description ? post.description.substring(0, 100) : ""}...</p>
                        </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No articles found with this tag.</p>
                    </div>
                )}
            </>
        ) : (
            // State when no label is selected
            <div className="empty-state-initial">
                <p>Select a tag above to start exploring.</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default Labels;