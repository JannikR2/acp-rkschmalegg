import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../apiService';
import EventListItem from '../EventListItem';
import EventDetails from '../EventDetails';
import EventForm from '../EventForm';
import PersonsTable from '../PersonsTable';
import TimeSlotManager from '../TimeSlotManager';
import '../App.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAllEvents();
      
      if (response.success) {
        setEvents(response.data);
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

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setCurrentView('details');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleNavigationClick = (view) => {
    setCurrentView(view);
    setSelectedEvent(null);
    setError(null);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
    setCurrentView('list');
  };

  const handleBackToEventDetails = () => {
    setCurrentView('details');
  };

  const handlePersonSelect = (person) => {
    // Removed personEvents view - no longer needed since we don't manage event participation
    console.log('Selected person:', person);
  };

  const handleCreateEvent = async (eventData, status = 'draft') => {
    try {
      setError(null);
      // Ensure the status is set correctly
      const eventDataWithStatus = { ...eventData, status };
      const response = await apiService.createEvent(eventDataWithStatus);
      
      if (response.success) {
        await loadEvents();
        setCurrentView('list');
      } else {
        setError('Fehler beim Erstellen des Events');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Fehler beim Erstellen des Events');
    }
  };

  const handleUpdateEvent = (event) => {
    setSelectedEvent(event);
    setCurrentView('edit');
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
        setCurrentView('list');
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
        setCurrentView('list');
      } else {
        setError('Fehler beim Löschen des Events');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Fehler beim Löschen des Events');
    }
  };

  const handleManageTimeSlots = (event) => {
    setSelectedEvent(event);
    setCurrentView('timeslots');
  };

  const handleBackFromTimeSlots = () => {
    setCurrentView('details');
  };

  if (loading) {
    return (
      <>
        <header className="App-header">
          <h1>Zeiterfassung RK Schmalegg</h1>
        </header>
        <main className="App-main">
          <div className="loading-message">Lade Events...</div>
        </main>
      </>
    );
  }

  if (currentView === 'details') {
    return (
      <>
        <header className="App-header">
          <h1>Zeiterfassung RK Schmalegg</h1>
        </header>
        <main className="App-main">
          <EventDetails 
            event={selectedEvent} 
            onBack={handleBackToList}
            onUpdate={handleUpdateEvent}
            onDelete={handleDeleteEvent}
            onManageTimeSlots={() => handleManageTimeSlots(selectedEvent)}
          />
        </main>
      </>
    );
  }

  if (currentView === 'timeslots') {
    return (
      <>
        <header className="App-header">
          <h1>Zeiterfassung RK Schmalegg</h1>
        </header>
        <main className="App-main">
          <TimeSlotManager 
            event={selectedEvent}
            onBack={handleBackFromTimeSlots}
            onUpdate={loadEvents}
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
            <h1>Zeiterfassung RK Schmalegg - Admin</h1>
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
          <h1>Zeiterfassung RK Schmalegg</h1>
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
    return (
      <>
        <header className="App-header">
          <h1>Zeiterfassung RK Schmalegg</h1>
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
          <h1>Zeiterfassung RK Schmalegg - Admin</h1>
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
            <h2>Termine</h2>
            <button className="add-event-button" onClick={() => setCurrentView('create')}>
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
