import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import CompanySelector from '../components/CompanySelector';
import BillManager from '../components/CompanyManager';
import BuyerSelector from '../components/BuyerSelector';
import BuyerManager from '../components/BuyerManager';
import { calculateInvoiceTotals } from '../utils/gstCalculation';
import { numberToWords } from '../utils/numberToWords';
import { saveQuotation, updateQuotation, checkInvoiceNumberExists } from '../services/quotationService';
import '../styles/dashboard.css';

function CreateBill({ userId }) {
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize from navigation state if available (Edit Mode)
    const initialQuotation = location.state?.quotation || null;

    const [formData, setFormData] = useState({
        sellerName: '', sellerAddress: '', sellerPhone: '', sellerGST: '', sellerPAN: '', sellerEmail: '', sellerTagline: '', sellerSignature: '',
        buyerName: '', buyerAddress: '', buyerGST: '',
        invoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0],
        deliveryNote: '', paymentMode: '', supplierRef: '', otherRef: '', buyerPO: '', poDate: '', dispatchThrough: '', destination: '', termsOfDelivery: ''
    });

    const [items, setItems] = useState([{ id: 1, description: '', hsn: '', unit: 1, rate: 0, amount: 0, excludeGST: false }]);
    const [gstRate, setGstRate] = useState(18);
    const [gstType, setGstType] = useState('');

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const [currentQuotationId, setCurrentQuotationId] = useState(null);

    const [showCompanyManager, setShowCompanyManager] = useState(false);
    const [showBuyerManager, setShowBuyerManager] = useState(false);

    const [generateTransporter, setGenerateTransporter] = useState(false);

    const invoiceRef = useRef(null);
    const totals = calculateInvoiceTotals(items, gstRate, gstType);
    const amountInWords = numberToWords(totals.totalAfterTax);

    // Load initial quotation if present
    useEffect(() => {
        if (initialQuotation) {
            loadQuotation(initialQuotation);
            // Clear state to avoid reloading on refresh if desired, but keeping it is fine
        }
    }, [initialQuotation]);

    const loadQuotation = (quotation) => {
        setFormData(prev => ({
            ...prev,
            buyerName: quotation.buyer_name,
            buyerAddress: quotation.buyer_address,
            buyerGST: quotation.buyer_gst || '',
            invoiceNumber: quotation.quotation_no,
            deliveryNote: quotation.invoice_details?.deliveryNote || '',
            paymentMode: quotation.invoice_details?.paymentMode || '',
            supplierRef: quotation.invoice_details?.supplierRef || '',
            otherRef: quotation.invoice_details?.otherRef || '',
            buyerPO: quotation.invoice_details?.buyerPO || '',
            poDate: quotation.invoice_details?.poDate || '',
            dispatchThrough: quotation.invoice_details?.dispatchThrough || '',
            destination: quotation.invoice_details?.destination || '',
            termsOfDelivery: quotation.invoice_details?.termsOfDelivery || ''
        }));
        setGstType(quotation.invoice_details?.gstType || '');
        setGenerateTransporter(quotation.invoice_details?.generateTransporter || false);
        setItems((quotation.items || []).map(item => ({
            ...item,
            rate: item.rate || (item.unit ? item.amount / item.unit : 0),
            excludeGST: item.excludeGST || false
        })) || [{ id: 1, description: '', hsn: '', unit: 1, rate: 0, amount: 0, excludeGST: false }]);
        setGstRate(quotation.gst_rate || 18);
        setCurrentQuotationId(quotation.id);

        // Note: We might want to auto-select company/buyer if we have their IDs, 
        // but the selectors handle their own state. 
        // Ideally we pass selectedCompanyId to CompanyManager.
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (id, field, value) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const updates = { [field]: value };
            if (field === 'unit' || field === 'rate') {
                const unit = field === 'unit' ? parseFloat(value) || 0 : parseFloat(item.unit) || 0;
                const rate = field === 'rate' ? parseFloat(value) || 0 : parseFloat(item.rate) || 0;
                updates.amount = parseFloat((unit * rate).toFixed(2));
            }
            return { ...item, ...updates };
        }));
    };

    const addItem = (initialData = {}) => {
        const newId = Math.max(...items.map(i => i.id), 0) + 1;
        setItems(prev => [...prev, {
            id: newId,
            description: initialData.description || '',
            hsn: initialData.hsn || '',
            unit: initialData.unit || 1,
            rate: initialData.rate || 0,
            amount: initialData.amount || 0,
            excludeGST: initialData.excludeGST || false
        }]);
    };

    const removeItem = (id) => {
        if (items.length > 1) setItems(prev => prev.filter(item => item.id !== id));
    };

    const resetForm = () => {
        if (confirm('Reset form?')) {
            navigate(0); // Simple reload or manual reset
        }
    };

    const handleCompanySelect = (company) => {
        if (company) {
            setFormData(prev => ({
                ...prev,
                sellerName: company.company_name,
                sellerAddress: company.address,
                sellerPhone: company.phone,
                sellerGST: company.gst_number,
                sellerPAN: company.pan_number || '',
                sellerEmail: company.email,
                sellerTagline: company.tagline || '',
                logoUrl: company.logo_url || '',
                sellerSignature: company.signature_url || ''
            }));
            setSelectedCompany(company);
        } else {
            setSelectedCompany(null);
        }
    };

    const handleBuyerSelect = (buyer) => {
        if (buyer) {
            setFormData(prev => ({
                ...prev,
                buyerName: buyer.buyer_name,
                buyerAddress: buyer.address,
                buyerGST: buyer.gst_number || ''
            }));
            setSelectedBuyer(buyer);
        } else {
            setSelectedBuyer(null);
        }
    };

    const validateForm = () => {
        if (!formData.sellerName) return alert('Seller Name required'), false;
        if (!formData.buyerName) return alert('Buyer Name required'), false;
        if (!formData.invoiceNumber) return alert('Invoice Number required'), false;
        if (items.length === 0) return alert('Add items'), false;
        return true;
    };

    const handleSaveQuotation = async () => {
        if (!validateForm()) return;

        try {
            if (!currentQuotationId) {
                const exists = await checkInvoiceNumberExists(formData.invoiceNumber, userId);
                if (exists) return alert('Invoice Number exists');
            }

            const data = {
                invoiceNumber: formData.invoiceNumber,
                companyId: selectedCompany?.id,
                buyerId: selectedBuyer?.id,
                buyerName: formData.buyerName,
                buyerAddress: formData.buyerAddress,
                buyerGST: formData.buyerGST,
                invoiceDetails: { ...formData, gstType, generateTransporter },
                items, gstRate, totals,
                status: 'quotation'
            };

            if (currentQuotationId) {
                await updateQuotation(currentQuotationId, data, userId);
                alert('Updated!');
            } else {
                const saved = await saveQuotation(data, userId);
                setCurrentQuotationId(saved.id);
                alert('Saved!');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving');
        }
    };

    const handleGenerateInvoicePDF = async () => {
        if (!validateForm()) return;
        // ... (Save logic + PDF generation)
        // For brevity, reusing save then generate
        // You should check for duplicate invoice number here too

        try {
            const data = {
                invoiceNumber: formData.invoiceNumber,
                companyId: selectedCompany?.id,
                buyerId: selectedBuyer?.id,
                buyerName: formData.buyerName,
                buyerAddress: formData.buyerAddress,
                buyerGST: formData.buyerGST,
                invoiceDetails: { ...formData, gstType, generateTransporter },
                items, gstRate, totals,
                status: 'invoice'
            };

            if (currentQuotationId) {
                await updateQuotation(currentQuotationId, data, userId);
            } else {
                const saved = await saveQuotation(data, userId);
                setCurrentQuotationId(saved.id);
            }

            // Generate PDF
            const element = invoiceRef.current;
            const opt = {
                margin: [5, 5, 5, 5],
                filename: `Invoice_${formData.invoiceNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'] }
            };

            element.style.display = 'block';
            await html2pdf().set(opt).from(element).save();
            element.style.display = 'none';

        } catch (e) {
            console.error(e);
            alert('Error generating PDF');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Create New Bill</h1>
            </div>

            <CompanySelector
                onCompanySelect={handleCompanySelect}
                onManageClick={() => setShowCompanyManager(true)}
                selectedCompanyId={selectedCompany?.id}
                userId={userId}
            />

            <BuyerSelector
                onBuyerSelect={handleBuyerSelect}
                onManageClick={() => setShowBuyerManager(true)}
                selectedBuyerId={selectedBuyer?.id}
                userId={userId}
            />

            <InvoiceForm
                formData={formData}
                items={items}
                gstRate={gstRate}
                gstType={gstType}
                totals={totals}
                amountInWords={amountInWords}
                onFormChange={handleFormChange}
                onItemChange={handleItemChange}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onGstRateChange={setGstRate}
                onGeneratePDF={handleGenerateInvoicePDF}
                onReset={resetForm}
                onSaveQuotation={handleSaveQuotation}
                onViewQuotations={() => navigate('/bills')}
                currentQuotationId={currentQuotationId}
                onGstTypeChange={setGstType}
                generateTransporter={generateTransporter}
                onGenerateTransporterChange={setGenerateTransporter}
            />

            {/* Hidden Preview using div reference for html2pdf */}
            <div style={{ display: 'none' }}>
                <div ref={invoiceRef}>
                    {/* Copy 1: Original */}
                    <div className="invoice-copy-page">
                        <InvoicePreview
                            formData={{ ...formData, copyLabel: 'Original for Recipient' }}
                            items={items}
                            gstRate={gstRate}
                            gstType={gstType}
                            totals={totals}
                            amountInWords={amountInWords}
                        />
                    </div>

                    <div className="html2pdf__page-break"></div>

                    {/* Copy 2: Extra Copy */}
                    <div className="invoice-copy-page">
                        <InvoicePreview
                            formData={{ ...formData, copyLabel: 'Extra Copy' }}
                            items={items}
                            gstRate={gstRate}
                            gstType={gstType}
                            totals={totals}
                            amountInWords={amountInWords}
                        />
                    </div>

                    {/* Copy 3: Transporter (Optional) */}
                    {generateTransporter && (
                        <>
                            <div className="html2pdf__page-break"></div>
                            <div className="invoice-copy-page">
                                <InvoicePreview
                                    formData={{ ...formData, copyLabel: 'Duplicate for Transporter' }}
                                    items={items}
                                    gstRate={gstRate}
                                    gstType={gstType}
                                    totals={totals}
                                    amountInWords={amountInWords}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            <BillManager
                isOpen={showCompanyManager}
                onClose={() => setShowCompanyManager(false)}
                onCompanySaved={handleCompanySelect}
                userId={userId}
                currentFormData={formData}
            />

            <BuyerManager
                isOpen={showBuyerManager}
                onClose={() => setShowBuyerManager(false)}
                onBuyerSaved={handleBuyerSelect}
                userId={userId}
            />
        </div>
    );
}

export default CreateBill;
