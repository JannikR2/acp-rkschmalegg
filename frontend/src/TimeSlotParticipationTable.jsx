import React, { useState, useEffect } from 'react';
import './TimeSlotParticipationTable.css';

const TimeSlotParticipationTable = ({ eventId, timeSlotId, timeSlotName, maxParticipants, onParticipationChange }) => {
  const [participation, setParticipation] = useState([]);
  const [allPersons, setAllPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventId && timeSlotId) {
      fetchParticipation();
      fetchAllPersons();
    }
  }, [eventId, timeSlotId]);

  const fetchParticipation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/timeslots/${timeSlotId}/participation`);
      const result = await response.json();
      
      if (result.success) {
        setParticipation(result.data);
      } else {
        setError(result.message || 'Fehler beim Laden der Teilnahmedaten');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error fetching timeslot participation:', error);
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
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/timeslots/${timeSlotId}/participation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personId: personId,
          status: status
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchParticipation(); // Reload data
        setError('');
        // Notify parent component that participation has changed
        if (onParticipationChange) {
          onParticipationChange();
        }
      } else {
        setError(result.message || 'Fehler beim Aktualisieren der Teilnahme');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error updating timeslot participation:', error);
    }
  };

  const getParticipationStatus = (personId) => {
    const participation_entry = participation.find(p => p.person.id === personId);
    return participation_entry ? participation_entry.status : null;
  };

  const getAcceptedCount = () => {
    return participation.filter(p => p.status === 'accepted').length;
  };

  const getAvailableSpots = () => {
    return Math.max(0, maxParticipants - getAcceptedCount());
  };

  const canAcceptMore = () => {
    return getAcceptedCount() < maxParticipants;
  };

  if (loading) {
    return (
      <div className="timeslot-participation-table">
        <div className="loading">Lade Teilnahmedaten...</div>
      </div>
    );
  }

  return (
    <div className="timeslot-participation-table">
      <div className="participation-header">
        <h3>Teilnehmer für "{timeSlotName}"</h3>
        <div className="participation-stats">
          <span className="stat-item">
            👥 {getAcceptedCount()} / {maxParticipants} Teilnehmer
          </span>
          <span className="stat-item">
            📍 {getAvailableSpots()} Plätze frei
          </span>
          {!canAcceptMore() && <span className="full-badge">Voll</span>}
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="table-container">
        <table className="participation-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Telefon</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {allPersons.map((person) => {
              const status = getParticipationStatus(person.id);
              return (
                <tr key={person.id} className={`participation-row ${status || ''}`}>
                  <td className="person-name" data-label="Name">
                    {person.firstName} {person.lastName}
                  </td>
                  <td data-label="E-Mail">{person.email || '-'}</td>
                  <td data-label="Telefon">{person.phone || '-'}</td>
                  <td data-label="Status">
                    <span className={`status-badge ${status || 'none'}`}>
                      {status === 'accepted' && '✅ Teilnahme bestätigt'}
                      {status === 'declined' && '❌ Abgelehnt'}
                      {status === 'pending' && '⏳ Ausstehend'}
                      {!status && '➖ Nicht angemeldet'}
                    </span>
                  </td>
                  <td className="actions-cell" data-label="Aktionen">
                    <div className="action-buttons">
                      {status !== 'accepted' && canAcceptMore() && (
                        <button
                          className="btn-small btn-accept"
                          onClick={() => updateParticipationStatus(person.id, 'accepted')}
                          disabled={!canAcceptMore()}
                        >
                          ✅ Bestätigen
                        </button>
                      )}
                      {status !== 'declined' && (
                        <button
                          className="btn-small btn-decline"
                          onClick={() => updateParticipationStatus(person.id, 'declined')}
                        >
                          ❌ Ablehnen
                        </button>
                      )}
                      {status !== 'pending' && status !== null && (
                        <button
                          className="btn-small btn-pending"
                          onClick={() => updateParticipationStatus(person.id, 'pending')}
                        >
                          ⏳ Ausstehend
                        </button>
                      )}
                      {status !== null && (
                        <button
                          className="btn-small btn-remove"
                          onClick={() => updateParticipationStatus(person.id, 'remove')}
                        >
                          🗑️ Entfernen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {allPersons.length === 0 && (
          <div className="no-persons">
            <p>Keine Personen verfügbar. Erstellen Sie zuerst Personen in der Verwaltung.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotParticipationTable;
