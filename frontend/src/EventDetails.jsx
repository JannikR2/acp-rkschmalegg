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

  const handleExportPDF = () => {
    // Create printable content
    const printWindow = window.open('', '_blank');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Event: ${event.name}</title>
        <style>
          @media print {
            @page { margin: 2cm; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
          }
          h1 { color: #333; border-bottom: 3px solid #f6ce38; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 30px; }
          h3 { color: #333; margin-top: 20px; margin-bottom: 10px; }
          h4 { color: #333; background: #fff8dc; padding: 8px 12px; border-left: 4px solid #f6ce38; margin-top: 25px; margin-bottom: 15px; }
          .event-info { margin: 20px 0; }
          .event-info p { margin: 5px 0; }
          .category-section { margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #333; color: #f6ce38; font-weight: 600; }
          tr:nth-child(even) { background-color: #f8f9fa; }
          .status-accepted { color: #27ae60; font-weight: bold; }
          .status-declined { color: #e74c3c; }
          .full-badge { background: #e74c3c; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; }
          .available-badge { background: #27ae60; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #7f8c8d; }
        </style>
      </head>
      <body>
        <h1>Event: ${event.name}</h1>
        
        <div class="event-info">
          <p><strong>Datum:</strong> ${event.dateFrom}${event.dateTo !== event.dateFrom ? ' bis ' + event.dateTo : ''}</p>
          <p><strong>Ort:</strong> ${event.location || 'Nicht angegeben'}</p>
          <p><strong>Beschreibung:</strong> ${event.description || 'Keine Beschreibung'}</p>
        </div>

        <h2>Zeitslots und Teilnehmer</h2>
        
        ${event.timeSlots && event.timeSlots.length > 0 ? (() => {
          // Group timeslots by date first, then by category
          const groupedByDate = event.timeSlots.reduce((acc, slot) => {
            const date = slot.date || event.dateFrom;
            if (!acc[date]) {
              acc[date] = {};
            }
            const category = slot.category || 'Ohne Kategorie';
            if (!acc[date][category]) {
              acc[date][category] = [];
            }
            acc[date][category].push(slot);
            return acc;
          }, {});

          // Sort dates and render
          const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
            return a.localeCompare(b);
          });

          return sortedDates.map(date => {
            const categoriesForDate = groupedByDate[date];
            const formattedDate = new Date(date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            return `
              <h3 style="color: #333; margin-top: 30px; padding-bottom: 10px; border-bottom: 2px solid #f6ce38;">${formattedDate}</h3>
              ${Object.entries(categoriesForDate).sort(([a], [b]) => a.localeCompare(b)).map(([category, slots]) => {
                // Sort slots by time within each category
                const sortedSlots = slots.sort((a, b) => a.timeFrom.localeCompare(b.timeFrom));
                
                return `
                  <div class="category-section">
                    <h4>${category}</h4>
                    ${sortedSlots.map(slot => {
                      const acceptedParticipants = slot.participants?.filter(p => p.status === 'accepted') || [];
                      const isFull = acceptedParticipants.length >= slot.maxParticipants;
                      
                      return `
                        <h3 style="font-size: 16px;">${slot.name} (${slot.timeFrom} - ${slot.timeTo})</h3>
                        <p>
                          <strong>Belegung:</strong> ${acceptedParticipants.length} / ${slot.maxParticipants}
                          ${isFull ? '<span class="full-badge">Voll</span>' : `<span class="available-badge">${slot.maxParticipants - acceptedParticipants.length} frei</span>`}
                        </p>
                        
                        ${slot.participants && slot.participants.length > 0 ? `
                          <table>
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>E-Mail</th>
                                <th>Telefon</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${slot.participants.map(p => `
                                <tr>
                                  <td>${p.person?.fullName || p.person?.firstName + ' ' + p.person?.lastName || 'Unbekannt'}</td>
                                  <td>${p.person?.email || '-'}</td>
                                  <td>${p.person?.phone || '-'}</td>
                                  <td class="status-${p.status}">${p.status === 'accepted' ? '✓ Zugesagt' : '✗ Abgesagt'}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                        ` : '<p><em>Noch keine Teilnehmer eingetragen</em></p>'}
                      `;
                    }).join('')}
                  </div>
                `;
              }).join('')}
            `;
          }).join('');
        })() : '<p><em>Keine Zeitslots vorhanden</em></p>'}

        <div class="footer">
          <p>Exportiert am: ${new Date().toLocaleString('de-DE')}</p>
          <p>RK Schmalegg Zeiterfassung</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
          <button className="export-button" onClick={handleExportPDF}>
            📄 PDF exportieren
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
              {(() => {
                // First group by date, then by category
                const groupedByDate = event.timeSlots.reduce((acc, timeSlot) => {
                  const date = timeSlot.date || event.dateFrom;
                  if (!acc[date]) {
                    acc[date] = {};
                  }
                  const category = timeSlot.category || 'Ohne Kategorie';
                  if (!acc[date][category]) {
                    acc[date][category] = [];
                  }
                  acc[date][category].push(timeSlot);
                  return acc;
                }, {});

                // Sort dates chronologically
                const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                  return a.localeCompare(b);
                });

                return sortedDates.map(date => {
                  const categories = groupedByDate[date];
                  const sortedCategories = Object.keys(categories).sort();

                  return (
                    <div key={date} className="timeslot-date-section">
                      <h3 className="date-header">
                        {new Date(date).toLocaleDateString('de-DE', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      
                      {sortedCategories.map(category => {
                        const slots = categories[category];
                        
                        // Sort slots by time within each category
                        const sortedSlots = slots.sort((a, b) => {
                          return a.timeFrom.localeCompare(b.timeFrom);
                        });
                        
                        return (
                          <div key={category} className="timeslot-category-group">
                            <h4 className="category-title">{category}</h4>
                            {sortedSlots.map((timeSlot) => (
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
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Detailed Participants Overview Table */}
        {event.timeSlots && event.timeSlots.length > 0 && (
          <div className="participants-overview">
            <h3>Detaillierte Übersicht - Zeitslots & Teilnehmer</h3>
            {(() => {
              // Group by date first, then by category
              const groupedByDate = event.timeSlots.reduce((acc, timeSlot) => {
                const date = timeSlot.date || event.dateFrom;
                if (!acc[date]) {
                  acc[date] = {};
                }
                const category = timeSlot.category || 'Ohne Kategorie';
                if (!acc[date][category]) {
                  acc[date][category] = [];
                }
                acc[date][category].push(timeSlot);
                return acc;
              }, {});

              // Sort dates
              const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                return a.localeCompare(b);
              });

              return sortedDates.map(date => {
                const categories = groupedByDate[date];
                const sortedCategories = Object.keys(categories).sort();

                return (
                  <div key={date} className="table-date-section">
                    <h4 className="table-date-header">
                      {new Date(date).toLocaleDateString('de-DE', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    
                    {sortedCategories.map(category => {
                      const slots = categories[category].sort((a, b) => a.timeFrom.localeCompare(b.timeFrom));
                      
                      return (
                        <div key={category} className="table-category-section">
                          <h5 className="table-category-header">{category}</h5>
                          <div className="overview-table-container">
                            <table className="overview-table">
                              <thead>
                                <tr>
                                  <th className="col-zeitslot">Zeitslot</th>
                                  <th className="col-zeit">Zeit</th>
                                  <th className="col-belegung">Belegung</th>
                                  <th className="col-teilnehmer">Teilnehmer</th>
                                </tr>
                              </thead>
                              <tbody>
                                {slots.map((timeSlot) => {
                    const acceptedParticipants = timeSlot.participants?.filter(p => p.status === 'accepted') || [];
                    const allParticipants = timeSlot.participants || [];
                    
                    if (allParticipants.length === 0) {
                      return (
                        <tr key={timeSlot.id} className="empty-slot">
                          <td><strong>{timeSlot.name}</strong></td>
                          <td>{timeSlot.timeFrom} - {timeSlot.timeTo}</td>
                          <td>
                            <span className="capacity">0 / {timeSlot.maxParticipants}</span>
                          </td>
                          <td colSpan="1" className="no-participants">
                            <em>Noch keine Teilnehmer</em>
                          </td>
                        </tr>
                      );
                    }
                    
                    return allParticipants.map((participant, index) => (
                      <tr key={`${timeSlot.id}-${index}`} className="accepted-row">{/* Only accepted participants are shown */}
                        {index === 0 && (
                          <>
                            <td rowSpan={allParticipants.length}>
                              <strong>{timeSlot.name}</strong>
                            </td>
                            <td rowSpan={allParticipants.length}>
                              {timeSlot.timeFrom} - {timeSlot.timeTo}
                            </td>
                            <td rowSpan={allParticipants.length}>
                              <span className="capacity">
                                {acceptedParticipants.length} / {timeSlot.maxParticipants}
                              </span>
                              {acceptedParticipants.length >= timeSlot.maxParticipants && 
                                <span className="full-badge-small">Voll</span>
                              }
                            </td>
                          </>
                        )}
                        <td>
                          <div className="participant-info">
                            <strong>{participant.person?.fullName || participant.person?.firstName + ' ' + participant.person?.lastName || 'Unbekannt'}</strong>
                          </div>
                        </td>
                      </tr>
                    ));
                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
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
