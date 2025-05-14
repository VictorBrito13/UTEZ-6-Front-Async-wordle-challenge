import { baseURL } from "../baseUrl";

export async function createGame(authToken: string) {
    try {
      const response = await fetch(`${baseURL}/game-core/create-game`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await response.json();

      console.log(data);

      return data;
    } catch (error) {
      console.error('Error fetching word:', error);
    }
  }