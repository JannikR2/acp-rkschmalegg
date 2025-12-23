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

// TimeSpan object for tracking individual work periods
export class TimeSpan {
  constructor({
    date,
    timeFrom,
    timeTo,
    description = ''
  }) {
    this.date = date; // Date when the work was done
    this.timeFrom = timeFrom; // Start time (e.g., "09:00")
    this.timeTo = timeTo; // End time (e.g., "12:30")
    this.description = description; // Optional description of what was done
  }

  getDuration() {
    if (!this.timeFrom || !this.timeTo) return 0;
    
    const [fromHour, fromMin] = this.timeFrom.split(':').map(Number);
    const [toHour, toMin] = this.timeTo.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;
    
    return (toMinutes - fromMinutes) / 60;
  }

  getFormattedDuration() {
    const duration = this.getDuration();
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}min`;
  }

  getTimeRange() {
    if (!this.timeFrom || !this.timeTo) return '';
    return `${this.timeFrom} - ${this.timeTo}`;
  }

  // Convert to JSON-serializable object
  toJSON() {
    return {
      date: this.date,
      timeFrom: this.timeFrom,
      timeTo: this.timeTo,
      description: this.description
    };
  }

  // Create from JSON object
  static fromJSON(json) {
    return new TimeSpan(json);
  }
}

// Participant with individual time tracking
export class Participant {
  constructor(person, timeSpans = []) {
    this.person = person; // Person object
    this.timeSpans = timeSpans; // Array of TimeSpan objects
  }

  addTimeSpan(timeSpan) {
    this.timeSpans.push(timeSpan);
  }

  removeTimeSpan(index) {
    this.timeSpans.splice(index, 1);
  }

  getTotalHours() {
    return this.timeSpans.reduce((total, timeSpan) => total + timeSpan.getDuration(), 0);
  }

  // Convert to JSON-serializable object
  toJSON() {
    return {
      person: this.person.toJSON(),
      timeSpans: this.timeSpans.map(ts => ts.toJSON())
    };
  }

  // Create from JSON object
  static fromJSON(json) {
    const person = Person.fromJSON(json.person);
    const timeSpans = json.timeSpans.map(ts => TimeSpan.fromJSON(ts));
    return new Participant(person, timeSpans);
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

  // Get total hours tracked by all participants
  getTotalTrackedHours() {
    return this.participants.reduce((total, participant) => total + participant.getTotalHours(), 0);
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

  // Get participant with their tracked hours
  getParticipantsWithHours() {
    return this.participants.map(participant => ({
      name: participant.person.getFullName(),
      hours: participant.getTotalHours(),
      timeSpans: participant.timeSpans
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
    const participants = json.participants.map(p => Participant.fromJSON(p));
    return new Event({
      ...json,
      participants
    });
  }
}
