import React, { useState } from 'react';
import './TimeSlotForm.css';

const TimeSlotForm = ({ onSave, onCancel, timeSlot, isEditing = false, presetCategory = null, event = null, existingCategories = [] }) => {
  const [category, setCategory] = useState(timeSlot?.category || presetCategory || '');
  const [timeSlots, setTimeSlots] = useState(
    isEditing && timeSlot 
      ? [{
          name: timeSlot.name,
          date: timeSlot.date || '',
          timeFrom: timeSlot.timeFrom,
          timeTo: timeSlot.timeTo,
          maxParticipants: timeSlot.maxParticipants
        }]
      : [{
          name: '',
          date: '',
          timeFrom: '',
          timeTo: '',
          maxParticipants: 1
        }]
  );
  const [errors, setErrors] = useState({});

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, {
      name: '',
      date: '',
      timeFrom: '',
      timeTo: '',
      maxParticipants: 1
    }]);
  };

  const removeTimeSlot = (index) => {
    if (timeSlots.length > 1) {
      const newTimeSlots = timeSlots.filter((_, i) => i !== index);
      setTimeSlots(newTimeSlots);
    }
  };

  const updateTimeSlot = (index, field, value) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index][field] = value;
    setTimeSlots(newTimeSlots);
    
    // Clear errors for this field
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    timeSlots.forEach((slot, index) => {
      if (!slot.name.trim()) {
        newErrors[`${index}-name`] = 'Name ist erforderlich';
      }

      if (!slot.timeFrom) {
        newErrors[`${index}-timeFrom`] = 'Startzeit ist erforderlich';
      }

      if (!slot.timeTo) {
        newErrors[`${index}-timeTo`] = 'Endzeit ist erforderlich';
      }

      if (slot.timeFrom && slot.timeTo && slot.timeFrom >= slot.timeTo) {
        newErrors[`${index}-timeTo`] = 'Endzeit muss nach der Startzeit liegen';
      }

      if (!slot.maxParticipants || slot.maxParticipants < 1) {
        newErrors[`${index}-maxParticipants`] = 'Mindestens 1 Teilnehmer erforderlich';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Category state value:', category);
    console.log('presetCategory:', presetCategory);
    console.log('timeSlot?.category:', timeSlot?.category);
    
    if (validateForm()) {
      if (isEditing) {
        // When editing, save single timeslot
        const dataToSave = {
          ...timeSlots[0],
          category,
          maxParticipants: parseInt(timeSlots[0].maxParticipants)
        };
        console.log('Editing - Saving data:', dataToSave);
        onSave(dataToSave);
      } else {
        // When creating, group timeslots by category and effective date, then save
        const slotsWithDefaults = timeSlots.map(slot => {
          // Determine effective date - use slot date or event's dateFrom as default
          const effectiveDate = slot.date || (event?.dateFrom || '');
          
          return {
            ...slot,
            category,
            date: effectiveDate,
            maxParticipants: parseInt(slot.maxParticipants)
          };
        });

        // Group timeslots by category and effective date
        const groupedSlots = new Map();
        
        slotsWithDefaults.forEach(slot => {
          const key = `${slot.category}_${slot.date}`;
          
          if (!groupedSlots.has(key)) {
            groupedSlots.set(key, []);
          }
          groupedSlots.get(key).push(slot);
        });

        // Merge slots that have the same category and date
        const mergedSlots = [];
        
        groupedSlots.forEach((slots, key) => {
          if (slots.length === 1) {
            // Single slot, add as-is
            mergedSlots.push(slots[0]);
          } else {
            // Multiple slots with same category and date, combine them
            const baseSlot = slots[0];
            
            // Sort slots by time to merge ranges properly
            const sortedSlots = slots.sort((a, b) => a.timeFrom.localeCompare(b.timeFrom));
            
            // Determine if we should merge names or create a time range
            const hasDistinctNames = slots.some(s => s.name !== sortedSlots[0].name);
            const combinedName = hasDistinctNames 
              ? slots.map(s => s.name).join(' / ')
              : sortedSlots[0].name;
            
            // Sum up max participants
            const totalMaxParticipants = slots.reduce((sum, s) => sum + s.maxParticipants, 0);
            
            // Use the earliest start time and latest end time if times differ
            const earliestStart = sortedSlots[0].timeFrom;
            const latestEnd = sortedSlots[sortedSlots.length - 1].timeTo;
            
            mergedSlots.push({
              ...baseSlot,
              name: combinedName,
              timeFrom: earliestStart,
              timeTo: latestEnd,
              maxParticipants: totalMaxParticipants
            });
          }
        });

        console.log('Creating - Original slots:', slotsWithDefaults);
        console.log('Creating - Merged slots:', mergedSlots);
        onSave(mergedSlots);
      }
    }
  };

  return (
    <div className="timeslot-form-container">
      <div className="timeslot-form-header">
        <h3>{isEditing ? 'Zeitslot bearbeiten' : 'Neue Zeitslots hinzufügen'}</h3>
      </div>

      <div className="timeslot-form">
        <div className="form-group">
          <label htmlFor="category">Kategorie {isEditing ? '' : '*'}</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="z.B. Parcour, Putzen, Aufbau"
            readOnly={presetCategory && !isEditing}
            className={presetCategory && !isEditing ? 'readonly-input' : ''}
            list="category-suggestions"
          />
          {existingCategories.length > 0 && (
            <datalist id="category-suggestions">
              {existingCategories.map((cat, index) => (
                <option key={index} value={cat} />
              ))}
            </datalist>
          )}
          {presetCategory && !isEditing && (
            <span className="helper-text">Zeitslots werden zur Kategorie "{presetCategory}" hinzugefügt</span>
          )}
          {!presetCategory && !isEditing && (
            <span className="helper-text">Alle Zeitslots werden dieser Kategorie zugeordnet. Zeitslots mit gleicher Kategorie und gleichem Datum werden automatisch zusammengefasst.</span>
          )}
          {isEditing && existingCategories.length > 0 && (
            <span className="helper-text">Wähle eine bestehende Kategorie oder erstelle eine neue</span>
          )}
          {isEditing && existingCategories.length === 0 && (
            <span className="helper-text">Kategorie kann geändert werden</span>
          )}
        </div>

        <div className="timeslots-container">
          {timeSlots.map((slot, index) => (
            <div key={index} className="timeslot-entry">
              <div className="timeslot-entry-header">
                <h4>Zeitslot {index + 1}</h4>
                {!isEditing && timeSlots.length > 1 && (
                  <button 
                    type="button" 
                    className="btn-remove-slot"
                    onClick={() => removeTimeSlot(index)}
                  >
                    ✕ Entfernen
                  </button>
                )}
              </div>

              <div className="form-group">
                <label htmlFor={`name-${index}`}>Name *</label>
                <input
                  type="text"
                  id={`name-${index}`}
                  value={slot.name}
                  onChange={(e) => updateTimeSlot(index, 'name', e.target.value)}
                  placeholder="z.B. Vormittag, Nachmittag, etc."
                  className={errors[`${index}-name`] ? 'error' : ''}
                />
                {errors[`${index}-name`] && <span className="error-text">{errors[`${index}-name`]}</span>}
              </div>
{event && (
                <div className="form-group">
                  <label htmlFor={`date-${index}`}>Datum (Optional)</label>
                  <input
                    type="date"
                    id={`date-${index}`}
                    value={slot.date || ''}
                    onChange={(e) => updateTimeSlot(index, 'date', e.target.value)}
                    className={errors[`${index}-date`] ? 'error' : ''}
                  />
                  {!slot.date && (
                    <span className="helper-text">
                      Wenn leer, gilt: {event.dateFrom === event.dateTo || !event.dateTo 
                        ? new Date(event.dateFrom).toLocaleDateString('de-DE') 
                        : `${new Date(event.dateFrom).toLocaleDateString('de-DE')} - ${new Date(event.dateTo).toLocaleDateString('de-DE')}`
                      }. Zeitslots mit gleicher Kategorie und gleichem Datum werden automatisch zusammengefasst.
                    </span>
                  )}
                  {errors[`${index}-date`] && <span className="error-text">{errors[`${index}-date`]}</span>}
                </div>
              )}

              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`timeFrom-${index}`}>Startzeit *</label>
                  <input
                    type="time"
                    id={`timeFrom-${index}`}
                    value={slot.timeFrom}
                    onChange={(e) => updateTimeSlot(index, 'timeFrom', e.target.value)}
                    className={errors[`${index}-timeFrom`] ? 'error' : ''}
                  />
                  {errors[`${index}-timeFrom`] && <span className="error-text">{errors[`${index}-timeFrom`]}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor={`timeTo-${index}`}>Endzeit *</label>
                  <input
                    type="time"
                    id={`timeTo-${index}`}
                    value={slot.timeTo}
                    onChange={(e) => updateTimeSlot(index, 'timeTo', e.target.value)}
                    className={errors[`${index}-timeTo`] ? 'error' : ''}
                  />
                  {errors[`${index}-timeTo`] && <span className="error-text">{errors[`${index}-timeTo`]}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor={`maxParticipants-${index}`}>Maximale Anzahl Teilnehmer *</label>
                <input
                  type="number"
                  id={`maxParticipants-${index}`}
                  min="1"
                  value={slot.maxParticipants}
                  onChange={(e) => updateTimeSlot(index, 'maxParticipants', e.target.value)}
                  className={errors[`${index}-maxParticipants`] ? 'error' : ''}
                />
                {errors[`${index}-maxParticipants`] && <span className="error-text">{errors[`${index}-maxParticipants`]}</span>}
              </div>
            </div>
          ))}
        </div>

        {!isEditing && (
          <button type="button" className="btn-add-slot" onClick={addTimeSlot}>
            + Weiteren Zeitslot hinzufügen
          </button>
        )}

        <div className="form-actions">
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            {isEditing ? 'Aktualisieren' : `${timeSlots.length} Zeitslot${timeSlots.length > 1 ? 's' : ''} speichern`}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotForm;
