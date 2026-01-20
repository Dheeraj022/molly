import React from 'react';
import '../styles/dashboard.css';

const Downloads = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Downloads</h1>
            </div>
            <div className="empty-state">
                <p>View and re-download generated invoices.</p>
            </div>
        </div>
    );
};

export default Downloads;
