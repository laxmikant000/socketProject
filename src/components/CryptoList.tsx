import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CryptoList.css';

interface CoinData {
    symbol: string;
    price: number;
    prevPrice: number;
    changePercent: number;
}

interface CoinStaticInfo {
    name: string;
    icon: string;
}

const COINS: Record<string, CoinStaticInfo> = {
    BTCUSDT: { name: 'Bitcoin', icon: 'https://assets.coincap.io/assets/icons/btc@2x.png' },
    ETHUSDT: { name: 'Ethereum', icon: 'https://assets.coincap.io/assets/icons/eth@2x.png' },
    ETHUSDC: { name: 'Ethereum', icon: 'https://assets.coincap.io/assets/icons/eth@2x.png' },

    BNBUSDT: { name: 'BNB', icon: 'https://assets.coincap.io/assets/icons/bnb@2x.png' },
    ETHCTSI: { name: 'CTSI', icon: 'https://assets.coincap.io/assets/icons/bnb@2x.png' },
    SOLUSDT: { name: 'Solana', icon: 'https://assets.coincap.io/assets/icons/sol@2x.png' },
    XRPUSDT: { name: 'XRP', icon: 'https://assets.coincap.io/assets/icons/xrp@2x.png' },
    ADAUSDT: { name: 'Cardano', icon: 'https://assets.coincap.io/assets/icons/ada@2x.png' },
    DOGEUSDT: { name: 'Dogecoin', icon: 'https://assets.coincap.io/assets/icons/doge@2x.png' },
    DOTUSDT: { name: 'Polkadot', icon: 'https://assets.coincap.io/assets/icons/dot@2x.png' },
    TRXUSDT: { name: 'TRON', icon: 'https://assets.coincap.io/assets/icons/trx@2x.png' },
    LTCUSDT: { name: 'Litecoin', icon: 'https://assets.coincap.io/assets/icons/ltc@2x.png' },
};

const SYMBOLS = Object.keys(COINS);

export default function CryptoList() {
    const [coins, setCoins] = useState<Record<string, CoinData>>({});
    const wsRef = useRef<WebSocket | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Connect to Binance WebSocket
        // Stream format: <symbol>@ticker
        const streams = SYMBOLS.map((s) => `${s.toLowerCase()}@ticker`).join('/');
        const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            console.log('Connected to Binance WebSocket');
        };

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const data = message.data; // The ticker data

            // data.s = Symbol, data.c = Last Price, data.P = Price Change Percent
            if (data && data.s && data.c) {
                setCoins((prevCoins) => {
                    const symbol = data.s;
                    const currentPrice = parseFloat(data.c);
                    const prevPrice = prevCoins[symbol]?.price || currentPrice;

                    return {
                        ...prevCoins,
                        [symbol]: {
                            symbol: symbol,
                            price: currentPrice,
                            prevPrice: prevPrice,
                            changePercent: parseFloat(data.P),
                        },
                    };
                });
            }
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const formatPrice = (price: number, symbol: string) => {
        // For BTC pairs, format as BTC amount
        if (symbol.includes('BTC') && !symbol.startsWith('BTC')) {
            return `${price.toFixed(8)} BTC`;
        }
        // For USD pairs, format as USD currency
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: price < 1 ? 4 : 2,
        }).format(price);
    };

    return (
        <div className="crypto-container">
            <div className="market-layout">
                <div className="market-left-panel">
                    <div className="header">
                        <h1>Market</h1>
                        <div style={{ fontSize: '20px', cursor: 'pointer' }}>🔔</div>
                    </div>

                    <div className="crypto-list">
                        {SYMBOLS.map((symbol) => {
                    const coin = coins[symbol];
                    const staticInfo = COINS[symbol];

                    // Determine direction for arrow and color
                    // We compare price vs prevPrice for the "tick" direction (micro-interaction)
                    // But usually users also want to see the 24h change color.
                    // The user asked: "if up show up arrow if down show dow arraow"
                    // This usually refers to the immediate tick or the 24h trend.
                    // Let's use the 24h change for the text color, and the immediate tick for a flash effect or arrow.
                    // Actually, let's use the arrow for the immediate tick direction if it changed, 
                    // or just default to the 24h change direction if no recent tick.

                    // Let's keep it simple: Arrow reflects 24h change (standard), 
                    // but we can add a "flash" effect for live updates.

                    // Wait, user said: "live update preice of coins ... if up the show up arrow if down show dow arraow"
                    // This strongly implies immediate tick direction.

                    const isPriceUp = coin ? coin.price > coin.prevPrice : false;
                    const isPriceDown = coin ? coin.price < coin.prevPrice : false;

                    // For the arrow next to price, let's use the immediate tick direction if available,
                    // otherwise fallback to 24h change.
                    const priceDirection = isPriceUp ? 'up' : isPriceDown ? 'down' : 'neutral';

                    // 24h Change Color
                    const isPositive24h = coin ? coin.changePercent >= 0 : true;

                    return (
                        <div
                            key={symbol}
                            className={`crypto-item ${isPriceUp ? 'flash-green' : isPriceDown ? 'flash-red' : ''}`}
                            onClick={() => navigate(`/chart?symbol=${symbol}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="coin-info">
                                <div className="coin-icon">
                                    <img src={staticInfo.icon} alt={staticInfo.name} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    {/* Fallback if image fails */}
                                    <span style={{ display: 'none' }}>{symbol.substring(0, 1)}</span>
                                </div>
                                <div className="coin-name-group">
                                    <span className="coin-symbol">{staticInfo.name}</span>
                                    <span className="coin-name">
                                        {symbol.includes('BTC') && !symbol.startsWith('BTC') 
                                            ? symbol.replace('BTC', '/BTC') 
                                            : symbol.replace('USDT', '').replace('USDC', '')}
                                    </span>
                                </div>
                            </div>

                            <div className="price-info">
                                <div className={`current-price ${priceDirection === 'up' ? 'text-green' : priceDirection === 'down' ? 'text-red' : ''}`}>
                                    {coin ? formatPrice(coin.price, symbol) : 'Loading...'}
                                    {priceDirection === 'up' && <span className="arrow">↑</span>}
                                    {priceDirection === 'down' && <span className="arrow">↓</span>}
                                </div>
                                <div className={`price-change ${isPositive24h ? 'text-green' : 'text-red'}`}>
                                    {coin ? `${coin.changePercent > 0 ? '+' : ''}${coin.changePercent.toFixed(2)}%` : '--'}
                                </div>
                            </div>
                        </div>
                    );
                })}
                    </div>
                </div>

                <div className="market-right-panel">
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>Select a cryptocurrency to view details</p>
                    </div>
                </div>
            </div>
        </div>
    );
}



