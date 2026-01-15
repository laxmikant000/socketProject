# Token Service - Get Ticker Symbols from Contract Addresses

This service allows you to fetch token information (symbol, name, price, etc.) from contract addresses across multiple blockchain networks.

## Supported Chains

- Ethereum (Chain ID: 1)
- BNB Smart Chain (Chain ID: 56)
- Polygon (Chain ID: 137)
- Arbitrum (Chain ID: 42161)
- Optimism (Chain ID: 10)
- Avalanche (Chain ID: 43114)
- Fantom (Chain ID: 250)
- Base (Chain ID: 8453)
- Gnosis Chain (Chain ID: 100)
- Celo (Chain ID: 42220)
- Cronos (Chain ID: 25)
- Moonbeam (Chain ID: 1284)
- Moonriver (Chain ID: 1285)

## Usage Examples

### 1. Get Token Symbol from Contract Address

```typescript
import { getTokenSymbolFromAddress } from './services/tokenService';

// Get USDC token info on Ethereum
const tokenInfo = await getTokenSymbolFromAddress(
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC contract address
    '1' // Ethereum chain ID
);

console.log(tokenInfo);
// Output:
// {
//   address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
//   chainId: '1',
//   symbol: 'USDC',
//   name: 'USD Coin',
//   decimals: 6,
//   logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
// }
```

### 2. Get Complete Token Info (Symbol + Price)

```typescript
import { getTokenInfo } from './services/tokenService';

// Get WETH token info on Ethereum
const tokenInfo = await getTokenInfo(
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH contract address
    '1' // Ethereum chain ID
);

console.log(tokenInfo);
// Output:
// {
//   symbol: 'WETH',
//   name: 'Wrapped Ether',
//   decimals: 18,
//   logo: '...',
//   price: 2500.50,
//   priceChange24h: 2.5
// }
```

### 3. Get Binance Ticker Symbol

```typescript
import { getBinanceTickerFromAddress } from './services/tokenService';

// Get Binance ticker for a token
const ticker = await getBinanceTickerFromAddress(
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETH on BSC
    '56' // BSC chain ID
);

console.log(ticker); // 'ETHUSDT'
```

### 4. Batch Lookup Multiple Tokens

```typescript
import { getTokenSymbolsBatch } from './services/tokenService';

const tokens = [
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', chainId: '1' }, // USDC on Ethereum
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', chainId: '56' }, // USDC on BSC
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', chainId: '137' }, // USDC on Polygon
];

const results = await getTokenSymbolsBatch(tokens);
console.log(results);
```

### 5. Get Token Price Only

```typescript
import { getTokenPrice } from './services/tokenService';

const priceInfo = await getTokenPrice(
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '1' // Ethereum
);

console.log(priceInfo);
// Output:
// {
//   price: 1.00,
//   priceChange24h: 0.01
// }
```

## React Component Usage

You can use the `TokenLookup` component in your app:

```tsx
import TokenLookup from './components/TokenLookup';

function MyApp() {
    return <TokenLookup />;
}
```

Or navigate to `/token-lookup` route if it's added to your router.

## API Rate Limits

The CoinGecko API has rate limits:
- Free tier: 10-50 calls/minute
- For production, consider using an API key or implementing caching

## Error Handling

All functions return `null` if the token is not found or an error occurs. Always check for null values:

```typescript
const tokenInfo = await getTokenSymbolFromAddress(address, chainId);
if (!tokenInfo) {
    console.error('Token not found');
    return;
}
```

## Notes

- Contract addresses are case-insensitive (automatically converted to lowercase)
- The service uses CoinGecko API which may not have all tokens
- For tokens not on CoinGecko, you may need to use direct blockchain calls (e.g., with ethers.js)

