// Person object type
export class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.manualHours = 0; // Manually entered hours (e.g., from Excel import)
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Convert to JSON-serializable object
  toJSON() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      manualHours: this.manualHours
    };
  }

  // Create from JSON object
  static fromJSON(json) {
    const person = new Person(json.firstName, json.lastName);
    person.manualHours = json.manualHours || 0;
    return person;
  }
}

// Participant with status (no time tracking)
export class Participant {
  constructor(person, status = 'declined') {
    this.person = person; // Person object
    this.status = status; // 'accepted', 'declined'
  }

  // Convert to JSON-serializable object
  toJSON() {
    return {
      person: this.person.toJSON ? this.person.toJSON() : this.person,
      status: this.status
    };
  }

  // Create from JSON object
  static fromJSON(json) {
    const person = Person.fromJSON(json.person);
    return new Participant(person, json.status || 'declined');
  }
}

// TimeSlot within an event
export class TimeSlot {
  constructor({
    id,
    name,
    timeFrom,
    timeTo,
    maxParticipants,
    category = '',
    participants = []
  }) {
    this.id = id;
    this.name = name;
    this.timeFrom = timeFrom; // Time string (e.g., "10:00")
    this.timeTo = timeTo;     // Time string (e.g., "11:00")
    this.maxParticipants = maxParticipants || 0;
    this.category = category; // Category for grouping timeslots (e.g., "Parcour", "Putzen")
    this.participants = participants; // Array of Participant objects
  }

  // Get available spots
  getAvailableSpots() {
    return Math.max(0, this.maxParticipants - this.getAcceptedCount());
  }

  // Get count of accepted participants
  getAcceptedCount() {
    return this.participants.filter(p => p.status === 'accepted').length;
  }

  // Check if slot is full
  isFull() {
    return this.getAcceptedCount() >= this.maxParticipants;
  }

  // Add participant to time slot
  addParticipant(participant) {
    if (participant instanceof Participant && !this.isFull()) {
      this.participants.push(participant);
    }
  }

  // Remove participant from time slot
  removeParticipant(participant) {
    this.participants = this.participants.filter(p => 
      p.person.firstName !== participant.person.firstName || 
      p.person.lastName !== participant.person.lastName
    );
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
      timeFrom: this.timeFrom,
      timeTo: this.timeTo,
      maxParticipants: this.maxParticipants,
      category: this.category,
      participants: this.participants.map(p => p.toJSON()),
      availableSpots: this.getAvailableSpots(),
      isFull: this.isFull()
    };
  }

  // Create from JSON object
  static fromJSON(json) {
    const participants = (json.participants || []).map(p => Participant.fromJSON(p));
    return new TimeSlot({
      ...json,
      participants
    });
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
    participants = [], // Array of Participant objects
    timeSlots = [], // Array of TimeSlot objects
    status = 'draft' // 'draft' or 'published'
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
    this.timeSlots = timeSlots; // Array of TimeSlot objects
    this.status = status; // 'draft' or 'published'
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

  // Add time slot to event
  addTimeSlot(timeSlot) {
    if (timeSlot instanceof TimeSlot) {
      this.timeSlots.push(timeSlot);
    }
  }

  // Remove time slot from event
  removeTimeSlot(timeSlotId) {
    this.timeSlots = this.timeSlots.filter(ts => ts.id !== timeSlotId);
  }

  // Get time slot by ID
  getTimeSlotById(timeSlotId) {
    return this.timeSlots.find(ts => ts.id === timeSlotId);
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
      status: this.status,
      participants: this.participants.map(p => p.toJSON()),
      timeSlots: this.timeSlots.map(ts => ts.toJSON())
    };
  }

  // Create from JSON object
  static fromJSON(json) {
    const participants = (json.participants || []).map(p => Participant.fromJSON(p));
    const timeSlots = (json.timeSlots || []).map(ts => TimeSlot.fromJSON(ts));
    return new Event({
      ...json,
      participants,
      timeSlots
    });
  }
}
