// github-updater.js - Automatisches Tool für Git-Updates über Commander

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitUpdater {
  constructor(repoPath) {
    this.repoPath = repoPath || process.cwd();
  }

  /**
   * Führt einen Git-Befehl aus
   * @param {string} command - Git-Befehl zum Ausführen
   * @returns {Promise<string>} - Ausgabe des Befehls
   */
  executeGitCommand(command) {
    return new Promise((resolve, reject) => {
      exec(`git ${command}`, { cwd: this.repoPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Fehler beim Ausführen von git ${command}:`);
          console.error(stderr);
          reject(error);
          return;
        }
        resolve(stdout.trim());
      });
    });
  }

  /**
   * Überprüft, ob es ungespeicherte Änderungen gibt
   */
  async hasChanges() {
    const status = await this.executeGitCommand('status --porcelain');
    return status.length > 0;
  }

  /**
   * Klont das Repository, falls es noch nicht existiert
   * @param {string} repoUrl - URL des zu klonenden Repositories
   * @param {string} branch - Branch, der geklont werden soll (optional)
   */
  async cloneRepo(repoUrl, branch = 'main') {
    const dirExists = fs.existsSync(this.repoPath);
    const isGitRepo = dirExists && fs.existsSync(path.join(this.repoPath, '.git'));

    if (!dirExists) {
      fs.mkdirSync(this.repoPath, { recursive: true });
      console.log(`Verzeichnis ${this.repoPath} erstellt.`);
    }

    if (!isGitRepo) {
      console.log(`Repository wird nach ${this.repoPath} geklont...`);
      await new Promise((resolve, reject) => {
        exec(`git clone -b ${branch} ${repoUrl} ${this.repoPath}`, (error, stdout, stderr) => {
          if (error) {
            console.error('Fehler beim Klonen des Repositories:');
            console.error(stderr);
            reject(error);
            return;
          }
          console.log(`Repository erfolgreich geklont.`);
          resolve(stdout);
        });
      });
    } else {
      console.log(`Repository existiert bereits in ${this.repoPath}.`);
    }
  }

  /**
   * Aktualisiert das lokale Repository
   */
  async pull() {
    console.log('Aktualisiere lokales Repository...');
    return this.executeGitCommand('pull');
  }

  /**
   * Fügt Dateien zur Staging-Area hinzu
   * @param {string} files - Dateipfade oder Glob-Muster
   */
  async add(files = '.') {
    console.log(`Füge Änderungen hinzu: ${files}`);
    return this.executeGitCommand(`add ${files}`);
  }

  /**
   * Erstellt einen Commit mit den gestaged Änderungen
   * @param {string} message - Commit-Nachricht
   */
  async commit(message) {
    console.log(`Erstelle Commit: ${message}`);
    return this.executeGitCommand(`commit -m "${message}"`);
  }

  /**
   * Pusht Änderungen zum Remote-Repository
   * @param {string} remote - Name des Remote-Repositories (default: origin)
   * @param {string} branch - Name des Branches (default: aktueller Branch)
   */
  async push(remote = 'origin', branch) {
    if (!branch) {
      branch = await this.executeGitCommand('rev-parse --abbrev-ref HEAD');
    }
    console.log(`Pushe Änderungen zu ${remote}/${branch}...`);
    return this.executeGitCommand(`push ${remote} ${branch}`);
  }

  /**
   * Wechselt den Branch
   * @param {string} branch - Name des Branches
   * @param {boolean} createIfNotExists - Erstellt den Branch, falls er nicht existiert
   */
  async checkout(branch, createIfNotExists = false) {
    try {
      if (createIfNotExists) {
        console.log(`Wechsle zu Branch ${branch} (wird erstellt, falls nicht vorhanden)...`);
        await this.executeGitCommand(`checkout -B ${branch}`);
      } else {
        console.log(`Wechsle zu Branch ${branch}...`);
        await this.executeGitCommand(`checkout ${branch}`);
      }
      return true;
    } catch (error) {
      console.error(`Fehler beim Wechseln zu Branch ${branch}:`, error);
      return false;
    }
  }

  /**
   * Automatisiert den kompletten Update-Prozess
   * @param {Array<Object>} files - Liste der zu aktualisierenden Dateien mit Pfad und Inhalt
   * @param {string} commitMessage - Commit-Nachricht
   */
  async updateRepository(files, commitMessage) {
    try {
      // Prüfe aktuellen Branch
      const currentBranch = await this.executeGitCommand('rev-parse --abbrev-ref HEAD');
      console.log(`Aktueller Branch: ${currentBranch}`);

      // Speichere Dateien
      for (const file of files) {
        const filePath = path.join(this.repoPath, file.path);
        
        // Stelle sicher, dass das Verzeichnis existiert
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Schreibe die Datei
        console.log(`Aktualisiere Datei: ${file.path}`);
        fs.writeFileSync(filePath, file.content);
      }

      // Prüfe, ob es Änderungen gibt
      const hasChanges = await this.hasChanges();
      if (!hasChanges) {
        console.log('Keine Änderungen gefunden.');
        return false;
      }

      // Commit und Push
      await this.add();
      await this.commit(commitMessage);
      await this.push();

      console.log('Änderungen erfolgreich an GitHub übermittelt.');
      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Repositories:', error);
      return false;
    }
  }
}

module.exports = GitUpdater;

// Beispiel für die Verwendung:
if (require.main === module) {
  (async () => {
    const gitUpdater = new GitUpdater('./chatgpt-backup');
    
    // Repository klonen (falls es nicht existiert)
    await gitUpdater.cloneRepo('https://github.com/Keyvanhardani/chatgpt-backup.git');
    
    // Repository aktualisieren
    await gitUpdater.pull();
    
    // Beispiel für eine Dateiaktualisierung
    const files = [
      {
        path: 'index.html',
        content: fs.readFileSync('./index-updated.html', 'utf8')
      },
      {
        path: 'backup.js',
        content: fs.readFileSync('./backup-updated.js', 'utf8')
      }
    ];

    await gitUpdater.updateRepository(files, 'Automatisches Update mit GitUpdater');
  })().catch(console.error);
}
