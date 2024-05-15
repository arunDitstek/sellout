import { Reader } from '@stripe/terminal-js';

const SELLOUT_DEFAULT_TERMINAL_READER_ID = 'SELLOUT_DEFAULT_TERMINAL_READER_ID';

export function setDefaultReaderId(readerId: string) {
  localStorage.setItem(SELLOUT_DEFAULT_TERMINAL_READER_ID, readerId);
}

export function getDefaultReader(readers: Reader[]): Reader {
  console.log(readers);
  const defaultReaderId = localStorage.getItem(SELLOUT_DEFAULT_TERMINAL_READER_ID);
  return readers.find(reader => reader.status === 'online' && reader.id === defaultReaderId) ?? readers[0];
}
