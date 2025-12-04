import { Voice } from "../types";

export const getVoiceClones = async (apiKey: string): Promise<Voice[]> => {
  try {
    // Removed 'Content-Type' header for GET request to prevent CORS preflight failures
    const response = await fetch("https://api.ai33.pro/v1m/voice/clone", {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
        "Accept": "application/json"
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      return result.data as Voice[];
    } else {
      console.warn("Unexpected voice list format:", result);
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch voice clones:", error);
    throw error;
  }
};

const pollTask = async (taskId: string, apiKey: string): Promise<string> => {
  const maxAttempts = 120; // Increased timeout for music (can take longer)
  const delay = 2000; // 2 seconds

  console.log(`Starting polling for Task ID: ${taskId}`);

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      // Polling the task status endpoint
      const response = await fetch(`https://api.ai33.pro/v1m/task/${taskId}`, {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
          "Accept": "application/json"
        }
      });

      if (!response.ok) continue;

      const data = await response.json();
      
      const status = data.status || data.data?.status;
      
      // Check for success status
      if (status === 'success' || status === 'done') {
        let url = data.metadata?.audio_url || data.data?.metadata?.audio_url || data.data?.url;
        
        // Music API returns an array of URLs, take the first one
        if (Array.isArray(url)) {
           url = url[0];
        }

        if (url) return url;
      }
      
      // Check for failure status
      if (status === 'error' || status === 'failed') {
        throw new Error(data.error_message || "Task failed during polling");
      }
      
    } catch (e) {
      console.warn("Polling error (retrying):", e);
    }
  }
  
  throw new Error("Generation timed out after polling");
};

export const generateSpeech = async (
  text: string, 
  voiceId: string, 
  apiKey: string
): Promise<string> => {
  try {
    const payload = {
      text: text,
      model: "speech-2.6-hd",
      voice_setting: {
        voice_id: voiceId,
        vol: 1,
        pitch: 0,
        speed: 1.15 
      },
      language_boost: "Auto"
    };

    const response = await fetch("https://api.ai33.pro/v1m/task/text-to-speech", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`TTS API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("TTS Initial Response:", JSON.stringify(data));

    // 1. Check for direct URL in metadata (Sync response)
    if (data.metadata?.audio_url) return data.metadata.audio_url;
    if (data.data?.metadata?.audio_url) return data.data.metadata.audio_url;
    if (data.url) return data.url;

    // 2. Check for Task ID (Async response)
    const taskId = data.task_id || data.id || data.data?.task_id || data.data?.id;
    
    if (taskId) {
      const status = data.status || data.data?.status || 'processing';
      if (status !== 'error' && status !== 'failed') {
        console.log(`TTS Task ${taskId} accepted. Starting polling...`);
        return await pollTask(taskId, apiKey);
      }
    }

    console.error("TTS Unexpected Response Structure:", JSON.stringify(data, null, 2));
    throw new Error("No audio URL found in response and no Task ID returned. Check console for full response.");

  } catch (error) {
    console.error("Speech generation failed:", error);
    throw error;
  }
};

export const generateMusic = async (
  title: string,
  idea: string,
  styleId: string,
  moodId: string,
  apiKey: string
): Promise<string> => {
  try {
    const payload = {
      title: title.substring(0, 40), // Max 40 chars
      idea: idea.substring(0, 300),  // Max 300 chars
      style_id: styleId,
      mood_id: moodId,
      n: 1,
      rewrite_idea_switch: true
    };

    const response = await fetch("https://api.ai33.pro/v1m/task/music-generation", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Music API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Music Initial Response:", JSON.stringify(data));

    const taskId = data.task_id || data.id || data.data?.task_id;

    if (taskId) {
      return await pollTask(taskId, apiKey);
    }

    throw new Error("No Task ID returned for Music Generation");
  } catch (error) {
    console.error("Music generation failed:", error);
    throw error;
  }
};

export const cloneVoice = async (file: File, apiKey: string): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch("https://api.ai33.pro/v1m/voice/clone", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Accept": "application/json"
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Voice Cloning Failed ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Voice cloning error:", error);
    throw error;
  }
};