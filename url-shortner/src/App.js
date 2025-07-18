import React, { useState } from 'react';

const logAction = (action, data) => console.log(`[LOG] ${action}:`, data);

function App() {
  const [urls, setUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState('shortener');
  const [originalUrl, setOriginalUrl] = useState('');
  const [validity, setValidity] = useState(30);
  const [customCode, setCustomCode] = useState('');

  const generateShortCode = () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('').sort(() => Math.random() - 0.5).slice(0, 6).join('');

  const isValidUrl = (url) => { try { new URL(url); return true; } catch { return false; } };

  const isUniqueCode = (code) => !urls.some(url => url.shortCode === code);

  const shortenUrl = () => {
    if (!originalUrl) return alert('Please enter a URL');
    if (!isValidUrl(originalUrl)) return alert('Please enter a valid URL');
    if (validity < 1) return alert('Validity must be at least 1 minute');

    let shortCode = customCode || generateShortCode();
    if (customCode && !isUniqueCode(shortCode)) return alert('This short code is already taken');

    const newUrl = {
      id: Date.now(),
      originalUrl,
      shortCode,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + validity * 60000),
      clicks: 0,
      clickDetails: []
    };

    setUrls([...urls, newUrl]);
    logAction('URL_CREATED', newUrl);
    setOriginalUrl('');
    setValidity(30);
    setCustomCode('');
    alert('URL shortened successfully!');
  };

  const handleShortLinkClick = (shortCode) => {
    const urlEntry = urls.find(url => url.shortCode === shortCode);
    if (!urlEntry) return alert('Short link not found');
    if (new Date() > urlEntry.expiresAt) return alert('This short link has expired');

    const clickData = { timestamp: new Date(), source: 'direct', location: 'Unknown' };
    
    setUrls(urls.map(url => url.shortCode === shortCode ? 
      { ...url, clicks: url.clicks + 1, clickDetails: [...url.clickDetails, clickData] } : url));
    
    logAction('LINK_CLICKED', { shortCode, clickData });
    window.open(urlEntry.originalUrl, '_blank');
  };

  const inputStyle = { width: '100%', padding: '8px', marginTop: '5px' };
  const buttonStyle = { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' };
  const cardStyle = { border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' };

  return (
  <div style={{ fontFamily: 'Arial, sans-serif' }}>
  <nav style={{ backgroundColor: '#f8f9fa', padding: '10px', borderBottom: '1px solid #ccc' }}>
  {['shortener', 'stats'].map(page => (
  <button key={page} onClick={() => setCurrentPage(page)} style={{ 
  marginRight: '10px', padding: '8px 16px', 
  backgroundColor: currentPage === page ? '#007bff' : 'white',
  color: currentPage === page ? 'white' : 'black',
  border: '1px solid #ccc', cursor: 'pointer'
  }}>
  {page === 'shortener' ? 'URL Shortener' : 'Statistics'}
  </button>
  ))}
  </nav>
  <div style={{ padding: '20px', maxWidth: currentPage === 'shortener' ? '600px' : '800px', margin: '0 auto' }}>
  {currentPage === 'shortener' ? (
          <>
            <h2>URL Shortener</h2>
            <div style={{ marginBottom: '30px' }}>
              {[
                { label: 'Original URL:', value: originalUrl, setter: setOriginalUrl, placeholder: 'https://example.com', type: 'text' },
                { label: 'Validity (minutes):', value: validity, setter: setValidity, min: 1, type: 'number' },
                { label: 'Custom Short Code (optional):', value: customCode, setter: setCustomCode, placeholder: 'mycode123', type: 'text' }
              ].map(({ label, value, setter, placeholder, type, min }) => (
                <div key={label} style={{ marginBottom: '15px' }}>
                  <label>{label}</label>
                  <input type={type} value={value} onChange={(e) => setter(type === 'number' ? parseInt(e.target.value) || 30 : e.target.value)} 
                    placeholder={placeholder} min={min} style={inputStyle} />
                </div>
              ))}
              <button onClick={shortenUrl} style={buttonStyle}>Shorten URL</button>
            </div>
            
            <h3>Your Shortened URLs:</h3>
            {urls.length === 0 ? <p>No URLs shortened yet.</p> : 
              urls.map(url => (
                <div key={url.id} style={cardStyle}>
                  <p><strong>Original:</strong> {url.originalUrl}</p>
                  <p><strong>Short Link:</strong> 
                    <button onClick={() => handleShortLinkClick(url.shortCode)} 
                      style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                      http://localhost:3000/{url.shortCode}
                    </button>
                  </p>
                  <p><strong>Expires:</strong> {url.expiresAt.toLocaleString()}</p>
                  <p><strong>Clicks:</strong> {url.clicks}</p>
                </div>
              ))
            }
          </>
        ) : (
          <>
            <h2>URL Statistics</h2>
            {urls.length === 0 ? <p>No URLs to show statistics for.</p> :
              urls.map(url => (
                <div key={url.id} style={{ ...cardStyle, padding: '15px' }}>
                  <h3>Short Code: {url.shortCode}</h3>
                  <p><strong>Original URL:</strong> {url.originalUrl}</p>
                  <p><strong>Created:</strong> {url.createdAt.toLocaleString()}</p>
                  <p><strong>Expires:</strong> {url.expiresAt.toLocaleString()}</p>
                  <p><strong>Total Clicks:</strong> {url.clicks}</p>
                  {url.clickDetails.length > 0 && (
                    <div>
                      <h4>Click Details:</h4>
                      {url.clickDetails.map((click, index) => (
                        <div key={index} style={{ backgroundColor: '#f8f9fa', padding: '5px', margin: '5px 0', borderRadius: '3px' }}>
                          <p><strong>Time:</strong> {click.timestamp.toLocaleString()}</p>
                          <p><strong>Source:</strong> {click.source}</p>
                          <p><strong>Location:</strong> {click.location}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            }
          </>
        )}
      </div>
    </div>
  );
}

export default App;