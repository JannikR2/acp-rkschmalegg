import { Person, TimeSpan, Participant } from './models.js';

// In-memory data store for persons and their event participation
let personsData = [];
let eventParticipationData = []; // Stores participation status for each person-event combination
let nextPersonId = 1;

// Initialize with sample persons
function initializeSamplePersons() {
  const persons = [
    new Person('Maria', 'Weber'),
    new Person('Stefan', 'Müller'),
    new Person('Anna', 'Schmidt'),
    new Person('Thomas', 'Fischer'),
    new Person('Lisa', 'Wagner'),
    new Person('Michael', 'Bauer'),
    new Person('Sarah', 'Hoffmann'),
    new Person('Daniel', 'Richter')
  ];

  // Add IDs to persons
  persons.forEach(person => {
    person.id = nextPersonId++;
    person.email = `${person.firstName.toLowerCase()}.${person.lastName.toLowerCase()}@rk-schmalegg.de`;
    person.phone = `+49 175 ${Math.floor(Math.random() * 9000000) + 1000000}`;
  });

  personsData = persons;

  // Initialize some sample participation data
  initializeSampleParticipation();
}

function initializeSampleParticipation() {
  // Sample participation for event ID 1 (will be mapped to actual events)
  const sampleParticipation = [
    { personId: 1, eventId: 1, status: 'accepted', timeSpans: [
      { date: '2024-12-15', timeFrom: '08:00', timeTo: '12:00', description: 'Hindernisse aufgebaut und Platz vorbereitet' }
    ]},
    { personId: 2, eventId: 1, status: 'accepted', timeSpans: [
      { date: '2024-12-15', timeFrom: '08:30', timeTo: '11:30', description: 'Absperrungen gesetzt und Boden geebnet' }
    ]},
    { personId: 3, eventId: 1, status: 'accepted', timeSpans: [
      { date: '2024-12-15', timeFrom: '09:00', timeTo: '12:00', description: 'Equipment sortiert und Richterstand aufgebaut' }
    ]},
    { personId: 4, eventId: 1, status: 'pending', timeSpans: [] },
    { personId: 5, eventId: 1, status: 'declined', timeSpans: [] },

    // Sample participation for event ID 2
    { personId: 1, eventId: 2, status: 'accepted', timeSpans: [
      { date: '2024-06-20', timeFrom: '06:00', timeTo: '10:00', description: 'Zelte aufgebaut und Dekoration angebracht' },
      { date: '2024-06-20', timeFrom: '14:00', timeTo: '18:00', description: 'Gästebetreuung und Festorganisation' },
      { date: '2024-06-20', timeFrom: '20:00', timeTo: '22:00', description: 'Aufräumarbeiten und Abbau' }
    ]},
    { personId: 2, eventId: 2, status: 'accepted', timeSpans: [
      { date: '2024-06-20', timeFrom: '07:00', timeTo: '11:00', description: 'Grillstation vorbereitet und Getränke organisiert' },
      { date: '2024-06-20', timeFrom: '15:00', timeTo: '19:00', description: 'Bewirtung der Gäste' }
    ]},
    { personId: 4, eventId: 2, status: 'accepted', timeSpans: [
      { date: '2024-06-19', timeFrom: '16:00', timeTo: '19:00', description: 'Vorbereitungen und Einkäufe' },
      { date: '2024-06-20', timeFrom: '12:00', timeTo: '20:00', description: 'Festleitung und Koordination' }
    ]},
    { personId: 5, eventId: 2, status: 'accepted', timeSpans: [
      { date: '2024-06-20', timeFrom: '13:00', timeTo: '17:00', description: 'Kinderbetreuung und Ponyreiten organisiert' }
    ]},

    // Sample participation for event ID 3
    { personId: 1, eventId: 3, status: 'accepted', timeSpans: [
      { date: '2025-01-12', timeFrom: '06:00', timeTo: '08:00', description: 'Parcours aufgebaut und vermessen' },
      { date: '2025-01-12', timeFrom: '08:00', timeTo: '17:00', description: 'Turnierleitung und Protokollführung' }
    ]},
    { personId: 2, eventId: 3, status: 'accepted', timeSpans: [
      { date: '2025-01-12', timeFrom: '07:00', timeTo: '18:00', description: 'Richtertätigkeit Dressur und Springen' }
    ]},
    { personId: 3, eventId: 3, status: 'accepted', timeSpans: [
      { date: '2025-01-12', timeFrom: '06:30', timeTo: '12:00', description: 'Anmeldung und Startnummernvergabe' },
      { date: '2025-01-12', timeFrom: '15:00', timeTo: '17:30', description: 'Siegerehrung organisiert' }
    ]},
    { personId: 4, eventId: 3, status: 'accepted', timeSpans: [
      { date: '2025-01-12', timeFrom: '08:00', timeTo: '17:00', description: 'Zeitnahme und Ergebnisdokumentation' }
    ]},
    { personId: 6, eventId: 3, status: 'pending', timeSpans: [] },
    { personId: 7, eventId: 3, status: 'declined', timeSpans: [] }
  ];

  eventParticipationData = sampleParticipation;
}

