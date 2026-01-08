import React, { useState, useEffect } from 'react';
import './PersonsTable.css';

const PersonsTable = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

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

  const handleAddPerson = async () => {
    if (!newPerson.firstName.trim() || !newPerson.lastName.trim()) {
      setError('Vor- und Nachname sind erforderlich');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/persons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPerson)
      });

      const result = await response.json();
      
      if (result.success) {
        setPersons([...persons, result.data]);
        setNewPerson({ firstName: '', lastName: '', email: '', phone: '' });
        setShowAddForm(false);
        setError('');
      } else {
        setError(result.message || 'Fehler beim Erstellen der Person');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error creating person:', error);
    }
  };

  if (loading) {
    return <div className="loading">Lade Personen...</div>;
  }

  return (
    <div className="persons-table-container">
      <div className="persons-header">
        <h2>Personen Verwaltung</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          + Person hinzufügen
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <div className="add-person-form">
          <h3>Neue Person hinzufügen</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Vorname*"
              value={newPerson.firstName}
              onChange={(e) => setNewPerson({...newPerson, firstName: e.target.value})}
            />
            <input
              type="text"
              placeholder="Nachname*"
              value={newPerson.lastName}
              onChange={(e) => setNewPerson({...newPerson, lastName: e.target.value})}
            />
          </div>
          <div className="form-row">
            <input
              type="email"
              placeholder="E-Mail (optional)"
              value={newPerson.email}
              onChange={(e) => setNewPerson({...newPerson, email: e.target.value})}
            />
            <input
              type="text"
              placeholder="Telefon (optional)"
              value={newPerson.phone}
              onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleAddPerson}>
              Hinzufügen
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setShowAddForm(false);
                setNewPerson({ firstName: '', lastName: '', email: '', phone: '' });
                setError('');
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <div className="persons-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Telefon</th>
            </tr>
          </thead>
          <tbody>
            {persons.map((person) => (
              <tr key={person.id}>
                <td>{person.id}</td>
                <td>
                  <div className="person-name">
                    <strong>{person.fullName}</strong>
                  </div>
                </td>
                <td>{person.email}</td>
                <td>{person.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {persons.length === 0 && (
          <div className="no-data">
            Keine Personen vorhanden
          </div>
        )}
      </div>

      <div className="persons-stats">
        <div className="stat-item">
          <span className="stat-number">{persons.length}</span>
          <span className="stat-label">Personen registriert</span>
        </div>
      </div>
    </div>
  );
};

export default PersonsTable;
