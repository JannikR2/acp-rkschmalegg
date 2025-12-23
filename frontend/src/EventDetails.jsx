import React from 'react';
import EventCard from './EventCard';
import './EventDetails.css';

const EventDetails = ({ event, onBack }) => {
  if (!event) {
    return (
      <div className="event-details-page">
        <div className="event-details-header">
          <button className="back-button" onClick={onBack}>
            ← Zurück zur Übersicht
          </button>
          <h2>Event nicht gefunden</h2>
        </div>
        <p>Das angeforderte Event konnte nicht gefunden werden.</p>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <div className="event-details-header">
        <button className="back-button" onClick={onBack}>
          ← Zurück zur Übersicht
        </button>
        <h2>Event Details</h2>
      </div>
      
      <div className="event-details-content">
        <EventCard event={event} />
      </div>
    </div>
  );
};

export default EventDetails;
