// EdgeOne Makers maps agents/<name>/index.ts to the /<name> route.
// Use a concrete wrapper so route discovery works across Makers build versions.
import { onRequest as chatOnRequest } from '../chat';

export async function onRequest(context: any) {
  return chatOnRequest(context);
}
