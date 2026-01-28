import { Trash2, X, FileText } from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/form.css';

function PaymentHistoryModal({ isOpen, onClose, sale, onDeletePayment }) {
    if (!isOpen || !sale) return null;

    const handleDelete = async (paymentId) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            await onDeletePayment(paymentId, sale.id);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>Payment History</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div style={{ marginBottom: '15px' }}>
                        <strong>Invoice: {sale.invoice_number}</strong>
                    </div>

                    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Mode</th>
                                    <th>Reference</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.payments && sale.payments.length > 0 ? (
                                    sale.payments.map(payment => (
                                        <tr key={payment.id}>
                                            <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                            <td style={{ fontWeight: 'bold', color: '#28a745' }}>₹{payment.amount}</td>
                                            <td>{payment.payment_mode}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {payment.reference_id || '-'}
                                                    {payment.proof_url && (
                                                        <a
                                                            href={payment.proof_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="View Receipt"
                                                            style={{ color: '#3b82f6', display: 'flex', alignItems: 'center' }}
                                                        >
                                                            <FileText size={16} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className="icon-btn btn-delete"
                                                    onClick={() => handleDelete(payment.id)}
                                                    title="Delete Payment"
                                                    style={{ padding: '6px', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: '#666' }}>
                                            No payments recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PaymentHistoryModal;
