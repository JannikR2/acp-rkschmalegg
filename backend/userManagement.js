import { Person, Participant } from './models.js';

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
  // Sample participation - only status, no time tracking
  const sampleParticipation = [
    // Event 1
    { personId: 1, eventId: 1, status: 'accepted' },
    { personId: 2, eventId: 1, status: 'accepted' },
    { personId: 3, eventId: 1, status: 'accepted' },
    { personId: 4, eventId: 1, status: 'pending' },
    { personId: 5, eventId: 1, status: 'declined' },

    // Event 2
    { personId: 1, eventId: 2, status: 'accepted' },
    { personId: 2, eventId: 2, status: 'accepted' },
    { personId: 4, eventId: 2, status: 'accepted' },
    { personId: 5, eventId: 2, status: 'accepted' },

    // Event 3
    { personId: 1, eventId: 3, status: 'accepted' },
    { personId: 2, eventId: 3, status: 'accepted' },
    { personId: 3, eventId: 3, status: 'accepted' },
    { personId: 4, eventId: 3, status: 'accepted' },
    { personId: 6, eventId: 3, status: 'pending' },
    { personId: 7, eventId: 3, status: 'declined' }
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
    phone: person.phone,
    isAdmin: false // Regular users are not admin by default
  };
}

export function createPerson(personData) {
  const newPerson = new Person(personData.firstName, personData.lastName);
  newPerson.id = nextPersonId++;
  newPerson.email = personData.email || `${personData.firstName.toLowerCase()}.${personData.lastName.toLowerCase()}@rk-schmalegg.de`;
  newPerson.phone = personData.phone || '';
  
  personsData.push(newPerson);
  
  return {
    id: newPerson.id,
    firstName: newPerson.firstName,
    lastName: newPerson.lastName,
    fullName: newPerson.getFullName(),
    email: newPerson.email,
    phone: newPerson.phone
  };
}

// Participation management functions
export function getEventParticipation(eventId) {
  const participations = eventParticipationData.filter(p => p.eventId === parseInt(eventId));
  
  return participations.map(participation => {
    const person = personsData.find(p => p.id === participation.personId);
    if (!person) return null;

    return {
      personId: participation.personId,
      person: person.getFullName(),
      email: person.email,
      status: participation.status
    };
  }).filter(p => p !== null);
}

export function updateParticipationStatus(eventId, personId, status) {
  // Valid statuses: 'accepted', 'declined', 'pending', 'not_responded'
  const validStatuses = ['accepted', 'declined', 'pending', 'not_responded'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  const participationIndex = eventParticipationData.findIndex(
    p => p.eventId === parseInt(eventId) && p.personId === parseInt(personId)
  );

  if (participationIndex >= 0) {
    // Update existing participation
    eventParticipationData[participationIndex].status = status;
  } else {
    // Create new participation entry
    eventParticipationData.push({
      personId: parseInt(personId),
      eventId: parseInt(eventId),
      status: status
    });
  }

  return true;
}

// Initialize on module load
initializeSamplePersons();

// Export the service object
export default {
  getAllPersons,
  getPersonById,
  createPerson,
  getEventParticipation,
  updateParticipationStatus
};
