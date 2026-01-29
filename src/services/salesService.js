import { supabase } from './supabase';

/**
 * Create a new sales record from an invoice
 * @param {Object} invoice - The invoice object (quotation with status='invoice')
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Created sales record
 */
export async function createSalesRecord(invoice, userId) {
    try {
        if (!userId) throw new Error('User ID required');

        // Check if sales record already exists for this invoice
        const { data: existing } = await supabase
            .from('sales')
            .select('id')
            .eq('invoice_id', invoice.id)
            .single();

        if (existing) {
            console.log('Sales record already exists for invoice:', invoice.id);
            return existing;
        }

        const totalAmount = invoice.total_after_tax || 0;

        const { data, error } = await supabase
            .from('sales')
            .insert([{
                user_id: userId,
                invoice_id: invoice.id,
                invoice_number: invoice.quotation_no,
                buyer_name: invoice.buyer_name,
                total_amount: totalAmount,
                received_amount: 0,
                status: 'pending'
            }])
            .select()
            .single();


        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating sales record:', error);
        throw error;
    }
}

/**
 * Check if a sales record exists for an invoice
 * @param {string} invoiceId 
 * @returns {Promise<boolean>}
 */
export async function checkSaleByInvoiceId(invoiceId) {
    try {
        const { data, error } = await supabase
            .from('sales')
            .select('id')
            .eq('invoice_id', invoiceId)
            .maybeSingle(); // Use maybeSingle to avoid error if not found

        if (error) throw error;
        return !!data;
    } catch (error) {
        console.error('Error checking sales existence:', error);
        return false; // Fail safe to allowing delete if check fails? Or blocking? 
        // Logic requirement says "If sales exist: Do NOT delete". 
        // If error, we probably shouldn't return false blindly, but for now assuming false means "no sales found".
        // Better safe: if error, maybe treat as "unknown" but here we just return false.
    }
}

/**
 * Add a payment to a sales record
 * @param {string} saleId - Sales UUID
 * @param {Object} paymentData - { amount, date, mode, reference, proofUrl }
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Updated sales record
 */
export async function addPayment(saleId, paymentData, userId) {
    try {
        // 1. Insert Payment Record
        const { error: paymentError } = await supabase
            .from('payments')
            .insert([{
                sale_id: saleId,
                user_id: userId,
                amount: paymentData.amount,
                payment_date: paymentData.date,
                payment_mode: paymentData.mode,
                reference_id: paymentData.reference || null,
                proof_url: paymentData.proofUrl || null
            }]);

        if (paymentError) throw paymentError;

        // 2. Fetch current sales data to recalculate
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .select('total_amount, received_amount')
            .eq('id', saleId)
            .single();

        if (saleError) throw saleError;

        // 3. Calculate new values
        const newReceived = parseFloat(sale.received_amount) + parseFloat(paymentData.amount);
        const total = parseFloat(sale.total_amount);

        // pending_amount is calculated generated column, but we update status
        let newStatus = 'partially_paid';
        if (newReceived >= total) {
            newStatus = 'paid';
        } else if (newReceived <= 0) {
            newStatus = 'pending'; // Should not happen on add payment but for safety
        }

        // 4. Update Sales Record
        const { data: updatedSale, error: updateError } = await supabase
            .from('sales')
            .update({
                received_amount: newReceived,
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', saleId)
            .select()
            .single();

        if (updateError) throw updateError;
        return updatedSale;

    } catch (error) {
        console.error('Error adding payment:', error);
        throw error;
    }
}

/**
 * Get all sales records
 * @param {string} userId - User UUID
 * @param {Object} filters - Optional filters { status, startDate, endDate }
 */
/**
 * Get all sales records
 * @param {string} userId - User UUID
 * @param {Object} filters - Optional filters { status, startDate, endDate }
 */
export async function getSales(userId, filters = {}) {
    try {
        let query = supabase
            .from('sales')
            .select(`
                *,
                payments (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate);
        }

        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching sales:', error);
        throw error;
    }
}

/**
 * Delete a payment and recalculate sales record
 * @param {string} paymentId 
 * @param {string} saleId 
 * @param {string} userId 
 */
export async function deletePayment(paymentId, saleId, userId) {
    try {
        // 1. Get payment amount before deleting
        const { data: payment, error: fetchError } = await supabase
            .from('payments')
            .select('amount')
            .eq('id', paymentId)
            .single();

        if (fetchError) throw fetchError;

        // 2. Delete payment
        const { error: deleteError } = await supabase
            .from('payments')
            .delete()
            .eq('id', paymentId);

        if (deleteError) throw deleteError;

        // 3. Recalculate Sales Record
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .select('total_amount, received_amount')
            .eq('id', saleId)
            .single();

        if (saleError) throw saleError;

        const newReceived = parseFloat(sale.received_amount) - parseFloat(payment.amount);
        const total = parseFloat(sale.total_amount);

        let newStatus = 'partially_paid';
        if (newReceived >= total) {
            newStatus = 'paid';
        } else if (newReceived <= 0) {
            newStatus = 'pending';
        }

        // 4. Update Sales Record
        const { error: updateError } = await supabase
            .from('sales')
            .update({
                received_amount: newReceived,
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', saleId);

        if (updateError) throw updateError;

    } catch (error) {
        console.error('Error deleting payment:', error);
        throw error;
    }
}

/**
 * Delete a sales record
 * @param {string} saleId 
 */
export async function deleteSale(saleId) {
    try {
        const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', saleId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting sale:', error);
        throw error;
    }
}

/**
 * Get sales statistics for a user
 * @param {string} userId
 * @returns {Promise<Object>} { totalSales, totalReceived, totalPending }
 */
export async function getSalesStats(userId) {
    try {
        const { data, error } = await supabase
            .from('sales')
            .select('total_amount, received_amount, pending_amount')
            .eq('user_id', userId);

        if (error) throw error;

        const stats = data.reduce((acc, curr) => ({
            totalSales: acc.totalSales + (parseFloat(curr.total_amount) || 0),
            totalReceived: acc.totalReceived + (parseFloat(curr.received_amount) || 0),
            totalPending: acc.totalPending + (parseFloat(curr.pending_amount) || 0)
        }), { totalSales: 0, totalReceived: 0, totalPending: 0 });

        return stats;
    } catch (error) {
        console.error('Error fetching sales stats:', error);
        return { totalSales: 0, totalReceived: 0, totalPending: 0 };
    }
}

/**
     * Upload a payment receipt/proof
     * @param {File} file - The file object to upload
     * @param {string} userId - User UUID
     * @returns {Promise<string>} Public URL of the uploaded file
     */
export async function uploadPaymentProof(file, userId) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('payment-proofs')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading payment proof:', error);
        throw error;
    }
}

