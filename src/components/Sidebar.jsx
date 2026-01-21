import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FilePlus,
    Files,
    Package,
    Building2,
    Users,
    Download,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    BarChart,
    Landmark
} from 'lucide-react';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, onLogout, isCollapsed, toggleSidebar }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/create-bill', label: 'Create Bill', icon: FilePlus },
        { path: '/bills', label: 'Bill History', icon: Files },
        { path: '/products', label: 'Products', icon: Package },
        { path: '/companies', label: 'Companies', icon: Building2 },
        { path: '/bank-details', label: 'Bank Details', icon: Landmark },
        { path: '/buyers', label: 'Buyers', icon: Users },
        { path: '/billing-reports', label: 'Billing Reports', icon: BarChart },
        { path: '/downloads', label: 'Downloads', icon: Download },
    ];

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <h2>Invoice<span className="highlight">Maker</span></h2>
                <button className="toggle-btn" onClick={toggleSidebar}>
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button onClick={onLogout} className="logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
