import React, { useState } from 'react';
import EventCard from './EventCard';
import './EventDetails.css';

const EventDetails = ({ event, onBack, onUpdate, onDelete, onManageTimeSlots, onEditTimeSlot, onManageParticipants }) => {
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

  const handleTimeSlotClick = (timeSlot) => {
    if (onEditTimeSlot) {
      onEditTimeSlot(event, timeSlot);
    }
  };

  const handleParticipantsClick = (timeSlot) => {
    if (onManageParticipants) {
      onManageParticipants(event, timeSlot);
    }
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
          <button className="timeslots-button" onClick={onManageTimeSlots}>
            ⏰ Zeitslots verwalten
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
        <EventCard event={event} />
        
        {/* Zeitslots Display */}
        {event.timeSlots && event.timeSlots.length > 0 && (
          <div className="timeslots-display">
            <h3>Zeitslots</h3>
            <div className="timeslots-grid">
              {event.timeSlots.map((timeSlot) => (
                <div key={timeSlot.id} className="timeslot-card">
                  <div 
                    className="timeslot-header clickable" 
                    onClick={() => handleTimeSlotClick(timeSlot)}
                    title="Zeitslot bearbeiten"
                  >
                    <h4>{timeSlot.name}</h4>
                    <span className="timeslot-time">{timeSlot.timeFrom} - {timeSlot.timeTo}</span>
                  </div>
                  <div 
                    className="timeslot-participants clickable"
                    onClick={() => handleParticipantsClick(timeSlot)}
                    title="Teilnehmer verwalten"
                  >
                    <span className="participant-count">
                      {timeSlot.participants?.length || 0} / {timeSlot.maxParticipants} Teilnehmer
                    </span>
                    {timeSlot.isFull && <span className="full-badge">Voll</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
