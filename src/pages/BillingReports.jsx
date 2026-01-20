import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getBillingReport } from '../services/reportService';
import { FileSpreadsheet, FileText, Filter, Calendar as CalendarIcon, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/dashboard.css';

const BillingReports = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);

    // Date State
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1); // First day of current month
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const handleGenerateReport = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await getBillingReport(user.id, startDate, endDate);
            setReportData(data);
        } catch (error) {
            console.error('Failed to generate report', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Quick Filters
    const setQuickFilter = (type) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (type) {
            case 'today':
                break; // start and end are already today
            case 'thisWeek':
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                start.setDate(diff);
                break;
            case 'thisMonth':
                start.setDate(1);
                break;
            case 'lastMonth':
                start.setMonth(start.getMonth() - 1);
                start.setDate(1);
                end.setDate(0); // Last day of previous month
                break;
            case 'thisYear':
                start.setMonth(0, 1);
                break;
            default:
                break;
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    // Calculations
    const totalInvoices = reportData.length;
    const totalTaxable = reportData.reduce((sum, item) => sum + (item.total_before_tax || 0), 0);
    const totalGST = reportData.reduce((sum, item) => sum + (item.total_gst || 0), 0);
    const grandTotal = reportData.reduce((sum, item) => sum + (item.total_after_tax || 0), 0);

    // Export to Excel
    const downloadExcel = () => {
        if (reportData.length === 0) return alert('No data to export');

        const exportData = reportData.map(item => ({
            'Invoice No': item.quotation_no,
            'Date': new Date(item.created_at).toLocaleDateString(),
            'Buyer Name': item.buyer_name,
            'Buyer GST': item.buyer_gst || 'N/A',
            'Taxable Amount': item.total_before_tax,
            'GST Amount': item.total_gst,
            'Total Amount': item.total_after_tax,
            'Status': item.status
        }));

        // Add Summary Row
        exportData.push({
            'Invoice No': 'TOTAL',
            'Date': '',
            'Buyer Name': '',
            'Buyer GST': '',
            'Taxable Amount': totalTaxable,
            'GST Amount': totalGST,
            'Total Amount': grandTotal,
            'Status': ''
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Billing Report");
        XLSX.writeFile(wb, `Billing_Report_${startDate}_to_${endDate}.xlsx`);
    };

    // Export to PDF
    const downloadPDF = () => {
        if (reportData.length === 0) return alert('No data to export');

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(18);
            doc.text('Billing Report', 14, 22);

            doc.setFontSize(11);
            doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

            // Table
            const tableColumn = ["Invoice No", "Date", "Buyer", "Taxable", "GST", "Total"];
            const tableRows = [];

            reportData.forEach(item => {
                const row = [
                    item.quotation_no,
                    new Date(item.created_at).toLocaleDateString(),
                    item.buyer_name,
                    item.total_before_tax.toFixed(2),
                    item.total_gst.toFixed(2),
                    item.total_after_tax.toFixed(2)
                ];
                tableRows.push(row);
            });

            // Summary Row
            tableRows.push([
                'TOTAL', '', '',
                totalTaxable.toFixed(2),
                totalGST.toFixed(2),
                grandTotal.toFixed(2)
            ]);

            // Use functional autoTable
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }, // Blue header
                footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
            });

            doc.save(`Billing_Report_${startDate}_to_${endDate}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try refreshing the page.');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Billing Reports</h1>
                    <p className="page-subtitle">Generate and download comprehensive sales reports</p>
                </div>
            </div>

            {/* Filter Section */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>

                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>Date From</label>
                        <input
                            type="date"
                            className="form-input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>Date To</label>
                        <input
                            type="date"
                            className="form-input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <button
                        className="btn-primary"
                        onClick={handleGenerateReport}
                        disabled={loading}
                        style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {loading ? 'Generating...' : <><Filter size={18} /> Generate Report</>}
                    </button>
                </div>

                {/* Quick Filters */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                    {['today', 'thisWeek', 'thisMonth', 'lastMonth', 'thisYear'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => { setQuickFilter(filter); setTimeout(handleGenerateReport, 100); }}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                border: '1px solid #e5e7eb',
                                background: '#f9fafb',
                                fontSize: '13px',
                                cursor: 'pointer',
                                color: '#4b5563'
                            }}
                        >
                            {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Report Summary & Data */}
            {reportData.length > 0 && (
                <div className="report-content" style={{ animation: 'fadeIn 0.5s ease' }}>

                    {/* Summary Cards */}
                    <div className="stats-grid" style={{ marginTop: '0', marginBottom: '24px' }}>
                        <div className="stat-card">
                            <div className="stat-content">
                                <h3 className="stat-label">Total Invoices</h3>
                                <p className="stat-value">{totalInvoices}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-content">
                                <h3 className="stat-label">Taxable Value</h3>
                                <p className="stat-value">{formatCurrency(totalTaxable)}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-content">
                                <h3 className="stat-label">Total GST</h3>
                                <p className="stat-value" style={{ color: '#ef4444' }}>{formatCurrency(totalGST)}</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ border: '1px solid #3b82f6', background: '#eff6ff' }}>
                            <div className="stat-content">
                                <h3 className="stat-label" style={{ color: '#1e40af' }}>Grand Total</h3>
                                <p className="stat-value" style={{ color: '#1e3a8a' }}>{formatCurrency(grandTotal)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Download Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px' }}>
                        <button
                            onClick={downloadPDF}
                            className="btn-secondary"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'white', border: '1px solid #e5e7eb',
                                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                                color: '#ef4444', fontWeight: 600
                            }}
                        >
                            <FileText size={20} /> Download PDF
                        </button>
                        <button
                            onClick={downloadExcel}
                            className="btn-secondary"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: '#10b981', border: 'none',
                                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                                color: 'white', fontWeight: 600
                            }}
                        >
                            <FileSpreadsheet size={20} /> Download Excel
                        </button>
                    </div>

                    {/* Data Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Invoice No</th>
                                    <th>Buyer Name</th>
                                    <th>Taxable</th>
                                    <th>GST</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map(item => (
                                    <tr key={item.id}>
                                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                        <td className="font-mono">{item.quotation_no}</td>
                                        <td>{item.buyer_name}</td>
                                        <td>{formatCurrency(item.total_before_tax)}</td>
                                        <td>{formatCurrency(item.total_gst)}</td>
                                        <td className="font-semibold">{formatCurrency(item.total_after_tax)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && reportData.length === 0 && (
                <div className="empty-state">
                    <CalendarIcon size={48} color="#d1d5db" />
                    <h3>No invoices found for this period</h3>
                    <p>Try selecting a different date range or generating new invoices.</p>
                </div>
            )}
        </div>
    );
};

export default BillingReports;
