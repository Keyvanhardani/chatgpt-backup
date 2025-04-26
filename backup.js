// Export functions for use in the HTML interface
window.runBackup = function(startOffset, stopOffset) {
  main(startOffset, stopOffset)
    .then(() => console.log('GPT-BACKUP::DONE'))
    .catch((e) => console.error(e));
};

function generateOffsets(startOffset, total) {
  const interval = 20;
  const start = startOffset + interval;
  const offsets = [];

  for (let i = start; i <= total; i += interval) {
    offsets.push(i);
  }

  return offsets;
}

function sleep(ms = 1000) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

function parseConversation(rawConversation) {
  const title = rawConversation.title;
  const create_time = rawConversation.create_time;
  const mapping = rawConversation.mapping;
  const keys = Object.keys(mapping);
  const messages = [];

  for (const k of keys) {
    const msgPayload = mapping[k];
    const msg = msgPayload.message;
    if (!msg) continue;

    const role = msg.author.role;
    const content = msg.content.parts;
    const model = msg.metadata.model_slug;
    const create_time = msg.create_time;

    messages.push({
      role,
      content,
      model,
      create_time,
    });
  }

  return {
    messages,
    create_time,
    title,
  };
}

function getRequestCount(total, startOffset, stopOffset) {
  if (stopOffset === -1) return total;

  return stopOffset - startOffset;
}

function logProgress(total, messages, offset) {
  const progress = Math.round((messages / total) * 100);
  console.log(`GPT-BACKUP::PROGRESS::${progress}%::OFFSET::${offset}`);
  
  // Update UI if it exists
  if (window.app && typeof window.app.updateBackupProgress === 'function') {
    window.app.updateBackupProgress(progress, offset);
  }
}

function getDateFormat(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

function downloadJson(data) {
  const jsonString = JSON.stringify(data, null, 2);
  const jsonBlob = new Blob([jsonString], { type: 'application/json' });
  const downloadLink = document.createElement('a');
  const fileName = `gpt-backup-${getDateFormat(new Date())}.json`;
  
  downloadLink.href = URL.createObjectURL(jsonBlob);
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  
  // Store in localStorage
  localStorage.setItem('json_data', jsonString);
  localStorage.setItem('backup_filename', fileName);
  
  // Update UI if available
  if (window.app) {
    window.app.loadBackupData(data, fileName);
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);
      resolve(fileName);
    }, 150);
  });
}

async function loadToken() {
  const res = await fetch('https://chatgpt.com/api/auth/session');

  if (!res.ok) {
    throw new Error('failed to fetch token');
  }

  const json = await res.json();
  return json.accessToken;
}

async function getConversationIds(token, offset = 0) {
  const res = await fetch(
    `https://chatgpt.com/backend-api/conversations?offset=${offset}&limit=20`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error('failed to fetch conversation ids');
  }

  const json = await res.json();
  return {
    items: json.items.map((item) => ({ ...item, offset })),
    total: json.total,
  };
}

async function fetchConversation(token, id, maxAttempts = 3, attempt = 1) {
  const INITIAL_BACKOFF = 10000;
  const BACKOFF_MULTIPLIER = 2;
  try {
    const res = await fetch(
      `https://chatgpt.com/backend-api/conversation/${id}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error('Unsuccessful response');
    }

    return res.json();
  } catch (error) {
    if (attempt >= maxAttempts) {
      throw new Error(`Failed to fetch conversation after ${maxAttempts} attempts.`);
    } else {
      var backoff = INITIAL_BACKOFF * Math.pow(BACKOFF_MULTIPLIER, attempt);
      console.log(`Error. Retrying in ${backoff}ms.`);
      await sleep(backoff);
      return fetchConversation(token, id, maxAttempts, attempt + 1);
    }
  }
}

async function getAllConversations(startOffset, stopOffset) {
  const token = await loadToken();

  // get first batch
  const { total, items: allItems } = await getConversationIds(
    token,
    startOffset,
  );

  // generate offsets
  const offsets = generateOffsets(startOffset, total);

  // don't spam api
  // fetch all offsets
  for (const offset of offsets) {
    // stop at offset
    if (offset === stopOffset) break;

    await sleep();

    const { items } = await getConversationIds(token, offset);
    allItems.push.apply(allItems, items);
  }

  const lastOffset =
    stopOffset === -1 ? offsets[offsets.length - 1] : stopOffset;

  const allConversations = [];
  const requested = getRequestCount(total, startOffset, stopOffset);

  console.log(`GPT-BACKUP::STARTING::TOTAL-OFFSETS::${lastOffset}`);
  console.log(`GPT-BACKUP::STARTING::REQUESTED-MESSAGES::${requested}`);
  console.log(`GPT-BACKUP::STARTING::TOTAL-MESSAGES::${total}`);
  
  for (const item of allItems) {
    // 60 conversations/min
    await sleep(1000);

    // log progress
    if (allConversations.length % 20 === 0) {
      logProgress(requested, allConversations.length, item.offset);
    }

    const rawConversation = await fetchConversation(token, item.id);
    const conversation = parseConversation(rawConversation);
    allConversations.push(conversation);
  }

  logProgress(requested, allConversations.length, lastOffset);

  return allConversations;
}

async function main(startOffset, stopOffset) {
  const allConversations = await getAllConversations(startOffset, stopOffset);
  const fileName = await downloadJson(allConversations);
  return { fileName, data: allConversations };
}

// GitHub integration functions
async function pushToGitHub(token, repo, path, content, message, branch = 'main') {
  try {
    // First, get the SHA of the current file if it exists
    let sha;
    try {
      const fileResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        sha = fileData.sha;
      }
    } catch (error) {
      console.log('File does not exist yet, will create it');
    }
    
    // Now update or create the file
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const requestBody = {
      message,
      content: encodedContent,
      branch
    };
    
    if (sha) {
      requestBody.sha = sha;
    }
    
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub API error: ${error.message}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    throw error;
  }
}

// Exported GitHub backup function for use from HTML interface
window.backupToGitHub = async function(githubToken, repo, backupData, fileName) {
  if (!githubToken || !repo) {
    throw new Error('GitHub token and repository are required');
  }
  
  if (!backupData) {
    // Try to get from localStorage
    const savedData = localStorage.getItem('json_data');
    if (!savedData) {
      throw new Error('No backup data available');
    }
    backupData = savedData;
    fileName = localStorage.getItem('backup_filename') || `gpt-backup-${getDateFormat(new Date())}.json`;
  }
  
  // If backupData is an object, stringify it
  const contentToUpload = typeof backupData === 'string' ? backupData : JSON.stringify(backupData, null, 2);
  
  try {
    // Create backups directory if it doesn't exist
    const path = `backups/${fileName}`;
    const message = `Update ChatGPT backup: ${fileName}`;
    
    const result = await pushToGitHub(githubToken, repo, path, contentToUpload, message);
    console.log('Successfully backed up to GitHub:', result);
    return result;
  } catch (error) {
    console.error('Failed to backup to GitHub:', error);
    throw error;
  }
};

// Check if we're running as a module or directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    main,
    getAllConversations,
    pushToGitHub
  };
}
