declare const __BASE_PATH__: string;

// Vite embeds this value; the Node prerender reads the same build environment.
export const BASE_PATH = typeof __BASE_PATH__ !== 'undefined'
  ? __BASE_PATH__
  : process.env.BASE_PATH || '/';

if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(BASE_PATH)) {
  throw new Error('BASE_PATH must be / or a path with leading and trailing slashes.');
}

export function sitePath(path: string) {
  return path.startsWith('/') && !path.startsWith('//')
    ? `${BASE_PATH}${path.slice(1)}`
    : path;
}
