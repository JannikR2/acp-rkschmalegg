import axios from 'axios'
import { useState, useEffect } from 'react'
import './App.css'
import apiService, { EventUtils } from './apiService'
import EventListItem from './EventListItem'
import EventDetails from './EventDetails'

function App() {  
  const [message, setMessage] = useState('')
  const [events, setEvents] = useState([])
  const [totalHours, setTotalHours] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentView, setCurrentView] = useState('list') // 'list' or 'details'
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

  const handleBackToList = () => {
    setSelectedEvent(null)
    setCurrentView('list')
  }

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
          <EventDetails event={selectedEvent} onBack={handleBackToList} />
        </main>
      </>
    )
  }

  return (
    <>
      <header className="App-header">
        <h1>Zeiterfassung RK Schmalegg</h1>
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
            <h2>Termine & Zeiterfassung</h2>
            <div className="total-hours">
              Gesamt: <strong>{totalHours.toFixed(1)}h</strong>
            </div>
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
