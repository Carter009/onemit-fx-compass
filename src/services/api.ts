// API service for fetching currency data

import { toast } from "sonner";

const BASE_URL = "/api"; // Would be updated to actual API endpoint in production
const API_KEY = 'fca_live_Go01rIgZxHqhRvqFQ2BLi6o5oZGoovGuZk3sQ8nV';

// Interface for currency rates
export interface CurrencyRates {
  [key: string]: number;
}

// Interface for VertoFX rates
export interface VertoFXRates {
  [key: string]: {
    buy: number;
    sell: number;
  };
}

// Mock data for development
const MOCK_FX_RATES: CurrencyRates = {
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  USD: 1.0,
};

const MOCK_VERTO_RATES: VertoFXRates = {
  USD: {
    buy: 1420,
    sell: 1400,
  },
  EUR: {
    buy: 1550,
    sell: 1530,
  },
  GBP: {
    buy: 1800,
    sell: 1780,
  },
  CAD: {
    buy: 1050,
    sell: 1030,
  },
};

/**
 * Fetches the latest exchange rate for a given currency against USD using Free Currency API.
 *
 * @param {string} currency - The target currency code (e.g., "EUR", "GBP", "CAD").
 * @returns {Promise<number>} - The exchange rate or throws an error.
 */
export const getExchangeRate = async (currency: string): Promise<number> => {
  try {
    console.log(`Fetching exchange rate for ${currency} using Free Currency API`);
    const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}&currencies=${currency}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.data && data.data[currency]) {
      console.log(`Received rate for ${currency}:`, data.data[currency]);
      return data.data[currency];
    } else {
      console.error('Rate not found in API response:', data);
      throw new Error('Rate not found in API response');
    }
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw error;
  }
};

// Fetch USDT to NGN rate
export const fetchUsdtNgnRate = async (): Promise<number> => {
  try {
    // Mock API call for development
    // In production, this would be an actual API call
    console.log("Fetching mock USDT/NGN rate");
    return Promise.resolve(1450);
  } catch (error) {
    toast.error("Failed to fetch USDT/NGN rate");
    console.error("Error fetching USDT/NGN rate:", error);
    return 0;
  }
};

// Update USDT to NGN rate
export const updateUsdtNgnRate = async (rate: number): Promise<boolean> => {
  try {
    // Mock API call for development
    // In production, this would be an actual API call
    console.log("Updating USDT/NGN rate to:", rate);
    return Promise.resolve(true);
  } catch (error) {
    toast.error("Failed to update USDT/NGN rate");
    console.error("Error updating USDT/NGN rate:", error);
    return false;
  }
};

// Fetch FX rates from Free Currency API
export const fetchFxRates = async (currencies: string[] = ["EUR", "GBP", "CAD"]): Promise<CurrencyRates> => {
  try {
    console.log("Fetching FX rates for currencies:", currencies);
    // In production environment, use the real API
    if (process.env.NODE_ENV === 'production') {
      const rates: CurrencyRates = {};
      
      // Fetch each currency rate individually 
      for (const currency of currencies) {
        try {
          const rate = await getExchangeRate(currency);
          rates[currency] = rate;
        } catch (e) {
          console.error(`Error fetching rate for ${currency}:`, e);
        }
      }
      
      // If USD is not included, add it as reference (1.0)
      if (!rates.USD) {
        rates.USD = 1.0;
      }
      
      console.log("Fetched production FX rates:", rates);
      return rates;
    } 
    
    // Use mock data for development
    console.log("Using mock FX rates:", MOCK_FX_RATES);
    return Promise.resolve(MOCK_FX_RATES);
  } catch (error) {
    toast.error("Failed to fetch FX rates");
    console.error("Error fetching FX rates:", error);
    return {};
  }
};

// Fetch VertoFX rates
export const fetchVertoFXRates = async (): Promise<VertoFXRates> => {
  try {
    // Mock API call for development
    // In production, this would be an actual API call or web scraping
    console.log("Fetching mock VertoFX rates");
    return Promise.resolve(MOCK_VERTO_RATES);
  } catch (error) {
    toast.error("Failed to fetch VertoFX rates");
    console.error("Error fetching VertoFX rates:", error);
    return {};
  }
};

// Calculate cost prices - this function is now replaced by the more specific functions in currencyUtils.ts
// Keeping it for backward compatibility
export const calculateCostPrices = async (
  usdtNgnRate: number, 
  fxRates: CurrencyRates,
  usdtToUsdFee: number = 0.001, // Updated to 0.10%
  usdToTargetFee: number = 0.03 // 3% margin for compatibility
): Promise<CurrencyRates> => {
  try {
    console.log("Calculating cost prices with params:", {
      usdtNgnRate,
      fxRates,
      usdtToUsdFee,
      usdToTargetFee
    });
    
    const costPrices: CurrencyRates = {};
    
    // Calculate for USD with USD formula
    costPrices.USD = usdtNgnRate * (1 + usdToTargetFee); // Simplified for compatibility
    
    // Calculate for other currencies with new formula
    for (const [currency, rate] of Object.entries(fxRates)) {
      if (currency === "USD") continue;
      costPrices[currency] = (usdtNgnRate * (1 - usdtToUsdFee)) / rate * (1 + usdToTargetFee);
    }
    
    console.log("Calculated cost prices:", costPrices);
    return costPrices;
  } catch (error) {
    toast.error("Failed to calculate cost prices");
    console.error("Error calculating cost prices:", error);
    return {};
  }
};
