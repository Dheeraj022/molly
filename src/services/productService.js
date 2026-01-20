import { supabase } from './supabase';

export const getProducts = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
    return data;
};

export const addProduct = async (product, userId) => {
    const { data, error } = await supabase
        .from('products')
        .insert([{ ...product, user_id: userId }])
        .select()
        .single();

    if (error) {
        console.error('Error adding product:', error);
        throw error;
    }
    return data;
};

export const updateProduct = async (id, updates) => {
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating product:', error);
        throw error;
    }
    return data;
};

export const deleteProduct = async (id) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
    return true;
};
