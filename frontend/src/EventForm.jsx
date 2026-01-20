import React, { useState, useEffect } from 'react';
import TimeSlotForm from './TimeSlotForm';
import './EventForm.css';

const EventForm = ({ event, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    location: ''
  });

  const [timeSlots, setTimeSlots] = useState([]);
  const [errors, setErrors] = useState({});
  const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);
  const [editingTimeSlotIndex, setEditingTimeSlotIndex] = useState(null);

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        dateFrom: event.dateFrom || '',
        dateTo: event.dateTo || '',
        timeFrom: event.timeFrom || '',
        timeTo: event.timeTo || '',
        location: event.location || ''
      });
      
      // Load existing time slots
      setTimeSlots(event.timeSlots || []);
    }
  }, [isEditing, event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name ist erforderlich';
    if (!formData.description.trim()) newErrors.description = 'Beschreibung ist erforderlich';
    if (!formData.dateFrom) newErrors.dateFrom = 'Startdatum ist erforderlich';
    if (!formData.timeFrom) newErrors.timeFrom = 'Startzeit ist erforderlich';
    if (!formData.timeTo) newErrors.timeTo = 'Endzeit ist erforderlich';
    if (!formData.location.trim()) newErrors.location = 'Ort ist erforderlich';

    // If dateTo is not provided, use dateFrom
    if (!formData.dateTo) {
      setFormData(prev => ({
        ...prev,
        dateTo: prev.dateFrom
      }));
    }

    // Validate time and date range
    if (formData.timeFrom && formData.timeTo) {
      const [fromHour, fromMin] = formData.timeFrom.split(':').map(Number);
      const [toHour, toMin] = formData.timeTo.split(':').map(Number);
      
      const fromMinutes = fromHour * 60 + fromMin;
      const toMinutes = toHour * 60 + toMin;
      
      // Check if end date is before start date
      const startDate = new Date(formData.dateFrom);
      const endDate = new Date(formData.dateTo || formData.dateFrom);
      
      if (endDate < startDate) {
        newErrors.dateTo = 'Enddatum muss nach dem Startdatum liegen';
      }

      // Check time range only if it's the same day
      const isSameDay = formData.dateFrom === (formData.dateTo || formData.dateFrom);
      if (isSameDay && toMinutes <= fromMinutes) {
        newErrors.timeTo = 'Endzeit muss nach der Startzeit liegen';
      }
    }

    // Validate time slots
    timeSlots.forEach((timeSlot, index) => {
      const slotPrefix = `timeSlot_${index}`;
      
      if (!timeSlot.name || !timeSlot.name.trim()) {
        newErrors[`${slotPrefix}_name`] = 'Zeitslot Name ist erforderlich';
      }
      
      if (!timeSlot.timeFrom) {
        newErrors[`${slotPrefix}_timeFrom`] = 'Startzeit ist erforderlich';
      }
      
      if (!timeSlot.timeTo) {
        newErrors[`${slotPrefix}_timeTo`] = 'Endzeit ist erforderlich';
      }
      
      if (!timeSlot.maxParticipants || timeSlot.maxParticipants < 1) {
        newErrors[`${slotPrefix}_maxParticipants`] = 'Mindestens 1 Teilnehmer erforderlich';
      }
      
      // Validate time slot time range
      if (timeSlot.timeFrom && timeSlot.timeTo) {
        const [slotFromHour, slotFromMin] = timeSlot.timeFrom.split(':').map(Number);
        const [slotToHour, slotToMin] = timeSlot.timeTo.split(':').map(Number);
        
        const slotFromMinutes = slotFromHour * 60 + slotFromMin;
        const slotToMinutes = slotToHour * 60 + slotToMin;
        
        if (slotToMinutes <= slotFromMinutes) {
          newErrors[`${slotPrefix}_timeTo`] = 'Endzeit muss nach der Startzeit liegen';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Time Slot Management Functions
  const handleAddTimeSlots = (newTimeSlots) => {
    if (Array.isArray(newTimeSlots)) {
      // Multiple timeslots
      const slotsWithIds = newTimeSlots.map(slot => ({
        ...slot,
        id: Date.now() + Math.random()
      }));
      setTimeSlots([...timeSlots, ...slotsWithIds]);
    } else {
      // Single timeslot
      const slotWithId = {
        ...newTimeSlots,
        id: Date.now()
      };
      setTimeSlots([...timeSlots, slotWithId]);
    }
    setShowTimeSlotForm(false);
  };

  const handleEditTimeSlot = (index) => {
    setEditingTimeSlotIndex(index);
    setShowTimeSlotForm(true);
  };

  const handleUpdateTimeSlot = (updatedSlot) => {
    const updatedTimeSlots = [...timeSlots];
    updatedTimeSlots[editingTimeSlotIndex] = {
      ...updatedTimeSlots[editingTimeSlotIndex],
      ...updatedSlot
    };
    setTimeSlots(updatedTimeSlots);
    setShowTimeSlotForm(false);
    setEditingTimeSlotIndex(null);
  };

  const handleCancelTimeSlotForm = () => {
    setShowTimeSlotForm(false);
    setEditingTimeSlotIndex(null);
  };

  const removeTimeSlot = (index) => {
    const updatedTimeSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedTimeSlots);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('EventForm: handleSubmit called');
    console.log('EventForm: Form data:', formData);
    console.log('EventForm: Time slots:', timeSlots);
    
    if (validateForm()) {
      // Remove temporary IDs from new timeslots (those with decimal point IDs)
      const cleanedTimeSlots = timeSlots.map(slot => {
        const { id, ...slotData } = slot;
        // Only keep ID if it's an integer (existing slot from backend)
        if (Number.isInteger(id)) {
          return slot;
        }
        // Remove temporary ID for new slots
        return slotData;
      });
      
      const eventData = {
        ...formData,
        dateTo: formData.dateTo || formData.dateFrom,
        timeSlots: cleanedTimeSlots,
        // Preserve existing participants when editing, start with empty array when creating
        participants: isEditing ? (event.participants || []) : [],
        // Default to draft status when creating, preserve existing when editing
        status: isEditing ? (event.status || 'draft') : 'draft'
      };
      console.log('EventForm: Validation passed, calling onSave with:', eventData);
      onSave(eventData);
    } else {
      console.log('EventForm: Validation failed, errors:', errors);
    }
  };

  const handleSaveAs = (status) => {
    if (validateForm()) {
      // Remove temporary IDs from new timeslots
      const cleanedTimeSlots = timeSlots.map(slot => {
        const { id, ...slotData } = slot;
        if (Number.isInteger(id)) {
          return slot;
        }
        return slotData;
      });
      
      const eventData = {
        ...formData,
        dateTo: formData.dateTo || formData.dateFrom,
        timeSlots: cleanedTimeSlots,
        participants: isEditing ? (event.participants || []) : [],
        status: status
      };
      onSave(eventData, status);
    }
  };

  return (
    <div className="event-form-page">
      <div className="event-form-header">
        <button className="back-button" onClick={onCancel}>
          ← Zurück zum Event
        </button>
        <h2>{isEditing ? 'Event bearbeiten' : 'Neues Event erstellen'}</h2>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Event Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="z.B. Reitturnier Frühjahr"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Beschreibung *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
            placeholder="Detaillierte Beschreibung des Events..."
            rows="3"
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateFrom">Startdatum *</label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={formData.dateFrom}
              onChange={handleChange}
              className={errors.dateFrom ? 'error' : ''}
            />
            {errors.dateFrom && <span className="error-text">{errors.dateFrom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dateTo">Enddatum</label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={formData.dateTo}
              onChange={handleChange}
              placeholder="Optional (falls mehrtägig)"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeFrom">Startzeit *</label>
            <input
              type="time"
              id="timeFrom"
              name="timeFrom"
              value={formData.timeFrom}
              onChange={handleChange}
              className={errors.timeFrom ? 'error' : ''}
            />
            {errors.timeFrom && <span className="error-text">{errors.timeFrom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="timeTo">Endzeit *</label>
            <input
              type="time"
              id="timeTo"
              name="timeTo"
              value={formData.timeTo}
              onChange={handleChange}
              className={errors.timeTo ? 'error' : ''}
            />
            {errors.timeTo && <span className="error-text">{errors.timeTo}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Ort *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? 'error' : ''}
            placeholder="z.B. Reitanlage RK Schmalegg"
          />
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>

        {/* Zeitslots Section */}
        <div className="timeslots-section">
          <div className="timeslots-header">
            <h3>Zeitslots (Optional)</h3>
            <button 
              type="button" 
              className="add-timeslot-button"
              onClick={() => setShowTimeSlotForm(true)}
            >
              + Zeitslot hinzufügen
            </button>
          </div>
          
          {timeSlots.length > 0 && (
            <div className="timeslots-list">
              {timeSlots.map((timeSlot, index) => (
                <div key={timeSlot.id || index} className="timeslot-item">
                  <div className="timeslot-info">
                    <div className="timeslot-detail">
                      {timeSlot.category && <span className="timeslot-category">{timeSlot.category}</span>}
                      <strong>{timeSlot.name}</strong>
                    </div>
                    <div className="timeslot-time">
                      {timeSlot.timeFrom} - {timeSlot.timeTo}
                    </div>
                    <div className="timeslot-capacity">
                      Max: {timeSlot.maxParticipants} Teilnehmer
                    </div>
                  </div>
                  <div className="timeslot-actions">
                    <button 
                      type="button" 
                      className="edit-timeslot-button"
                      onClick={() => handleEditTimeSlot(index)}
                      title="Zeitslot bearbeiten"
                    >
                      ✎
                    </button>
                    <button 
                      type="button" 
                      className="remove-timeslot-button"
                      onClick={() => removeTimeSlot(index)}
                      title="Zeitslot entfernen"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {timeSlots.length === 0 && (
            <p className="no-timeslots-hint">
              Keine Zeitslots definiert. Fügen Sie welche hinzu, um das Event in spezifische Zeitbereiche aufzuteilen.
            </p>
          )}
        </div>

        {/* TimeSlot Form Modal */}
        {showTimeSlotForm && (
          <div className="modal-overlay" onClick={handleCancelTimeSlotForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <TimeSlotForm
                onSave={editingTimeSlotIndex !== null ? handleUpdateTimeSlot : handleAddTimeSlots}
                onCancel={handleCancelTimeSlotForm}
                timeSlot={editingTimeSlotIndex !== null ? timeSlots[editingTimeSlotIndex] : null}
                isEditing={editingTimeSlotIndex !== null}
                event={formData.dateFrom ? { dateFrom: formData.dateFrom, dateTo: formData.dateTo || formData.dateFrom } : null}
                existingCategories={[...new Set(timeSlots
                  .map(slot => slot.category)
                  .filter(category => category && category.trim())
                )].sort()}
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Abbrechen
          </button>
          <div className="save-buttons">
            <button 
              type="button" 
              className="draft-button"
              onClick={() => handleSaveAs('draft')}
            >
              {isEditing ? 'Als Entwurf speichern' : 'Als Entwurf speichern'}
            </button>
            <button 
              type="button" 
              className="publish-button"
              onClick={() => handleSaveAs('published')}
            >
              {isEditing ? 'Veröffentlichen' : 'Veröffentlichen'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
