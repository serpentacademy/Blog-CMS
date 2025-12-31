// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import your pages and components
import Home from './Home';
import Post from './components/Post';
import Layout from './Layout'; // <--- Import the wrapper we made
import './index.css'; 
import Posts from './components/Posts'; // <--- The New List Page
// Optional: Placeholder components if you haven't built them yet
const Placeholder = ({title}: {title: string}) => (
  <div style={{textAlign: 'center', marginTop: '50px'}}>
    <h1 style={{color: '#fff'}}>{title}</h1>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // 1. Layout wraps everything
    children: [          // 2. All pages go inside 'children'
      {
        path: "/", // Corresponds to <Outlet /> in Layout
        element: <Home />,
      },
      
      // The Feed Route (Grid of 9 posts)
      {
        path: "/posts",
        element: <Posts />,
      },
      {
        path: "/post/:id",
        element: <Post />,
      },
      // New Routes as requested
      {
        path: "/posts",
        element: <Placeholder title="All Posts" />,
      },
      {
        path: "/categories",
        element: <Placeholder title="Categories" />,
      },
      {
        path: "/labels",
        element: <Placeholder title="Labels" />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);