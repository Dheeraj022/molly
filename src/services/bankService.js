import { supabase } from './supabase';

/**
 * Get all bank accounts for a specific user
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of bank account objects
 */
export async function getBanks(userId) {
    try {
        if (!userId) {
            console.error('❌ No user ID provided to getBanks');
            return [];
        }

        const { data, error } = await supabase
            .from('bank_accounts')
            .select('*')
            .eq('user_id', userId)
            .order('bank_name');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Error fetching banks:', error);
        throw error;
    }
}

/**
 * Save a new bank account
 * @param {Object} bankData - Bank form data
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Created bank object
 */
export async function saveBank(bankData, userId) {
    try {
        if (!userId) throw new Error('User ID required');

        const { data, error } = await supabase
            .from('bank_accounts')
            .insert([{
                user_id: userId,
                bank_name: bankData.bankName,
                account_number: bankData.accountNumber,
                ifsc_code: bankData.ifscCode,
                branch_name: bankData.branchName
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error saving bank:', error);
        throw error;
    }
}

/**
 * Update a bank account
 * @param {string} id - Bank UUID
 * @param {Object} bankData - Updated data
 * @param {string} userId - User UUID
 */
export async function updateBank(id, bankData, userId) {
    try {
        const { data, error } = await supabase
            .from('bank_accounts')
            .update({
                bank_name: bankData.bankName,
                account_number: bankData.accountNumber,
                ifsc_code: bankData.ifscCode,
                branch_name: bankData.branchName
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error updating bank:', error);
        throw error;
    }
}

/**
 * Delete a bank account
 * @param {string} id - Bank UUID
 */
export async function deleteBank(id) {
    try {
        const { error } = await supabase
            .from('bank_accounts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('❌ Error deleting bank:', error);
        throw error;
    }
}
