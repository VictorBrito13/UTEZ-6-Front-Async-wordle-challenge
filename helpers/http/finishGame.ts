import { baseURL } from "../baseUrl";

export async function finishGame(authToken: string) {
  const response = await fetch(`${baseURL}/game-core/finish-game`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  const data = await response.json();
  console.log(data);
  console.log('juego finalizado');
  return data;
}