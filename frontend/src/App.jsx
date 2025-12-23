import axios from 'axios'
import { useState, useEffect } from 'react'
import './App.css'
import apiService, { EventUtils } from './apiService'
import EventListItem from './EventListItem'
import EventDetails from './EventDetails'
import EventForm from './EventForm'
import PersonsTable from './PersonsTable'
import UserLogin from './UserLogin'
import UserDashboard from './UserDashboard'

function App() {  
  const [message, setMessage] = useState('')
  const [events, setEvents] = useState([])
  const [totalHours, setTotalHours] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentView, setCurrentView] = useState('list') // 'list', 'details', 'create', 'edit', or 'persons'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch server status
    axios.get('http://localhost:3000/')
      .then(response => {
        setMessage(response.data.message)
      })
      .catch(error => {
        console.error('There was an error fetching the server message!', error)
      })

    // Fetch events from backend
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getAllEvents()
      
      if (response.success) {
        setEvents(response.data)
        setTotalHours(response.totalHours)
      } else {
        setError('Fehler beim Laden der Events')
      }
    } catch (error) {
      console.error('Error loading events:', error)
      setError('Verbindung zum Server fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setCurrentView('details')
  }

  const handleUserLogin = (user) => {
    setCurrentUser(user);
    if (user.isAdmin) {
      setCurrentView('list');
    }
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    setCurrentView('list');
    setSelectedEvent(null);
    setSelectedPerson(null);
    setError(null);
  };

  const handlePersonSelect = (person) => {
    setSelectedPerson(person)
    setCurrentView('personEvents')
  }

  const handleNavigationClick = (view) => {
    setCurrentView(view)
    setSelectedEvent(null)
    setSelectedPerson(null)
    setError(null)
  }

  const handleBackToList = () => {
    setSelectedEvent(null)
    setCurrentView('list')
  }

  const handleCreateEvent = async (eventData) => {
    try {
      setError(null)
      const response = await apiService.createEvent(eventData)
      
      if (response.success) {
        // Refresh the events list
        await loadEvents()
        setCurrentView('list')
        // Could show success message here
      } else {
        setError('Fehler beim Erstellen des Events')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      setError('Fehler beim Erstellen des Events')
    }
  }

  const handleUpdateEvent = (event) => {
    setSelectedEvent(event)
    setCurrentView('edit')
  }

  const handleSaveUpdatedEvent = async (eventData) => {
    try {
      setError(null)
      const response = await apiService.updateEvent(selectedEvent.id, eventData)
      
      if (response.success) {
        // Refresh the events list
        await loadEvents()
        setCurrentView('list')
      } else {
        setError('Fehler beim Aktualisieren des Events')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      setError('Fehler beim Aktualisieren des Events')
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      setError(null)
      const response = await apiService.deleteEvent(eventId)
      
      if (response.success) {
        // Refresh the events list
        await loadEvents()
        setCurrentView('list')
      } else {
        setError('Fehler beim Löschen des Events')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      setError('Fehler beim Löschen des Events')
    }
  }

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <UserLogin onUserSelect={handleUserLogin} />;
  }

  // Show user dashboard for non-admin users
  if (!currentUser.isAdmin) {
    return <UserDashboard user={currentUser} onLogout={handleUserLogout} />;
  }

  // Admin interface continues below
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
    )
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
          />
        </main>
      </>
    )
  }

  // Render Persons view
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
              <button className="logout-button" onClick={handleUserLogout}>
                Abmelden
              </button>
            </div>
          </div>
        </header>
        <main className="App-main">
          <PersonsTable onPersonSelect={handlePersonSelect} />
        </main>
      </>
    )
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
    )
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
    )
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
            <button className="logout-button" onClick={handleUserLogout}>
              Abmelden
            </button>
          </div>
        </div>
      </header>
      <main className="App-main">
        <div className="server-message">{message}</div>
        
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
  )
}

export default App
