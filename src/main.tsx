// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Home';
import Post from './Post';
import './index.css'; // Assuming you have standard styles

// Define your routes here
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    // The ":id" is a dynamic parameter (e.g., /post/my-first-blog)
    path: "/post/:id",
    element: <Post />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);