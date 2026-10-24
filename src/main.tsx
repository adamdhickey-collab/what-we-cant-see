import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './styles/tokens.css';
import './styles/app.css';

// A private soundtrack for local screenings: ?soundtrack plays
// local/soundtrack.mp3 (or ?soundtrack=other.m4a) and lets it drive the clock.
// Development only: the public build carries neither this code nor the music.
// ?music plays the same piece from its official YouTube upload alongside the
// story, which keeps its own clock (src/animation/music.ts).
if (import.meta.env.DEV) {
  const params = new URLSearchParams(location.search);
  const soundtrack = params.get('soundtrack');
  if (soundtrack !== null) void import('./animation/soundtrack').then((m) => m.attachSoundtrack(`/local/${soundtrack || 'soundtrack.mp3'}`));
  const music = params.get('music');
  const from = params.get('from');
  if (music !== null) void import('./animation/music').then((m) => m.attachMusic(music, from === null ? null : +from));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
