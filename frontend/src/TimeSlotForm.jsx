import React, { useState } from 'react';
import './TimeSlotForm.css';

const TimeSlotForm = ({ onSave, onCancel, timeSlot, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: timeSlot?.name || '',
    timeFrom: timeSlot?.timeFrom || '',
    timeTo: timeSlot?.timeTo || '',
    maxParticipants: timeSlot?.maxParticipants || 1
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }

    if (!formData.timeFrom) {
      newErrors.timeFrom = 'Startzeit ist erforderlich';
    }

    if (!formData.timeTo) {
      newErrors.timeTo = 'Endzeit ist erforderlich';
    }

    if (formData.timeFrom && formData.timeTo && formData.timeFrom >= formData.timeTo) {
      newErrors.timeTo = 'Endzeit muss nach der Startzeit liegen';
    }

    if (!formData.maxParticipants || formData.maxParticipants < 1) {
      newErrors.maxParticipants = 'Mindestens 1 Teilnehmer erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants)
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="timeslot-form-container">
      <div className="timeslot-form-header">
        <h3>{isEditing ? 'Time Slot bearbeiten' : 'Neuen Time Slot hinzufügen'}</h3>
      </div>

      <form className="timeslot-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="z.B. Putzen, Aufbau, etc."
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeFrom">Startzeit *</label>
            <input
              type="time"
              id="timeFrom"
              value={formData.timeFrom}
              onChange={(e) => handleChange('timeFrom', e.target.value)}
              className={errors.timeFrom ? 'error' : ''}
            />
            {errors.timeFrom && <span className="error-text">{errors.timeFrom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="timeTo">Endzeit *</label>
            <input
              type="time"
              id="timeTo"
              value={formData.timeTo}
              onChange={(e) => handleChange('timeTo', e.target.value)}
              className={errors.timeTo ? 'error' : ''}
            />
            {errors.timeTo && <span className="error-text">{errors.timeTo}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="maxParticipants">Maximale Anzahl Teilnehmer *</label>
          <input
            type="number"
            id="maxParticipants"
            min="1"
            value={formData.maxParticipants}
            onChange={(e) => handleChange('maxParticipants', e.target.value)}
            className={errors.maxParticipants ? 'error' : ''}
          />
          {errors.maxParticipants && <span className="error-text">{errors.maxParticipants}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {isEditing ? 'Aktualisieren' : 'Hinzufügen'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeSlotForm;
