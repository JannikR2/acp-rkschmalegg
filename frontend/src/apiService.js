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

  // Get participation statistics
  async getStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/participation`);
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

  // Get total number of participants
  getTotalParticipants(event) {
    return event.participants.length;
  },

  // Get number of accepted participants
  getAcceptedParticipants(event) {
    return event.participants.filter(participant => participant.status === 'accepted').length;
  },

  // Get number of declined participants
  getDeclinedParticipants(event) {
    return event.participants.filter(participant => participant.status === 'declined').length;
  },

  // Get number of pending participants
  getPendingParticipants(event) {
    return event.participants.filter(participant => participant.status === 'pending').length;
  },

  // Get participation statistics
  getParticipationStats(event) {
    const total = this.getTotalParticipants(event);
    const accepted = this.getAcceptedParticipants(event);
    const declined = this.getDeclinedParticipants(event);
    const pending = this.getPendingParticipants(event);
    
    return {
      total,
      accepted,
      declined,
      pending,
      acceptanceRate: total > 0 ? (accepted / total * 100).toFixed(1) : 0
    };
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

  // Get participants grouped by status
  getParticipantsByStatus(event) {
    const accepted = [];
    const declined = [];
    const pending = [];

    event.participants.forEach(participant => {
      const participantInfo = {
        name: `${participant.person.firstName} ${participant.person.lastName}`,
        status: participant.status
      };

      switch (participant.status) {
        case 'accepted':
          accepted.push(participantInfo);
          break;
        case 'declined':
          declined.push(participantInfo);
          break;
        case 'pending':
        default:
          pending.push(participantInfo);
          break;
      }
    });

    return { accepted, declined, pending };
  }
};

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
