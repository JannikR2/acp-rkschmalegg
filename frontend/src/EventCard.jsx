import React from 'react';
import { EventUtils } from './apiService';
import './EventCard.css';

const EventCard = ({ event }) => {
  const participantsWithHours = EventUtils.getParticipantsWithHours(event);
  const totalTrackedHours = EventUtils.getTotalTrackedHours(event);
  const plannedDuration = EventUtils.calculatePlannedDuration(event);

  return (
    <div className="event-card">
      <div className="event-header">
        <h3 className="event-name">{event.name}</h3>
        <div className="event-hours">{totalTrackedHours.toFixed(1)}h erfasst</div>
      </div>
      
      <p className="event-description">{event.description}</p>
      
      <div className="event-details">
        <div className="event-detail">
          <span className="detail-label">📅 Datum:</span>
          <span>{EventUtils.getDateRange(event.dateFrom, event.dateTo)}</span>
        </div>
        
        <div className="event-detail">
          <span className="detail-label">🕐 Zeit (geplant):</span>
          <span>{EventUtils.getTimeRange(event.timeFrom, event.timeTo)} ({plannedDuration}h)</span>
        </div>
        
        <div className="event-detail">
          <span className="detail-label">📍 Ort:</span>
          <span>{event.location}</span>
        </div>
      </div>

      <div className="participants-section">
        <h4 className="participants-title">👥 Teilnehmer & Zeiterfassung</h4>
        {participantsWithHours.length > 0 ? (
          <div className="participants-list">
            {participantsWithHours.map((participant, index) => (
              <div key={index} className="participant-card">
                <div className="participant-header">
                  <span className="participant-name">{participant.name}</span>
                  <span className="participant-hours">{participant.hours.toFixed(1)}h</span>
                </div>
                
                {participant.timeSpans.length > 0 && (
                  <div className="time-spans">
                    {participant.timeSpans.map((timeSpan, spanIndex) => (
                      <div key={spanIndex} className="time-span">
                        <div className="time-span-header">
                          <span className="time-span-date">
                            {new Date(timeSpan.date).toLocaleDateString()}
                          </span>
                          <span className="time-span-time">
                            {EventUtils.getTimeRange(timeSpan.timeFrom, timeSpan.timeTo)} ({EventUtils.getFormattedDuration(timeSpan)})
                          </span>
                        </div>
                        {timeSpan.description && (
                          <div className="time-span-description">
                            {timeSpan.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-participants">Keine Teilnehmer</p>
        )}
      </div>
    </div>
  );
};

export default EventCard;
