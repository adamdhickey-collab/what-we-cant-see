// Which telling of the ride this is. The original, or ?edition=naropa: the
// same scenes, data and science, with the inner voice drawn from the
// contemplative psychology taught at Naropa University (src/content/naropa.ts).
// Read once, at load; the script checker, which has no page, sees the original.

export type Edition = 'original' | 'naropa';

export const EDITIONS: Edition[] = ['original', 'naropa'];

const asked = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('edition');

export const EDITION: Edition = asked === 'naropa' ? 'naropa' : 'original';

/** The query that keeps a link inside this edition. */
export const EDITION_QUERY = EDITION === 'original' ? '' : `?edition=${EDITION}`;
