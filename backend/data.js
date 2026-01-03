import { Person, Participant, Event, TimeSlot } from './models.js';
import * as userService from './userManagement.js';

// In-memory data store (in a real app, this would be a database)
let eventsData = [];
let nextEventId = 1;
let nextTimeSlotId = 1;

// Initialize with sample data
function initializeSampleData() {
  const person1 = new Person('Maria', 'Weber');
  const person2 = new Person('Stefan', 'Müller');
  const person3 = new Person('Anna', 'Schmidt');
  const person4 = new Person('Thomas', 'Fischer');
  const person5 = new Person('Lisa', 'Wagner');

  // Create participants with only status (no time tracking)
  const participant1Event1 = new Participant(person1, 'accepted');
  const participant2Event1 = new Participant(person2, 'accepted');
  const participant3Event1 = new Participant(person3, 'accepted');

  const participant1Event2 = new Participant(person1, 'accepted');
  const participant2Event2 = new Participant(person2, 'accepted');
  const participant4Event2 = new Participant(person4, 'accepted');
  const participant5Event2 = new Participant(person5, 'accepted');

  const participant1Event3 = new Participant(person1, 'accepted');
  const participant2Event3 = new Participant(person2, 'accepted');
  const participant3Event3 = new Participant(person3, 'accepted');
  const participant4Event3 = new Participant(person4, 'accepted');

  const events = [
    new Event({
      id: nextEventId++,
      name: 'Sommerfest',
      description: 'Jährliches Vereinsfest mit Bewirtung, Ponyreiten für Kinder und geselligem Beisammensein',
      dateFrom: '2024-06-20',
      dateTo: '2024-06-20',
      timeFrom: '12:00',
      timeTo: '22:00',
      location: 'Festplatz bei der Reithalle',
      participants: [participant1Event2, participant2Event2, participant4Event2, participant5Event2]
    }),
    new Event({
      id: nextEventId++,
      name: 'Reitturnier Frühjahr',
      description: 'Traditionelles Frühjahrsturnier mit Dressur- und Springprüfungen für alle Altersklassen',
      dateFrom: '2025-01-12',
      dateTo: '2025-01-12',
      timeFrom: '08:00',
      timeTo: '18:00',
      location: 'Reitplatz und Reithalle',
      participants: [participant1Event3, participant2Event3, participant3Event3, participant4Event3]
    }),
    new Event({
      id: nextEventId++,
      name: 'Aufbau Reitplatz',
      description: 'Vorbereitung des Reitplatzes für das kommende Turnier mit Hindernisaufbau und Platzvorbereitung',
      dateFrom: '2024-12-15',
      dateTo: '2024-12-15',
      timeFrom: '08:00',
      timeTo: '12:00',
      location: 'Reitanlage RK Schmalegg',
      participants: [participant1Event1, participant2Event1, participant3Event1]
    })
  ];

  eventsData = events;
}

// Data access functions
export function getAllEvents() {
  // Sort events by dateFrom in descending order (newest first)
  const sortedEvents = eventsData
    .slice() // Create a copy to avoid mutating the original array
    .sort((a, b) => new Date(b.dateFrom) - new Date(a.dateFrom));
  
  return sortedEvents.map(event => event.toJSON());
}

export function getEventById(id) {
  const event = eventsData.find(e => e.id === parseInt(id));
  return event ? event.toJSON() : null;
}

export function createEvent(eventData) {
  // Handle timeSlots if provided
  let timeSlots = [];
  if (eventData.timeSlots && Array.isArray(eventData.timeSlots)) {
    timeSlots = eventData.timeSlots.map(tsData => new TimeSlot({
      id: nextTimeSlotId++,
      ...tsData
    }));
  }

  const event = new Event({
    id: nextEventId++,
    ...eventData,
    timeSlots: timeSlots
  });
  eventsData.push(event);
  return event.toJSON();
}

export function updateEvent(id, eventData) {
  const index = eventsData.findIndex(e => e.id === parseInt(id));
  if (index === -1) return null;
  
  // Get the existing event to preserve participants if not provided
  const existingEvent = eventsData[index];
  
  // Convert participants if they're provided as JSON
  let participants = existingEvent.participants || [];
  if (eventData.participants) {
    participants = eventData.participants.map(p => {
      if (p instanceof Participant) {
        return p;
      }
      // Convert from JSON to Participant instance
      return Participant.fromJSON(p);
    });
  }

  // Handle timeSlots if provided
  let timeSlots = existingEvent.timeSlots || [];
  if (eventData.timeSlots && Array.isArray(eventData.timeSlots)) {
    timeSlots = eventData.timeSlots.map(tsData => {
      // If it has an existing ID, preserve it, otherwise create new one
      const id = (tsData.id && typeof tsData.id === 'number' && tsData.id > 0) ? tsData.id : nextTimeSlotId++;
      return new TimeSlot({
        id: id,
        ...tsData
      });
    });
  }
  
  const updatedEvent = new Event({
    id: parseInt(id),
    ...eventData,
    participants: participants,
    timeSlots: timeSlots
  });
  
  eventsData[index] = updatedEvent;
  return updatedEvent.toJSON();
}

