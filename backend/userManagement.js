import { Person, Participant } from './models.js';

// In-memory data store for persons
let personsData = [];
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

// Initialize on module load
initializeSamplePersons();

// Export the service object
export default {
  getAllPersons,
  getPersonById,
  createPerson
};
