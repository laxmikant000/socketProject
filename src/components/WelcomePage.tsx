import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BarChart2, Activity, ArrowRight } from 'lucide-react';
import './WelcomePage.css';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <header className="welcome-header">
                    <div className="logo-container">
                        <Activity className="logo-icon" size={40} />
                        <h1 className="app-title">CryptoPulse</h1>
                    </div>
                    <p className="app-subtitle">Real-time market insights & professional charting</p>
                </header>

                <div className="cards-container">
                    <div className="nav-card market-card" onClick={() => navigate('/market')}>
                        <div className="card-icon-wrapper">
                            <TrendingUp size={48} />
                        </div>
                        <div className="card-content">
                            <h2>Live Market</h2>
                            <p>Track top cryptocurrencies with real-time price updates and 24h changes.</p>
                            <span className="card-action">View Market <ArrowRight size={16} /></span>
                        </div>
                    </div>

                    <div className="nav-card chart-card" onClick={() => navigate('/chart')}>
                        <div className="card-icon-wrapper">
                            <BarChart2 size={48} />
                        </div>
                        <div className="card-content">
                            <h2>Pro Charts</h2>
                            <p>Advanced technical analysis with interactive TradingView-style charts.</p>
                            <span className="card-action">Open Charts <ArrowRight size={16} /></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="background-animation">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>
        </div>
    );
};

export default WelcomePage;
