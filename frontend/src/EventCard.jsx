import React from 'react';
import { EventUtils } from './apiService';
import './EventCard.css';

const EventCard = ({ event, isAdmin = false, onPublish, onUnpublish }) => {
  const plannedDuration = EventUtils.calculatePlannedDuration(event);

  const handlePublishToggle = async () => {
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
    <div className="event-card">
      <div className="event-header">
        <div className="event-title-section">
          <h3 className="event-name">{event.name}</h3>
          <div className="event-status">
            <span className={`status-badge ${event.status}`}>
              {event.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
            </span>
            {isAdmin && (
              <button 
                className={`publish-toggle-btn ${event.status}`}
                onClick={handlePublishToggle}
                title={event.status === 'published' ? 'Als Entwurf speichern' : 'Veröffentlichen'}
              >
                {event.status === 'published' ? '📝' : '🌐'}
              </button>
            )}
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
          <span className="detail-label">Zeit:</span>
          <span>{EventUtils.getTimeRange(event.timeFrom, event.timeTo)} ({plannedDuration}h)</span>
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
