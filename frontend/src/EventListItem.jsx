import React from 'react';
import { EventUtils } from './apiService';
import './EventListItem.css';

const EventListItem = ({ event, onClick }) => {
  return (
    <div className="event-list-item" onClick={onClick}>
      <div className="event-list-header">
        <h3 className="event-list-name">{event.name}</h3>
        <div className="event-list-arrow">→</div>
      </div>
      
      <div className="event-list-details">
        <div className="event-list-detail">
          <span className="detail-icon">📅</span>
          <span>{EventUtils.getDateRange(event.dateFrom, event.dateTo)}</span>
        </div>
        
        <div className="event-list-detail">
          <span className="detail-icon">🕐</span>
          <span>{EventUtils.getTimeRange(event.timeFrom, event.timeTo)}</span>
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
