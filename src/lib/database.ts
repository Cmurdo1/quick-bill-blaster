
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
export type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];

// Client operations
export const clientService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async create(client: Omit<ClientInsert, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...client, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<ClientInsert>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Invoice operations
export const invoiceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        invoice_items(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        invoice_items(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(invoice: Omit<InvoiceInsert, 'user_id'>, items: Omit<InvoiceItemInsert, 'invoice_id'>[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Start transaction
    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({ ...invoice, user_id: user.id })
      .select()
      .single();
    
    if (invoiceError) throw invoiceError;

    // Add invoice items
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items.map(item => ({ ...item, invoice_id: newInvoice.id })));
      
      if (itemsError) throw itemsError;
    }

    return newInvoice;
  },

  async update(id: string, invoice: Partial<InvoiceInsert>, items?: Omit<InvoiceItemInsert, 'invoice_id'>[]) {
    const { data, error } = await supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Update items if provided
    if (items) {
      // Delete existing items
      await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      // Insert new items
      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items.map(item => ({ ...item, invoice_id: id })));
        
        if (itemsError) throw itemsError;
      }
    }

    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Generate next invoice number
export async function generateInvoiceNumber(): Promise<string> {
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) throw error;

  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  if (!data || data.length === 0) {
    return `INV-${currentYear}${currentMonth}-001`;
  }

  const lastInvoice = data[0];
  const lastNumber = lastInvoice.invoice_number;
  
  // Extract number from format INV-YYYYMM-XXX
  const match = lastNumber.match(/INV-(\d{6})-(\d{3})/);
  if (match) {
    const lastYearMonth = match[1];
    const lastSeq = parseInt(match[2]);
    
    if (lastYearMonth === `${currentYear}${currentMonth}`) {
      // Same month, increment sequence
      const nextSeq = (lastSeq + 1).toString().padStart(3, '0');
      return `INV-${currentYear}${currentMonth}-${nextSeq}`;
    }
  }
  
  // New month or different format, start from 001
  return `INV-${currentYear}${currentMonth}-001`;
}
