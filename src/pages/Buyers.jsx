import React from 'react';
import '../styles/dashboard.css';

const Buyers = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Buyer Management</h1>
            </div>
            <div className="empty-state">
                <p>Manage your buyers/customers here.</p>
            </div>
        </div>
    );
};

export default Buyers;
