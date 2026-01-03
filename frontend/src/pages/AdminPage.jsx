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
  const [selectedPerson, setSelectedPerson] = useState(null);
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
    setSelectedPerson(null);
    setError(null);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
    setSelectedPerson(null);
    setCurrentView('list');
  };

  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    setCurrentView('personEvents');
  };

  const handleCreateEvent = async (eventData) => {
    try {
      setError(null);
      const response = await apiService.createEvent(eventData);
      
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

  const handleSaveUpdatedEvent = async (eventData) => {
    try {
      setError(null);
      const response = await apiService.updateEvent(selectedEvent.id, eventData);
      
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
          <PersonsTable onPersonSelect={handlePersonSelect} />
        </main>
      </>
    );
  }

  if (currentView === 'personEvents') {
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
          <div className="person-events-view">
            <div className="section-header">
              <button className="back-button" onClick={() => handleNavigationClick('persons')}>
                ← Zurück zu Personen
              </button>
              <h2>Events für {selectedPerson?.fullName}</h2>
            </div>
            
            <div className="events-list-simple">
              {events.length > 0 ? (
                events.map((event) => {
                  const participation = event.participants?.find(p => p.person.firstName === selectedPerson?.firstName && p.person.lastName === selectedPerson?.lastName);
                  const status = participation ? participation.status : 'nicht eingetragen';
                  
                  return (
                    <div key={event.id} className="event-status-item">
                      <div className="event-info">
                        <h3 className="event-name">{event.name}</h3>
                        <div className="event-meta">
                          <span className="event-date">{event.dateFrom}</span>
                          <span className="event-time">{event.timeFrom} - {event.timeTo}</span>
                        </div>
                      </div>
                      <div className="participation-status">
                        <span className={`status-badge ${status.replace(' ', '-')}`}>
                          {status === 'accepted' && '✅ Zugesagt'}
                          {status === 'declined' && '❌ Abgesagt'}
                          {status === 'pending' && '⏳ Ausstehend'}
                          {status === 'nicht eingetragen' && '➖ Nicht eingetragen'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Keine Events vorhanden</p>
              )}
            </div>
          </div>
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
            onCancel={handleBackToList} 
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
