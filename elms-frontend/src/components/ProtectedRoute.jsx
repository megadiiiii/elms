import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route Guard Component to protect routes from unauthenticated access.
 * If token does not exist in localStorage, it redirects user to /login.
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    if (!token || token === 'undefined' || token === 'null') {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
