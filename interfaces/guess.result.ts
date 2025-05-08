export interface GuessResult {
  [key: string]: {
    letter: string;
    status: 'correct' | 'present' | 'absent';
  };
}