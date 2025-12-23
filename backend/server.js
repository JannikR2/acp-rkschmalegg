import express from 'express'
import cors from 'cors'
import * as dataService from './data.js'

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
}

const app = express()

app.use(cors(corsOptions))
app.use(express.json()) // Parse JSON request bodies

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'RK Schmalegg Zeiterfassung API Server läuft!' })
})

// Get all events
app.get('/api/events', (req, res) => {
  try {
    const events = dataService.getAllEvents()
    res.json({
      success: true,
      data: events,
      totalEvents: events.length,
      totalHours: dataService.getTotalTrackedHours()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Events',
      error: error.message
    })
  }
})

// Get specific event by ID
app.get('/api/events/:id', (req, res) => {
  try {
    const event = dataService.getEventById(req.params.id)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event nicht gefunden'
      })
    }
    res.json({
      success: true,
      data: event
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden des Events',
      error: error.message
    })
  }
})

// Create new event
app.post('/api/events', (req, res) => {
  try {
    const newEvent = dataService.createEvent(req.body)
    res.status(201).json({
      success: true,
      data: newEvent,
      message: 'Event erfolgreich erstellt'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Fehler beim Erstellen des Events',
      error: error.message
    })
  }
})

// Update existing event
app.put('/api/events/:id', (req, res) => {
  try {
    const updatedEvent = dataService.updateEvent(req.params.id, req.body)
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event nicht gefunden'
      })
    }
    res.json({
      success: true,
      data: updatedEvent,
      message: 'Event erfolgreich aktualisiert'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Fehler beim Aktualisieren des Events',
      error: error.message
    })
  }
})

// Delete event
app.delete('/api/events/:id', (req, res) => {
  try {
    const deleted = dataService.deleteEvent(req.params.id)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Event nicht gefunden'
      })
    }
    res.json({
      success: true,
      message: 'Event erfolgreich gelöscht'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen des Events',
      error: error.message
    })
  }
})

// Get total tracked hours across all events
app.get('/api/stats/hours', (req, res) => {
  try {
    const totalHours = dataService.getTotalTrackedHours()
    res.json({
      success: true,
      data: {
        totalHours: totalHours,
        totalEvents: dataService.getAllEvents().length
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Statistiken',
      error: error.message
    })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
  console.log('API Endpoints:')
  console.log('  GET    /api/events         - Alle Events abrufen')
  console.log('  GET    /api/events/:id     - Einzelnes Event abrufen')
  console.log('  POST   /api/events         - Neues Event erstellen')
  console.log('  PUT    /api/events/:id     - Event aktualisieren')
  console.log('  DELETE /api/events/:id     - Event löschen')
  console.log('  GET    /api/stats/hours    - Gesamtstunden abrufen')
})