// auto-update.js - Automatisches Update-Skript für das ChatGPT-Backup-Tool
const fs = require('fs');
const path = require('path');
const GitUpdater = require('./github-updater');

// Konfiguration
const config = {
  // GitHub-Repository URL
  repoUrl: 'https://github.com/Keyvanhardani/chatgpt-backup.git',
  // Lokaler Pfad zum Repository (relativ oder absolut)
  repoPath: path.resolve(__dirname, 'chatgpt-backup'),
  // Zu aktualisierende Dateien
  filesToUpdate: [
    {
      path: 'index.html',
      localPath: path.resolve(__dirname, 'index.html')
    },
    {
      path: 'backup.js',
      localPath: path.resolve(__dirname, 'backup.js')
    },
    {
      path: 'github-updater.js',
      localPath: path.resolve(__dirname, 'github-updater.js')
    },
    {
      path: 'auto-update.js',
      localPath: path.resolve(__dirname, 'auto-update.js')
    },
    {
      path: 'README.md',
      localPath: path.resolve(__dirname, 'README.md')
    }
  ],
  // Commit-Nachricht
  commitMessage: 'Automatisches Update: Backup-Auswahl und GitHub-Integration hinzugefügt'
};

async function main() {
  try {
    console.log('Starte automatisches Update...');
    
    // Initialisiere den Git-Updater
    const gitUpdater = new GitUpdater(config.repoPath);
    
    // Klone das Repository, falls es noch nicht existiert
    await gitUpdater.cloneRepo(config.repoUrl);
    
    // Aktualisiere das lokale Repository
    await gitUpdater.pull();
    
    // Bereite die Dateien für das Update vor
    const filesToUpdate = [];
    
    for (const file of config.filesToUpdate) {
      try {
        // Prüfe, ob die lokale Datei existiert
        if (fs.existsSync(file.localPath)) {
          const content = fs.readFileSync(file.localPath, 'utf8');
          filesToUpdate.push({
            path: file.path,
            content: content
          });
          console.log(`Datei '${file.path}' zum Update vorbereitet.`);
        } else {
          console.warn(`Warnung: Lokale Datei '${file.localPath}' nicht gefunden und wird übersprungen.`);
        }
      } catch (error) {
        console.error(`Fehler beim Lesen der Datei '${file.path}':`, error);
      }
    }
    
    if (filesToUpdate.length === 0) {
      console.log('Keine Dateien zum Aktualisieren gefunden. Der Vorgang wird beendet.');
      return;
    }
    
    // Führe das Repository-Update durch
    const success = await gitUpdater.updateRepository(filesToUpdate, config.commitMessage);
    
    if (success) {
      console.log(`
================================================
✅ ERFOLG: Repository erfolgreich aktualisiert!
================================================
Die folgenden Dateien wurden aktualisiert:
${filesToUpdate.map(f => `- ${f.path}`).join('\n')}

Commit-Nachricht: "${config.commitMessage}"

Repository: ${config.repoUrl}
`);
    } else {
      console.log(`
⚠️ Update abgeschlossen, aber möglicherweise gab es keine Änderungen.
`);
    }
  } catch (error) {
    console.error(`
❌ FEHLER: Das automatische Update ist fehlgeschlagen:
`, error);
  }
}

// Starte das Update-Skript
main().catch(error => {
  console.error('Unbehandelter Fehler:', error);
  process.exit(1);
});
