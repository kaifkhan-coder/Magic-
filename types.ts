
export interface FileAttachment {
  name: string;
  type: string;
  base64: string;
}

export interface Suggestion {
  id: string;
  find: string;
  replaceWith: string;
  reason: string;
}

export type AiAction = 'improve' | 'shorten' | 'expand' | 'fix' | 'custom';

export interface SelectionInfo {
  text: string;
  rect: DOMRect;
}
