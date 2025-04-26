# ChatGPT Backup Reader

Ein einfacher Viewer für deine exportierten ChatGPT-Konversationen. Diese leichtgewichtige Anwendung ermöglicht es dir, JSON-Backup-Dateien zu laden und die Konversationen zu durchsuchen.

## Funktionen

- **Backup anzeigen**: Lade deine JSON-Backup-Dateien und zeige die Konversationen an
- **Vorschau**: Sieh dir den vollständigen Inhalt einer Konversation an
- **Markdown-Export**: Lade Konversationen als Markdown-Dateien herunter
- **Responsive Design**: Funktioniert auf Desktop und mobilen Geräten

## Installation

Die Installation ist sehr einfach:

1. Navigiere zum `reader`-Verzeichnis:
   ```
   cd reader
   ```

2. Initialisiere npm und installiere die erforderlichen Abhängigkeiten:
   ```
   npm init -y
   npm install bootstrap marked
   ```

3. Öffne die `index.html` in deinem Browser.

## Verwendung

1. Öffne die `index.html`-Datei in einem Webbrowser
2. Klicke auf "Backup-Datei auswählen" und wähle eine JSON-Datei aus, die mit dem ChatGPT-Backup-Tool erstellt wurde
3. Die Liste der Konversationen wird angezeigt
4. Klicke auf "Vorschau", um den vollständigen Inhalt einer Konversation anzuzeigen
5. Klicke auf "Download", um die Konversation als Markdown-Datei zu speichern

## Technische Details

Der Reader verwendet:
- **Bootstrap** für das Layout und die Benutzeroberfläche
- **Marked** für die Umwandlung von Markdown in HTML
- **Vanilla JavaScript** (kein Framework erforderlich)

## Anpassung

Du kannst diesen Reader ganz einfach anpassen:
- Bearbeite die CSS-Styles in der `index.html`-Datei
- Ändere die Markdown-Formatierung in der `chatToMarkdown`-Funktion
- Passe das Layout und die Benutzeroberfläche nach deinen Wünschen an

## Fehlerbehebung

- **"Ungültiges JSON"**: Stelle sicher, dass du eine korrekt formatierte Backup-Datei ausgewählt hast
- **Leerer Vorschaubereich**: Prüfe, ob die ausgewählte Konversation Nachrichten enthält
- **Fehler beim Download**: Überprüfe die Browserrechte zum Herunterladen von Dateien