export function deleteEvent(id) {
  const index = eventsData.findIndex(e => e.id === parseInt(id));
  if (index === -1) return false;
  
  eventsData.splice(index, 1);
  return true;
}

// Time Slot Management Functions

export function addTimeSlot(eventId, timeSlotData) {
  const event = eventsData.find(e => e.id === parseInt(eventId));
  if (!event) return null;

  const timeSlot = new TimeSlot({
    id: nextTimeSlotId++,
    ...timeSlotData
  });

  event.addTimeSlot(timeSlot);
  return timeSlot.toJSON();
}

export function updateTimeSlot(eventId, timeSlotId, timeSlotData) {
  const event = eventsData.find(e => e.id === parseInt(eventId));
  if (!event) return null;

  const timeSlotIndex = event.timeSlots.findIndex(ts => ts.id === parseInt(timeSlotId));
  if (timeSlotIndex === -1) return null;

  const updatedTimeSlot = new TimeSlot({
    id: parseInt(timeSlotId),
    ...timeSlotData
  });

  event.timeSlots[timeSlotIndex] = updatedTimeSlot;
  return updatedTimeSlot.toJSON();
}

export function deleteTimeSlot(eventId, timeSlotId) {
  const event = eventsData.find(e => e.id === parseInt(eventId));
  if (!event) return false;

  const initialLength = event.timeSlots.length;
  event.removeTimeSlot(parseInt(timeSlotId));
  return event.timeSlots.length < initialLength;
}

export function getTimeSlotById(eventId, timeSlotId) {
  const event = eventsData.find(e => e.id === parseInt(eventId));
  if (!event) return null;

  const timeSlot = event.getTimeSlotById(parseInt(timeSlotId));
  return timeSlot ? timeSlot.toJSON() : null;
}

// Time slot participation functions
export function getTimeSlotParticipation(eventId, timeSlotId) {
  const event = eventsData.find(e => e.id === parseInt(eventId));
  if (!event) throw new Error('Event nicht gefunden');

  const timeSlot = event.getTimeSlotById(parseInt(timeSlotId));
  if (!timeSlot) throw new Error('Zeitslot nicht gefunden');

  return timeSlot.participants.map(participant => ({
    person: participant.person,
    status: participant.status
  }));
}

export function setTimeSlotParticipation(eventId, timeSlotId, personId, status) {
  const event = eventsData.find(e => e.id === parseInt(eventId));
  if (!event) throw new Error('Event nicht gefunden');

  const timeSlot = event.getTimeSlotById(parseInt(timeSlotId));
  if (!timeSlot) throw new Error('Zeitslot nicht gefunden');

  // Find the person
  const personsData = userService.getAllPersons();
  const person = personsData.find(p => p.id === parseInt(personId));
  if (!person) throw new Error('Person nicht gefunden');

  // Check if already participating
  const existingParticipantIndex = timeSlot.participants.findIndex(p => p.person.id === parseInt(personId));
  
  if (existingParticipantIndex >= 0) {
    // Update existing participation
    timeSlot.participants[existingParticipantIndex].status = status;
  } else {
    // Add new participation - but check capacity for 'accepted' status
    if (status === 'accepted' && timeSlot.isFull()) {
      throw new Error('Zeitslot ist bereits voll');
    }
    
    const newParticipant = new Participant(person, status);
    timeSlot.participants.push(newParticipant);
  }

  return {
    person: person,
    status: status
  };
}

export function removeTimeSlotParticipation(eventId, timeSlotId, personId) {
  const event = eventsData.find(e => e.id === parseInt(eventId));
  if (!event) throw new Error('Event nicht gefunden');

  const timeSlot = event.getTimeSlotById(parseInt(timeSlotId));
  if (!timeSlot) throw new Error('Zeitslot nicht gefunden');

  const initialLength = timeSlot.participants.length;
  timeSlot.participants = timeSlot.participants.filter(p => p.person.id !== parseInt(personId));
  
  return timeSlot.participants.length < initialLength;
}

// Initialize the data when the module is loaded
initializeSampleData();
