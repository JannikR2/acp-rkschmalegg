import React from 'react';
import { EventUtils } from './apiService';
import './EventCard.css';

const EventCard = ({ event }) => {
  return (
    <div className="event-card">
      <div className="event-header">
        <div className="event-title-section">
          <h3 className="event-name">{event.name}</h3>
          <div className="event-status">
            <span className={`status-badge ${event.status}`}>
              {event.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
            </span>
          </div>
        </div>
      </div>
      <p className="event-description">{event.description}</p>
      <div className="event-details">
        <div className="event-detail">
          <span className="detail-label">Datum:</span>
          <span>{EventUtils.getDateRange(event.dateFrom, event.dateTo)}</span>
        </div>
        
        <div className="event-detail">
          <span className="detail-label">Ort:</span>
          <span>{event.location}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
