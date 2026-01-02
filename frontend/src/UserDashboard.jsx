import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

const UserDashboard = ({ user, onLogout }) => {
  const [events, setEvents] = useState([]);
  const [myParticipation, setMyParticipation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            participation: myParticipation || { status: 'not_responded' }
          };
        }
        return { eventId: event.id, participation: { status: 'not_responded' } };
      } catch (error) {
        console.error(`Error fetching participation for event ${event.id}:`, error);
        return { eventId: event.id, participation: { status: 'not_responded' } };
      }
    });

    const participationResults = await Promise.all(participationPromises);
    setMyParticipation(participationResults);
  };

  const updateParticipationStatus = async (eventId, status) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/participation/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      
      if (result.success) {
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

  const getParticipationForEvent = (eventId) => {
    const participation = myParticipation.find(p => p.eventId === eventId);
    return participation ? participation.participation : { status: 'not_responded' };
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
          <p>Hier können Sie Events zusagen oder absagen</p>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Abmelden
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{myParticipation.filter(p => p.participation.status === 'accepted').length}</div>
          <div className="stat-label">Zugesagte Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{myParticipation.filter(p => p.participation.status === 'declined').length}</div>
          <div className="stat-label">Abgesagte Events</div>
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboard;
