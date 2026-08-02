// EdgeOne Makers maps agents/<name>/index.ts to the /<name> route.
// Use a concrete wrapper so route discovery works across Makers build versions.
import { onRequest as stopOnRequest } from '../stop';

export async function onRequest(context: any) {
  return stopOnRequest(context);
}
