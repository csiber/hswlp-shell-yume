export interface UploadCreditInput {
  type: 'image' | 'music' | 'prompt';
  title?: string | null;
  promptText?: string | null; // for image or prompt
  artist?: string | null;
  album?: string | null;
  picture?: string | null;
  tags?: string[];
  linkedUploadId?: string | null;
  hasR2?: boolean;
}

export function calculateUploadCredits(input: UploadCreditInput): number {
  let value = 1;
  if (input.type === 'image') {
    if (input.title) value += 1;
    if (input.promptText) value += 1;
    if (input.tags && input.tags.length > 0) value += 1;
    if (input.hasR2) value += 1;
  } else if (input.type === 'music') {
    if (input.title) value += 1;
    if (input.artist) value += 1;
    if (input.album) value += 1;
    if (input.picture) value += 2;
    if (input.tags && input.tags.length > 0) value += 1;
  } else if (input.type === 'prompt') {
    if (input.title) value += 1;
    if (input.promptText && input.promptText.length >= 300) value += 1;
    if (input.linkedUploadId) value += 2;
  }
  return value;
}

