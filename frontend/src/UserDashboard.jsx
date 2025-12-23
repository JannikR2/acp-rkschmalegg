import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

const UserDashboard = ({ user, onLogout }) => {
  const [events, setEvents] = useState([]);
  const [myParticipation, setMyParticipation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTimeSpanForm, setShowTimeSpanForm] = useState(null);
  const [newTimeSpan, setNewTimeSpan] = useState({
    date: '',
    timeFrom: '',
    timeTo: '',
    description: ''
  });

  useEffect(() => {
    if (user && !user.isAdmin) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsResponse = await fetch('http://localhost:3000/api/events');
      const eventsResult = await eventsResponse.json();
      
      if (eventsResult.success) {
        setEvents(eventsResult.data);
        // Fetch participation for each event
        await fetchMyParticipation(eventsResult.data);
      } else {
        setError('Fehler beim Laden der Events');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyParticipation = async (eventsList) => {
    const participationPromises = eventsList.map(async (event) => {
      try {
        const response = await fetch(`http://localhost:3000/api/events/${event.id}/participation`);
        const result = await response.json();
        
        if (result.success) {
          const myParticipation = result.data.find(p => p.personId === user.id);
          return {
            eventId: event.id,
            participation: myParticipation || { status: 'not_responded', timeSpans: [], totalHours: 0 }
          };
        }
        return { eventId: event.id, participation: { status: 'not_responded', timeSpans: [], totalHours: 0 } };
      } catch (error) {
        console.error(`Error fetching participation for event ${event.id}:`, error);
        return { eventId: event.id, participation: { status: 'not_responded', timeSpans: [], totalHours: 0 } };
      }
    });

    const participationResults = await Promise.all(participationPromises);
    setMyParticipation(participationResults);
  };

  const updateParticipationStatus = async (eventId, status) => {
    try {
      // If declining and user has existing hours, confirm first
      const currentParticipation = getParticipationForEvent(eventId);
      if (status === 'declined' && currentParticipation.timeSpans && currentParticipation.timeSpans.length > 0) {
        const confirmDecline = confirm(
          `Sie haben bereits ${currentParticipation.totalHours.toFixed(1)} Stunden für dieses Event erfasst. ` +
          `Wenn Sie absagen, werden alle Ihre Arbeitszeiten für dieses Event gelöscht. Fortfahren?`
        );
        if (!confirmDecline) {
          return; // User cancelled the decline
        }
      }

      const response = await fetch(`http://localhost:3000/api/events/${eventId}/participation/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh participation data to get updated state (backend automatically clears time spans when declining)
        await fetchMyParticipation(events);
        setError('');
      } else {
        setError(result.message || 'Fehler beim Aktualisieren des Status');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error updating participation status:', error);
    }
  };

  const addTimeSpan = async (eventId) => {
    if (!newTimeSpan.date || !newTimeSpan.timeFrom || !newTimeSpan.timeTo) {
      setError('Datum, Start- und Endzeit sind erforderlich');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/participation/${user.id}/timespans`, {
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
        // Refresh participation data
        await fetchMyParticipation(events);
      } else {
        setError(result.message || 'Fehler beim Hinzufügen der Zeitspanne');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error adding time span:', error);
    }
  };

  const removeTimeSpan = async (eventId, timeSpanIndex) => {
    if (!confirm('Zeitspanne wirklich löschen?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/participation/${user.id}/timespans/${timeSpanIndex}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh participation data
        await fetchMyParticipation(events);
      } else {
        setError(result.message || 'Fehler beim Löschen der Zeitspanne');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error removing time span:', error);
    }
  };

  const getParticipationForEvent = (eventId) => {
    const participation = myParticipation.find(p => p.eventId === eventId);
    return participation ? participation.participation : { status: 'not_responded', timeSpans: [], totalHours: 0 };
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted': return 'status-accepted';
      case 'declined': return 'status-declined';
      case 'pending': return 'status-pending';
      case 'not_responded': return 'status-not-responded';
      default: return 'status-not-responded';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return 'Zugesagt';
      case 'declined': return 'Abgesagt';
      case 'pending': return 'Ausstehend';
      case 'not_responded': return 'Noch nicht geantwortet';
      default: return 'Noch nicht geantwortet';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const calculateDuration = (timeFrom, timeTo) => {
    if (!timeFrom || !timeTo) return 0;
    
    const [fromHour, fromMin] = timeFrom.split(':').map(Number);
    const [toHour, toMin] = timeTo.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;
    
    return (toMinutes - fromMinutes) / 60;
  };

  const getTotalHours = () => {
    return myParticipation.reduce((total, p) => total + p.participation.totalHours, 0);
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="dashboard-header">
          <h1>Lade Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>Willkommen, {user.fullName}!</h1>
          <p>Hier können Sie Events zusagen/absagen und Ihre Arbeitszeiten erfassen</p>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Abmelden
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{getTotalHours().toFixed(1)}h</div>
          <div className="stat-label">Meine Gesamtstunden</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{myParticipation.filter(p => p.participation.status === 'accepted').length}</div>
          <div className="stat-label">Zugesagte Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{myParticipation.filter(p => p.participation.status === 'not_responded').length}</div>
          <div className="stat-label">Noch zu bearbeiten</div>
        </div>
      </div>

      <div className="events-grid">
        {events.map((event) => {
          const participation = getParticipationForEvent(event.id);
          return (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h3>{event.name}</h3>
                <span className={`status-badge ${getStatusBadgeClass(participation.status)}`}>
                  {getStatusText(participation.status)}
                </span>
              </div>
              
              <div className="event-details">
                <div className="event-date">
                  📅 {formatDate(event.dateFrom)}
                </div>
                <div className="event-time">
                  🕐 {formatTime(event.timeFrom)} - {formatTime(event.timeTo)}
                </div>
                <div className="event-location">
                  📍 {event.location}
                </div>
                <div className="event-description">
                  {event.description}
                </div>
              </div>

              <div className="participation-actions">
                {participation.status !== 'accepted' && (
                  <button 
                    className="btn-accept"
                    onClick={() => updateParticipationStatus(event.id, 'accepted')}
                  >
                    ✓ Zusagen
                  </button>
                )}
                {participation.status !== 'declined' && (
                  <button 
                    className="btn-decline"
                    onClick={() => updateParticipationStatus(event.id, 'declined')}
                  >
                    ✗ Absagen
                  </button>
                )}
              </div>

              {participation.status === 'accepted' && (
                <div className="time-tracking">
                  <div className="time-tracking-header">
                    <h4>Meine Arbeitszeiten ({participation.totalHours.toFixed(1)}h)</h4>
                    <button 
                      className="btn-add-time"
                      onClick={() => setShowTimeSpanForm(event.id)}
                    >
                      + Zeit hinzufügen
                    </button>
                  </div>
                  
                  <div className="time-spans-list">
                    {participation.timeSpans.map((timeSpan, index) => (
                      <div key={index} className="time-span-item">
                        <div className="time-span-info">
                          <div className="time-span-date">
                            {new Date(timeSpan.date).toLocaleDateString()}
                          </div>
                          <div className="time-span-time">
                            {timeSpan.timeFrom} - {timeSpan.timeTo} ({calculateDuration(timeSpan.timeFrom, timeSpan.timeTo).toFixed(1)}h)
                          </div>
                          {timeSpan.description && (
                            <div className="time-span-desc">{timeSpan.description}</div>
                          )}
                        </div>
                        <button 
                          className="btn-remove-timespan"
                          onClick={() => removeTimeSpan(event.id, index)}
                          title="Zeitspanne löschen"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {participation.timeSpans.length === 0 && (
                      <div className="no-timespans">Noch keine Zeiten erfasst</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time Span Form */}
      {showTimeSpanForm && (
        <div className="timespan-form-overlay">
          <div className="timespan-form">
            <h4>Arbeitszeit hinzufügen</h4>
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
                placeholder="Was haben Sie gemacht? (optional)"
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
    </div>
  );
};

export default UserDashboard;
