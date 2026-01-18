import React, { useState, useEffect } from 'react';
import './UserLogin.css';

const LOGO_URL = 'https://tse4.mm.bing.net/th/id/OIP.UORK-u3V7UVpyTeEcb0y_QHaHa?rs=1&pid=ImgDetMain&o=7&rm=3';

const UserLogin = ({ onUserSelect }) => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handlePersonSelect = (person) => {
    onUserSelect(person);
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
          <h2>Als wer möchten Sie sich anmelden?</h2>
        </div>
        <p className="login-subtitle">Wählen Sie Ihren Namen aus der Liste:</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="persons-grid">
          {persons.map((person) => (
            <button 
              key={person.id}
              className="person-card"
              onClick={() => handlePersonSelect(person)}
            >
              <div className="person-name">{person.fullName}</div>
              <div className="person-email">{person.email}</div>
            </button>
          ))}
        </div>
        
        <div className="admin-access">
          <button 
            className="admin-button"
            onClick={() => onUserSelect({ id: 'admin', fullName: 'Administrator', isAdmin: true })}
          >
            🔧 Admin-Zugang
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
