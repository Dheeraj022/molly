import { supabase } from './supabase';

/**
 * Fetch billing report data for a specific date range
 * @param {string} userId - User UUID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of invoices
 */
export async function getBillingReport(userId, startDate, endDate) {
    try {
        if (!userId) throw new Error('User ID is required');

        // Adjust endDate to include the full day (23:59:59)
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
            .from('quotations')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'invoice')
            .gte('created_at', new Date(startDate).toISOString())
            .lte('created_at', endDateTime.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching billing report:', error);
        throw error;
    }
}
