import { useState, useEffect } from 'react';
import { getSales, addPayment, deleteSale, deletePayment } from '../services/salesService';
import PaymentModal from '../components/PaymentModal';
import PaymentHistoryModal from '../components/PaymentHistoryModal';
import { Pencil, Trash2, Plus } from 'lucide-react';
import '../styles/dashboard.css'; // Reuse dashboard styles

function Sales({ userId }) { // Expecting userId to be passed or accessible
    // If not passed, we might need context, but let's assume it's passed or we get it from auth service
    // For now assuming passed prop or we can import useAuth but App.jsx structure suggests prop

    // Fallback if userId prop isn't passed directly (e.g. if Route component doesn't get it)
    // For now, I'll rely on App.jsx passing it.

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedSale, setSelectedSale] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchSales();
        }
    }, [userId, filterStatus]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const data = await getSales(userId, { status: filterStatus });
            setSales(data);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = async (saleId, paymentData) => {
        try {
            await addPayment(saleId, paymentData, userId);
            fetchSales(); // Refresh list
            return true;
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteSale = async (saleId) => {
        if (window.confirm('Are you sure you want to delete this sales record? This cannot be undone.')) {
            try {
                await deleteSale(saleId);
                setSales(prev => prev.filter(s => s.id !== saleId));
            } catch (error) {
                alert('Failed to delete sale');
            }
        }
    };

    const handleDeletePayment = async (paymentId, saleId) => {
        try {
            await deletePayment(paymentId, saleId, userId);
            // Refresh logic handled by refetch or local update
            // Ideally refetch to ensure consistency
            fetchSales();
        } catch (error) {
            alert('Failed to delete payment');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            paid: { background: '#d4edda', color: '#155724' },
            partially_paid: { background: '#fff3cd', color: '#856404' },
            pending: { background: '#f8d7da', color: '#721c24' }
        };
        const labels = {
            paid: 'Paid',
            partially_paid: 'Partial',
            pending: 'Pending'
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: '500',
                ...s
            }}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Sales & Payments</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        className="form-control"
                        style={{
                            width: 'auto',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            outline: 'none',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Invoice No</th>
                            <th>Customer</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                            <th style={{ textAlign: 'right' }}>Received</th>
                            <th style={{ textAlign: 'right' }}>Pending</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                            </tr>
                        ) : sales.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No sales records found.</td>
                            </tr>
                        ) : (
                            sales.map(sale => (
                                <tr key={sale.id}>
                                    <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                                    <td>{sale.invoice_number}</td>
                                    <td>{sale.buyer_name}</td>
                                    <td style={{ textAlign: 'right' }}>₹{sale.total_amount}</td>
                                    <td style={{ textAlign: 'right', color: '#28a745' }}>₹{sale.received_amount}</td>
                                    <td style={{ textAlign: 'right', color: '#dc3545', fontWeight: 'bold' }}>
                                        ₹{sale.pending_amount}
                                    </td>
                                    <td>{getStatusBadge(sale.status)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {sale.status !== 'paid' && (
                                                <button
                                                    className="icon-btn btn-edit"
                                                    onClick={() => {
                                                        setSelectedSale(sale);
                                                        setShowPaymentModal(true);
                                                    }}
                                                    title="Add Payment"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            )}
                                            <button
                                                className="icon-btn btn-duplicate"
                                                onClick={() => {
                                                    setSelectedSale(sale);
                                                    setShowHistoryModal(true);
                                                }}
                                                title="View/Edit History"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                className="icon-btn btn-delete"
                                                onClick={() => handleDeleteSale(sale.id)}
                                                title="Delete Sale"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                sale={selectedSale}
                userId={userId}
                onPaymentAdded={handleAddPayment}
            />

            <PaymentHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                sale={selectedSale}
                onDeletePayment={handleDeletePayment}
            />
        </div>
    );
}

export default Sales;
