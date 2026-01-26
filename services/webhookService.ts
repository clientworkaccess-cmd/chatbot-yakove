
import { Attachment, WebhookResponse } from '../types';

const WEBHOOK_URL = 'https://yakovb.app.n8n.cloud/webhook/chatbot-input';

export const sendToWebhook = async (text: string, attachments: Attachment[], sessionId: string): Promise<string> => {
  try {
    const payload = {
      sessionId: sessionId,
      message: text,
      timestamp: new Date().toISOString(),
      attachments: attachments.map(a => ({
        name: a.name,
        type: a.type,
        data: a.data,
        size: a.size
      }))
    };

    const response = await fetch(WEBHOOK_URL, {
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
    
    /**
     * n8n webhooks typically return an array of objects. 
     * We need to extract the first item and then find the 'output' field.
     */
    const result = Array.isArray(data) ? data[0] : data;
    
    // Prioritize the 'output' field as requested, falling back to other common response keys.
    const output = result?.output || result?.text || result?.response || result?.message;
    
    if (output === undefined || output === null) {
      console.warn("Webhook response received but no recognized content field ('output', 'text', etc.) was found. Raw response:", result);
      return "I received a response, but it didn't contain any text content.";
    }

    return String(output);
  } catch (error) {
    console.error("Webhook integration failed:", error);
    throw error;
  }
};
