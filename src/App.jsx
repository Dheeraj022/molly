import { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import CompanySelector from './components/CompanySelector';
import CompanyManager from './components/CompanyManager';
import BuyerSelector from './components/BuyerSelector';
import BuyerManager from './components/BuyerManager';
import QuotationList from './components/QuotationList';
import LandingPage from './components/LandingPage';
import { calculateInvoiceTotals } from './utils/gstCalculation';
import { numberToWords } from './utils/numberToWords';
import { saveQuotation, updateQuotation, generateQuotationNumber, checkInvoiceNumberExists } from './services/quotationService';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import VerifyEmail from './components/VerifyEmail';
import { onAuthStateChange, signOut } from './services/authService';
import './styles/form.css';
import './styles/invoice.css';
import './styles/icons.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState('login'); // 'login', 'register', 'forgot-password', 'verify-email'

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Check URL hash for email verification
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=signup') || hash.includes('type=email') || hash.includes('type=recovery')) {
      setAuthView('verify-email');
    }
  }, []);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setAuthView('login');
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 Logout button clicked...');
      const result = await signOut();
      console.log('📤 Logout result:', result);
    } catch (error) {
      console.error('❌ Logout exception:', error);
    } finally {
      // ALWAYS perform local cleanup, regardless of server response
      console.log('✅ Performing local logout cleanup...');

      // Clear all storage to prevent sticky sessions
      localStorage.clear();
      sessionStorage.clear();

      // Reset app state
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthView('login');
      setShowLanding(true);

      console.log('✅ Local state reset complete');
    }
  };
  const [formData, setFormData] = useState({
    sellerName: '',
    sellerAddress: '',
    sellerPhone: '',
    sellerGST: '',
    sellerPAN: '',
    sellerEmail: '',
    sellerTagline: '',
    sellerSignature: '',
    buyerName: '',
    buyerAddress: '',
    buyerGST: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    deliveryNote: '',
    paymentMode: '',
    supplierRef: '',
    otherRef: '',
    buyerPO: '',
    poDate: '',
    dispatchThrough: '',
    destination: '',
    termsOfDelivery: ''
  });

  const [items, setItems] = useState([
    { id: 1, description: '', hsn: '', unit: 1, rate: 0, amount: 0, excludeGST: false }
  ]);

  const [gstRate, setGstRate] = useState(18);
  const [gstType, setGstType] = useState('');
  const invoiceRef = useRef(null);

  // Supabase integration state
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [currentQuotationId, setCurrentQuotationId] = useState(null);
  const [showCompanyManager, setShowCompanyManager] = useState(false);
  const [showBuyerManager, setShowBuyerManager] = useState(false);
  const [showQuotationList, setShowQuotationList] = useState(false);

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

  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    setItems(prev => [...prev, { id: newId, description: '', hsn: '', unit: 1, rate: 0, amount: 0, excludeGST: false }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const resetForm = () => {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
      setFormData({
        sellerName: '',
        sellerAddress: '',
        sellerPhone: '',
        sellerGST: '',
        sellerPAN: '',
        sellerEmail: '',
        sellerTagline: '',
        sellerSignature: '',
        buyerName: '',
        buyerAddress: '',
        buyerGST: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        deliveryNote: '',
        paymentMode: '',
        supplierRef: '',
        otherRef: '',
        buyerPO: '',
        poDate: '',
        dispatchThrough: '',
        destination: '',
        termsOfDelivery: ''
      });
      setItems([{ id: 1, description: '', hsn: '', unit: 1, amount: 0 }]);
      setGstRate(18);
      setSelectedCompany(null);
      setCurrentQuotationId(null);
    }
  };

  // Company selection handler
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

  // Save quotation handler
  const handleSaveQuotation = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Check for duplicate invoice number (only when creating new quotation)
      if (!currentQuotationId) {
        const exists = await checkInvoiceNumberExists(formData.invoiceNumber);
        if (exists) {
          alert(`❌ Invoice number "${formData.invoiceNumber}" already exists! Please use a different invoice number.`);
          return;
        }
      } else {
        // When updating, check if the invoice number conflicts with other quotations
        const exists = await checkInvoiceNumberExists(formData.invoiceNumber, currentQuotationId);
        if (exists) {
          alert(`❌ Invoice number "${formData.invoiceNumber}" already exists! Please use a different invoice number.`);
          return;
        }
      }

      const quotationData = {
        invoiceNumber: formData.invoiceNumber,
        companyId: selectedCompany?.id,
        buyerName: formData.buyerName,
        buyerAddress: formData.buyerAddress,
        buyerGST: formData.buyerGST,
        invoiceDetails: {
          deliveryNote: formData.deliveryNote,
          paymentMode: formData.paymentMode,
          supplierRef: formData.supplierRef,
          otherRef: formData.otherRef,
          buyerPO: formData.buyerPO,
          poDate: formData.poDate,
          dispatchThrough: formData.dispatchThrough,
          destination: formData.destination,
          termsOfDelivery: formData.termsOfDelivery,
          gstType: gstType
        },
        items: items,
        gstRate: gstRate,
        totals: totals,
        status: 'quotation'
      };

      if (currentQuotationId) {
        await updateQuotation(currentQuotationId, quotationData, currentUser.id);
        alert('Quotation updated successfully!');
      } else {
        await saveQuotation(quotationData, currentUser.id);
        alert('Quotation saved successfully!');
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Failed to save quotation. Please try again.');
    }
  };

  // Load quotation handler
  const handleLoadQuotation = (quotation) => {
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
    setItems((quotation.items || []).map(item => ({
      ...item,
      rate: item.rate || (item.unit ? item.amount / item.unit : 0),
      excludeGST: item.excludeGST || false
    })) || [{ id: 1, description: '', hsn: '', unit: 1, rate: 0, amount: 0, excludeGST: false }]);
    setGstRate(quotation.gst_rate || 18);
    setCurrentQuotationId(quotation.id);
  };

  const validateForm = () => {
    const requiredFields = [
      { field: 'sellerName', label: 'Seller Name' },
      { field: 'sellerAddress', label: 'Seller Address' },
      { field: 'sellerPhone', label: 'Seller Phone' },
      { field: 'sellerGST', label: 'Seller GST' },
      { field: 'sellerEmail', label: 'Seller Email' },
      { field: 'buyerName', label: 'Buyer Name' },
      { field: 'buyerAddress', label: 'Buyer Address' },
      { field: 'invoiceNumber', label: 'Invoice Number' },
      { field: 'invoiceDate', label: 'Invoice Date' }
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field] || !formData[field].trim()) {
        alert(`Please fill in: ${label}`);
        return false;
      }
    }

    if (items.length === 0) {
      alert('Please add at least one item to the invoice');
      return false;
    }

    for (const item of items) {
      if (!item.description || !item.description.trim()) {
        alert('Please fill in item description for all items');
        return false;
      }
      if (!item.amount || parseFloat(item.amount) <= 0) {
        alert('Please enter a valid amount for all items');
        return false;
      }
    }

    return true;
  };

  // Unified function: Auto-save and generate PDF
  const handleGenerateInvoicePDF = async () => {
    // Step 1: Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Step 1.5: Check for duplicate invoice number before proceeding
      if (!currentQuotationId) {
        const exists = await checkInvoiceNumberExists(formData.invoiceNumber, currentUser.id);
        if (exists) {
          alert(`❌ Invoice number "${formData.invoiceNumber}" already exists! Please use a different invoice number.`);
          return;
        }
      } else {
        // When updating, check if the invoice number conflicts with other quotations
        const exists = await checkInvoiceNumberExists(formData.invoiceNumber, currentUser.id, currentQuotationId);
        if (exists) {
          alert(`❌ Invoice number "${formData.invoiceNumber}" already exists! Please use a different invoice number.`);
          return;
        }
      }

      // Step 2: Prepare quotation data
      const quotationData = {
        invoiceNumber: formData.invoiceNumber,
        companyId: selectedCompany?.id,
        buyerId: selectedBuyer?.id,
        buyerName: formData.buyerName,
        buyerAddress: formData.buyerAddress,
        buyerGST: formData.buyerGST,
        invoiceDetails: {
          deliveryNote: formData.deliveryNote,
          paymentMode: formData.paymentMode,
          supplierRef: formData.supplierRef,
          otherRef: formData.otherRef,
          buyerPO: formData.buyerPO,
          poDate: formData.poDate,
          dispatchThrough: formData.dispatchThrough,
          destination: formData.destination,
          termsOfDelivery: formData.termsOfDelivery,
          gstType: gstType
        },
        items: items,
        gstRate: gstRate,
        totals: totals,
        status: 'invoice' // Mark as invoice when generating PDF
      };

      // Step 3: Auto-save or update to Supabase
      let savedQuotation;
      if (currentQuotationId) {
        // Update existing quotation
        savedQuotation = await updateQuotation(currentQuotationId, quotationData, currentUser.id);
        console.log('✅ Invoice updated:', savedQuotation);
      } else {
        // Create new quotation
        savedQuotation = await saveQuotation(quotationData, currentUser.id);
        setCurrentQuotationId(savedQuotation.id); // Store the new ID
        console.log('✅ Invoice saved:', savedQuotation);
      }

      // Step 4: Generate PDF after successful save
      generatePDFDocument();

    } catch (error) {
      console.error('❌ Error saving invoice:', error);
      alert('Failed to save invoice. PDF not generated. Please try again.');
    }
  };

  // Extract PDF generation logic
  const generatePDFDocument = () => {
    const element = invoiceRef.current;
    element.style.display = 'block';

    const invoiceNumber = formData.invoiceNumber;
    const cleanInvoiceNumber = invoiceNumber.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
    const filename = `Invoice_${cleanInvoiceNumber}.pdf`;

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: 'css', avoid: 'tr' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save(filename)
      .then(() => {
        element.style.display = 'none';
        alert('✅ Invoice saved and PDF generated successfully!');
      })
      .catch(err => {
        console.error('❌ PDF generation error:', err);
        alert('Invoice saved but PDF generation failed. Please try again.');
        element.style.display = 'none';
      });
  };

  const totals = calculateInvoiceTotals(items, gstRate, gstType);
  const amountInWords = numberToWords(totals.totalAfterTax);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Show landing page first
  if (showLanding && !isAuthenticated) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <Register onBackToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'forgot-password') {
      return <ForgotPassword onBackToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'verify-email') {
      return <VerifyEmail onBackToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setAuthView('register')}
        onShowForgotPassword={() => setAuthView('forgot-password')}
      />
    );
  }

  return (
    <div className="container">
      <header className="app-header">
        <div style={{ flex: 1 }}>
          <h1>GST Tax Invoice Maker</h1>
          <p className="subtitle">Professional invoice generator with instant PDF download</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingLeft: '20px'
        }}>
          <span style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            whiteSpace: 'nowrap'
          }}>
            {currentUser?.email}
          </span>
          <button
            onClick={handleLogout}
            className="logout-button"
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="invoice-form">
        {/* Company Selector */}
        <CompanySelector
          onCompanySelect={handleCompanySelect}
          onManageClick={() => setShowCompanyManager(true)}
          selectedCompanyId={selectedCompany?.id}
          userId={currentUser?.id}
        />

        {/* Buyer Selector */}
        <BuyerSelector
          onBuyerSelect={handleBuyerSelect}
          onManageClick={() => setShowBuyerManager(true)}
          selectedBuyerId={selectedBuyer?.id}
          userId={currentUser?.id}
        />

        {/* Main Invoice Form */}
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
          onViewQuotations={() => setShowQuotationList(true)}
          currentQuotationId={currentQuotationId}
          onGstTypeChange={setGstType}
        />
      </div>

      {/* Invoice Preview (Hidden) */}
      <div className="invoice-preview-wrapper">
        <InvoicePreview
          ref={invoiceRef}
          formData={formData}
          items={items}
          gstRate={gstRate}
          gstType={gstType}
          totals={totals}
          amountInWords={amountInWords}
        />
      </div>

      {/* Modals */}
      <CompanyManager
        isOpen={showCompanyManager}
        onClose={() => setShowCompanyManager(false)}
        onCompanySaved={(company) => {
          // Auto-select the newly created company
          if (company) {
            handleCompanySelect(company);
          }
        }}
        currentFormData={{
          sellerName: formData.sellerName,
          sellerAddress: formData.sellerAddress,
          sellerPhone: formData.sellerPhone,
          sellerGST: formData.sellerGST,
          sellerPAN: formData.sellerPAN,
          sellerEmail: formData.sellerEmail,
          sellerTagline: formData.sellerTagline
        }}
        userId={currentUser?.id}
      />



      {/* Buyer Manager Modal */}
      <BuyerManager
        isOpen={showBuyerManager}
        onClose={() => setShowBuyerManager(false)}
        onBuyerSaved={(buyer) => {
          if (buyer) {
            handleBuyerSelect(buyer);
          }
        }}
        userId={currentUser?.id}
      />

      <QuotationList
        isOpen={showQuotationList}
        onClose={() => setShowQuotationList(false)}
        onLoadQuotation={handleLoadQuotation}
        userId={currentUser?.id}
      />
    </div>
  );
}

export default App;
