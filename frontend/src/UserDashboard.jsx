import React, { useState, useEffect } from 'react';
import { EventUtils } from './apiService';
import './UserDashboard.css';

const LOGO_URL = 'https://tse4.mm.bing.net/th/id/OIP.UORK-u3V7UVpyTeEcb0y_QHaHa?rs=1&pid=ImgDetMain&o=7&rm=3';

const UserDashboard = ({ user, onLogout }) => {
  const [events, setEvents] = useState([]);
  const [timeSlotParticipation, setTimeSlotParticipation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user && !user.isAdmin) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Only fetch published events for regular users
      const eventsResponse = await fetch('http://localhost:3000/api/events?status=published');
      const eventsResult = await eventsResponse.json();
      
      if (eventsResult.success) {
        setEvents(eventsResult.data);
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
                
                // Add all participants data to the timeslot object
                timeSlot.participants = participationResult.data;
                
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

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
  };

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear + 1, currentYear, currentYear - 1, currentYear - 2]; // Nächstes Jahr, Dieses Jahr, Letztes Jahr, Vorletztes Jahr
  };

  const getFilteredEvents = () => {
    return events.filter(event => {
      const eventYear = new Date(event.dateFrom).getFullYear();
      return eventYear === selectedYear;
    });
  };

  // If an event is selected, show the detail view
  if (selectedEvent) {
    const eventTimeSlots = getTimeSlotsForEvent(selectedEvent.id);
    
    return (
      <div className="user-dashboard">
        <div className="dashboard-header">
          <div className="user-info">
            <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
            <h1>Willkommen, {user.fullName}!</h1>
          </div>
          <button className="logout-button" onClick={onLogout}>
            Abmelden
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="event-details-container">
          <button className="back-button" onClick={handleBackToList}>
            ← Zurück zur Übersicht
          </button>

          <div className="event-card-detail">
            <h2>{selectedEvent.name}</h2>
            <div className="event-info">
              <div className="event-date">
                📅 {EventUtils.getDateRange(selectedEvent.dateFrom, selectedEvent.dateTo)}
              </div>
              <div className="event-time">
                🕐 {formatTime(selectedEvent.timeFrom)} - {formatTime(selectedEvent.timeTo)}
              </div>
              <div className="event-location">
                📍 {selectedEvent.location}
              </div>
              <div className="event-description">
                {selectedEvent.description}
              </div>
            </div>
          </div>

          {/* Zeitslots zum Anmelden */}
          {eventTimeSlots.length > 0 && (
            <div className="timeslots-signup-section">
              <h3> Verfügbare Zeitslots - Jetzt anmelden!</h3>
              {(() => {
                // First group by date, then by category
                const groupedByDate = eventTimeSlots.reduce((acc, timeSlot) => {
                  const date = timeSlot.date || 'Alle Tage';
                  if (!acc[date]) {
                    acc[date] = {};
                  }
                  const category = timeSlot.category || 'Ohne Kategorie';
                  if (!acc[date][category]) {
                    acc[date][category] = [];
                  }
                  acc[date][category].push(timeSlot);
                  return acc;
                }, {});

                // Sort dates ("Alle Tage" first, then chronologically)
                const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                  if (a === 'Alle Tage') return -1;
                  if (b === 'Alle Tage') return 1;
                  return a.localeCompare(b);
                });

                return sortedDates.map(date => {
                  const categories = groupedByDate[date];
                  const sortedCategories = Object.keys(categories).sort();

                  return (
                    <div key={date} className="timeslot-date-section">
                      <h3 className="date-header">
                        {date === 'Alle Tage' ? date : new Date(date).toLocaleDateString('de-DE', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      
                      {sortedCategories.map(category => {
                        const slots = categories[category];
                        
                        // Sort slots by time within each category
                        const sortedSlots = slots.sort((a, b) => {
                          return a.timeFrom.localeCompare(b.timeFrom);
                        });
                        
                        return (
                          <div key={category} className="timeslot-category-section">
                            <h4 className="category-header">{category}</h4>
                            <div className="timeslots-grid">
                              {sortedSlots.map((timeSlot) => {
                                const timeSlotParticipation = getTimeSlotParticipation(selectedEvent.id, timeSlot.id);
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
                                          onClick={() => updateTimeSlotParticipation(selectedEvent.id, timeSlot.id, 'remove')}
                                        >
                                          Abmelden
                                        </button>
                              ) : !isFull ? (
                                        <button 
                                          className="btn-timeslot-signup"
                                          onClick={() => updateTimeSlotParticipation(selectedEvent.id, timeSlot.id, 'accepted')}
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
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* Participants Overview Table */}
          {eventTimeSlots.length > 0 && (
            <div className="participants-overview">
              <h3>Zeitslots & Teilnehmer</h3>
              {(() => {
                // Group by date first, then by category
                const groupedByDate = eventTimeSlots.reduce((acc, timeSlot) => {
                  const date = timeSlot.date || 'Alle Tage';
                  if (!acc[date]) {
                    acc[date] = {};
                  }
                  const category = timeSlot.category || 'Ohne Kategorie';
                  if (!acc[date][category]) {
                    acc[date][category] = [];
                  }
                  acc[date][category].push(timeSlot);
                  return acc;
                }, {});

                // Sort dates
                const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                  if (a === 'Alle Tage') return -1;
                  if (b === 'Alle Tage') return 1;
                  return a.localeCompare(b);
                });

                return sortedDates.map(date => {
                  const categories = groupedByDate[date];
                  const sortedCategories = Object.keys(categories).sort();

                  return (
                    <div key={date} className="table-date-section">
                      <h4 className="table-date-header">
                        {date === 'Alle Tage' ? date : new Date(date).toLocaleDateString('de-DE', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      
                      {sortedCategories.map(category => {
                        const slots = categories[category].sort((a, b) => a.timeFrom.localeCompare(b.timeFrom));
                        
                        return (
                          <div key={category} className="table-category-section">
                            <h5 className="table-category-header">{category}</h5>
                            <div className="overview-table-container">
                              <table className="overview-table">
                                <thead>
                                  <tr>
                                    <th>Zeitslot</th>
                                    <th>Zeit</th>
                                    <th>Belegung</th>
                                    <th>Teilnehmer</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {slots.map((timeSlot) => {
                      // Fetch participants for this timeslot
                      const timeSlotData = timeSlotParticipation.find(
                        p => p.eventId === selectedEvent.id && p.timeSlotId === timeSlot.id
                      );
                      
                      // Get participants from the timeSlot data
                      const allParticipants = timeSlot.participants || [];
                      const acceptedParticipants = allParticipants.filter(p => p.status === 'accepted');
                      
                      if (allParticipants.length === 0) {
                        return (
                          <tr key={timeSlot.id} className="empty-slot">
                            <td><strong>{timeSlot.name}</strong></td>
                            <td>{timeSlot.timeFrom} - {timeSlot.timeTo}</td>
                            <td>
                              <span className="capacity">0 / {timeSlot.maxParticipants}</span>
                            </td>
                            <td colSpan="2" className="no-participants">
                              <em>Noch keine Teilnehmer</em>
                            </td>
                          </tr>
                        );
                      }
                      
                      return allParticipants.map((participant, index) => (
                        <tr key={`${timeSlot.id}-${index}`} className="accepted-row">{/* Only accepted participants are shown */}
                          {index === 0 && (
                            <>
                              <td rowSpan={allParticipants.length}>
                                <strong>{timeSlot.name}</strong>
                              </td>
                              <td rowSpan={allParticipants.length}>
                                {timeSlot.timeFrom} - {timeSlot.timeTo}
                              </td>
                              <td rowSpan={allParticipants.length}>
                                <span className="capacity">
                                  {acceptedParticipants.length} / {timeSlot.maxParticipants}
                                </span>
                                {acceptedParticipants.length >= timeSlot.maxParticipants && 
                                  <span className="full-badge-small">Voll</span>
                                }
                              </td>
                            </>
                          )}
                          <td>
                            <strong>{participant.person?.fullName || participant.person?.firstName + ' ' + participant.person?.lastName || 'Unbekannt'}</strong>
                          </td>
                          <td>
                            <span className={`status-badge status-${participant.status}`}>
                              {participant.status === 'accepted' ? '✓ Zugesagt' : '✗ Abgesagt'}
                            </span>
                          </td>
                        </tr>
                      ));
                    })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
    );
  }

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
          <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
          <h1>Willkommen, {user.fullName}!</h1>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Abmelden
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Year Filter */}
      <div className="year-filter-section">
        <label htmlFor="user-year-select">Jahr:</label>
        <select 
          id="user-year-select"
          value={selectedYear} 
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="year-select"
        >
          {getAvailableYears().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="events-grid">
        {getFilteredEvents().map((event) => {
          return (
            <div key={event.id} className="event-card" onClick={() => handleEventClick(event)}>
              <div className="event-header">
                <h3>{event.name}</h3>
              </div>
              
              <div className="event-details">
                <div className="event-date">
                  📅 {EventUtils.getDateRange(event.dateFrom, event.dateTo)}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboard;
