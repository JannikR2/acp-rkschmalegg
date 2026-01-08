import React, { useState, useEffect } from 'react';
import apiService from './apiService';
import TimeSlotForm from './TimeSlotForm';
import TimeSlotParticipationTable from './TimeSlotParticipationTable';
import './TimeSlotManager.css';

const TimeSlotManager = ({ event, onBack, onUpdate, selectedTimeSlot, initialShowParticipants, initialSelectedTimeSlot }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [showParticipants, setShowParticipants] = useState(initialShowParticipants || false);
  const [selectedTimeSlotState, setSelectedTimeSlotState] = useState(initialSelectedTimeSlot || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTimeSlots();
  }, [event.id]);

  useEffect(() => {
    if (selectedTimeSlot) {
      // If there's a selectedTimeSlot for editing, prioritize that over participants
      setEditingTimeSlot(selectedTimeSlot);
      setShowForm(true);
      setShowParticipants(false); // Ensure participants view is not shown
    }
  }, [selectedTimeSlot]);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTimeSlots(event.id);
      
      if (response.success) {
        setTimeSlots(response.data);
      } else {
        setError('Fehler beim Laden der Zeitslots');
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Verbindung zum Server fehlgeschlagen. Bitte prüfen Sie, ob der Server läuft.');
      } else {
        setError('Verbindungsfehler beim Laden der Zeitslots');
      }
    } finally {
      setLoading(false);
    }
  };

  const reloadTimeSlotsQuietly = async () => {
    try {
      const response = await apiService.getTimeSlots(event.id);
      if (response.success) {
        setTimeSlots(response.data);
      }
    } catch (error) {
      console.error('Error reloading time slots quietly:', error);
      // Don't set error state - just log the error
    }
  };

  const handleAddTimeSlot = async (timeSlotData) => {
    try {
      const response = await apiService.createTimeSlot(event.id, timeSlotData);
      
      if (response.success) {
        await reloadTimeSlotsQuietly();
        setShowForm(false);
        setError('');
      } else {
        setError(response.message || 'Fehler beim Erstellen des Zeitslots');
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
        await reloadTimeSlotsQuietly();
        setEditingTimeSlot(null);
        setShowForm(false);
        setError('');
      } else {
        setError(response.message || 'Fehler beim Aktualisieren des Zeitslots');
      }
    } catch (error) {
      setError('Verbindungsfehler');
      console.error('Error updating time slot:', error);
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId) => {
    if (!window.confirm('Möchten Sie diesen Zeitslot wirklich löschen?')) {
      return;
    }

    try {
      const response = await apiService.deleteTimeSlot(event.id, timeSlotId);
      
      if (response.success) {
        await reloadTimeSlotsQuietly();
        setError('');
      } else {
        setError(response.message || 'Fehler beim Löschen des Zeitslots');
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

  const handleManageParticipants = (timeSlot) => {
    setSelectedTimeSlotState(timeSlot);
    setShowParticipants(true);
  };

  const handleBackFromParticipants = () => {
    setShowParticipants(false);
    setSelectedTimeSlotState(null);
    setError(''); // Clear any existing errors
    // Reload time slots quietly to get updated participant counts
    reloadTimeSlotsQuietly();
  };

  const handleParticipationChange = () => {
    // When participation changes, reload the timeslots to get updated counts
    reloadTimeSlotsQuietly();
  };

  if (loading) {
    return (
      <div className="timeslot-manager">
        <div className="loading">Lade Zeitslots...</div>
      </div>
    );
  }

  if (showParticipants && selectedTimeSlotState) {
    return (
      <div className="timeslot-manager">
        <button className="back-button" onClick={handleBackFromParticipants}>
          ← Zurück zur Zeitslot Liste
        </button>
        <TimeSlotParticipationTable 
          eventId={event.id}
          timeSlotId={selectedTimeSlotState.id}
          timeSlotName={selectedTimeSlotState.name}
          maxParticipants={selectedTimeSlotState.maxParticipants}
          onParticipationChange={handleParticipationChange}
        />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="timeslot-manager">
        <button className="back-button" onClick={handleCancelForm}>
          ← Zurück zur Zeitslot Liste
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
          <h2>Zeitslots für "{event.name}"</h2>
          <button 
            className="btn-primary add-timeslot-btn"
            onClick={() => setShowForm(true)}
          >
            + Zeitslot hinzufügen
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
          <p>Keine Zeitslots vorhanden. Fügen Sie den ersten hinzu!</p>
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
                </div>
              </div>
              <div className="timeslot-actions">
                <button 
                  className="btn-small btn-primary"
                  onClick={() => handleManageParticipants(timeSlot)}
                >
                  👥 Teilnehmer verwalten
                </button>
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
