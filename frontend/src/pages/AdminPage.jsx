import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import apiService from '../apiService';
import EventListItem from '../EventListItem';
import EventDetails from '../EventDetails';
import EventForm from '../EventForm';
import PersonsTable from '../PersonsTable';
import TimeSlotManager from '../TimeSlotManager';
import TimeSlotForm from '../TimeSlotForm';
import '../App.css';

const LOGO_URL = 'https://tse4.mm.bing.net/th/id/OIP.UORK-u3V7UVpyTeEcb0y_QHaHa?rs=1&pid=ImgDetMain&o=7&rm=3';

const AdminPage = () => {
  const navigate = useNavigate();
  const { eventId, timeslotId } = useParams();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedTimeSlotState, setSelectedTimeSlotState] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Determine current view based on URL path
  const getCurrentView = () => {
    const path = location.pathname;
    if (path.includes('/persons')) return 'persons';
    if (path.includes('/create')) return 'create';
    if (path.includes('/edit')) return 'edit';
    if (path.includes('/timeslots')) return 'timeslots';
    if (eventId) return 'details';
    return 'list';
  };

  const currentView = getCurrentView();

  useEffect(() => {
    loadEvents();
  }, [selectedYear]);

  useEffect(() => {
    // Load specific event when eventId is in URL
    if (eventId && events.length > 0) {
      loadEventById(eventId);
    } else {
      setSelectedEvent(null);
    }
  }, [eventId, events]);

  useEffect(() => {
    // Handle timeslot-specific logic
    if (timeslotId && selectedEvent) {
      const timeSlot = selectedEvent.timeSlots?.find(ts => ts.id === timeslotId);
      if (timeSlot) {
        setSelectedTimeSlot(timeSlot);
        if (location.pathname.includes('/participants')) {
          setShowParticipants(true);
          setSelectedTimeSlotState(timeSlot);
        }
      }
    } else {
      setSelectedTimeSlot(null);
      setShowParticipants(false);
      setSelectedTimeSlotState(null);
    }
  }, [timeslotId, selectedEvent, location.pathname]);

  const loadEventById = async (id) => {
    try {
      const response = await apiService.getEventById(id);
      if (response.success) {
        setSelectedEvent(response.data);
      } else {
        setError('Event nicht gefunden');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      setError('Fehler beim Laden des Events');
      navigate('/admin');
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAllEvents();
      
      if (response.success) {
        // Filter events by selected year
        const filteredEvents = response.data.filter(event => {
          if (event.dateFrom) {
            const eventYear = new Date(event.dateFrom).getFullYear();
            return eventYear === selectedYear;
          }
          return false;
        });
        setEvents(filteredEvents);
      } else {
        setError('Fehler beim Laden der Events');
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Verbindung zum Server fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i <= 5; i++) {
    yearOptions.push(currentYear - i);
  }

  const handleEventClick = (event) => {
    navigate(`/admin/events/${event.id}`);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleNavigationClick = (view) => {
    if (view === 'list') {
      navigate('/admin');
    } else if (view === 'persons') {
      navigate('/admin/persons');
    }
    setError(null);
  };

  const handleBackToList = () => {
    navigate('/admin');
  };

  const handleBackToEventDetails = () => {
    if (selectedEvent) {
      navigate(`/admin/events/${selectedEvent.id}`);
    } else {
      navigate('/admin');
    }
  };

  const handlePersonSelect = (person) => {
    // Removed personEvents view - no longer needed since we don't manage event participation
    console.log('Selected person:', person);
  };

  const handleCreateEvent = async (eventData, status = 'draft') => {
    try {
      console.log('AdminPage: handleCreateEvent called with:', eventData, 'status:', status);
      setError(null);
      // Ensure the status is set correctly
      const eventDataWithStatus = { ...eventData, status };
      console.log('AdminPage: Sending to API:', eventDataWithStatus);
      const response = await apiService.createEvent(eventDataWithStatus);
      console.log('AdminPage: API response:', response);
      
      if (response.success) {
        await loadEvents();
        navigate('/admin');
      } else {
        setError('Fehler beim Erstellen des Events');
      }
    } catch (error) {
      console.error('AdminPage: Error creating event:', error);
      setError('Fehler beim Erstellen des Events: ' + error.message);
    }
  };

  const handleUpdateEvent = (event) => {
    if (!event || !event.id) {
      setError('Event nicht gefunden');
      return;
    }
    navigate(`/admin/events/${event.id}/edit`);
  };

  const handleSaveUpdatedEvent = async (eventData, status = null) => {
    try {
      setError(null);
      // If status is provided, use it; otherwise keep existing status
      const eventDataWithStatus = { 
        ...eventData, 
        status: status || selectedEvent.status || 'draft' 
      };
      const response = await apiService.updateEvent(selectedEvent.id, eventDataWithStatus);
      
      if (response.success) {
        await loadEvents();
        navigate(`/admin/events/${selectedEvent.id}`);
      } else {
        setError('Fehler beim Aktualisieren des Events');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Fehler beim Aktualisieren des Events');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      setError(null);
      const response = await apiService.deleteEvent(eventId);
      
      if (response.success) {
        await loadEvents();
        navigate('/admin');
      } else {
        setError('Fehler beim Löschen des Events');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Fehler beim Löschen des Events');
    }
  };

  const handleManageTimeSlots = (event) => {
    if (!event || !event.id) {
      setError('Event nicht gefunden');
      return;
    }
    navigate(`/admin/events/${event.id}/timeslots`);
  };

  const handleBackFromTimeSlots = async () => {
    // Refresh the selected event data to show updates
    if (selectedEvent?.id) {
      try {
        const response = await apiService.getEventById(selectedEvent.id);
        if (response.success) {
          setSelectedEvent(response.data);
        }
        // Also refresh the events list
        await loadEvents();
      } catch (error) {
        console.error('Error refreshing event data:', error);
      }
      navigate(`/admin/events/${selectedEvent.id}`);
    } else {
      navigate('/admin');
    }
  };

  const handleEditTimeSlot = (event, timeSlot) => {
    if (!event || !event.id || !timeSlot || !timeSlot.id) {
      setError('Event oder Zeitslot nicht gefunden');
      return;
    }
    navigate(`/admin/events/${event.id}/timeslots/${timeSlot.id}`);
  };

  const handleManageParticipantsFromDetails = (event, timeSlot) => {
    if (!event || !event.id || !timeSlot || !timeSlot.id) {
      setError('Event oder Zeitslot nicht gefunden');
      return;
    }
    navigate(`/admin/events/${event.id}/timeslots/${timeSlot.id}/participants`);
  };

  if (loading) {
    return (
      <>
        <header className="App-header">
          <div className="header-content">
            <div className="header-title-with-logo">
              <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
              <h1>Eventmanager RK Schmalegg</h1>
            </div>
          </div>
        </header>
        <main className="App-main">
          <div className="loading-message">Lade Events...</div>
        </main>
      </>
    );
  }

  if (currentView === 'details') {
    if (!selectedEvent) {
      return (
        <>
          <header className="App-header">
            <div className="header-content">
              <div className="header-title-with-logo">
                <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
                <h1>Eventmanager RK Schmalegg</h1>
              </div>
            </div>
          </header>
          <main className="App-main">
            <div className="error-message">
              Event nicht gefunden
            </div>
            <button onClick={handleBackToList} className="back-button">
              ← Zurück zur Übersicht
            </button>
          </main>
        </>
      );
    }

    return (
      <>
        <header className="App-header">
          <div className="header-content">
            <div className="header-title-with-logo">
              <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
              <h1>Eventmanager RK Schmalegg</h1>
            </div>
          </div>
        </header>
        <main className="App-main">
          <EventDetails 
            event={selectedEvent} 
            onBack={handleBackToList}
            onUpdate={handleUpdateEvent}
            onDelete={handleDeleteEvent}
            onManageTimeSlots={() => selectedEvent && handleManageTimeSlots(selectedEvent)}
            onEditTimeSlot={handleEditTimeSlot}
            onManageParticipants={handleManageParticipantsFromDetails}
          />
        </main>
      </>
    );
  }

  if (currentView === 'timeslots') {
    if (!selectedEvent) {
      return (
        <>
          <header className="App-header">
            <div className="header-content">
              <div className="header-title-with-logo">
                <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
                <h1>Eventmanager RK Schmalegg</h1>
              </div>
            </div>
          </header>
          <main className="App-main">
            <div className="error-message">
              Event nicht gefunden
            </div>
            <button onClick={handleBackToList} className="back-button">
              ← Zurück zur Übersicht
            </button>
          </main>
        </>
      );
    }

    return (
      <>
        <header className="App-header">
          <div className="header-content">
            <div className="header-title-with-logo">
              <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
              <h1>Eventmanager RK Schmalegg</h1>
            </div>
          </div>
        </header>
        <main className="App-main">
          <TimeSlotManager 
            event={selectedEvent}
            onBack={handleBackFromTimeSlots}
            onUpdate={loadEvents}
            selectedTimeSlot={selectedTimeSlot}
            initialShowParticipants={showParticipants}
            initialSelectedTimeSlot={selectedTimeSlotState}
          />
        </main>
      </>
    );
  }

  if (currentView === 'persons') {
    return (
      <>
        <header className="App-header">
          <div className="header-content">
            <div className="header-title-with-logo">
              <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
              <h1>Eventmanager RK Schmalegg</h1>
            </div>
            <div className="header-actions">
              <nav className="main-nav">
                <button 
                  className={`nav-button ${currentView === 'list' ? 'active' : ''}`}
                  onClick={() => handleNavigationClick('list')}
                >
                  📅 Events
                </button>
                <button 
                  className={`nav-button ${currentView === 'persons' ? 'active' : ''}`}
                  onClick={() => handleNavigationClick('persons')}
                >
                  👥 Personen
                </button>
              </nav>
              <button className="logout-button" onClick={handleLogout}>
                Abmelden
              </button>
            </div>
          </div>
        </header>
        <main className="App-main">
          <PersonsTable />
        </main>
      </>
    );
  }

  if (currentView === 'create') {
    return (
      <>
        <header className="App-header">
          <div className="header-content">
            <div className="header-title-with-logo">
              <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
              <h1>Eventmanager RK Schmalegg</h1>
            </div>
          </div>
        </header>
        <main className="App-main">
          <EventForm 
            onSave={handleCreateEvent} 
            onCancel={handleBackToList} 
          />
        </main>
      </>
    );
  }

  if (currentView === 'edit') {
    if (!selectedEvent) {
      return (
        <>
          <header className="App-header">
            <div className="header-content">
              <div className="header-title-with-logo">
                <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
                <h1>Eventmanager RK Schmalegg</h1>
              </div>
            </div>
          </header>
          <main className="App-main">
            <div className="error-message">
              Event nicht gefunden
            </div>
            <button onClick={handleBackToList} className="back-button">
              ← Zurück zur Übersicht
            </button>
          </main>
        </>
      );
    }

    return (
      <>
        <header className="App-header">
          <div className="header-content">
            <div className="header-title-with-logo">
              <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
              <h1>Eventmanager RK Schmalegg</h1>
            </div>
          </div>
        </header>
        <main className="App-main">
          <EventForm 
            event={selectedEvent}
            onSave={handleSaveUpdatedEvent} 
            onCancel={handleBackToEventDetails} 
            isEditing={true}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <header className="App-header">
        <div className="header-content">
          <div className="header-title-with-logo">
            <img src={LOGO_URL} alt="RK Schmalegg Logo" className="header-logo" />
            <h1>Eventmanager RK Schmalegg</h1>
          </div>
          <div className="header-actions">
            <nav className="main-nav">
              <button 
                className={`nav-button ${currentView === 'list' ? 'active' : ''}`}
                onClick={() => handleNavigationClick('list')}
              >
                📅 Events
              </button>
              <button 
                className={`nav-button ${currentView === 'persons' ? 'active' : ''}`}
                onClick={() => handleNavigationClick('persons')}
              >
                👥 Personen
              </button>
            </nav>
            <button className="logout-button" onClick={handleLogout}>
              Abmelden
            </button>
          </div>
        </div>
      </header>
      <main className="App-main">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
        
        <section className="events-section">
          <div className="section-header">
            <div className="section-title-row">
              <h2>Termine</h2>
              <div className="year-filter">
                <label htmlFor="event-year-select">Jahr:</label>
                <select 
                  id="event-year-select"
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="year-select"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="add-event-button" onClick={() => navigate('/admin/events/create')}>
              + Neues Event
            </button>
          </div>
          
          <div className="events-list">
            {events.length > 0 ? (
              events.map((event) => (
                <EventListItem 
                  key={event.id} 
                  event={event} 
                  onClick={() => handleEventClick(event)}
                  isAdmin={true}
                />
              ))
            ) : (
              <p>Keine Termine vorhanden</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default AdminPage;
