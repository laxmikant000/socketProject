
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Activity } from 'lucide-react';
import './ChartPage.css';

const INTERVALS = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' },
];

const COINS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'DOTUSDT', 'TRXUSDT', 'LTCUSDT'
];

const ChartPage: React.FC = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [symbol, setSymbol] = useState(searchParams.get('symbol') || 'BTCUSDT');
    const [interval, setInterval] = useState('1h');
    const [price, setPrice] = useState<number | null>(null);
    const [prevPrice, setPrevPrice] = useState<number | null>(null);

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0f1114' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const newSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        chartRef.current = chart;
        seriesRef.current = newSeries;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ 
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Fetch Historical Data & Connect WebSocket
    useEffect(() => {
        if (!seriesRef.current) return;

        // 1. Fetch Historical Data
        const fetchHistory = async () => {
            try {
                const response = await fetch(
                    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`
                );
                const data = await response.json();

                const formattedData = data.map((d: any) => ({
                    time: (d[0] / 1000) as UTCTimestamp,
                    open: parseFloat(d[1]),
                    high: parseFloat(d[2]),
                    low: parseFloat(d[3]),
                    close: parseFloat(d[4]),
                }));

                seriesRef.current?.setData(formattedData);

                // Set initial price
                if (formattedData.length > 0) {
                    const lastCandle = formattedData[formattedData.length - 1];
                    setPrice(lastCandle.close);
                }
            } catch (error) {
                console.error('Error fetching historical data:', error);
            }
        };

        fetchHistory();

        // 2. Connect WebSocket
        if (wsRef.current) wsRef.current.close();

        const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const kline = message.k;

            const candle = {
                time: (kline.t / 1000) as UTCTimestamp,
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
            };

            seriesRef.current?.update(candle);

            setPrice((prev) => {
                setPrevPrice(prev);
                return candle.close;
            });
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [symbol, interval]);

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: p < 1 ? 4 : 2,
        }).format(p);
    };

    return (
        <div className="chart-page-container">
            <div className="chart-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="symbol-selector">
                    <Activity className="icon" size={20} />
                    <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                        {COINS.map(c => (
                            <option key={c} value={c}>{c.replace('USDT', '')}</option>
                        ))}
                    </select>
                </div>

                <div className="price-display">
                    <span className={`price ${price && prevPrice && price > prevPrice ? 'text-green' : 'text-red'}`}>
                        {price ? formatPrice(price) : 'Loading...'}
                    </span>
                </div>

                <div className="interval-selector">
                    <Clock className="icon" size={18} />
                    {INTERVALS.map((int) => (
                        <button
                            key={int.value}
                            className={`interval-btn ${interval === int.value ? 'active' : ''}`}
                            onClick={() => setInterval(int.value)}
                        >
                            {int.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-wrapper" ref={chartContainerRef}></div>
        </div>
    );
};

export default ChartPage;
