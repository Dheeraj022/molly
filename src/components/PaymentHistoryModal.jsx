import { Trash2, X, FileText } from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/form.css';

const styles = `
  @media (max-width: 768px) {
    .payment-history-table thead {
      display: none;
    }
    .payment-history-table tbody {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .payment-history-table tr {
      display: block;
      margin-bottom: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      background: #fff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      position: relative;
    }
    .payment-history-table td {
      text-align: right;
      padding: 0.5rem 0;
      border: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      border-bottom: 1px dashed #f1f5f9;
    }
    .payment-history-table td::before {
        content: attr(data-label);
        font-weight: 500;
        color: #94a3b8;
        font-size: 0.85rem;
    }

    /* Remove border from last item (Action) */
    .payment-history-table td:last-child {
      border-bottom: none;
      justify-content: flex-end; /* Button on right */
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }
    /* Hide label for Action column */
    .payment-history-table td:last-child::before {
        display: none;
    }

    /* Specific Column Sizing/Coloring */
    .payment-history-table td:nth-child(1) { /* Date */
        color: #64748b;
    }
    .payment-history-table td:nth-child(2) { /* Amount */
        font-weight: 700;
        color: #28a745;
    }
    .payment-history-table td:nth-child(4) { /* Reference */
       /* Allow text to wrap if long */
       white-space: normal;
       max-width: 100%;
    }

    .payment-history-table .btn-delete {
      width: 100%;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      background-color: #fee2e2 !important; 
      color: #ef4444 !important;
      border: 1px solid #fecaca;
      border-radius: 6px;
    }
  }
`;

function PaymentHistoryModal({ isOpen, onClose, sale, onDeletePayment }) {
    if (!isOpen || !sale) return null;

    const handleDelete = async (paymentId) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            await onDeletePayment(paymentId, sale.id);
        }
    };

    return (
        <div className="modal-overlay">
            <style>{styles}</style>
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
                        <table className="data-table payment-history-table">
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
                                            <td data-label="Date">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                            <td data-label="Amount" style={{ fontWeight: 'bold', color: '#28a745' }}>₹{payment.amount}</td>
                                            <td data-label="Mode">{payment.payment_mode}</td>
                                            <td data-label="Reference">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
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
