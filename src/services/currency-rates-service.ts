
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { CurrencyRates } from './api';
import { Database } from '@/integrations/supabase/types';

// Interface for currency rate records
export interface CurrencyRate {
  id?: string;
  currency_code: string;
  rate: number;
  is_active?: boolean;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

// Save currency rates to the database
export const saveCurrencyRates = async (rates: CurrencyRates): Promise<boolean> => {
  try {
    if (!rates || Object.keys(rates).length === 0) {
      console.warn("No rates provided to save");
      return false;
    }

    console.log("Attempting to save currency rates:", rates);

    // Process each rate individually to avoid constraint issues
    for (const [currency_code, rate] of Object.entries(rates)) {
      try {
        // Check if rate already exists
        const { data: existingRates, error: fetchError } = await supabase
          .from('currency_rates')
          .select('id')
          .eq('currency_code', currency_code)
          .limit(1);
        
        if (fetchError) {
          console.error(`Error checking if ${currency_code} exists:`, fetchError);
          continue;
        }
        
        const currentDate = new Date().toISOString();
        
        if (existingRates && existingRates.length > 0) {
          // Update existing rate
          console.log(`Updating rate for ${currency_code}:`, rate);
          const { error: updateError } = await supabase
            .from('currency_rates')
            .update({ 
              rate, 
              updated_at: currentDate,
              source: 'api'
            })
            .eq('currency_code', currency_code);
            
          if (updateError) {
            console.error(`Error updating rate for ${currency_code}:`, updateError);
          }
        } else {
          // Insert new rate
          console.log(`Inserting rate for ${currency_code}:`, rate);
          const { error: insertError } = await supabase
            .from('currency_rates')
            .insert([{ 
              currency_code, 
              rate, 
              source: 'api',
              is_active: true,
              created_at: currentDate,
              updated_at: currentDate
            }]);
            
          if (insertError) {
            console.error(`Error inserting rate for ${currency_code}:`, insertError);
          }
        }
      } catch (innerError) {
        console.error(`Error processing ${currency_code}:`, innerError);
        // Continue with other currencies even if one fails
      }
    }
    
    console.log("Currency rates update completed");
    return true;
  } catch (error) {
    console.error("Error saving currency rates:", error);
    toast.error("Failed to update currency rates");
    return false;
  }
};

// Fetch currency rates from database
export const fetchCurrencyRates = async (): Promise<CurrencyRates> => {
  try {
    console.log("Fetching currency rates from database");
    const { data, error } = await supabase
      .from('currency_rates')
      .select('currency_code, rate')
      .eq('is_active', true);
    
    if (error) {
      console.error("Supabase error fetching currency rates:", error);
      throw error;
    }
    
    const rates: CurrencyRates = {};
    if (data) {
      data.forEach(item => {
        rates[item.currency_code] = item.rate;
      });
    }
    
    console.log("Fetched currency rates:", rates);
    return rates;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    toast.error("Failed to fetch currency rates");
    return {};
  }
};
