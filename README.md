# ChatGPT Backup Tool

Dieses Tool ermöglicht es dir, deine ChatGPT-Konversationen zu sichern und zu verwalten. Es wurde erweitert, um Backups auszuwählen und automatisch mit GitHub zu synchronisieren.

## Funktionen

- **Backup erstellen**: Exportiere alle deine ChatGPT-Konversationen in eine JSON-Datei
- **Backup anzeigen**: Lade bestehende Backup-Dateien und durchsuche deine Konversationen
- **Markdown-Export**: Exportiere einzelne Konversationen als Markdown-Dateien
- **Backup-Auswahl**: Wähle bestehende Backup-Dateien zum Anzeigen aus
- **GitHub-Integration**: Automatisches Pushen von Änderungen an dein GitHub-Repository

## Installation

1. Repository klonen:
   ```
   git clone https://github.com/Keyvanhardani/chatgpt-backup.git
   cd chatgpt-backup
   ```

2. Öffne `index.html` in deinem Browser oder hoste die Dateien auf einem Webserver.

## Verwendung

### Backup erstellen

1. Öffne die `index.html`-Datei in deinem Browser
2. Klicke auf "Create New Backup"
3. Konfiguriere die Backup-Parameter (Start-Offset, Stop-Offset)
4. Klicke auf "Start Backup"
5. Warte, bis der Vorgang abgeschlossen ist
6. Die JSON-Datei wird automatisch heruntergeladen und in der Anwendung geladen

### Bestehendes Backup laden

1. Öffne die `index.html`-Datei in deinem Browser
2. Klicke auf "Load Existing Backup"
3. Wähle eine zuvor erstellte JSON-Backup-Datei aus

### Konversationen als Markdown exportieren

1. Lade ein Backup wie oben beschrieben
2. Finde die Konversation, die du exportieren möchtest
3. Klicke auf das Download-Symbol neben der Konversation
4. Die Konversation wird als Markdown-Datei heruntergeladen

## GitHub-Integration verwenden

Um Änderungen automatisch an dein eigenes GitHub-Repository zu pushen:

1. Stelle sicher, dass Node.js installiert ist
2. Führe das Update-Skript aus:
   ```
   node auto-update.js
   ```

## Eigene Anpassungen

Du kannst dieses Tool nach deinen Bedürfnissen anpassen:

- Bearbeite die CSS-Styles in `index.html`, um das Aussehen zu ändern
- Passe die Backup-Parameter in `backup.js` an, um mehr oder weniger Konversationen zu erfassen
- Erweitere die GitHub-Integration für zusätzliche Funktionen

## Fehlerbehebung

- **"Failed to fetch token"**: Stelle sicher, dass du bei ChatGPT angemeldet bist
- **"Failed to fetch conversation ids"**: API-Rate-Limits könnten erreicht sein, warte einige Minuten
- **GitHub-Synchronisierung schlägt fehl**: Stelle sicher, dass du die korrekten Berechtigungen hast

## Mitwirken

Wenn du Verbesserungen vornehmen möchtest, erstelle einen Fork des Repositories, nimm deine Änderungen vor und sende einen Pull Request.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.
