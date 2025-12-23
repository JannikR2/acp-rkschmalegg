// Person object type
export class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
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
}

// Event object type
export class Event {
  constructor({
    name,
    description,
    dateFrom,
    dateTo,
    timeFrom,
    timeTo,
    location,
    participants = [] // Array of Participant objects
  }) {
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
}

// Helper function to create sample data
export function createSampleEvents() {
  const person1 = new Person('Maria', 'Weber');
  const person2 = new Person('Stefan', 'Müller');
  const person3 = new Person('Anna', 'Schmidt');
  const person4 = new Person('Thomas', 'Fischer');
  const person5 = new Person('Lisa', 'Wagner');

  // Create participants for "Aufbau Reitplatz"
  const participant1Event1 = new Participant(person1, [
    new TimeSpan({ 
      date: '2024-03-15', 
      timeFrom: '08:00', 
      timeTo: '12:00', 
      description: 'Hindernisse aufgebaut und Platz vorbereitet' 
    })
  ]);

  const participant2Event1 = new Participant(person2, [
    new TimeSpan({ 
      date: '2024-03-15', 
      timeFrom: '08:30', 
      timeTo: '11:30', 
      description: 'Absperrungen gesetzt und Boden geebnet' 
    })
  ]);

  const participant3Event1 = new Participant(person3, [
    new TimeSpan({ 
      date: '2024-03-15', 
      timeFrom: '09:00', 
      timeTo: '12:00', 
      description: 'Equipment sortiert und Richterstand aufgebaut' 
    })
  ]);

  // Create participants for "Sommerfest"
  const participant1Event2 = new Participant(person1, [
    new TimeSpan({ 
      date: '2024-06-20', 
      timeFrom: '06:00', 
      timeTo: '10:00', 
      description: 'Zelte aufgebaut und Dekoration angebracht' 
    }),
    new TimeSpan({ 
      date: '2024-06-20', 
      timeFrom: '14:00', 
      timeTo: '18:00', 
      description: 'Gästebetreuung und Festorganisation' 
    }),
    new TimeSpan({ 
      date: '2024-06-20', 
      timeFrom: '20:00', 
      timeTo: '22:00', 
      description: 'Aufräumarbeiten und Abbau' 
    })
  ]);

  const participant2Event2 = new Participant(person2, [
    new TimeSpan({ 
      date: '2024-06-20', 
      timeFrom: '07:00', 
      timeTo: '11:00', 
      description: 'Grillstation vorbereitet und Getränke organisiert' 
    }),
    new TimeSpan({ 
      date: '2024-06-20', 
      timeFrom: '15:00', 
      timeTo: '19:00', 
      description: 'Bewirtung der Gäste' 
    })
  ]);

  const participant4Event2 = new Participant(person4, [
    new TimeSpan({ 
      date: '2024-06-19', 
      timeFrom: '16:00', 
      timeTo: '19:00', 
      description: 'Vorbereitungen und Einkäufe' 
    }),
    new TimeSpan({ 
      date: '2024-06-20', 
      timeFrom: '12:00', 
      timeTo: '20:00', 
      description: 'Festleitung und Koordination' 
    })
  ]);

  const participant5Event2 = new Participant(person5, [
    new TimeSpan({ 
      date: '2024-06-20', 
      timeFrom: '13:00', 
      timeTo: '17:00', 
      description: 'Kinderbetreuung und Ponyreiten organisiert' 
    })
  ]);

  // Create participants for "Reitturnier Frühjahr"
  const participant1Event3 = new Participant(person1, [
    new TimeSpan({ 
      date: '2024-04-12', 
      timeFrom: '06:00', 
      timeTo: '08:00', 
      description: 'Parcours aufgebaut und vermessen' 
    }),
    new TimeSpan({ 
      date: '2024-04-12', 
      timeFrom: '08:00', 
      timeTo: '17:00', 
      description: 'Turnierleitung und Protokollführung' 
    })
  ]);

  const participant2Event3 = new Participant(person2, [
    new TimeSpan({ 
      date: '2024-04-12', 
      timeFrom: '07:00', 
      timeTo: '18:00', 
      description: 'Richtertätigkeit Dressur und Springen' 
    })
  ]);

  const participant3Event3 = new Participant(person3, [
    new TimeSpan({ 
      date: '2024-04-12', 
      timeFrom: '06:30', 
      timeTo: '12:00', 
      description: 'Anmeldung und Startnummernvergabe' 
    }),
    new TimeSpan({ 
      date: '2024-04-12', 
      timeFrom: '15:00', 
      timeTo: '17:30', 
      description: 'Siegerehrung organisiert' 
    })
  ]);

  const participant4Event3 = new Participant(person4, [
    new TimeSpan({ 
      date: '2024-04-12', 
      timeFrom: '08:00', 
      timeTo: '17:00', 
      description: 'Zeitnahme und Ergebnisdokumentation' 
    })
  ]);

  const events = [
    new Event({
      name: 'Aufbau Reitplatz',
      description: 'Vorbereitung des Reitplatzes für das kommende Turnier mit Hindernisaufbau und Platzvorbereitung',
      dateFrom: '2024-03-15',
      dateTo: '2024-03-15',
      timeFrom: '08:00',
      timeTo: '12:00',
      location: 'Reitanlage RK Schmalegg',
      participants: [participant1Event1, participant2Event1, participant3Event1]
    }),
    new Event({
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
      name: 'Reitturnier Frühjahr',
      description: 'Traditionelles Frühjahrsturnier mit Dressur- und Springprüfungen für alle Altersklassen',
      dateFrom: '2024-04-12',
      dateTo: '2024-04-12',
      timeFrom: '08:00',
      timeTo: '18:00',
      location: 'Reitplatz und Reithalle',
      participants: [participant1Event3, participant2Event3, participant3Event3, participant4Event3]
    })
  ];

  return events;
}
