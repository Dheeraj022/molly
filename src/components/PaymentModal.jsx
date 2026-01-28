import { useState, useEffect } from 'react';
import { Upload, X, Calendar, CreditCard, FileText, Banknote } from 'lucide-react';
import '../styles/form.css'; // Reusing form styles
import { uploadPaymentProof } from '../services/salesService';

function PaymentModal({ isOpen, onClose, sale, onPaymentAdded, userId }) {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [mode, setMode] = useState('Cash');
    const [reference, setReference] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && sale) {
            // Default to full pending amount
            setAmount(sale.pending_amount);
            setMode('Cash');
            setReference('');
            setFile(null);
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, sale]);

    if (!isOpen || !sale) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (amount > sale.pending_amount) {
            alert(`Amount cannot exceed pending amount (${sale.pending_amount})`);
            return;
        }

        setLoading(true);
        try {
            const paymentData = {
                amount: parseFloat(amount),
                date,
                mode,
                reference
            };

            if (file) {
                const proofUrl = await uploadPaymentProof(file, userId || sale.user_id);
                paymentData.proofUrl = proofUrl;
            }

            await onPaymentAdded(sale.id, paymentData);
            onClose();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px', width: '95%' }}>
                <div className="modal-header">
                    <h2>Record Payment</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">

                    {/* Summary Card */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Invoice Amount</span>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>₹{sale.total_amount}</span>
                        </div>
                        <div style={{ width: '100%', height: '1px', background: '#e2e8f0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Pending Amount
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444', background: '#fee2e2', padding: '4px 12px', borderRadius: '6px' }}>
                                ₹{sale.pending_amount}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Amount Received</label>
                            <input
                                type="number"
                                className="form-control"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                max={sale.pending_amount}
                                min="1"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Payment Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Payment Mode</label>
                            <select
                                className="form-control"
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                            >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Reference No. / Note (Optional)</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. UPI Ref ID, Cheque No"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Receipt / Proof (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    id="receipt-upload"
                                    className="form-control"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    style={{
                                        opacity: 0,
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        cursor: 'pointer',
                                        zIndex: 10
                                    }}
                                />
                                <div style={{
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: file ? '#f0f9ff' : '#fff',
                                    borderColor: file ? '#3b82f6' : '#cbd5e1',
                                    transition: 'all 0.2s'
                                }}>
                                    {file ? (
                                        <>
                                            <FileText size={24} color="#3b82f6" />
                                            <span style={{ color: '#3b82f6', fontWeight: '500', fontSize: '14px' }}>
                                                {file.name}
                                            </span>
                                            <span style={{ color: '#64748b', fontSize: '12px' }}>Click to change</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={24} color="#94a3b8" />
                                            <span style={{ color: '#64748b', fontWeight: '500', fontSize: '14px' }}>
                                                Click to upload receipt
                                            </span>
                                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                                                JPG, PNG or PDF
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ padding: 0, marginTop: '32px', gap: '12px', display: 'flex' }}>
                            <button
                                type="button"
                                className="btn"
                                onClick={onClose}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    color: '#64748b',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)'
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Payment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PaymentModal;
