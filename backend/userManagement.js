import { Person, Participant } from './models.js';

// In-memory data store for persons
let personsData = [];
let nextPersonId = 1;

// Reference to eventsData will be set by data.js
let getEventsDataFn = null;

export function setEventsDataAccessor(fn) {
  getEventsDataFn = fn;
}

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
    person.manualHours = 0;
  });

  personsData = persons;
}

// Helper function to calculate duration in hours from time strings
function calculateHours(timeFrom, timeTo) {
  if (!timeFrom || !timeTo) return 0;
  
  const [fromHour, fromMin] = timeFrom.split(':').map(Number);
  const [toHour, toMin] = timeTo.split(':').map(Number);
  
  const fromMinutes = fromHour * 60 + fromMin;
  const toMinutes = toHour * 60 + toMin;
  
  return (toMinutes - fromMinutes) / 60;
}

// Calculate total hours for a person across all events and timeslots
export function calculatePersonHours(personId, year = null) {
  // Get manual hours for this person
  const person = personsData.find(p => p.id === parseInt(personId));
  
  // Only include manual hours if NO year filter is applied
  const manualHours = (!year && person) ? (person.manualHours || 0) : 0;

  if (!getEventsDataFn) {
    return { totalHours: manualHours, approvedHours: 0 };
  }

  const events = getEventsDataFn();
  let timeslotHours = 0;
  let approvedHours = 0;

  events.forEach(event => {
    // Filter by year if provided
    if (year && event.dateFrom) {
      const eventYear = new Date(event.dateFrom).getFullYear();
      if (eventYear !== parseInt(year)) {
        return; // Skip this event
      }
    }

    if (event.timeSlots && Array.isArray(event.timeSlots)) {
      event.timeSlots.forEach(timeSlot => {
        if (timeSlot.participants && Array.isArray(timeSlot.participants)) {
          const participation = timeSlot.participants.find(
            p => p.person && p.person.id === parseInt(personId)
          );
          
          if (participation && participation.status === 'accepted') {
            const hours = calculateHours(timeSlot.timeFrom, timeSlot.timeTo);
            timeslotHours += hours;
            // For now, we consider all accepted hours as approved
            // This can be extended with an additional approval workflow
            approvedHours += hours;
          }
        }
      });
    }
  });

  return {
    totalHours: Math.round((manualHours + timeslotHours) * 10) / 10, // Round to 1 decimal
    approvedHours: Math.round(approvedHours * 10) / 10
  };
}

// Person management functions
export function getAllPersons(year = null) {
  return personsData.map(person => {
    const hours = calculatePersonHours(person.id, year);
    return {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      fullName: person.getFullName(),
      email: person.email,
      phone: person.phone,
      totalHours: hours.totalHours,
      approvedHours: hours.approvedHours
    };
  });
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
  newPerson.manualHours = personData.manualHours || personData.hours || 0;
  
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

// Import persons from an array (overwrites all existing persons)
export function importPersons(personsArray) {
  if (!Array.isArray(personsArray)) {
    throw new Error('Import data must be an array');
  }

  // Validate all entries first
  for (const personData of personsArray) {
    if (!personData.firstName || !personData.lastName) {
      throw new Error('Each person must have firstName and lastName');
    }
  }

  // Clear existing persons
  personsData = [];
  nextPersonId = 1;

  // Import new persons
  const imported = personsArray.map(personData => {
    const newPerson = new Person(personData.firstName, personData.lastName);
    newPerson.id = nextPersonId++;
    newPerson.email = personData.email || `${personData.firstName.toLowerCase()}.${personData.lastName.toLowerCase()}@rk-schmalegg.de`;
    newPerson.phone = personData.phone || '';
    // Support both 'hours' and 'manualHours' from import
    newPerson.manualHours = parseFloat(personData.manualHours || personData.hours || 0);
    
    personsData.push(newPerson);
    
    return {
      id: newPerson.id,
      firstName: newPerson.firstName,
      lastName: newPerson.lastName,
      fullName: newPerson.getFullName(),
      email: newPerson.email,
      phone: newPerson.phone
    };
  });

  return imported;
}

// Initialize on module load
initializeSamplePersons();

// Export the service object
export default {
  getAllPersons,
  getPersonById,
  createPerson,
  importPersons
};
