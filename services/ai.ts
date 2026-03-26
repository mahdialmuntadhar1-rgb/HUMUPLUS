export interface JourneyWaypoint {
  name: string;
  address: string;
}

interface JourneyResponse {
  waypoints: JourneyWaypoint[];
}

interface TaglineResponse {
  tagline: string;
}

const aiApiBase = import.meta.env.VITE_AI_API_BASE_URL;

function assertApiBase() {
  if (!aiApiBase) {
    throw new Error('AI API endpoint is not configured. Set VITE_AI_API_BASE_URL.');
  }
  return aiApiBase.replace(/\/$/, '');
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI API request failed (${response.status}): ${text || 'No error body'}`);
  }
  return response.json() as Promise<T>;
}

export const aiApi = {
  async generateJourney(prompt: string): Promise<JourneyWaypoint[]> {
    const base = assertApiBase();
    const response = await fetch(`${base}/journey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await parseJson<JourneyResponse>(response);
    return Array.isArray(data.waypoints) ? data.waypoints : [];
  },

  async generateTagline(name: string, reviews: string[]): Promise<string> {
    const base = assertApiBase();
    const response = await fetch(`${base}/tagline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, reviews }),
    });
    const data = await parseJson<TaglineResponse>(response);
    return (data.tagline || '').trim();
  },
};
