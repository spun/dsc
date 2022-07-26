// src/main-bundle.ts
// This file contains the same logic of "main.js" but without using
// the dynamic import feature that can cause CORS problems.
import youtube from './youtube/youtube';
import twitch from './twitch/twitch';
import mixer from './mixer/mixer';

(() => {
  // Check current domain
  switch (document.domain) {
    case 'www.youtube.com':
      youtube();
      break;
    case 'www.twitch.tv':
    case 'twitch.tv':
      twitch();
      break;
    case 'mixer.com':
      mixer();
      break;
    default:
      console.log(`Unknown domain: ${document.domain}`);
      break;
  }
})();
