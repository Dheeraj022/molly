import { supabase } from './supabase';

/**
 * Fetch dashboard statistics for a specific user
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Dashboard stats object
 */
export async function getDashboardStats(userId) {
    try {
        if (!userId) {
            console.error('❌ No user ID provided to getDashboardStats');
            return {
                totalInvoices: 0,
                totalRevenue: 0,
                totalBuyers: 0,
                totalProducts: 0
            };
        }

        // Run all queries in parallel for performance
        const [
            invoicesPromise,
            revenuePromise,
            buyersPromise,
            productsPromise
        ] = await Promise.all([
            // 1. Total Invoices (Count of quotations where status = 'invoice')
            supabase
                .from('quotations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('status', 'invoice'),

            // 2. Total Revenue (Sum of total_after_tax for invoices)
            // Note: Supabase doesn't have a direct sum function in JS client easily without RPC,
            // but for now efficiently, we can fetch just the amounts or use a hack.
            // Since we might not have a huge number of invoices yet, fetching just amounts is okay.
            // A better scalable way is a Postgres function, but I'll do client-side sum for now as per "Common Bugs" to avoid heavy loops, 
            // I will select ONLY the column needed.
            supabase
                .from('quotations')
                .select('total_after_tax')
                .eq('user_id', userId)
                .eq('status', 'invoice'),

            // 3. Total Buyers
            supabase
                .from('buyers')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId),

            // 4. Total Products
            supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
        ]);

        // Process Invoices Count
        const totalInvoices = invoicesPromise.count || 0;

        // Process Revenue
        const revenueData = revenuePromise.data || [];
        const totalRevenue = revenueData.reduce((sum, item) => sum + (item.total_after_tax || 0), 0);

        // Process Buyers Count
        const totalBuyers = buyersPromise.count || 0;

        // Process Products Count
        const totalProducts = productsPromise.count || 0;

        return {
            totalInvoices,
            totalRevenue,
            totalBuyers,
            totalProducts
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalInvoices: 0,
            totalRevenue: 0,
            totalBuyers: 0,
            totalProducts: 0
        };
    }
}
