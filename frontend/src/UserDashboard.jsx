import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

const UserDashboard = ({ user, onLogout }) => {
  const [events, setEvents] = useState([]);
  const [myParticipation, setMyParticipation] = useState([]);
  const [timeSlotParticipation, setTimeSlotParticipation] = useState([]);
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
        await fetchTimeSlotParticipation(eventsResult.data);
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

  const fetchTimeSlotParticipation = async (eventsList) => {
    const timeSlotParticipationData = [];
    
    for (const event of eventsList) {
      try {
        // First get the timeslots for this event
        const timeSlotsResponse = await fetch(`http://localhost:3000/api/events/${event.id}/timeslots`);
        const timeSlotsResult = await timeSlotsResponse.json();
        
        if (timeSlotsResult.success && timeSlotsResult.data.length > 0) {
          // For each timeslot, get participation data
          for (const timeSlot of timeSlotsResult.data) {
            try {
              const participationResponse = await fetch(`http://localhost:3000/api/events/${event.id}/timeslots/${timeSlot.id}/participation`);
              const participationResult = await participationResponse.json();
              
              if (participationResult.success) {
                const myParticipation = participationResult.data.find(p => p.person.id === user.id);
                timeSlotParticipationData.push({
                  eventId: event.id,
                  timeSlotId: timeSlot.id,
                  timeSlot: timeSlot,
                  participation: myParticipation || { status: 'not_responded' }
                });
              }
            } catch (error) {
              console.error(`Error fetching participation for timeslot ${timeSlot.id}:`, error);
              timeSlotParticipationData.push({
                eventId: event.id,
                timeSlotId: timeSlot.id,
                timeSlot: timeSlot,
                participation: { status: 'not_responded' }
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching timeslots for event ${event.id}:`, error);
      }
    }
    
    setTimeSlotParticipation(timeSlotParticipationData);
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

  const updateTimeSlotParticipation = async (eventId, timeSlotId, status) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/timeslots/${timeSlotId}/participation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          personId: user.id,
          status: status
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchTimeSlotParticipation(events);
        setError('');
      } else {
        setError(result.message || 'Fehler beim Aktualisieren der Zeitslot-Teilnahme');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error updating timeslot participation:', error);
    }
  };

  const getParticipationForEvent = (eventId) => {
    const participation = myParticipation.find(p => p.eventId === eventId);
    return participation ? participation.participation : { status: 'not_responded' };
  };

  const getTimeSlotParticipation = (eventId, timeSlotId) => {
    const participation = timeSlotParticipation.find(
      p => p.eventId === eventId && p.timeSlotId === timeSlotId
    );
    return participation ? participation.participation : { status: 'not_responded' };
  };

  const getTimeSlotsForEvent = (eventId) => {
    return timeSlotParticipation
      .filter(p => p.eventId === eventId)
      .map(p => p.timeSlot);
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
          <div className="stat-number">{timeSlotParticipation.filter(p => p.participation.status === 'accepted').length}</div>
          <div className="stat-label">Gebuchte Zeitslots</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{myParticipation.filter(p => p.participation.status === 'not_responded').length}</div>
          <div className="stat-label">Noch zu bearbeiten</div>
        </div>
      </div>

      <div className="events-grid">
        {events.map((event) => {
          const participation = getParticipationForEvent(event.id);
          const eventTimeSlots = getTimeSlotsForEvent(event.id);
          
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

              {/* Show timeslots if they exist and user has accepted the event */}
              {eventTimeSlots.length > 0 && participation.status === 'accepted' && (
                <div className="timeslots-section">
                  <h4>📅 Verfügbare Zeitslots</h4>
                  <div className="timeslots-grid">
                    {eventTimeSlots.map((timeSlot) => {
                      const timeSlotParticipation = getTimeSlotParticipation(event.id, timeSlot.id);
                      const isSignedUp = timeSlotParticipation.status === 'accepted';
                      const isFull = timeSlot.isFull;
                      const availableSpots = timeSlot.availableSpots;
                      
                      return (
                        <div key={timeSlot.id} className={`timeslot-card ${isSignedUp ? 'signed-up' : ''} ${isFull && !isSignedUp ? 'full' : ''}`}>
                          <div className="timeslot-header">
                            <h5>{timeSlot.name}</h5>
                            <span className="timeslot-time">
                              {timeSlot.timeFrom} - {timeSlot.timeTo}
                            </span>
                          </div>
                          
                          <div className="timeslot-info">
                            <div className="capacity-info">
                              {timeSlot.maxParticipants > 0 && (
                                <span className={`capacity ${isFull ? 'full' : ''}`}>
                                  {timeSlot.maxParticipants - availableSpots}/{timeSlot.maxParticipants} Plätze
                                </span>
                              )}
                            </div>
                            
                            <div className="timeslot-status">
                              {isSignedUp ? (
                                <span className="status-signed-up">✓ Angemeldet</span>
                              ) : isFull ? (
                                <span className="status-full">Ausgebucht</span>
                              ) : (
                                <span className="status-available">Verfügbar</span>
                              )}
                            </div>
                          </div>

                          <div className="timeslot-actions">
                            {isSignedUp ? (
                              <button 
                                className="btn-timeslot-cancel"
                                onClick={() => updateTimeSlotParticipation(event.id, timeSlot.id, 'declined')}
                              >
                                Abmelden
                              </button>
                            ) : !isFull ? (
                              <button 
                                className="btn-timeslot-signup"
                                onClick={() => updateTimeSlotParticipation(event.id, timeSlot.id, 'accepted')}
                              >
                                Anmelden
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Show message if there are timeslots but user hasn't accepted event yet */}
              {eventTimeSlots.length > 0 && participation.status !== 'accepted' && (
                <div className="timeslots-locked">
                  <p>💡 Sagen Sie dem Event zu, um sich für Zeitslots anzumelden</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboard;
