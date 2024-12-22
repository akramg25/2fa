import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Landing from './components/Landing';
import SignInForm from './routes/SignIn';
import SignUpForm from './routes/SignUp';
import Layout from './components/Layout';
import Profile from './routes/Profile';

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Landing /></Layout>
  },
  {
    path: '/signin',
    element: <Layout><SignInForm /></Layout>
  },
  {
    path: '/signup',
    element: <Layout><SignUpForm /></Layout>
  },
  {
    path: '/profile',
    element: <Layout><Profile /></Layout>
  }
])


const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)