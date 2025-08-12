import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    amount: '',
    name: '',
    email: '',
    phone: '',
    amountDirection: 'sending'
  });
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [nilaPrice, setNilaPrice] = useState(null);
  const [nilaAmount, setNilaAmount] = useState(0);

  const ACCOUNT_REF_ID = 'dfkvch5vrd0d57sowjqnt17y';
  const FIXED_WALLET_ADDRESS = '0x6B992443ead5c751df1dDBBd35DD1E7b3f319B36';

  // Fetch NILA token price on component mount
  useEffect(() => {
    fetchNilaPrice();
  }, []);

  // Calculate NILA amount when USD amount changes
  useEffect(() => {
    if (formData.amount && nilaPrice) {
      const usdAmount = parseFloat(formData.amount);
      if (!isNaN(usdAmount) && usdAmount > 0) {
        const calculatedNila = usdAmount / nilaPrice;
        setNilaAmount(calculatedNila);
      } else {
        setNilaAmount(0);
      }
    } else {
      setNilaAmount(0);
    }
  }, [formData.amount, nilaPrice]);

  const fetchNilaPrice = async () => {
    try {
      // Using a proxy API to fetch CoinMarketCap data
      // In production, you should use your own backend API with proper API keys
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=mindwavedao&vs_currencies=usd');
      if (response.data && response.data.mindwavedao) {
        setNilaPrice(response.data.mindwavedao.usd);
      } else {
        // Fallback price if API fails
        setNilaPrice(0.001); // You should update this with actual price
      }
    } catch (err) {
      console.error('Error fetching NILA price:', err);
      // Fallback price
      setNilaPrice(0.001);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveToDatabase = async (sessionData) => {
    try {
      // This will be called after successful payment session creation
      // You'll need to set up an API endpoint to handle this
      await axios.post('/api/save-transaction', {
        sessionId: sessionData.sessionId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        usdAmount: formData.amount,
        nilaAmount: nilaAmount,
        walletAddress: FIXED_WALLET_ADDRESS,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving to database:', err);
      // Continue with payment even if database save fails
    }
  };

  const createPaymentSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        accountRefId: ACCOUNT_REF_ID,
        fromCurrency: 'USD',
        toCurrency: 'USDC',
        address: FIXED_WALLET_ADDRESS,
        amountDirection: formData.amountDirection,
        method: 'card'
      };

      // Add amount based on direction
      if (formData.amountDirection === 'sending') {
        payload.fromAmount = parseFloat(formData.amount);
      } else {
        payload.toAmount = parseFloat(formData.amount);
      }

      const response = await axios.post('/api/session', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.sessionId) {
        setSessionId(response.data.sessionId);
        
        // Save transaction data to database
        await saveToDatabase(response.data);
        
        setShowIframe(true);
      } else {
        throw new Error('No session ID received');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create payment session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    createPaymentSession();
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      name: '',
      email: '',
      phone: '',
      amountDirection: 'sending'
    });
    setSessionId(null);
    setShowIframe(false);
    setError(null);
    setNilaAmount(0);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="/mindwave-logo.webp" alt="MindWaveDAO" className="logo" />
        <h1>Buy NILA Tokens</h1>
        <p className="subtitle">Purchase NILA tokens using USD via Instaxchange</p>
      </header>

      <main className="App-main">
        {!showIframe ? (
          <div className="exchange-form-container">
            <form onSubmit={handleSubmit} className="exchange-form">
              <div className="token-info">
                {nilaPrice && (
                  <div className="price-display">
                    <p>Current NILA Price: <span className="price">${nilaPrice.toFixed(6)} USD</span></p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount">USD Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter USD amount"
                  className="form-control"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              {formData.amount && nilaPrice && nilaAmount > 0 && (
                <div className="conversion-display">
                  <p>You will receive approximately:</p>
                  <p className="nila-amount">{nilaAmount.toFixed(2)} NILA</p>
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Creating Session...' : 'Continue to Payment'}
              </button>
            </form>

            <div className="info-section">
              <h3>How it works:</h3>
              <ol>
                <li>Enter your personal information</li>
                <li>Specify the USD amount you want to spend</li>
                <li>See how many NILA tokens you'll receive</li>
                <li>Complete the payment through Instaxchange</li>
                <li>NILA tokens will be sent to your wallet</li>
              </ol>
              <p className="wallet-note">
                <small>Tokens will be sent to the official MindWaveDAO wallet for distribution.</small>
              </p>
            </div>
          </div>
        ) : (
          <div className="iframe-container">
            <div className="iframe-header">
              <h2>Complete Your Payment</h2>
              <button onClick={resetForm} className="back-button">
                ← Start New Transaction
              </button>
            </div>
            
            <div className="transaction-summary">
              <h3>Transaction Summary</h3>
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>USD Amount:</strong> ${formData.amount}</p>
              <p><strong>NILA Tokens:</strong> {nilaAmount.toFixed(2)} NILA</p>
            </div>
            
            <iframe
              src={`https://instaxchange.com/embed/${sessionId}`}
              title="Instaxchange Payment"
              className="payment-iframe"
              allow="payment"
            />
            
            <div className="iframe-info">
              <p>Complete your payment in the secure Instaxchange window above.</p>
              <p>Session ID: {sessionId}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
