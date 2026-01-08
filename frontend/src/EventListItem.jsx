import React from 'react';
import { EventUtils } from './apiService';
import './EventListItem.css';

const EventListItem = ({ event, onClick, isAdmin = false, onPublish, onUnpublish }) => {
  const handlePublishToggle = async (e) => {
    e.stopPropagation(); // Prevent triggering onClick
    try {
      if (event.status === 'published') {
        await onUnpublish?.(event.id);
      } else {
        await onPublish?.(event.id);
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  return (
    <div className="event-list-item" onClick={onClick}>
      <div className="event-list-header">
        <div className="event-list-title">
          <h3 className="event-list-name">{event.name}</h3>
          <span className={`status-badge ${event.status}`}>
            {event.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
          </span>
        </div>
        <div className="event-list-actions">
          {isAdmin && (
            <button 
              className={`publish-toggle-btn ${event.status}`}
              onClick={handlePublishToggle}
              title={event.status === 'published' ? 'Als Entwurf speichern' : 'Veröffentlichen'}
            >
              {event.status === 'published' ? '📝' : '🌐'}
            </button>
          )}
          <div className="event-list-arrow">→</div>
        </div>
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
