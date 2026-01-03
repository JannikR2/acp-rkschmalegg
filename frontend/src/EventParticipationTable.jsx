import React, { useState, useEffect } from 'react';
import './EventParticipationTable.css';

const EventParticipationTable = ({ eventId, eventName }) => {
  const [participation, setParticipation] = useState([]);
  const [allPersons, setAllPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventId) {
      fetchParticipation();
      fetchAllPersons();
    }
  }, [eventId]);

  const fetchParticipation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/participation`);
      const result = await response.json();
      
      if (result.success) {
        setParticipation(result.data);
      } else {
        setError(result.message || 'Fehler beim Laden der Teilnahmedaten');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error fetching participation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPersons = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/persons');
      const result = await response.json();
      
      if (result.success) {
        setAllPersons(result.data);
      }
    } catch (error) {
      console.error('Error fetching persons:', error);
    }
  };

  const updateParticipationStatus = async (personId, status) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/participation/${personId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchParticipation();
      } else {
        setError(result.message || 'Fehler beim Aktualisieren des Status');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error updating participation status:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted': return 'status-accepted';
      case 'declined': return 'status-declined';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return 'Zugesagt';
      case 'declined': return 'Abgesagt';
      case 'pending': return 'Ausstehend';
      default: return 'Ausstehend';
    }
  };

  const getUnresponsivePersons = () => {
    const participantIds = new Set(participation.map(p => p.personId));
    return allPersons.filter(person => !participantIds.has(person.id));
  };

  if (loading) {
    return <div className="loading">Lade Teilnahmedaten...</div>;
  }

  return (
    <div className="participation-table-container">
      <h3>Teilnahme für "{eventName}"</h3>
      
      {error && <div className="error-message">{error}</div>}

      <div className="participation-table">
        <table>
          <thead>
            <tr>
              <th>Teilnehmer</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {participation.map((participant) => (
              <tr key={participant.personId}>
                <td>
                  <div className="participant-info">
                    <strong>{participant.person}</strong>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(participant.status)}`}>
                    {getStatusText(participant.status)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons-compact">
                    {participant.status !== 'accepted' && (
                      <button 
                        className="btn-mini btn-accept"
                        onClick={() => updateParticipationStatus(participant.personId, 'accepted')}
                        title="Zusagen"
                      >
                        ✓
                      </button>
                    )}
                    {participant.status !== 'declined' && (
                      <button 
                        className="btn-mini btn-decline"
                        onClick={() => updateParticipationStatus(participant.personId, 'declined')}
                        title="Absagen"
                      >
                        ✗
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {getUnresponsivePersons().map((person) => (
              <tr key={`unresponsive-${person.id}`} className="unresponsive-person">
                <td>
                  <div className="participant-info">
                    <strong>{person.fullName}</strong>
                  </div>
                </td>
                <td>
                  <span className="status-badge status-pending">
                    Nicht geantwortet
                  </span>
                </td>
                <td>
                  <div className="action-buttons-compact">
                    <button 
                      className="btn-mini btn-accept"
                      onClick={() => updateParticipationStatus(person.id, 'accepted')}
                      title="Zusagen"
                    >
                      ✓
                    </button>
                    <button 
                      className="btn-mini btn-decline"
                      onClick={() => updateParticipationStatus(person.id, 'declined')}
                      title="Absagen"
                    >
                      ✗
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {participation.length === 0 && getUnresponsivePersons().length === 0 && (
          <div className="no-data">
            Keine Teilnahmedaten vorhanden
          </div>
        )}
      </div>

      <div className="participation-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{participation.filter(p => p.status === 'accepted').length}</span>
            <span className="stat-label">Zugesagt</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{participation.filter(p => p.status === 'declined').length}</span>
            <span className="stat-label">Abgesagt</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{getUnresponsivePersons().length}</span>
            <span className="stat-label">Keine Antwort</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventParticipationTable;
