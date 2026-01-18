# Excel Import Anleitung für Mitglieder

## Anforderungen an die Excel-Datei

Die Excel-Datei muss folgende Spalten enthalten (Reihenfolge ist egal):

### Pflichtfelder:
- **firstName** oder **Vorname** - Der Vorname der Person
- **lastName** oder **Nachname** - Der Nachname der Person

### Optionale Felder:
- **email** oder **Email** oder **E-Mail** - Die E-Mail-Adresse
- **phone** oder **Telefon** oder **Phone** - Die Telefonnummer
- **hours** oder **Stunden** oder **geleisteteStunden** - Bereits geleistete Stunden (Zahl)

## Beispiel Excel-Struktur

### Option 1: Englische Spaltennamen
| firstName | lastName | email | phone | hours |
|-----------|----------|-------|-------|-------|
| Maria | Weber | maria.weber@example.de | +49 175 1234567 | 5.5 |
| Stefan | Müller | stefan.mueller@example.de | +49 175 2345678 | 12.0 |
| Anna | Schmidt | anna.schmidt@example.de | +49 175 3456789 | 8.5 |

### Option 2: Deutsche Spaltennamen
| Vorname | Nachname | E-Mail | Telefon | Stunden |
|---------|----------|--------|---------|---------|
| Maria | Weber | maria.weber@example.de | +49 175 1234567 | 5.5 |
| Stefan | Müller | stefan.mueller@example.de | +49 175 2345678 | 12.0 |
| Anna | Schmidt | anna.schmidt@example.de | +49 175 3456789 | 8.5 |

## Wichtige Hinweise

⚠️ **ACHTUNG**: Der Import **überschreibt alle bestehenden Mitglieder**!

- Zeilen ohne Vorname oder Nachname werden übersprungen
- Wenn E-Mail oder Telefon fehlen, werden automatisch Standard-Werte verwendet
- **Stunden werden als Dezimalzahlen angegeben** (z.B. 5.5 für 5 Stunden 30 Minuten)
- Die importierten Stunden werden zu den automatisch erfassten Zeitslot-Stunden **addiert**
- Die Excel-Datei muss im Format .xlsx oder .xls sein
- Das erste Blatt (Sheet) der Excel-Datei wird verwendet

## Ablauf des Imports

1. Klicken Sie auf den Button "📊 Excel importieren"
2. Wählen Sie Ihre Excel-Datei aus
3. Das System prüft die Daten und zeigt eine Bestätigungsmeldung
4. Nach Bestätigung werden alle bisherigen Personen durch die neuen ersetzt
5. Eine Erfolgsmeldung zeigt an, wie viele Personen importiert wurden

## Fehlerbehebung

- **"Keine gültigen Personen gefunden"**: Prüfen Sie, ob die Spalten firstName/Vorname und lastName/Nachname vorhanden sind
- **"X Zeilen werden übersprungen"**: Einige Zeilen haben keinen Vor- oder Nachnamen
- **"Fehler beim Verarbeiten"**: Stellen Sie sicher, dass die Datei im Excel-Format (.xlsx oder .xls) ist
