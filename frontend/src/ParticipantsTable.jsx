import React from 'react';
import './ParticipantsTable.css';

const ParticipantsTable = ({ timeSlots, dateFrom }) => {
  if (!timeSlots || timeSlots.length === 0) {
    return null;
  }

  // Group by date first, then by category
  const groupedByDate = timeSlots.reduce((acc, timeSlot) => {
    const date = timeSlot.date || dateFrom;
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

  return (
    <div className="participants-overview">
      <h3>Zeitslots & Teilnehmer</h3>
      {sortedDates.map(date => {
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
                            <tr key={`${timeSlot.id}-${index}`} className="accepted-row">
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
      })}
    </div>
  );
};

export default ParticipantsTable;
