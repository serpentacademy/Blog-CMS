// src/Home.tsx
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to the Blog</h1>
      <p>Select a category or read a post:</p>
      
      <nav>
        <ul>
          <li>
            {/* Using Link prevents the page from refreshing */}
            <Link to="/post/pinterest-seo-strategy">
              Read: Pinterest SEO Strategy
            </Link>
          </li>
          <li>
            <Link to="/post/react-firebase-guide">
              Read: React & Firebase Guide
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;