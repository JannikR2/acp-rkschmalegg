# Datenspeicherung im Backend

## Übersicht

Das Backend speichert alle Events, Zeitslots und Teilnahmedaten automatisch in einer JSON-Datei, sodass die Daten nach einem Neustart erhalten bleiben.

## Speicherort

Die Daten werden gespeichert in:
```
backend/data/events.json
```

## Automatische Speicherung

Die Daten werden **automatisch gespeichert** nach jeder Änderung:

- ✅ Event erstellen
- ✅ Event bearbeiten
- ✅ Event löschen
- ✅ Event-Status ändern (veröffentlichen/unveröffentlichen)
- ✅ Zeitslot erstellen
- ✅ Zeitslot bearbeiten
- ✅ Zeitslot löschen
- ✅ Teilnahme an Zeitslot (anmelden/abmelden)

## Beim Start

Beim Start des Backends:

1. **Falls `events.json` existiert**: Die Daten werden aus der Datei geladen
   ```
   ✓ 3 Events aus Datei geladen
   ```

2. **Falls `events.json` nicht existiert**: Das System initialisiert sich mit Beispieldaten und speichert diese
   ```
   Keine gespeicherten Daten gefunden. Initialisiere mit Beispieldaten...
   ✓ Daten erfolgreich gespeichert in: .../backend/data/events.json
   ```

## Datenformat

Die JSON-Datei enthält:

```json
{
  "nextEventId": 4,          // Nächste verfügbare Event-ID
  "nextTimeSlotId": 10,      // Nächste verfügbare Zeitslot-ID
  "events": [                // Array aller Events
    {
      "id": 1,
      "name": "...",
      "description": "...",
      "dateFrom": "...",
      "dateTo": "...",
      "timeFrom": "...",
      "timeTo": "...",
      "location": "...",
      "status": "published",
      "timeSlots": [
        {
          "id": 1,
          "name": "...",
          "date": "...",
          "category": "...",
          "timeFrom": "...",
          "timeTo": "...",
          "maxParticipants": 5,
          "participants": [
            {
              "personId": 1,
              "status": "accepted"
            }
          ]
        }
      ]
    }
  ]
}
```

## Manuelles Backup

Um ein Backup zu erstellen, kopiere einfach die Datei:
```bash
cp backend/data/events.json backend/data/events-backup.json
```

## Daten zurücksetzen

Um die Daten zurückzusetzen auf die Beispieldaten:

1. Backend stoppen (Ctrl+C)
2. Datei löschen:
   ```bash
   rm backend/data/events.json
   ```
3. Backend neu starten - neue Beispieldaten werden erstellt

## Wichtiger Hinweis

⚠️ Die Datei `backend/data/events.json` sollte **NICHT** in die Versionskontrolle (Git) eingecheckt werden, da sie Benutzerdaten enthält. Sie ist bereits in der `.gitignore` aufgelistet.

## Fehlerbehebung

**Problem**: Daten werden nicht gespeichert
- Prüfe, ob das `backend/data/` Verzeichnis existiert und beschreibbar ist
- Überprüfe die Konsole auf Fehlermeldungen:
  ```
  ✗ Fehler beim Speichern der Daten: ...
  ```

**Problem**: Daten werden beim Start nicht geladen
- Prüfe, ob die Datei existiert: `backend/data/events.json`
- Überprüfe, ob die JSON-Datei valide ist (kein Syntax-Fehler)
- Die Konsole zeigt beim Start an, ob Daten geladen wurden

**Problem**: Alte Daten bleiben nach Backend-Neustart
- Das ist korrekt! Die Daten sind persistent und bleiben erhalten
- Falls du neue Daten möchtest, siehe "Daten zurücksetzen" oben
