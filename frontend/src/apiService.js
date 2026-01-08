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

  // Time Slot Management
  async getTimeSlots(eventId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/timeslots`);
      return response.data;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }
  }

  async createTimeSlot(eventId, timeSlotData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/events/${eventId}/timeslots`, timeSlotData);
      return response.data;
    } catch (error) {
      console.error('Error creating time slot:', error);
      throw error;
    }
  }

  async updateTimeSlot(eventId, timeSlotId, timeSlotData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/events/${eventId}/timeslots/${timeSlotId}`, timeSlotData);
      return response.data;
    } catch (error) {
      console.error('Error updating time slot:', error);
      throw error;
    }
  }

  async deleteTimeSlot(eventId, timeSlotId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/events/${eventId}/timeslots/${timeSlotId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting time slot:', error);
      throw error;
    }
  }

  // Time Slot Participation Management
  async getTimeSlotParticipation(eventId, timeSlotId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/timeslots/${timeSlotId}/participation`);
      return response.data;
    } catch (error) {
      console.error('Error fetching time slot participation:', error);
      throw error;
    }
  }

  async setTimeSlotParticipation(eventId, timeSlotId, personId, status) {
    try {
      const response = await axios.post(`${API_BASE_URL}/events/${eventId}/timeslots/${timeSlotId}/participation`, {
        personId,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error setting time slot participation:', error);
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


};

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
