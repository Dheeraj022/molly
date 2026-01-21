import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Loader2, Save, Building } from 'lucide-react';
import { getBanks, saveBank, updateBank, deleteBank } from '../services/bankService';
import { supabase } from '../services/supabase';
import '../styles/dashboard.css';

const BankDetails = () => {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingBank, setEditingBank] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) loadBanks(user.id);
        };
        fetchUser();
    }, []);

    const loadBanks = async (userId) => {
        try {
            setLoading(true);
            const data = await getBanks(userId);
            setBanks(data);
        } catch (error) {
            console.error('Failed to load banks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (bank = null) => {
        if (bank) {
            setEditingBank(bank);
            setFormData({
                bankName: bank.bank_name,
                accountNumber: bank.account_number,
                ifscCode: bank.ifsc_code || '',
                branchName: bank.branch_name || ''
            });
        } else {
            setEditingBank(null);
            setFormData({
                bankName: '',
                accountNumber: '',
                ifscCode: '',
                branchName: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBank(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.bankName.trim()) return alert('Bank Name is required');
        if (!formData.accountNumber.trim()) return alert('Account Number is required');

        try {
            setIsSaving(true);
            if (editingBank) {
                await updateBank(editingBank.id, formData, currentUser.id);
            } else {
                await saveBank(formData, currentUser.id);
            }
            loadBanks(currentUser.id);
            handleCloseModal();
        } catch (error) {
            alert('Failed to save bank: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this bank account?')) {
            try {
                await deleteBank(id);
                loadBanks(currentUser.id);
            } catch (error) {
                alert('Failed to delete bank');
            }
        }
    };

    const filteredBanks = banks.filter(b =>
        b.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.account_number.includes(searchTerm)
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bank Details Management</h1>
                    <p className="page-subtitle">Manage your bank accounts for invoicing</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} /> Add Bank Account
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar-container" style={{ marginBottom: '24px', position: 'relative', maxWidth: '400px' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                    type="text"
                    placeholder="Search banks..."
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
                <div className="loading-state">Loading banks...</div>
            ) : filteredBanks.length === 0 ? (
                <div className="empty-state">
                    <Building size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                    <h3>No bank accounts found</h3>
                    <p>Add your first bank account to link with your companies.</p>
                </div>
            ) : (
                <div className="companies-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {filteredBanks.map(bank => (
                        <div key={bank.id} className="company-card-item" style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                                        <Building size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>{bank.bank_name}</h3>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>....{bank.account_number.slice(-4)}</p>
                                    </div>
                                </div>
                                <div className="action-buttons">
                                    <button className="icon-btn btn-edit" onClick={() => handleOpenModal(bank)} title="Edit">
                                        <Pencil size={18} />
                                    </button>
                                    <button className="icon-btn btn-delete" onClick={() => handleDelete(bank.id)} title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                                <p style={{ marginBottom: '8px' }}><strong>A/c No:</strong> {bank.account_number}</p>
                                <p style={{ marginBottom: '8px' }}><strong>IFSC:</strong> {bank.ifsc_code}</p>
                                <p style={{ marginBottom: '0' }}><strong>Branch:</strong> {bank.branch_name}</p>
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
                        maxWidth: '500px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div className="modal-header" style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111827' }}>
                                {editingBank ? 'Edit Bank Account' : 'Add New Bank Account'}
                            </h2>
                            <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <X size={24} color="#6b7280" />
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: '24px' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Bank Name *</label>
                                    <input
                                        type="text"
                                        value={formData.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                        required
                                        placeholder="e.g. HDFC Bank"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Account Number *</label>
                                    <input
                                        type="text"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                        required
                                        placeholder="e.g. 1234567890"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>IFSC Code</label>
                                    <input
                                        type="text"
                                        value={formData.ifscCode}
                                        onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                                        placeholder="e.g. HDFC0001234"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Branch Name</label>
                                    <input
                                        type="text"
                                        value={formData.branchName}
                                        onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                                        placeholder="e.g. Main Branch"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="btn-primary"
                                disabled={isSaving}
                                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {isSaving ? <Loader2 size={18} className="spinning" /> : <Save size={18} />}
                                {editingBank ? 'Update Bank' : 'Save Bank'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankDetails;
