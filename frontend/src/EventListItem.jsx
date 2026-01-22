import React from 'react';
import { EventUtils } from './apiService';
import './EventListItem.css';

const EventListItem = ({ event, onClick, isAdmin = false }) => {

  return (
    <div className="event-list-item" onClick={onClick}>
      <div className="event-list-header">
        <div className="event-list-title">
          <h3 className="event-list-name">{event.name}</h3>
        </div>
        <div className="event-list-actions">
          <span className={`status-badge ${event.status}`}>
            {event.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
          </span>
        </div>
      </div>
      
      <div className="event-list-details">
        <div className="event-list-detail">
          <span className="detail-icon">📅</span>
          <span>{EventUtils.getDateRange(event.dateFrom, event.dateTo)}</span>
        </div>
        
        <div className="event-list-detail">
          <span className="detail-icon">📍</span>
          <span>{event.location}</span>
        </div>
      </div>
    </div>
  );
};

export default EventListItem;
