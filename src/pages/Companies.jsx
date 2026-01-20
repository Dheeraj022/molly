import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Loader2, Save, Upload } from 'lucide-react';
import { getCompanies, saveCompany, updateCompany, deleteCompany, uploadLogo, uploadSignature } from '../services/companyService';
import { supabase } from '../services/supabase';
import '../styles/dashboard.css';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingCompany, setEditingCompany] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        sellerName: '',
        sellerAddress: '',
        sellerPhone: '',
        sellerGST: '',
        sellerEmail: '',
        sellerPAN: '',
        sellerTagline: '',
        logoUrl: '',
        signatureUrl: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) loadCompanies(user.id);
        };
        fetchUser();
    }, []);

    const loadCompanies = async (userId) => {
        try {
            setLoading(true);
            const data = await getCompanies(userId);
            setCompanies(data);
        } catch (error) {
            console.error('Failed to load companies', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (company = null) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                sellerName: company.company_name,
                sellerAddress: company.address,
                sellerPhone: company.phone,
                sellerGST: company.gst_number,
                sellerEmail: company.email,
                sellerPAN: company.pan_number || '',
                sellerTagline: company.tagline || '',
                logoUrl: company.logo_url || '',
                signatureUrl: company.signature_url || ''
            });
        } else {
            setEditingCompany(null);
            setFormData({
                sellerName: '',
                sellerAddress: '',
                sellerPhone: '',
                sellerGST: '',
                sellerEmail: '',
                sellerPAN: '',
                sellerTagline: '',
                logoUrl: '',
                signatureUrl: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCompany(null);
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;
        try {
            setIsUploading(true);
            const url = await uploadLogo(file);
            setFormData(prev => ({ ...prev, logoUrl: url }));
        } catch (err) {
            alert('Failed to upload logo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSignatureUpload = async (file) => {
        if (!file) return;
        try {
            setIsUploading(true);
            const url = await uploadSignature(file);
            setFormData(prev => ({ ...prev, signatureUrl: url }));
        } catch (err) {
            alert('Failed to upload signature');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.sellerName.trim()) return alert('Company Name is required');
        if (!formData.sellerGST.trim()) return alert('GST Number is required');
        if (formData.sellerGST.length !== 15) return alert('GST Number must be 15 characters');

        try {
            if (editingCompany) {
                await updateCompany(editingCompany.id, formData, currentUser.id);
            } else {
                await saveCompany(formData, currentUser.id);
            }
            loadCompanies(currentUser.id);
            handleCloseModal();
        } catch (error) {
            alert('Failed to save company: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this company?')) {
            try {
                await deleteCompany(id);
                loadCompanies(currentUser.id);
            } catch (error) {
                alert('Failed to delete company');
            }
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.gst_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Company Management</h1>
                    <p className="page-subtitle">Manage your business profiles</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} /> Add Company
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar-container" style={{ marginBottom: '24px', position: 'relative', maxWidth: '400px' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                    type="text"
                    placeholder="Search companies..."
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
                <div className="loading-state">Loading companies...</div>
            ) : filteredCompanies.length === 0 ? (
                <div className="empty-state">
                    <h3>No companies found</h3>
                    <p>Add your first company profile to get started.</p>
                </div>
            ) : (
                <div className="companies-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {filteredCompanies.map(company => (
                        <div key={company.id} className="company-card-item" style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {company.logo_url ? (
                                        <img src={company.logo_url} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #f3f4f6' }} />
                                    ) : (
                                        <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#6b7280' }}>
                                            {company.company_name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>{company.company_name}</h3>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{company.gst_number}</p>
                                    </div>
                                </div>
                                <div className="action-buttons">
                                    <button
                                        className="icon-btn btn-edit"
                                        onClick={() => handleOpenModal(company)}
                                        title="Edit">
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        className="icon-btn btn-delete"
                                        onClick={() => handleDelete(company.id)}
                                        title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                                <p style={{ marginBottom: '8px' }}><strong>Email:</strong> {company.email}</p>
                                <p style={{ marginBottom: '8px' }}><strong>Phone:</strong> {company.phone}</p>
                                <p style={{ marginBottom: '0', whiteSpace: 'pre-line' }}><strong>Address:</strong><br />{company.address}</p>
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
                                {editingCompany ? 'Edit Company Profile' : 'Add New Company'}
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
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Company Name *</label>
                                            <input
                                                type="text"
                                                value={formData.sellerName}
                                                onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                                                required
                                                placeholder="e.g. Acme Corp"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>GST Number *</label>
                                            <input
                                                type="text"
                                                value={formData.sellerGST}
                                                onChange={(e) => setFormData({ ...formData, sellerGST: e.target.value.toUpperCase() })}
                                                required
                                                maxLength="15"
                                                placeholder="15-digit GSTIN"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Email Address *</label>
                                            <input
                                                type="email"
                                                value={formData.sellerEmail}
                                                onChange={(e) => setFormData({ ...formData, sellerEmail: e.target.value })}
                                                required
                                                placeholder="billing@acme.com"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Phone Number *</label>
                                            <input
                                                type="tel"
                                                value={formData.sellerPhone}
                                                onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
                                                required
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
                                                value={formData.sellerAddress}
                                                onChange={(e) => setFormData({ ...formData, sellerAddress: e.target.value })}
                                                required
                                                rows="4"
                                                placeholder="Full business address"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>PAN Number (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.sellerPAN}
                                                onChange={(e) => setFormData({ ...formData, sellerPAN: e.target.value.toUpperCase() })}
                                                placeholder="10-digit PAN"
                                                maxLength="10"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Tagline (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.sellerTagline}
                                                onChange={(e) => setFormData({ ...formData, sellerTagline: e.target.value })}
                                                placeholder="e.g. Innovation for you"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid #e5e7eb', margin: '24px 0', paddingTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    {/* Logo Upload */}
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Company Logo</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {formData.logoUrl && <img src={formData.logoUrl} alt="Logo Preview" style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: '4px' }} />}
                                            <label className="btn-secondary" style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Upload size={16} /> Upload Logo
                                                <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e.target.files[0])} style={{ display: 'none' }} disabled={isUploading} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Signature Upload */}
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Authorized Signature</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {formData.signatureUrl && <img src={formData.signatureUrl} alt="Sig Preview" style={{ width: '80px', height: '40px', objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: '4px' }} />}
                                            <label className="btn-secondary" style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Upload size={16} /> Upload Signature
                                                <input type="file" accept="image/*" onChange={(e) => handleSignatureUpload(e.target.files[0])} style={{ display: 'none' }} disabled={isUploading} />
                                            </label>
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
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 size={18} className="spinning" /> : <Save size={18} />}
                                {editingCompany ? 'Update Company' : 'Save Company'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Companies;
