import React from 'react';
import '../styles/dashboard.css';

const Dashboard = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3 className="stat-label">Total Invoices</h3>
                    <p className="stat-value">124</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-label">Revenue</h3>
                    <p className="stat-value">₹ 4,32,000</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-label">Pending</h3>
                    <p className="stat-value">12</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
