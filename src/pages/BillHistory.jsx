import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuotations, deleteQuotation, duplicateQuotation, convertToInvoice, generateQuotationNumber } from '../services/quotationService';
import { FileText, Trash2, Pencil, CheckCircle2, FileDown } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import InvoicePreview from '../components/InvoicePreview';
import { calculateInvoiceTotals } from '../utils/gstCalculation';
import { numberToWords } from '../utils/numberToWords';
import '../styles/dashboard.css';

function BillHistory({ userId }) {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // PDF Download State
    const [downloadData, setDownloadData] = useState(null);
    const downloadRef = useRef(null);

    useEffect(() => {
        if (userId) {
            loadQuotations();
        }
    }, [userId]);

    async function loadQuotations() {
        try {
            setLoading(true);
            setError(null);
            const data = await getQuotations(userId);
            setQuotations(data);
        } catch (err) {
            setError('Failed to load quotations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Are you sure you want to delete this quotation?')) {
            return;
        }
        try {
            await deleteQuotation(id);
            await loadQuotations();
        } catch (err) {
            alert('Failed to delete quotation');
            console.error(err);
        }
    }

    async function handleDuplicate(id) {
        try {
            const newQuotationNo = await generateQuotationNumber();
            await duplicateQuotation(id, newQuotationNo);
            await loadQuotations();
            alert(`Quotation duplicated as ${newQuotationNo}!`);
        } catch (err) {
            alert('Failed to duplicate quotation');
            console.error(err);
        }
    }

    async function handleConvertToInvoice(id) {
        if (!confirm('Convert this quotation to an invoice?')) {
            return;
        }
        try {
            await convertToInvoice(id);
            await loadQuotations();
            alert('Converted to invoice successfully!');
        } catch (err) {
            alert('Failed to convert to invoice');
            console.error(err);
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    // --- Download Logic ---
    const handleDownload = (quotation) => {
        const company = quotation.companies || {};
        const inv = quotation.invoice_details || {};

        const qItems = (quotation.items || []).map(item => ({
            ...item,
            rate: item.rate || (item.unit ? item.amount / item.unit : 0),
            excludeGST: item.excludeGST || false
        }));

        const qFormData = {
            // Seller Details - Prioritize snapshot
            sellerName: inv.sellerName || company.company_name || '',
            sellerAddress: inv.sellerAddress || company.address || '',
            sellerPhone: inv.sellerPhone || company.phone || '',
            sellerGST: inv.sellerGST || company.gst_number || '',
            sellerPAN: inv.sellerPAN || company.pan_number || '',
            sellerEmail: inv.sellerEmail || company.email || '',
            sellerTagline: inv.sellerTagline || company.tagline || '',
            logoUrl: inv.logoUrl || company.logo_url || '',
            sellerSignature: inv.sellerSignature || company.signature_url || '',

            // Buyer Details
            buyerName: quotation.buyer_name || '',
            buyerAddress: quotation.buyer_address || '',
            buyerGST: quotation.buyer_gst || '',

            // Invoice Details
            invoiceNumber: quotation.quotation_no,
            invoiceDate: quotation.created_at,
            deliveryNote: inv.deliveryNote || '',
            paymentMode: inv.paymentMode || '',
            supplierRef: inv.supplierRef || '',
            otherRef: inv.otherRef || '',
            buyerPO: inv.buyerPO || '',
            poDate: inv.poDate || '',
            dispatchThrough: inv.dispatchThrough || '',
            destination: inv.destination || '',
            termsOfDelivery: inv.termsOfDelivery || ''
        };

        const qGstRate = quotation.gst_rate || 18;
        const qGstType = inv.gstType || '';
        const qTotals = calculateInvoiceTotals(qItems, qGstRate, qGstType);
        const qAmountInWords = numberToWords(qTotals.totalAfterTax);

        setDownloadData({
            formData: qFormData,
            items: qItems,
            gstRate: qGstRate,
            gstType: qGstType,
            totals: qTotals,
            amountInWords: qAmountInWords
        });
    };

    useEffect(() => {
        if (downloadData && downloadRef.current) {
            const invoiceNumber = downloadData.formData.invoiceNumber || 'Draft';
            const cleanInvoiceNumber = invoiceNumber.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
            const filename = `Quotation_${cleanInvoiceNumber}.pdf`;

            const opt = {
                margin: 0,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            setTimeout(() => {
                html2pdf().set(opt).from(downloadRef.current).save().then(() => setDownloadData(null));
            }, 500);
        }
    }, [downloadData]);

    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const filteredQuotations = quotations.filter(q => {
        const matchesSearch =
            q.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.quotation_no?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (dateFilter) {
            const rowDate = new Date(q.created_at).toISOString().split('T')[0];
            matchesDate = rowDate === dateFilter;
        }

        return matchesSearch && matchesDate;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Bill History</h1>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search by Client or Invoice No..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        minWidth: '300px',
                        fontSize: '14px'
                    }}
                />
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}
                />
                {(searchTerm || dateFilter) && (
                    <button
                        onClick={() => { setSearchTerm(''); setDateFilter(''); }}
                        style={{
                            padding: '10px 16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: 'pointer',
                            color: '#ef4444'
                        }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {loading ? (
                <div className="loading-state">Loading bills...</div>
            ) : filteredQuotations.length === 0 ? (
                <div className="empty-state">
                    {searchTerm || dateFilter ? 'No bills match your filters.' : 'No bills found. Create one to get started.'}
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Invoice No</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuotations.map(q => (
                                <tr key={q.id}>
                                    <td className="font-mono" data-label="Invoice No">{q.quotation_no}</td>
                                    <td data-label="Customer">{q.buyer_name}</td>
                                    <td data-label="Date">{formatDate(q.created_at)}</td>
                                    <td className="font-semibold" data-label="Amount">{formatCurrency(q.total_after_tax)}</td>
                                    <td data-label="Status">
                                        <span className={`status-badge status-${q.status}`}>
                                            {q.status}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => navigate('/create-bill', { state: { quotation: q } })}
                                                className="icon-btn btn-edit"
                                                title="Edit">
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDuplicate(q.id)}
                                                className="icon-btn btn-duplicate"
                                                title="Duplicate">
                                                <FileText size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(q)}
                                                className="icon-btn btn-download"
                                                title="Download">
                                                <FileDown size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="icon-btn btn-delete"
                                                title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Hidden Preview for PDF Generation */}
            <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
                {downloadData && (
                    <InvoicePreview
                        ref={downloadRef}
                        formData={downloadData.formData}
                        items={downloadData.items}
                        gstRate={downloadData.gstRate}
                        gstType={downloadData.gstType}
                        totals={downloadData.totals}
                        amountInWords={downloadData.amountInWords}
                    />
                )}
            </div>
        </div>
    );
}

export default BillHistory;
