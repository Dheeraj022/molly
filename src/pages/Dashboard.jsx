import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getDashboardStats } from '../services/dashboardService';
import { FileText, IndianRupee, Users, Package } from 'lucide-react';
import '../styles/dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalRevenue: 0,
        totalBuyers: 0,
        totalProducts: 0
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const data = await getDashboardStats(user.id);
                    setStats(data);
                }
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                {user && <p className="page-subtitle">Welcome back, {user.user_metadata?.username || user.email.split('@')[0]}</p>}
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <h3 className="stat-label">Total Invoices</h3>
                        <p className="stat-value">
                            {loading ? '...' : stats.totalInvoices}
                        </p>
                    </div>
                    <div className="stat-icon-container icon-blue">
                        <FileText size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <h3 className="stat-label">Total Revenue</h3>
                        <p className="stat-value">
                            {loading ? '...' : formatCurrency(stats.totalRevenue)}
                        </p>
                    </div>
                    <div className="stat-icon-container icon-green">
                        <IndianRupee size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <h3 className="stat-label">Total Buyers</h3>
                        <p className="stat-value">
                            {loading ? '...' : stats.totalBuyers}
                        </p>
                    </div>
                    <div className="stat-icon-container icon-purple">
                        <Users size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <h3 className="stat-label">Total Products</h3>
                        <p className="stat-value">
                            {loading ? '...' : stats.totalProducts}
                        </p>
                    </div>
                    <div className="stat-icon-container icon-orange">
                        <Package size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
