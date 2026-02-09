import { Attachment, WebhookResponse, WorkerTasks } from '../types';

const CHAT_WEBHOOK_URL = 'https://yakovb.app.n8n.cloud/webhook/chatbot-input';
const TASKS_WEBHOOK_URL = 'https://yakovb.app.n8n.cloud/webhook/get-workers';

export const sendToWebhook = async (
  text: string,
  attachments: Attachment[],
  sessionId: string,
  userId: string,
  userEmail: string
): Promise<string> => {
  try {
    const payload = {
      sessionId: sessionId,
      userId: userId,
      userEmail: userEmail,
      message: text,
      timestamp: new Date().toISOString(),
      attachments: attachments.map(a => ({
        name: a.name,
        type: a.type,
        data: a.data,
        size: a.size
      }))
    };

    const response = await fetch(CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}`);
    }

    const data = await response.json();

    const result = Array.isArray(data) ? data[0] : data;
    const output = result?.output || result?.text || result?.response || result?.message;

    if (output === undefined || output === null) {
      console.warn("Webhook response received but no recognized content field was found.", result);
      return "I received a response, but it didn't contain any text content.";
    }

    return String(output);
  } catch (error) {
    console.error("Webhook integration failed:", error);
    throw error;
  }
};

export const getWorkerTasks = async (userId: string, userEmail: string, userName?: string): Promise<WorkerTasks[]> => {
  try {
    const payload = {
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(TASKS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Task Webhook responded with ${response.status}`);
    }

    const data = await response.json();

    let resultData = data;

    // Logic to unwrap N8N response if it is wrapped in an array with 'output' key or similar
    // Case: [ { output: [ { worker: ... }, ... ] } ]
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem && typeof firstItem === 'object') {
        if (Array.isArray(firstItem.output)) {
          resultData = firstItem.output;
        } else if (Array.isArray(firstItem.tasks)) {
          // The top level item is the worker object itself in an array [ { worker:..., tasks:... } ]
          // This matches standard expected format, no change needed to resultData (which is data)
        } else if ('worker' in firstItem) {
          // Array of workers, correct format
        } else if (firstItem.body && Array.isArray(firstItem.body)) {
          // Sometimes N8N returns in body
          resultData = firstItem.body;
        }
      }
    }
    // Case: { output: [ ... ] }
    else if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data.output)) {
        resultData = data.output;
      }
    }

    // Check if data is array (expected format)
    if (Array.isArray(resultData)) {
      return resultData as WorkerTasks[];
    }

    // Fallback if it returns a single object
    if (typeof resultData === 'object' && resultData !== null && 'tasks' in resultData) {
      return [resultData] as WorkerTasks[];
    }

    console.warn("Task webhook returned unexpected structure:", data);
    return [];
  } catch (error) {
    console.error("Task webhook failed:", error);
    throw error;
  }
};
