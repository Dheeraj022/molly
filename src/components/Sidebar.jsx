import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FilePlus,
    Files,
    Package,
    Building2,
    Users,
    Download,
    LogOut
} from 'lucide-react';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, onLogout }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/create-bill', label: 'Create Bill', icon: FilePlus },
        { path: '/bills', label: 'Bill History', icon: Files },
        { path: '/products', label: 'Products', icon: Package },
        { path: '/companies', label: 'Companies', icon: Building2 },
        { path: '/buyers', label: 'Buyers', icon: Users },
        { path: '/downloads', label: 'Downloads', icon: Download },
    ];

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2>Invoice<span className="highlight">Maker</span></h2>
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
