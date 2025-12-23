import express from 'express'
import cors from 'cors'
import * as dataService from './data.js'
import * as userService from './userManagement.js'

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

// User Management Endpoints

// Get all persons
app.get('/api/persons', (req, res) => {
  try {
    const persons = userService.getAllPersons()
    res.json({
      success: true,
      data: persons
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Personen',
      error: error.message
    })
  }
})

// Get specific person by ID
app.get('/api/persons/:id', (req, res) => {
  try {
    const person = userService.getPersonById(req.params.id)
    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Person nicht gefunden'
      })
    }
    res.json({
      success: true,
      data: person
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Person',
      error: error.message
    })
  }
})

// Create new person
app.post('/api/persons', (req, res) => {
  try {
    const newPerson = userService.createPerson(req.body)
    res.status(201).json({
      success: true,
      data: newPerson,
      message: 'Person erfolgreich erstellt'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Fehler beim Erstellen der Person',
      error: error.message
    })
  }
})

// Event Participation Endpoints

// Get event participation data
app.get('/api/events/:eventId/participation', (req, res) => {
  try {
    const participation = userService.getEventParticipation(req.params.eventId)
    res.json({
      success: true,
      data: participation
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Teilnahmedaten',
      error: error.message
    })
  }
})

// Update participation status
app.put('/api/events/:eventId/participation/:personId/status', (req, res) => {
  try {
    const { status } = req.body
    const updated = userService.updateParticipationStatus(req.params.eventId, req.params.personId, status)
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Teilnahme nicht gefunden'
      })
    }
    res.json({
      success: true,
      message: 'Teilnahmestatus aktualisiert'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Fehler beim Aktualisieren des Teilnahmestatus',
      error: error.message
    })
  }
})

// Add time span for participant
app.post('/api/events/:eventId/participation/:personId/timespans', (req, res) => {
  try {
    const added = userService.addTimeSpan(req.params.eventId, req.params.personId, req.body)
    if (!added) {
      return res.status(400).json({
        success: false,
        message: 'Zeitspanne konnte nicht hinzugefügt werden'
      })
    }
    res.status(201).json({
      success: true,
      message: 'Zeitspanne erfolgreich hinzugefügt'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Fehler beim Hinzufügen der Zeitspanne',
      error: error.message
    })
  }
})

// Remove time span for participant
app.delete('/api/events/:eventId/participation/:personId/timespans/:index', (req, res) => {
  try {
    const removed = userService.removeTimeSpan(req.params.eventId, req.params.personId, parseInt(req.params.index))
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Zeitspanne nicht gefunden'
      })
    }
    res.json({
      success: true,
      message: 'Zeitspanne erfolgreich entfernt'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Entfernen der Zeitspanne',
      error: error.message
    })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
  console.log('API Endpoints:')
  console.log('  Events:')
  console.log('    GET    /api/events         - Alle Events abrufen')
  console.log('    GET    /api/events/:id     - Einzelnes Event abrufen')
  console.log('    POST   /api/events         - Neues Event erstellen')
  console.log('    PUT    /api/events/:id     - Event aktualisieren')
  console.log('    DELETE /api/events/:id     - Event löschen')
  console.log('    GET    /api/stats/hours    - Gesamtstunden abrufen')
  console.log('  Persons:')
  console.log('    GET    /api/persons        - Alle Personen abrufen')
  console.log('    GET    /api/persons/:id    - Einzelne Person abrufen')
  console.log('    POST   /api/persons        - Neue Person erstellen')
  console.log('  Participation:')
  console.log('    GET    /api/events/:eventId/participation              - Teilnahmedaten abrufen')
  console.log('    PUT    /api/events/:eventId/participation/:personId/status - Teilnahmestatus aktualisieren')
  console.log('    POST   /api/events/:eventId/participation/:personId/timespans - Zeitspanne hinzufügen')
  console.log('    DELETE /api/events/:eventId/participation/:personId/timespans/:index - Zeitspanne entfernen')
})