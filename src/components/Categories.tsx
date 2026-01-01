import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, ChevronDown, Calendar, ArrowRight, X } from 'lucide-react';
import '../css/Categories.css';

// --- Types ---
interface CategoryDoc {
  Categories: string[]; // Note: Matches your specific data model capitalization
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
  categories: string[];
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [filteredCats, setFilteredCats] = useState<string[]>([]); // For the dropdown filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [posts, setPosts] = useState<PostData[]>([]);
  
  // Loading States
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  // UI State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const docRef = doc(db, "categories", "all");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as CategoryDoc;
          // Sort alphabetically for better UX
          const sorted = (data.Categories || []).sort();
          setAllCategories(sorted);
          setFilteredCats(sorted);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Posts when a Category is Selected
  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedCategory) {
        setPosts([]);
        return;
      }

      setLoadingPosts(true);
      try {
        const postsRef = collection(db, "posts");
        // Query: array-contains checks if the selected string is inside the categories array
        const q = query(
            postsRef, 
            where("categories", "array-contains", selectedCategory),
            limit(9) // Limit to 9 for the grid
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
  }, [selectedCategory]);

  // Handle Search Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsDropdownOpen(true);
    
    // Filter the list based on input
    const filtered = allCategories.filter(cat => 
      cat.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCats(filtered);
  };

  // Handle Selection
  const selectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery(cat); // Set input to selected value
    setIsDropdownOpen(false);
  };

  // Clear Selection
  const clearSelection = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setFilteredCats(allCategories);
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
    <div className="categories-page-wrapper">
      
      {/* --- HEADER & SEARCH AREA --- */}
      <div className="cats-header-section">
        <h1 className="cats-headline">Explore Topics</h1>
        <p className="cats-subhead">Select a category to filter the archive.</p>

        {/* Searchable Dropdown */}
        <div className="search-dropdown-container" ref={dropdownRef}>
            <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input 
                    type="text" 
                    className="cat-search-input" 
                    placeholder="Search categories..." 
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
                <ul className="cat-dropdown-list">
                    {loadingCats ? (
                        <li className="cat-dropdown-item loading">Loading...</li>
                    ) : filteredCats.length > 0 ? (
                        filteredCats.map((cat, index) => (
                            <li 
                                key={index} 
                                className="cat-dropdown-item" 
                                onClick={() => selectCategory(cat)}
                            >
                                {cat}
                            </li>
                        ))
                    ) : (
                        <li className="cat-dropdown-item empty">No categories found</li>
                    )}
                </ul>
            )}
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="cats-results-area">
        {loadingPosts ? (
             <div className="loading-grid">
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
             </div>
        ) : selectedCategory ? (
            <>
                <h3 className="results-label">
                    Showing results for <span className="highlight">"{selectedCategory}"</span>
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
                            <p className="card-excerpt">{post.description.substring(0, 100)}...</p>
                        </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No articles found in this category yet.</p>
                    </div>
                )}
            </>
        ) : (
            // State when no category is selected
            <div className="empty-state-initial">
                <p>Please select a category above to view posts.</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default Categories;