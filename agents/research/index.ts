// EdgeOne Makers maps agents/<name>/index.ts to the /<name> route.
// Keep the implementation in the shared flat module, but expose a concrete
// handler here. Some Makers build versions do not follow re-exports when
// discovering Agent routes.
import { onRequest as researchOnRequest } from '../research';

export async function onRequest(context: any) {
  return researchOnRequest(context);
}
