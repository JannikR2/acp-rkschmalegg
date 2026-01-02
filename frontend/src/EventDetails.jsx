import React, { useState } from 'react';
import EventCard from './EventCard';
import EventParticipationTable from './EventParticipationTable';
import './EventDetails.css';

const EventDetails = ({ event, onBack, onUpdate, onDelete, onManageTimeSlots }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdateClick = () => {
    onUpdate(event);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(event.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

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
        <div className="action-buttons">
          <button className="timeslots-button" onClick={() => onManageTimeSlots && onManageTimeSlots(event)}>
            🕐 Time Slots verwalten
          </button>
          <button className="update-button" onClick={handleUpdateClick}>
            ✏️ Bearbeiten
          </button>
          <button className="delete-button" onClick={handleDeleteClick}>
            🗑️ Löschen
          </button>
        </div>
      </div>
      
      <div className="event-details-content">
        <EventCard event={event} hideParticipants={true} />
        <EventParticipationTable eventId={event.id} eventName={event.name} />
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-dialog">
            <h3>Event löschen</h3>
            <p>Sind Sie sicher, dass Sie das Event "<strong>{event.name}</strong>" löschen möchten?</p>
            <p className="warning-text">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="confirmation-actions">
              <button className="cancel-confirm-button" onClick={handleCancelDelete}>
                Abbrechen
              </button>
              <button className="confirm-delete-button" onClick={handleConfirmDelete}>
                Löschen bestätigen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
