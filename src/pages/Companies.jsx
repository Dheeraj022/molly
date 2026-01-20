import React from 'react';
import '../styles/dashboard.css';

const Companies = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Company Management</h1>
            </div>
            <div className="empty-state">
                <p>Manage your company profiles here.</p>
            </div>
        </div>
    );
};

export default Companies;
