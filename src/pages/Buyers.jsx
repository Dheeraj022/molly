import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Loader2, Save, User } from 'lucide-react';
import { getBuyers, saveBuyer, updateBuyer, deleteBuyer } from '../services/buyerService';
import { supabase } from '../services/supabase';
import '../styles/dashboard.css';

const Buyers = () => {
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingBuyer, setEditingBuyer] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        buyerName: '',
        buyerAddress: '',
        buyerGST: '',
        buyerPhone: '',
        buyerEmail: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) loadBuyers(user.id);
        };
        fetchUser();
    }, []);

    const loadBuyers = async (userId) => {
        try {
            setLoading(true);
            const data = await getBuyers(userId);
            setBuyers(data);
        } catch (error) {
            console.error('Failed to load buyers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (buyer = null) => {
        if (buyer) {
            setEditingBuyer(buyer);
            setFormData({
                buyerName: buyer.buyer_name,
                buyerAddress: buyer.address,
                buyerGST: buyer.gst_number || '',
                buyerPhone: buyer.phone || '',
                buyerEmail: buyer.email || ''
            });
        } else {
            setEditingBuyer(null);
            setFormData({
                buyerName: '',
                buyerAddress: '',
                buyerGST: '',
                buyerPhone: '',
                buyerEmail: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBuyer(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.buyerName.trim()) return alert('Buyer Name is required');
        if (!formData.buyerAddress.trim()) return alert('Address is required');

        try {
            setIsSaving(true);
            if (editingBuyer) {
                await updateBuyer(editingBuyer.id, formData, currentUser.id);
            } else {
                await saveBuyer(formData, currentUser.id);
            }
            loadBuyers(currentUser.id);
            handleCloseModal();
        } catch (error) {
            alert('Failed to save buyer: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this buyer?')) {
            try {
                await deleteBuyer(id);
                loadBuyers(currentUser.id);
            } catch (error) {
                alert('Failed to delete buyer');
            }
        }
    };

    const filteredBuyers = buyers.filter(b =>
        b.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.gst_number && b.gst_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Buyer Management</h1>
                    <p className="page-subtitle">Manage your customers and clients</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} /> Add Buyer
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar-container" style={{ marginBottom: '24px', position: 'relative', maxWidth: '400px' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                    type="text"
                    placeholder="Search buyers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 10px 10px 40px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '14px'
                    }}
                />
            </div>

            {loading ? (
                <div className="loading-state">Loading buyers...</div>
            ) : filteredBuyers.length === 0 ? (
                <div className="empty-state">
                    <h3>No buyers found</h3>
                    <p>Add your first customer to get started.</p>
                </div>
            ) : (
                <div className="companies-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {filteredBuyers.map(buyer => (
                        <div key={buyer.id} className="company-card-item">
                            <div className="company-card-header">
                                <div className="company-info">
                                    <div className="company-avatar">
                                        <User size={24} />
                                    </div>
                                    <div className="company-details">
                                        <h3>{buyer.buyer_name}</h3>
                                        {buyer.gst_number && <p>GST: {buyer.gst_number}</p>}
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button
                                        className="icon-btn btn-edit"
                                        onClick={() => handleOpenModal(buyer)}
                                        title="Edit">
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        className="icon-btn btn-delete"
                                        onClick={() => handleDelete(buyer.id)}
                                        title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                                {buyer.email && <p style={{ marginBottom: '8px' }}><strong>Email:</strong> {buyer.email}</p>}
                                {buyer.phone && <p style={{ marginBottom: '8px' }}><strong>Phone:</strong> {buyer.phone}</p>}
                                <p style={{ marginBottom: '0', whiteSpace: 'pre-line' }}><strong>Address:</strong><br />{buyer.address}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}>
                    <div className="modal-content" style={{
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div className="modal-header" style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', flexShrink: 0 }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111827' }}>
                                {editingBuyer ? 'Edit Buyer Profile' : 'Add New Buyer'}
                            </h2>
                            <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <X size={24} color="#6b7280" />
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flexGrow: 1 }}>
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                                    {/* Left Column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Buyer Name *</label>
                                            <input
                                                type="text"
                                                value={formData.buyerName}
                                                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                                                required
                                                placeholder="e.g. John Doe"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>GST Number (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.buyerGST}
                                                onChange={(e) => setFormData({ ...formData, buyerGST: e.target.value.toUpperCase() })}
                                                maxLength="15"
                                                placeholder="15-digit GSTIN"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.buyerPhone}
                                                onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                                                placeholder="+91 99999 99999"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Address *</label>
                                            <textarea
                                                value={formData.buyerAddress}
                                                onChange={(e) => setFormData({ ...formData, buyerAddress: e.target.value })}
                                                required
                                                rows="4"
                                                placeholder="Full billing address"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.buyerEmail}
                                                onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                                                placeholder="customer@example.com"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', flexShrink: 0 }}>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="btn-primary"
                                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 size={18} className="spinning" /> : <Save size={18} />}
                                {editingBuyer ? 'Update Buyer' : 'Save Buyer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Buyers;
