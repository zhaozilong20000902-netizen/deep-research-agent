// EdgeOne Makers maps agents/<name>/index.ts to the /<name> route.
// Keep the implementation in the shared flat module so local imports remain
// stable while the deployed Agent route follows the platform convention.
export { onRequest } from '../research';
