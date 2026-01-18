import React, { useState, useEffect } from 'react';
import './PersonsTable.css';

const PersonsTable = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newPerson, setNewPerson] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchPersons();
  }, [selectedYear]);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/persons?year=${selectedYear}`);
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

  const handleExportCSV = () => {
    // Create CSV header
    const headers = ['ID', 'Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Geleistete Stunden'];
    
    // Create CSV rows
    const rows = persons.map(person => {
      const nameParts = person.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return [
        person.id,
        firstName,
        lastName,
        person.email || '',
        person.phone || '',
        person.totalHours || 0
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Mitglieder_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i <= 5; i++) {
    yearOptions.push(currentYear - i);
  }

  if (loading) {
    return <div className="loading">Lade Personen...</div>;
  }

  return (
    <div className="persons-table-container">
      <div className="persons-header">
        <h2>Personen Verwaltung</h2>
        <div className="header-controls">
          <div className="year-filter">
            <label htmlFor="year-select">Jahr:</label>
            <select 
              id="year-select"
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="year-select"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="header-buttons">
            <button 
              className="btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              + Person hinzufügen
            </button>
            <button 
              className="btn-secondary"
              onClick={() => alert('Excel-Import wird noch implementiert')}
            >
              📊 Excel importieren
            </button>
            <button 
              className="btn-secondary"
              onClick={handleExportCSV}
            >
              📥 CSV exportieren
            </button>
          </div>
        </div>
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
              <th>Geleistete Stunden</th>
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
                <td className="hours-cell">{person.totalHours || 0} h</td>
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
