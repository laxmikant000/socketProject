import { useState } from 'react';
import { getTokenInfo, getBinanceTickerFromAddress, CHAIN_NAMES } from '../services/tokenService';
import './TokenLookup.css';

export default function TokenLookup() {
    const [contractAddress, setContractAddress] = useState('');
    const [chainId, setChainId] = useState('1'); // Default to Ethereum
    const [tokenInfo, setTokenInfo] = useState<any>(null);
    const [binanceTicker, setBinanceTicker] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async () => {
        if (!contractAddress.trim()) {
            setError('Please enter a contract address');
            return;
        }

        setLoading(true);
        setError(null);
        setTokenInfo(null);
        setBinanceTicker(null);

        try {
            const info = await getTokenInfo(contractAddress, chainId);
            if (info) {
                setTokenInfo(info);
                
                // Try to get Binance ticker
                const ticker = await getBinanceTickerFromAddress(contractAddress, chainId);
                setBinanceTicker(ticker);
            } else {
                setError('Token not found. Please check the contract address and chain.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch token information');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="token-lookup-container">
            <h2>Token Lookup by Contract Address</h2>
            
            <div className="lookup-form">
                <div className="form-group">
                    <label htmlFor="chainId">Chain:</label>
                    <select
                        id="chainId"
                        value={chainId}
                        onChange={(e) => setChainId(e.target.value)}
                        disabled={loading}
                    >
                        {Object.entries(CHAIN_NAMES).map(([id, name]) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="contractAddress">Contract Address:</label>
                    <input
                        id="contractAddress"
                        type="text"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder="0x..."
                        disabled={loading}
                    />
                </div>

                <button onClick={handleLookup} disabled={loading}>
                    {loading ? 'Looking up...' : 'Lookup Token'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {tokenInfo && (
                <div className="token-info-card">
                    <div className="token-header">
                        {tokenInfo.logo && (
                            <img src={tokenInfo.logo} alt={tokenInfo.symbol} className="token-logo" />
                        )}
                        <div>
                            <h3>{tokenInfo.name}</h3>
                            <p className="token-symbol">{tokenInfo.symbol}</p>
                        </div>
                    </div>

                    <div className="token-details">
                        <div className="detail-item">
                            <span className="label">Symbol:</span>
                            <span className="value">{tokenInfo.symbol}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Name:</span>
                            <span className="value">{tokenInfo.name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Decimals:</span>
                            <span className="value">{tokenInfo.decimals}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Chain:</span>
                            <span className="value">{CHAIN_NAMES[chainId]}</span>
                        </div>
                        {tokenInfo.price !== undefined && (
                            <div className="detail-item">
                                <span className="label">Price (USD):</span>
                                <span className="value">
                                    ${tokenInfo.price.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 6,
                                    })}
                                </span>
                            </div>
                        )}
                        {tokenInfo.priceChange24h !== undefined && (
                            <div className="detail-item">
                                <span className="label">24h Change:</span>
                                <span className={`value ${tokenInfo.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                                    {tokenInfo.priceChange24h >= 0 ? '+' : ''}
                                    {tokenInfo.priceChange24h.toFixed(2)}%
                                </span>
                            </div>
                        )}
                        {binanceTicker && (
                            <div className="detail-item highlight">
                                <span className="label">Binance Ticker:</span>
                                <span className="value">{binanceTicker}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

