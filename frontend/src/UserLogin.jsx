import React, { useState, useEffect } from 'react';
import './UserLogin.css';

const LOGO_URL = 'https://tse4.mm.bing.net/th/id/OIP.UORK-u3V7UVpyTeEcb0y_QHaHa?rs=1&pid=ImgDetMain&o=7&rm=3';

const UserLogin = ({ onUserSelect }) => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({
    name: '',
    password: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/persons');
      const result = await response.json();
      
      if (result.success) {
        setPersons(result.data);
      } else {
        setError(result.message || 'Fehler beim Laden der Personen');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error fetching persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    setError('');

    if (field === 'name') {
      if (value.length > 0 && value.toLowerCase() !== 'admin') {
        const filtered = persons.filter(person => {
          const fullNameNoSpace = (person.firstName + person.lastName).toLowerCase();
          const fullNameWithSpace = (person.firstName + ' ' + person.lastName).toLowerCase();
          const searchValue = value.toLowerCase();
          
          return fullNameNoSpace.includes(searchValue) || 
                 fullNameWithSpace.includes(searchValue) ||
                 person.firstName.toLowerCase().includes(searchValue) ||
                 person.lastName.toLowerCase().includes(searchValue);
        });
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (person) => {
    const nameValue = person.firstName + person.lastName;
    setLoginForm(prev => ({ ...prev, name: nameValue }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!loginForm.name || !loginForm.password) {
      setError('Bitte füllen Sie alle Felder aus');
      return;
    }

    if (loginForm.password !== '123') {
      setError('Falsches Passwort');
      return;
    }

    // Check for admin login
    if (loginForm.name.toLowerCase() === 'admin') {
      onUserSelect({ id: 'admin', fullName: 'Administrator', isAdmin: true });
      return;
    }

    // Find matching user
    const matchingUser = persons.find(person => {
      const fullNameNoSpace = (person.firstName + person.lastName).toLowerCase();
      return fullNameNoSpace === loginForm.name.toLowerCase();
    });

    if (matchingUser) {
      onUserSelect(matchingUser);
    } else {
      setError('Benutzer nicht gefunden');
    }
  };

  if (loading) {
    return (
      <div className="user-login-container">
        <div className="login-box">
          <h2>Lade Benutzer...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="user-login-container">
      <div className="login-box">
        <div className="login-header">
          <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
          <h2>Anmeldung</h2>
        </div>
        <p className="login-subtitle">Bitte melden Sie sich an</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <div className="autocomplete-container">
              <input
                type="text"
                id="name"
                value={loginForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onFocus={() => {
                  if (loginForm.name.length > 0 && loginForm.name.toLowerCase() !== 'admin') {
                    // Re-trigger filtering when focusing
                    handleInputChange('name', loginForm.name);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicking
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Admin oder Name (z.B. MaxMustermann)"
                className="login-input"
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((person) => (
                    <div
                      key={person.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(person)}
                    >
                      <span className="suggestion-name">{person.firstName}{person.lastName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Passwort:</label>
            <input
              type="password"
              id="password"
              value={loginForm.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="123"
              className="login-input"
            />
          </div>

          <button type="submit" className="login-button">
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
