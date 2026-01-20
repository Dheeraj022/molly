import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { getQuotations } from '../services/quotationService';
import { FileText, Download, Loader2, Calendar, User, IndianRupee } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import InvoicePreview from '../components/InvoicePreview';
import { calculateInvoiceTotals } from '../utils/gstCalculation';
import { numberToWords } from '../utils/numberToWords';
import '../styles/dashboard.css';

const Downloads = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // PDF Generation State
    const [downloadData, setDownloadData] = useState(null);
    const [generatingId, setGeneratingId] = useState(null); // To show loading state on specific button
    const downloadRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) loadQuotations(user.id);
        };
        fetchUser();
    }, []);

    const loadQuotations = async (userId) => {
        try {
            setLoading(true);
            const data = await getQuotations(userId);
            // Filter to only show completed/generated items if needed, but showing all for now
            setQuotations(data);
        } catch (error) {
            console.error('Failed to load downloads', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (quotation) => {
        setGeneratingId(quotation.id);

        try {
            const company = quotation.companies || {};
            const inv = quotation.invoice_details || {};

            const qItems = (quotation.items || []).map(item => ({
                ...item,
                rate: item.rate || (item.unit ? item.amount / item.unit : 0),
                excludeGST: item.excludeGST || false
            }));

            const qFormData = {
                // Seller Details - Prioritize snapshot, fall back to relational data
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
        } catch (err) {
            console.error("Error preparing download:", err);
            setGeneratingId(null);
            alert("Failed to generate PDF");
        }
    };

    // Trigger PDF generation when data is ready
    useEffect(() => {
        if (downloadData && downloadRef.current) {
            const invoiceNumber = downloadData.formData.invoiceNumber || 'Draft';
            const cleanInvoiceNumber = invoiceNumber.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
            const filename = `Invoice_${cleanInvoiceNumber}.pdf`;

            const opt = {
                margin: 0,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Small timeout to ensure render
            setTimeout(() => {
                html2pdf()
                    .set(opt)
                    .from(downloadRef.current)
                    .save()
                    .then(() => {
                        setDownloadData(null);
                        setGeneratingId(null);
                    })
                    .catch(err => {
                        console.error('PDF Generation Error:', err);
                        setDownloadData(null);
                        setGeneratingId(null);
                    });
            }, 500);
        }
    }, [downloadData]);


    const filteredQuotations = quotations.filter(q =>
        q.quotation_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Downloads</h1>
                    <p className="page-subtitle">Access and download your generated invoices</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading files...</div>
            ) : filteredQuotations.length === 0 ? (
                <div className="empty-state">
                    <h3>No invoices found</h3>
                    <p>Generated invoices will appear here for download.</p>
                </div>
            ) : (
                <div className="downloads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {filteredQuotations.map(q => (
                        <div key={q.id} className="download-card" style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#fef2f2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>{q.quotation_no}</h3>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Invoice/Quotation</p>
                                    </div>
                                </div>
                                <span className={`status-badge status-${q.status}`} style={{ fontSize: '12px', padding: '4px 8px' }}>
                                    {q.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={16} className="text-gray-400" />
                                    <span style={{ fontWeight: 500 }}>{q.buyer_name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>{formatDate(q.created_at)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IndianRupee size={16} className="text-gray-400" />
                                    <span style={{ fontWeight: 600, color: '#111827' }}>{Number(q.total_after_tax).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(q)}
                                disabled={generatingId === q.id}
                                className="btn-primary"
                                style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                            >
                                {generatingId === q.id ? (
                                    <>
                                        <Loader2 size={18} className="spinning" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} /> Download PDF
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Hidden Preview for PDF Generation */}
            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', width: '210mm', minHeight: '297mm', background: 'white' }}>
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
};

export default Downloads;
