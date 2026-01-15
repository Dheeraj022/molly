// ============================================
// BUYER SERVICE - SUPABASE CRUD OPERATIONS
// ============================================
// Mirrors companyService.js structure

import { supabase } from './supabase';

/**
 * Get all buyers from Supabase for a specific user
 * @param {string} userId - User UUID from auth
 * @returns {Promise<Array>} Array of buyer objects
 */
export async function getBuyers(userId) {
    try {
        if (!userId) {
            console.error('❌ No user ID provided to getBuyers');
            return [];
        }

        console.log('🔄 Loading buyers from Supabase...');

        const { data, error } = await supabase
            .from('buyers')
            .select('*')
            .eq('user_id', userId)
            .order('buyer_name');

        if (error) {
            console.error('❌ Supabase Error - Get Buyers:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        console.log('✅ Successfully loaded buyers:', data?.length || 0);
        return data || [];
    } catch (error) {
        console.error('❌ Error fetching buyers:', error);
        throw error;
    }
}

/**
 * Get single buyer by ID
 * @param {string} id - Buyer UUID
 * @returns {Promise<Object>} Buyer object
 */
export async function getBuyer(id) {
    try {
        const { data, error } = await supabase
            .from('buyers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('❌ Supabase Error - Get Buyer:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('❌ Error fetching buyer:', error);
        throw error;
    }
}

/**
 * Save new buyer to Supabase
 * @param {Object} buyerData - Buyer data object
 * @param {string} userId - User UUID from auth
 * @returns {Promise<Object>} Saved buyer object
 */
export async function saveBuyer(buyerData, userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required to save buyer');
        }

        const { data, error } = await supabase
            .from('buyers')
            .insert([{
                user_id: userId,
                buyer_name: buyerData.buyerName,
                address: buyerData.buyerAddress,
                gst_number: buyerData.buyerGST || null,
                phone: buyerData.buyerPhone || null,
                email: buyerData.buyerEmail || null
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase Error - Save Buyer:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        console.log('✅ Buyer saved successfully:', data);
        return data;
    } catch (error) {
        console.error('❌ Error saving buyer:', error);
        throw error;
    }
}

/**
 * Update existing buyer in Supabase
 * @param {string} id - Buyer UUID
 * @param {Object} buyerData - Updated buyer data
 * @param {string} userId - User UUID from auth (for verification)
 * @returns {Promise<Object>} Updated buyer object
 */
export async function updateBuyer(id, buyerData, userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required to update buyer');
        }

        const { data, error } = await supabase
            .from('buyers')
            .update({
                buyer_name: buyerData.buyerName,
                address: buyerData.buyerAddress,
                gst_number: buyerData.buyerGST || null,
                phone: buyerData.buyerPhone || null,
                email: buyerData.buyerEmail || null
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase Error - Update Buyer:', error);
            throw error;
        }

        console.log('✅ Buyer updated successfully:', data);
        return data;
    } catch (error) {
        console.error('❌ Error updating buyer:', error);
        throw error;
    }
}

/**
 * Delete buyer from Supabase
 * @param {string} id - Buyer UUID
 */
export async function deleteBuyer(id) {
    try {
        const { error } = await supabase
            .from('buyers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Supabase Error - Delete Buyer:', error);
            throw error;
        }

        console.log('✅ Buyer deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting buyer:', error);
        throw error;
    }
}
