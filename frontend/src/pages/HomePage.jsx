import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Zeiterfassung RK Schmalegg</h1>
        <p className="subtitle">Willkommen beim Zeitmanagementsystem des Reit- und Fahrvereins Schmalegg</p>
        
        <div className="action-cards">
          <div className="action-card">
            <div className="card-icon">👤</div>
            <h3>Benutzer</h3>
            <p>Melden Sie sich als Vereinsmitglied an, um Events zu sehen und sich für Zeitslots anzumelden.</p>
            <Link to="/login" className="cta-button">
              Zur Anmeldung
            </Link>
          </div>
          
          <div className="action-card">
            <div className="card-icon">⚙️</div>
            <h3>Administrator</h3>
            <p>Verwalten Sie Events, Zeitslots und Teilnehmer. Behalten Sie den Überblick über alle Aktivitäten.</p>
            <Link to="/admin" className="cta-button admin">
              Admin-Bereich
            </Link>
          </div>
        </div>
      </div>
      
      <div className="info-section">
        <div className="info-grid">
          <div className="info-item">
            <h4>📅 Event-Management</h4>
            <p>Erstellen und verwalten Sie Vereinsevents mit vordefinierten Zeitslots</p>
          </div>
          
          <div className="info-item">
            <h4>👥 Teilnehmerverwaltung</h4>
            <p>Mitglieder können sich einfach für verfügbare Zeitslots anmelden</p>
          </div>
          
          <div className="info-item">
            <h4>📊 Stundenerfassung</h4>
            <p>Automatische Berechnung der geleisteten Arbeitsstunden pro Event</p>
          </div>
          
          <div className="info-item">
            <h4>📱 Benutzerfreundlich</h4>
            <p>Intuitive Bedienung sowohl für Administratoren als auch für Mitglieder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
