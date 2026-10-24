import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './styles/tokens.css';
import './styles/app.css';
import { EDITION } from './content/edition';

if (EDITION === 'naropa') document.title = 'What We Can’t See · The Naropa edition';

// A private soundtrack for local screenings: ?soundtrack plays
// local/soundtrack.mp3 (or ?soundtrack=other.m4a) and lets it drive the clock.
// Development only: the public build carries neither this code nor the file.
// The public music, which follows the story's clock, is src/animation/music.ts.
if (import.meta.env.DEV) {
  const soundtrack = new URLSearchParams(location.search).get('soundtrack');
  if (soundtrack !== null) void import('./animation/soundtrack').then((m) => m.attachSoundtrack(`/local/${soundtrack || 'soundtrack.mp3'}`));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