// Person management functions
export function getAllPersons() {
  return personsData.map(person => ({
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    fullName: person.getFullName(),
    email: person.email,
    phone: person.phone
  }));
}

export function getPersonById(id) {
  const person = personsData.find(p => p.id === parseInt(id));
  if (!person) return null;
  
  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    fullName: person.getFullName(),
    email: person.email,
    phone: person.phone
  };
}

export function createPerson(personData) {
  const person = new Person(personData.firstName, personData.lastName);
  person.id = nextPersonId++;
  person.email = personData.email || `${personData.firstName.toLowerCase()}.${personData.lastName.toLowerCase()}@rk-schmalegg.de`;
  person.phone = personData.phone || '';
  
  personsData.push(person);
  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    fullName: person.getFullName(),
    email: person.email,
    phone: person.phone
  };
}

// Event participation functions
export function getEventParticipation(eventId) {
  return eventParticipationData
    .filter(p => p.eventId === parseInt(eventId))
    .map(participation => {
      const person = personsData.find(p => p.id === participation.personId);
      const totalHours = participation.timeSpans.reduce((total, timeSpan) => {
        return total + calculateTimeSpanDuration(timeSpan);
      }, 0);

      return {
        personId: participation.personId,
        person: person ? person.getFullName() : 'Unknown',
        email: person ? person.email : '',
        status: participation.status,
        timeSpans: participation.timeSpans,
        totalHours: totalHours
      };
    });
}

export function updateParticipationStatus(eventId, personId, status) {
  const participation = eventParticipationData.find(
    p => p.eventId === parseInt(eventId) && p.personId === parseInt(personId)
  );
  
  if (participation) {
    participation.status = status;
    
    // If status is declined, clear all time spans
    if (status === 'declined') {
      participation.timeSpans = [];
    }
  } else {
    // Create new participation record
    eventParticipationData.push({
      personId: parseInt(personId),
      eventId: parseInt(eventId),
      status: status,
      timeSpans: []
    });
  }
  
  return true;
}

export function addTimeSpan(eventId, personId, timeSpanData) {
  let participation = eventParticipationData.find(
    p => p.eventId === parseInt(eventId) && p.personId === parseInt(personId)
  );
  
  if (!participation) {
    participation = {
      personId: parseInt(personId),
      eventId: parseInt(eventId),
      status: 'accepted',
      timeSpans: []
    };
    eventParticipationData.push(participation);
  }
  
  participation.timeSpans.push(timeSpanData);
  return true;
}

export function removeTimeSpan(eventId, personId, timeSpanIndex) {
  const participation = eventParticipationData.find(
    p => p.eventId === parseInt(eventId) && p.personId === parseInt(personId)
  );
  
  if (participation && participation.timeSpans[timeSpanIndex]) {
    participation.timeSpans.splice(timeSpanIndex, 1);
    return true;
  }
  
  return false;
}

function calculateTimeSpanDuration(timeSpan) {
  if (!timeSpan.timeFrom || !timeSpan.timeTo) return 0;
  
  const [fromHour, fromMin] = timeSpan.timeFrom.split(':').map(Number);
  const [toHour, toMin] = timeSpan.timeTo.split(':').map(Number);
  
  const fromMinutes = fromHour * 60 + fromMin;
  const toMinutes = toHour * 60 + toMin;
  
  return (toMinutes - fromMinutes) / 60;
}

// Initialize the data when the module is loaded
initializeSamplePersons();
