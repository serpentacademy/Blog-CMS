// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Category from './components/Category'; // Import the new component
import Layout from './Layout';
import Home from './Home';
import Post from './components/Post'; 
import Posts from './components/Posts'; 
import './index.css'; 

// Optional: Placeholder components
const Placeholder = ({title}: {title: string}) => (
  <div style={{textAlign: 'center', marginTop: '100px'}}>
    <h1 style={{color: 'var(--nav-text-hover)'}}>{title}</h1>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, 
    children: [
      {
        path: "/", 
        element: <Home />,
      },
      
      // 1. FIXED: Removed the duplicate "Placeholder" route for /posts
      {
        path: "/posts",
        element: <Posts />,
      },
      
      // 2. FIXED: Changed ":id" to ":postSlug" to match your Post.tsx code
      {
        path: "/post/:postSlug",
        element: <Post />,
      },

      // Placeholders for other pages
      {
        path: "/categories",
        element: <Placeholder title="Categories" />,
      },
      {
        path: "/labels",
        element: <Placeholder title="Labels" />,
      },
      {
  path: "/category/:categorySlug", 
  element: <Category />,
},
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);