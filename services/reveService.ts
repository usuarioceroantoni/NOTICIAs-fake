export const generateReveImage = async (prompt: string, apiKey: string, aspectRatio: string = "16:9"): Promise<string> => {
  // If the prompt is short, we might enhance it, but the UI now provides a full prompt.
  // We will assume the prompt passed from the UI is the "Final" prompt.
  // However, to ensure high quality, we can prepend a style guide if the user didn't include one.
  
  // Simple check: if prompt doesn't mention "8k" or "cinematic", add it.
  let finalPrompt = prompt;
  if (!prompt.toLowerCase().includes("cinematic") && !prompt.toLowerCase().includes("8k")) {
     finalPrompt = `Cinematic, hyper-realistic, 8k resolution. ${prompt}`;
  }

  try {
    const response = await fetch("https://api.reve.com/v1/image/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        aspect_ratio: aspectRatio,
        version: "latest"
      })
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      
      try {
        const text = await response.text();
        // Attempt to parse error JSON if it exists
        try {
          const errorData = JSON.parse(text);
          if (errorData.message) errorMessage = errorData.message;
          else if (errorData.error) errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
          else if (errorData.code_error) errorMessage = `${errorData.code_error}: ${errorData.message || ''}`;
          else errorMessage = text; 
        } catch {
          if (text) errorMessage = text;
        }
      } catch (e) {
        // Reading text failed
      }

      throw new Error(errorMessage);
    }

    // Parse the successful JSON response
    const data = await response.json();
    
    // Check for content violation
    if (data.content_violation) {
      throw new Error("La imagen no se pudo generar debido a una violación de política de contenido (Content Violation).");
    }

    if (data.image) {
      // The API returns raw base64 data in the 'image' field for JSON responses
      // We prepend the data URI scheme for React to display it
      return `data:image/png;base64,${data.image}`;
    } else {
      throw new Error("No image data received from API (Response format unknown)");
    }
  } catch (error) {
    throw error;
  }
};