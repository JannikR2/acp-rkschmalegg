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
      totalEvents: events.length
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

// Time Slot Management API Routes

// Get all time slots for an event
app.get('/api/events/:eventId/timeslots', (req, res) => {
  try {
    const event = dataService.getEventById(req.params.eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event nicht gefunden'
      })
    }
    res.json({
      success: true,
      data: event.timeSlots || [],
      eventId: event.id
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Time Slots',
      error: error.message
    })
  }
})

// Add time slot to event
app.post('/api/events/:eventId/timeslots', (req, res) => {
  try {
    const timeSlot = dataService.addTimeSlot(req.params.eventId, req.body)
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Event nicht gefunden'
      })
    }
    res.json({
      success: true,
      data: timeSlot,
      message: 'Time Slot erfolgreich erstellt'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Fehler beim Erstellen des Time Slots',
      error: error.message
    })
  }
})

// Update time slot
app.put('/api/events/:eventId/timeslots/:timeSlotId', (req, res) => {
  try {
    const timeSlot = dataService.updateTimeSlot(req.params.eventId, req.params.timeSlotId, req.body)
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time Slot nicht gefunden'
      })
    }
    res.json({
      success: true,
      data: timeSlot,
      message: 'Time Slot erfolgreich aktualisiert'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Fehler beim Aktualisieren des Time Slots',
      error: error.message
    })
  }
})

// Delete time slot
app.delete('/api/events/:eventId/timeslots/:timeSlotId', (req, res) => {
  try {
    const success = dataService.deleteTimeSlot(req.params.eventId, req.params.timeSlotId)
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Time Slot nicht gefunden'
      })
    }
    res.json({
      success: true,
      message: 'Time Slot erfolgreich gelöscht'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Fehler beim Löschen des Time Slots',
      error: error.message
    })
  }
})

// Get time slot participation
app.get('/api/events/:eventId/timeslots/:timeSlotId/participation', (req, res) => {
  try {
    const participation = dataService.getTimeSlotParticipation(req.params.eventId, req.params.timeSlotId)
    res.json({
      success: true,
      data: participation
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Fehler beim Laden der Teilnahmedaten',
      error: error.message
    })
  }
})

// Manage time slot participation
app.post('/api/events/:eventId/timeslots/:timeSlotId/participation', (req, res) => {
  try {
    const { personId, status } = req.body
    
    if (status === 'remove') {
      const success = dataService.removeTimeSlotParticipation(req.params.eventId, req.params.timeSlotId, personId)
      if (success) {
        res.json({
          success: true,
          message: 'Teilnahme erfolgreich entfernt'
        })
      } else {
        res.status(404).json({
          success: false,
          message: 'Teilnahme nicht gefunden'
        })
      }
    } else {
      const participation = dataService.setTimeSlotParticipation(req.params.eventId, req.params.timeSlotId, personId, status)
      if (participation) {
        res.json({
          success: true,
          data: participation,
          message: `Teilnahmestatus erfolgreich auf '${status}' gesetzt`
        })
      } else {
        res.status(400).json({
          success: false,
          message: 'Fehler beim Setzen des Teilnahmestatus'
        })
      }
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Fehler beim Verwalten der Teilnahme',
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
  console.log('  Persons:')
  console.log('    GET    /api/persons        - Alle Personen abrufen')
  console.log('    GET    /api/persons/:id    - Einzelne Person abrufen')
  console.log('    POST   /api/persons        - Neue Person erstellen')
  console.log('  Participation:')
  console.log('    GET    /api/events/:eventId/participation              - Teilnahmedaten abrufen')
  console.log('    PUT    /api/events/:eventId/participation/:personId/status - Teilnahmestatus aktualisieren')
  console.log('  Zeitslots:')
  console.log('    GET    /api/events/:eventId/timeslots                   - Zeitslots für Event abrufen')
  console.log('    POST   /api/events/:eventId/timeslots                   - Zeitslot erstellen')
  console.log('    PUT    /api/events/:eventId/timeslots/:timeSlotId      - Zeitslot aktualisieren')
  console.log('    DELETE /api/events/:eventId/timeslots/:timeSlotId      - Zeitslot löschen')
  console.log('  Zeitslot Teilnahme:')
  console.log('    GET    /api/events/:eventId/timeslots/:timeSlotId/participation - Zeitslot Teilnahmedaten abrufen')
  console.log('    POST   /api/events/:eventId/timeslots/:timeSlotId/participation - Zeitslot Teilnahme verwalten')
})