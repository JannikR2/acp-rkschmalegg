import React from 'react';
import { EventUtils } from './apiService';
import './EventCard.css';

const EventCard = ({ event, hideParticipants = false }) => {
  const plannedDuration = EventUtils.calculatePlannedDuration(event);

  // Count participants by status
  const acceptedCount = event.participants ? event.participants.filter(p => p.status === 'accepted').length : 0;
  const declinedCount = event.participants ? event.participants.filter(p => p.status === 'declined').length : 0;

  return (
    <div className="event-card">
      <div className="event-header">
        <h3 className="event-name">{event.name}</h3>
      </div>
      <p className="event-description">{event.description}</p>
      <div className="event-details">
        <div className="event-detail">
          <span className="detail-label">Datum:</span>
          <span>{EventUtils.getDateRange(event.dateFrom, event.dateTo)}</span>
        </div>
        
        <div className="event-detail">
          <span className="detail-label">Zeit:</span>
          <span>{EventUtils.getTimeRange(event.timeFrom, event.timeTo)} ({plannedDuration}h)</span>
        </div>
        
        <div className="event-detail">
          <span className="detail-label">Ort:</span>
          <span>{event.location}</span>
        </div>
      </div>

      {!hideParticipants && (
        <div className="participants-section">
          <h4 className="participants-title">Teilnahme-Status</h4>
          <div className="participation-stats">
            <div className="stat-item">
              <span className="stat-number accepted">{acceptedCount}</span>
              <span className="stat-label">Zugesagt</span>
            </div>
            <div className="stat-item">
              <span className="stat-number declined">{declinedCount}</span>
              <span className="stat-label">Abgesagt</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
