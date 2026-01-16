const UUID_RADIX = 16;
const UUID_MASK_3 = 0x3;
const UUID_MASK_8 = 0x8;

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string): string => {
    const r = (Math.random() * UUID_RADIX) | 0;
    const v = c === 'x' ? r : (r & UUID_MASK_3) | UUID_MASK_8;
    return v.toString(UUID_RADIX);
  });
}
