import React, { useState, useEffect } from 'react';
import './EventParticipationTable.css';

const EventParticipationTable = ({ eventId, eventName }) => {
  const [participation, setParticipation] = useState([]);
  const [allPersons, setAllPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTimeSpanForm, setShowTimeSpanForm] = useState(null);
  const [expandedParticipant, setExpandedParticipant] = useState(null);
  const [newTimeSpan, setNewTimeSpan] = useState({
    date: '',
    timeFrom: '',
    timeTo: '',
    description: ''
  });

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
        await fetchParticipation(); // Refresh data
      } else {
        setError(result.message || 'Fehler beim Aktualisieren des Status');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error updating participation status:', error);
    }
  };

  const addTimeSpan = async (personId) => {
    if (!newTimeSpan.date || !newTimeSpan.timeFrom || !newTimeSpan.timeTo) {
      setError('Datum, Start- und Endzeit sind erforderlich');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/participation/${personId}/timespans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTimeSpan)
      });

      const result = await response.json();
      
      if (result.success) {
        setNewTimeSpan({ date: '', timeFrom: '', timeTo: '', description: '' });
        setShowTimeSpanForm(null);
        setError('');
        await fetchParticipation(); // Refresh data
      } else {
        setError(result.message || 'Fehler beim Hinzufügen der Zeitspanne');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error adding time span:', error);
    }
  };

  const removeTimeSpan = async (personId, timeSpanIndex) => {
    if (!confirm('Zeitspanne wirklich löschen?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/participation/${personId}/timespans/${timeSpanIndex}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchParticipation(); // Refresh data
      } else {
        setError(result.message || 'Fehler beim Löschen der Zeitspanne');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error removing time span:', error);
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

  // Get persons who haven't responded yet
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
              <th>Stunden</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {participation.map((participant) => (
              <React.Fragment key={participant.personId}>
                <tr>
                  <td>
                    <div className="participant-info">
                      <strong>{participant.person}</strong>
                      <small>{participant.email}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(participant.status)}`}>
                      {getStatusText(participant.status)}
                    </span>
                  </td>
                  <td>
                    <div className="hours-column">
                      <span className="hours-display">
                        {participant.totalHours.toFixed(1)}h
                      </span>
                      {participant.timeSpans.length > 0 && (
                        <small className="timespan-count">
                          {participant.timeSpans.length} Einträg{participant.timeSpans.length === 1 ? '' : 'e'}
                        </small>
                      )}
                    </div>
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
                      {participant.status === 'accepted' && (
                        <>
                          <button 
                            className="btn-mini btn-primary"
                            onClick={() => setShowTimeSpanForm(participant.personId)}
                            title="Zeit hinzufügen"
                          >
                            +
                          </button>
                          {participant.timeSpans.length > 0 && (
                            <button 
                              className="btn-mini btn-details"
                              onClick={() => setExpandedParticipant(
                                expandedParticipant === participant.personId ? null : participant.personId
                              )}
                              title="Details anzeigen"
                            >
                              {expandedParticipant === participant.personId ? '▲' : '▼'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                
                {/* Expandable row for time spans */}
                {expandedParticipant === participant.personId && participant.timeSpans.length > 0 && (
                  <tr className="timespan-details-row">
                    <td colSpan="4">
                      <div className="timespan-details">
                        <h5>Zeitspannen für {participant.person}</h5>
                        <div className="time-spans-list">
                          {participant.timeSpans.map((timeSpan, index) => (
                            <div key={index} className="time-span-item">
                              <div className="time-span-info">
                                <span className="time-span-date">
                                  {new Date(timeSpan.date).toLocaleDateString()}
                                </span>
                                <span className="time-span-time">
                                  {timeSpan.timeFrom} - {timeSpan.timeTo}
                                </span>
                                {timeSpan.description && (
                                  <span className="time-span-desc">{timeSpan.description}</span>
                                )}
                              </div>
                              <button 
                                className="btn-remove-timespan"
                                onClick={() => removeTimeSpan(participant.personId, index)}
                                title="Zeitspanne löschen"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* Show unresponsive persons */}
            {getUnresponsivePersons().map((person) => (
              <tr key={`unresponsive-${person.id}`} className="unresponsive-person">
                <td>
                  <div className="participant-info">
                    <strong>{person.fullName}</strong>
                    <small>{person.email}</small>
                  </div>
                </td>
                <td>
                  <span className="status-badge status-pending">
                    Nicht geantwortet
                  </span>
                </td>
                <td>-</td>
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

      {/* Time Span Form */}
      {showTimeSpanForm && (
        <div className="timespan-form-overlay">
          <div className="timespan-form">
            <h4>Zeitspanne hinzufügen</h4>
            <div className="form-row">
              <input
                type="date"
                value={newTimeSpan.date}
                onChange={(e) => setNewTimeSpan({...newTimeSpan, date: e.target.value})}
              />
            </div>
            <div className="form-row">
              <input
                type="time"
                value={newTimeSpan.timeFrom}
                onChange={(e) => setNewTimeSpan({...newTimeSpan, timeFrom: e.target.value})}
                placeholder="Von"
              />
              <input
                type="time"
                value={newTimeSpan.timeTo}
                onChange={(e) => setNewTimeSpan({...newTimeSpan, timeTo: e.target.value})}
                placeholder="Bis"
              />
            </div>
            <div className="form-row">
              <textarea
                value={newTimeSpan.description}
                onChange={(e) => setNewTimeSpan({...newTimeSpan, description: e.target.value})}
                placeholder="Beschreibung (optional)"
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button 
                className="btn-primary" 
                onClick={() => addTimeSpan(showTimeSpanForm)}
              >
                Hinzufügen
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowTimeSpanForm(null);
                  setNewTimeSpan({ date: '', timeFrom: '', timeTo: '', description: '' });
                  setError('');
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
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
            <span className="stat-number">{participation.reduce((sum, p) => sum + p.totalHours, 0).toFixed(1)}h</span>
            <span className="stat-label">Gesamt Stunden</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventParticipationTable;
