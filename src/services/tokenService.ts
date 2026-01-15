// Chain IDs and their corresponding CoinGecko platform IDs
export const CHAIN_PLATFORMS: Record<string, string> = {
    '1': 'ethereum',           // Ethereum Mainnet
    '56': 'binance-smart-chain', // BSC
    '137': 'polygon-pos',       // Polygon
    '42161': 'arbitrum-one',    // Arbitrum
    '10': 'optimistic-ethereum', // Optimism
    '43114': 'avalanche',       // Avalanche
    '250': 'fantom',            // Fantom
    '8453': 'base',             // Base
    '100': 'xdai',              // Gnosis Chain
    '42220': 'celo',            // Celo
    '25': 'cronos',             // Cronos
    '1284': 'moonbeam',         // Moonbeam
    '1285': 'moonriver',        // Moonriver
};

// Chain names mapping
export const CHAIN_NAMES: Record<string, string> = {
    '1': 'Ethereum',
    '56': 'BNB Smart Chain',
    '137': 'Polygon',
    '42161': 'Arbitrum',
    '10': 'Optimism',
    '43114': 'Avalanche',
    '250': 'Fantom',
    '8453': 'Base',
    '100': 'Gnosis',
    '42220': 'Celo',
    '25': 'Cronos',
    '1284': 'Moonbeam',
    '1285': 'Moonriver',
};

export interface TokenInfo {
    symbol: string;
    name: string;
    decimals: number;
    logo?: string;
    price?: number;
    priceChange24h?: number;
}

export interface TokenMetadata {
    address: string;
    chainId: string;
    symbol: string;
    name: string;
    decimals: number;
    logo?: string;
}

/**
 * Get token symbol and metadata from contract address using CoinGecko API
 * @param contractAddress - The token contract address
 * @param chainId - The chain ID (e.g., '1' for Ethereum, '56' for BSC)
 * @returns Promise with token metadata
 */
export async function getTokenSymbolFromAddress(
    contractAddress: string,
    chainId: string
): Promise<TokenMetadata | null> {
    try {
        const platform = CHAIN_PLATFORMS[chainId];
        if (!platform) {
            throw new Error(`Unsupported chain ID: ${chainId}`);
        }

        // CoinGecko API endpoint for token info by contract address
        const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${contractAddress.toLowerCase()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Token not found for address ${contractAddress} on chain ${chainId}`);
                return null;
            }
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
            address: contractAddress,
            chainId: chainId,
            symbol: data.symbol?.toUpperCase() || 'UNKNOWN',
            name: data.name || 'Unknown Token',
            decimals: data.detail_platforms?.[platform]?.decimal_place || 18,
            logo: data.image?.small || data.image?.thumb || undefined,
        };
    } catch (error) {
        console.error(`Error fetching token symbol for ${contractAddress} on chain ${chainId}:`, error);
        return null;
    }
}

/**
 * Get multiple token symbols from contract addresses in batch
 * @param tokens - Array of { address, chainId } objects
 * @returns Promise with array of token metadata
 */
export async function getTokenSymbolsBatch(
    tokens: Array<{ address: string; chainId: string }>
): Promise<TokenMetadata[]> {
    const promises = tokens.map(({ address, chainId }) =>
        getTokenSymbolFromAddress(address, chainId)
    );
    
    const results = await Promise.all(promises);
    return results.filter((result): result is TokenMetadata => result !== null);
}

/**
 * Get token price and 24h change from CoinGecko
 * @param contractAddress - The token contract address
 * @param chainId - The chain ID
 * @returns Promise with price info
 */
export async function getTokenPrice(
    contractAddress: string,
    chainId: string
): Promise<{ price: number; priceChange24h: number } | null> {
    try {
        const platform = CHAIN_PLATFORMS[chainId];
        if (!platform) {
            throw new Error(`Unsupported chain ID: ${chainId}`);
        }

        const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contractAddress.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const tokenData = data[contractAddress.toLowerCase()];
        
        if (!tokenData) {
            return null;
        }

        return {
            price: tokenData.usd || 0,
            priceChange24h: tokenData.usd_24h_change || 0,
        };
    } catch (error) {
        console.error(`Error fetching token price for ${contractAddress}:`, error);
        return null;
    }
}

/**
 * Get complete token info (symbol, name, price, etc.) from contract address
 * @param contractAddress - The token contract address
 * @param chainId - The chain ID
 * @returns Promise with complete token info
 */
export async function getTokenInfo(
    contractAddress: string,
    chainId: string
): Promise<TokenInfo | null> {
    try {
        const [metadata, priceData] = await Promise.all([
            getTokenSymbolFromAddress(contractAddress, chainId),
            getTokenPrice(contractAddress, chainId),
        ]);

        if (!metadata) {
            return null;
        }

        return {
            symbol: metadata.symbol,
            name: metadata.name,
            decimals: metadata.decimals,
            logo: metadata.logo,
            price: priceData?.price,
            priceChange24h: priceData?.priceChange24h,
        };
    } catch (error) {
        console.error(`Error fetching token info for ${contractAddress}:`, error);
        return null;
    }
}

/**
 * Get Binance ticker symbol from contract address and chain
 * This maps the token to its Binance trading pair (e.g., BTCUSDT)
 * @param contractAddress - The token contract address
 * @param chainId - The chain ID
 * @returns Promise with Binance ticker symbol or null
 */
export async function getBinanceTickerFromAddress(
    contractAddress: string,
    chainId: string
): Promise<string | null> {
    try {
        const tokenInfo = await getTokenSymbolFromAddress(contractAddress, chainId);
        if (!tokenInfo) {
            return null;
        }

        // Map token symbol to Binance ticker format
        // Common mappings - you can extend this
        const symbolToTicker: Record<string, string> = {
            'BTC': 'BTCUSDT',
            'ETH': 'ETHUSDT',
            'BNB': 'BNBUSDT',
            'SOL': 'SOLUSDT',
            'XRP': 'XRPUSDT',
            'ADA': 'ADAUSDT',
            'DOGE': 'DOGEUSDT',
            'DOT': 'DOTUSDT',
            'TRX': 'TRXUSDT',
            'LTC': 'LTCUSDT',
        };

        return symbolToTicker[tokenInfo.symbol] || null;
    } catch (error) {
        console.error(`Error getting Binance ticker for ${contractAddress}:`, error);
        return null;
    }
}

