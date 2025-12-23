import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// API service for handling all backend communication
class ApiService {
  // Get all events
  async getAllEvents() {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  // Get specific event by ID
  async getEventById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  // Create new event
  async createEvent(eventData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/events`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Update existing event
  async updateEvent(id, eventData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete event
  async deleteEvent(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Get total hours statistics
  async getStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/hours`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
}

// Helper functions for working with plain event objects
export const EventUtils = {
  // Calculate planned duration in hours
  calculatePlannedDuration(event) {
    if (!event.timeFrom || !event.timeTo) return 0;
    
    const [fromHour, fromMin] = event.timeFrom.split(':').map(Number);
    const [toHour, toMin] = event.timeTo.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;
    
    return (toMinutes - fromMinutes) / 60;
  },

  // Get total hours tracked by all participants
  getTotalTrackedHours(event) {
    return event.participants.reduce((total, participant) => {
      return total + this.getParticipantTotalHours(participant);
    }, 0);
  },

  // Get participant total hours
  getParticipantTotalHours(participant) {
    return participant.timeSpans.reduce((total, timeSpan) => {
      return total + this.getTimeSpanDuration(timeSpan);
    }, 0);
  },

  // Get duration of a time span
  getTimeSpanDuration(timeSpan) {
    if (!timeSpan.timeFrom || !timeSpan.timeTo) return 0;
    
    const [fromHour, fromMin] = timeSpan.timeFrom.split(':').map(Number);
    const [toHour, toMin] = timeSpan.timeTo.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;
    
    return (toMinutes - fromMinutes) / 60;
  },

  // Format time span duration
  getFormattedDuration(timeSpan) {
    const duration = this.getTimeSpanDuration(timeSpan);
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}min`;
  },

  // Get time range string
  getTimeRange(timeFrom, timeTo) {
    if (!timeFrom || !timeTo) return '';
    return `${timeFrom} - ${timeTo}`;
  },

  // Format date range
  getDateRange(dateFrom, dateTo) {
    if (!dateFrom) return '';
    
    const startDate = new Date(dateFrom).toLocaleDateString();
    const endDate = dateTo ? new Date(dateTo).toLocaleDateString() : startDate;
    
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  },

  // Get participant names as string
  getParticipantNames(event) {
    return event.participants.map(p => `${p.person.firstName} ${p.person.lastName}`).join(', ');
  },

  // Get participants with their tracked hours
  getParticipantsWithHours(event) {
    return event.participants.map(participant => ({
      name: `${participant.person.firstName} ${participant.person.lastName}`,
      hours: this.getParticipantTotalHours(participant),
      timeSpans: participant.timeSpans
    }));
  }
};

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
