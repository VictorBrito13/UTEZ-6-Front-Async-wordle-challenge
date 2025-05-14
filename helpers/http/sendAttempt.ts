import { baseURL } from "../baseUrl";

export async function sendAttempt(word: string, authToken: string) {
    const response = await fetch(`${baseURL}/game-core/guess-word`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ word })
    });

    const data = await response.json();

    return data;
  }