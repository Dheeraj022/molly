import { supabase } from './supabase';

/**
 * Sign up a new user with email, phone, and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} phone - User's phone number (optional)
 * @returns {Promise<Object>} User data and session
 */
export async function signUp(email, password, phone = '') {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    phone: phone || null
                },
                emailRedirectTo: `${window.location.origin}/verify-email`
            }
        });

        if (error) throw error;

        console.log('✅ User registered successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Registration error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign in an existing user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data and session
 */
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        console.log('✅ User logged in successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Login error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sign out the current user
 * @returns {Promise<Object>} Success status
 */
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        console.log('✅ User logged out successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Logout error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Success status
 */
export async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw error;

        console.log('✅ Password reset email sent');
        return { success: true };
    } catch (error) {
        console.error('❌ Password reset error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success status
 */
export async function updatePassword(newPassword) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        console.log('✅ Password updated successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Password update error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current authenticated user
 * @returns {Promise<Object>} Current user or null
 */
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        return user;
    } catch (error) {
        console.error('❌ Get user error:', error);
        return null;
    }
}

/**
 * Get current session
 * @returns {Promise<Object>} Current session or null
 */
export async function getSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        return session;
    } catch (error) {
        console.error('❌ Get session error:', error);
        return null;
    }
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Object} Subscription object
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        callback(event, session);
    });
}

/**
 * Resend verification email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Success status
 */
export async function resendVerificationEmail(email) {
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/verify-email`
            }
        });

        if (error) throw error;

        console.log('✅ Verification email resent');
        return { success: true };
    } catch (error) {
        console.error('❌ Resend verification error:', error);
        return { success: false, error: error.message };
    }
}
