import { useState, useEffect } from 'react';
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
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>Record Payment</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div style={{ marginBottom: '15px', padding: '10px', background: '#f5f7fa', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ color: '#666' }}>Invoice No:</span>
                            <strong>{sale.invoice_number}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ color: '#666' }}>Total Amount:</span>
                            <strong>₹{sale.total_amount}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc3545' }}>
                            <span>Pending Amount:</span>
                            <strong>₹{sale.pending_amount}</strong>
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
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*,application/pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </div>

                        <div className="modal-footer" style={{ padding: 0, marginTop: '20px' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
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
