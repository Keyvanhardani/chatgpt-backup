# ChatGPT Backup Tool

Dieses Tool ermöglicht es dir, deine ChatGPT-Konversationen zu sichern und zu verwalten.

## Funktionen

- **Backup erstellen**: Exportiere deine ChatGPT-Konversationen in eine JSON-Datei
- **Backup-Viewer**: Nutze den integrierten Reader zum Anzeigen und Exportieren von Konversationen
- **Markdown-Export**: Exportiere einzelne Konversationen als Markdown-Dateien

## Komponenten

Das Projekt besteht aus zwei Hauptkomponenten:

1. **Backup-Tool**: Skript zum Herunterladen und Sichern deiner ChatGPT-Konversationen
2. **Reader**: Eine eigenständige Webanwendung zum Anzeigen und Exportieren der gesicherten Konversationen

## Installation

1. Repository klonen:
   ```
   git clone https://github.com/Keyvanhardani/chatgpt-backup.git
   cd chatgpt-backup
   ```

2. Für den Reader die Abhängigkeiten installieren:
   ```
   cd reader
   npm init -y
   npm install bootstrap marked
   ```

## Verwendung

### Backup erstellen

1. Passe die Variablen `START_OFFSET` und `STOP_OFFSET` in der `backup.js` nach Bedarf an
2. Öffne die ChatGPT-Website und melde dich an
3. Öffne die Entwicklertools des Browsers und füge den Inhalt von `backup.js` in die Konsole ein
4. Warte, bis der Backup-Prozess abgeschlossen ist
5. Die JSON-Datei wird automatisch heruntergeladen

### Backup anzeigen

1. Navigiere zum `reader`-Verzeichnis
2. Öffne die `index.html`-Datei in einem Browser
3. Klicke auf "Backup-Datei auswählen" und wähle deine zuvor erstellte JSON-Backup-Datei
4. Durchsuche deine Konversationen und verwende die Vorschau- und Download-Funktionen

## Anpassungen

Du kannst dieses Tool nach deinen Bedürfnissen anpassen:

- Bearbeite die CSS-Styles im Reader, um das Aussehen zu ändern
- Passe die Backup-Parameter in `backup.js` an, um mehr oder weniger Konversationen zu erfassen
- Ändere die Markdown-Formatierung nach deinen Wünschen

## Fehlerbehebung

- **"Failed to fetch token"**: Stelle sicher, dass du bei ChatGPT angemeldet bist
- **"Failed to fetch conversation ids"**: API-Rate-Limits könnten erreicht sein, warte einige Minuten
- **"Ungültiges JSON"**: Prüfe, ob die Backup-Datei korrekt formatiert ist

## Mitwirken

Wenn du Verbesserungen vornehmen möchtest, erstelle einen Fork des Repositories, nimm deine Änderungen vor und sende einen Pull Request.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.
