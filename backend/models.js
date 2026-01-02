// Person object type
export class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Convert to JSON-serializable object
  toJSON() {
    return {
      firstName: this.firstName,
      lastName: this.lastName
    };
  }

  // Create from JSON object
  static fromJSON(json) {
    return new Person(json.firstName, json.lastName);
  }
}

// Participant with status (no time tracking)
export class Participant {
  constructor(person, status = 'pending') {
    this.person = person; // Person object
    this.status = status; // 'accepted', 'declined', 'pending', 'not_responded'
  }

  // Convert to JSON-serializable object
  toJSON() {
    return {
      person: this.person.toJSON(),
      status: this.status
    };
  }

  // Create from JSON object
  static fromJSON(json) {
    const person = Person.fromJSON(json.person);
    return new Participant(person, json.status || 'pending');
  }
}

// Event object type
export class Event {
  constructor({
    id,
    name,
    description,
    dateFrom,
    dateTo,
    timeFrom,
    timeTo,
    location,
    participants = [] // Array of Participant objects
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.dateFrom = dateFrom; // Date object or ISO string
    this.dateTo = dateTo;     // Date object or ISO string
    this.timeFrom = timeFrom; // Time string (e.g., "09:00")
    this.timeTo = timeTo;     // Time string (e.g., "17:00")
    this.location = location;
    this.participants = participants; // Array of Participant objects
  }

  // Calculate planned duration in hours
  calculatePlannedDuration() {
    if (!this.timeFrom || !this.timeTo) return 0;
    
    const [fromHour, fromMin] = this.timeFrom.split(':').map(Number);
    const [toHour, toMin] = this.timeTo.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;
    
    return (toMinutes - fromMinutes) / 60;
  }

  // Get count of accepted participants
  getAcceptedCount() {
    return this.participants.filter(p => p.status === 'accepted').length;
  }

  // Get count of declined participants
  getDeclinedCount() {
    return this.participants.filter(p => p.status === 'declined').length;
  }

  // Add participant to event
  addParticipant(participant) {
    if (participant instanceof Participant) {
      this.participants.push(participant);
    }
  }

  // Remove participant from event
  removeParticipant(participant) {
    this.participants = this.participants.filter(p => 
      p.person.firstName !== participant.person.firstName || 
      p.person.lastName !== participant.person.lastName
    );
  }

  // Get participant names as string
  getParticipantNames() {
    return this.participants.map(p => p.person.getFullName()).join(', ');
  }

  // Get participants with their status
  getParticipantsWithStatus() {
    return this.participants.map(participant => ({
      name: participant.person.getFullName(),
      status: participant.status
    }));
  }

  // Format date range
  getDateRange() {
    if (!this.dateFrom) return '';
    
    const startDate = new Date(this.dateFrom).toLocaleDateString();
    const endDate = this.dateTo ? new Date(this.dateTo).toLocaleDateString() : startDate;
    
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  }

  // Format time range
  getTimeRange() {
    if (!this.timeFrom || !this.timeTo) return '';
    return `${this.timeFrom} - ${this.timeTo}`;
  }

  // Convert to JSON-serializable object
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      timeFrom: this.timeFrom,
      timeTo: this.timeTo,
      location: this.location,
      participants: this.participants.map(p => p.toJSON())
    };
  }

  // Create from JSON object
  static fromJSON(json) {
    const participants = (json.participants || []).map(p => Participant.fromJSON(p));
    return new Event({
      ...json,
      participants
    });
  }
}
