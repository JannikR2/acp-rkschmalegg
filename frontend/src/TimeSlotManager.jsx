import React, { useState, useEffect } from 'react';
import apiService from './apiService';
import TimeSlotForm from './TimeSlotForm';
import './TimeSlotManager.css';

const TimeSlotManager = ({ event, onBack, onUpdate }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTimeSlots();
  }, [event.id]);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTimeSlots(event.id);
      
      if (response.success) {
        setTimeSlots(response.data);
      } else {
        setError('Fehler beim Laden der Time Slots');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error loading time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = async (timeSlotData) => {
    try {
      const response = await apiService.createTimeSlot(event.id, timeSlotData);
      
      if (response.success) {
        await loadTimeSlots();
        setShowForm(false);
        setError('');
      } else {
        setError(response.message || 'Fehler beim Erstellen des Time Slots');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error creating time slot:', error);
    }
  };

  const handleUpdateTimeSlot = async (timeSlotData) => {
    try {
      const response = await apiService.updateTimeSlot(event.id, editingTimeSlot.id, timeSlotData);
      
      if (response.success) {
        await loadTimeSlots();
        setEditingTimeSlot(null);
        setShowForm(false);
        setError('');
      } else {
        setError(response.message || 'Fehler beim Aktualisieren des Time Slots');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error updating time slot:', error);
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId) => {
    if (!window.confirm('Möchten Sie diesen Time Slot wirklich löschen?')) {
      return;
    }

    try {
      const response = await apiService.deleteTimeSlot(event.id, timeSlotId);
      
      if (response.success) {
        await loadTimeSlots();
        setError('');
      } else {
        setError(response.message || 'Fehler beim Löschen des Time Slots');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error deleting time slot:', error);
    }
  };

  const handleEditTimeSlot = (timeSlot) => {
    setEditingTimeSlot(timeSlot);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTimeSlot(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="timeslot-manager">
        <div className="loading">Lade Time Slots...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="timeslot-manager">
        <button className="back-button" onClick={handleCancelForm}>
          ← Zurück zur Time Slot Liste
        </button>
        <TimeSlotForm 
          onSave={editingTimeSlot ? handleUpdateTimeSlot : handleAddTimeSlot}
          onCancel={handleCancelForm}
          timeSlot={editingTimeSlot}
          isEditing={!!editingTimeSlot}
        />
      </div>
    );
  }

  return (
    <div className="timeslot-manager">
      <div className="timeslot-header">
        <button className="back-button" onClick={onBack}>
          ← Zurück zum Event
        </button>
        <div className="header-content">
          <h2>Time Slots für "{event.name}"</h2>
          <button 
            className="btn-primary add-timeslot-btn"
            onClick={() => setShowForm(true)}
          >
            + Time Slot hinzufügen
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {timeSlots.length === 0 ? (
        <div className="no-timeslots">
          <p>Keine Time Slots vorhanden. Fügen Sie den ersten hinzu!</p>
        </div>
      ) : (
        <div className="timeslots-list">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot.id} className="timeslot-item">
              <div className="timeslot-info">
                <h3 className="timeslot-name">{timeSlot.name}</h3>
                <div className="timeslot-details">
                  <span className="timeslot-time">
                    🕐 {timeSlot.timeFrom} - {timeSlot.timeTo}
                  </span>
                  <span className="timeslot-participants">
                    👥 {timeSlot.participants?.filter(p => p.status === 'accepted').length || 0} / {timeSlot.maxParticipants}
                    {timeSlot.isFull && <span className="full-badge">Voll</span>}
                  </span>
                  <span className="timeslot-available">
                    📍 {timeSlot.availableSpots} Plätze frei
                  </span>
                </div>
              </div>
              <div className="timeslot-actions">
                <button 
                  className="btn-small btn-secondary"
                  onClick={() => handleEditTimeSlot(timeSlot)}
                >
                  ✏️ Bearbeiten
                </button>
                <button 
                  className="btn-small btn-danger"
                  onClick={() => handleDeleteTimeSlot(timeSlot.id)}
                >
                  🗑️ Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotManager;
