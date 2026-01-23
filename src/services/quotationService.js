import { supabase } from './supabase';

/**
 * Get all quotations with company details for a specific user
 * @param {string} userId - User UUID from auth
 * @returns {Promise<Array>} Array of quotation objects
 */
export async function getQuotations(userId) {
    try {
        if (!userId) {
            console.error('❌ No user ID provided to getQuotations');
            return [];
        }

        const { data, error } = await supabase
            .from('quotations')
            .select(`
        *,
        companies (*)
      `)
            .eq('user_id', userId)
            .eq('user_id', userId)
            .order('invoice_date', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching quotations:', error);
        throw error;
    }
}

/**
 * Get a single quotation by ID
 * @param {string} id - Quotation UUID
 * @returns {Promise<Object>} Quotation object
 */
export async function getQuotation(id) {
    try {
        const { data, error } = await supabase
            .from('quotations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching quotation:', error);
        throw error;
    }
}

/**
 * Check if an invoice number already exists for a specific user
 * @param {string} invoiceNumber - Invoice number to check
 * @param {string} userId - User UUID from auth
 * @param {string} excludeId - Optional ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if invoice number exists, false otherwise
 */
export async function checkInvoiceNumberExists(invoiceNumber, userId, excludeId = null) {
    try {
        if (!userId) {
            throw new Error('User ID is required to check invoice number');
        }

        let query = supabase
            .from('quotations')
            .select('id, quotation_no')
            .eq('quotation_no', invoiceNumber)
            .eq('user_id', userId);

        // If updating an existing quotation, exclude its own ID
        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data && data.length > 0;
    } catch (error) {
        console.error('Error checking invoice number:', error);
        throw error;
    }
}

/**
 * Save a new quotation
 * @param {Object} quotationData - Quotation data
 * @param {string} userId - User UUID from auth
 * @returns {Promise<Object>} Created quotation object
 */
export async function saveQuotation(quotationData, userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required to save quotation');
        }

        const { data, error } = await supabase
            .from('quotations')
            .insert([{
                user_id: userId,
                quotation_no: quotationData.invoiceNumber,
                company_id: quotationData.companyId || null,
                buyer_name: quotationData.buyerName,
                buyer_address: quotationData.buyerAddress,
                buyer_gst: quotationData.buyerGST || null,
                invoice_details: quotationData.invoiceDetails,
                items: quotationData.items,
                gst_rate: quotationData.gstRate,
                total_before_tax: quotationData.totals.totalBeforeTax,
                total_gst: quotationData.totals.totalGST,
                total_after_tax: quotationData.totals.totalAfterTax,
                total_after_tax: quotationData.totals.totalAfterTax,
                status: quotationData.status || 'quotation',
                invoice_date: quotationData.invoiceDate || new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving quotation:', error);
        throw error;
    }
}

/**
 * Update an existing quotation
 * @param {string} id - Quotation UUID
 * @param {Object} quotationData - Updated quotation data
 * @param {string} userId - User UUID from auth (for verification)
 * @returns {Promise<Object>} Updated quotation object
 */
export async function updateQuotation(id, quotationData, userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required to update quotation');
        }

        const { data, error } = await supabase
            .from('quotations')
            .update({
                buyer_name: quotationData.buyerName,
                buyer_address: quotationData.buyerAddress,
                buyer_gst: quotationData.buyerGST || null,
                invoice_details: quotationData.invoiceDetails,
                items: quotationData.items,
                gst_rate: quotationData.gstRate,
                total_before_tax: quotationData.totals.totalBeforeTax,
                total_gst: quotationData.totals.totalGST,
                total_after_tax: quotationData.totals.totalAfterTax,
                total_after_tax: quotationData.totals.totalAfterTax,
                status: quotationData.status,
                invoice_date: quotationData.invoiceDate
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating quotation:', error);
        throw error;
    }
}

/**
 * Delete a quotation
 * @param {string} id - Quotation UUID
 * @returns {Promise<void>}
 */
export async function deleteQuotation(id) {
    try {
        const { error } = await supabase
            .from('quotations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting quotation:', error);
        throw error;
    }
}

/**
 * Duplicate a quotation with a new quotation number
 * @param {string} id - Original quotation UUID
 * @param {string} newQuotationNo - New quotation number
 * @returns {Promise<Object>} New quotation object
 */
export async function duplicateQuotation(id, newQuotationNo) {
    try {
        // Fetch original quotation
        const { data: original, error: fetchError } = await supabase
            .from('quotations')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Create duplicate with new quotation number
        const { data, error } = await supabase
            .from('quotations')
            .insert([{
                quotation_no: newQuotationNo,
                company_id: original.company_id,
                buyer_name: original.buyer_name,
                buyer_address: original.buyer_address,
                buyer_gst: original.buyer_gst,
                invoice_details: original.invoice_details,
                items: original.items,
                gst_rate: original.gst_rate,
                total_before_tax: original.total_before_tax,
                total_gst: original.total_gst,
                total_after_tax: original.total_after_tax,
                status: 'quotation' // Always create as quotation
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error duplicating quotation:', error);
        throw error;
    }
}

/**
 * Convert quotation to invoice
 * @param {string} id - Quotation UUID
 * @returns {Promise<Object>} Updated quotation object
 */
export async function convertToInvoice(id) {
    try {
        const { data, error } = await supabase
            .from('quotations')
            .update({ status: 'invoice' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error converting to invoice:', error);
        throw error;
    }
}

/**
 * Generate a unique quotation number (Fallback legacy)
 * @returns {Promise<string>} Unique quotation number
 */
export async function generateQuotationNumber() {
    try {
        // Get the latest quotation number
        const { data, error } = await supabase
            .from('quotations')
            .select('quotation_no')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        // Generate new number
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = String(today.getMonth() + 1).padStart(2, '0');

        if (data && data.length > 0) {
            // Extract number from last quotation
            const lastNo = data[0].quotation_no;
            const match = lastNo.match(/(\d+)$/);
            if (match) {
                const nextNum = parseInt(match[1]) + 1;
                return `QT-${year}${month}-${String(nextNum).padStart(3, '0')}`;
            }
        }

        // First quotation
        return `QT-${year}${month}-001`;
    } catch (error) {
        console.error('Error generating quotation number:', error);
        // Fallback to timestamp-based number
        return `QT-${Date.now()}`;
    }
}

/**
 * Generate a unique Invoice Number based on Company Prefix and Financial Year
 * Format: {PREFIX}/{YY}{YY+1}/{SEQUENCE} (e.g. MSC/2526/0001)
 * @param {string} companyId - Selected Company UUID
 * @returns {Promise<string>} New Invoice Number
 */
export async function generateInvoiceNumber(companyId) {
    try {
        if (!companyId) {
            throw new Error('Company ID is required to generate invoice number');
        }

        // 1. Get Company Prefix
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('invoice_prefix, company_name')
            .eq('id', companyId)
            .single();

        if (companyError) throw companyError;

        let prefix = company.invoice_prefix;
        if (!prefix) {
            // Fallback: First 3 uppercase letters of company name or 'INV'
            prefix = company.company_name ? company.company_name.substring(0, 3).toUpperCase() : 'INV';
        }

        // 2. Calculate Financial Year (e.g. 2526 for 2025-2026)
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 1-12
        const currentYear = today.getFullYear(); // 2025

        let startYear, endYear;
        // Indian Financial Year: April (4) to March (3)
        if (currentMonth >= 4) {
            startYear = currentYear;
            endYear = currentYear + 1;
        } else {
            startYear = currentYear - 1;
            endYear = currentYear;
        }

        const fyShort = `${startYear.toString().slice(-2)}${endYear.toString().slice(-2)}`; // "2526"

        const searchPattern = `${prefix}/${fyShort}/%`;

        // 3. Find latest invoice number for this pattern
        const { data: lastInvoice, error: quoteError } = await supabase
            .from('quotations')
            .select('quotation_no')
            .like('quotation_no', searchPattern)
            .order('created_at', { ascending: false })
            .limit(1);

        if (quoteError) throw quoteError;

        let nextNum = 1;
        if (lastInvoice && lastInvoice.length > 0) {
            const lastNo = lastInvoice[0].quotation_no;
            // Expected format: PRE/FY/0001
            const parts = lastNo.split('/');
            if (parts.length === 3) {
                const lastSeq = parseInt(parts[2]);
                if (!isNaN(lastSeq)) {
                    nextNum = lastSeq + 1;
                }
            }
        }

        return `${prefix}/${fyShort}/${String(nextNum).padStart(4, '0')}`;

    } catch (error) {
        console.error('Error generating invoice number:', error);
        return null; // Handle error gracefully in frontend
    }
}
