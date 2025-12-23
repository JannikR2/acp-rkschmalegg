import React, { useState, useEffect } from 'react';
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

  const [errors, setErrors] = useState({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const eventData = {
        ...formData,
        dateTo: formData.dateTo || formData.dateFrom,
        // Preserve existing participants when editing, start with empty array when creating
        participants: isEditing ? (event.participants || []) : []
      };
      onSave(eventData);
    }
  };

  return (
    <div className="event-form-page">
      <div className="event-form-header">
        <button className="back-button" onClick={onCancel}>
          ← Zurück zur Übersicht
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

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Abbrechen
          </button>
          <button type="submit" className="save-button">
            {isEditing ? 'Änderungen speichern' : 'Event erstellen'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
