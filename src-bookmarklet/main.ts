// src/main.ts

function loadFullScript() {
  // Get url of the bookmarklet
  const docScripts = document.getElementsByTagName('script');
  const mainScript = Array.from(docScripts).filter((script) => script.src.endsWith('main.js'));
  if (mainScript.length === 1) {
    // Create the url of the "main-full" alternative we are going to load
    const fullMainSrc = mainScript[0].src.replace('main.js', 'main-bundle.js');
    // Create script tag and load the "main-full" bookmarklet
    const script = document.body.appendChild(document.createElement('script'));
    script.type = 'module';
    script.src = fullMainSrc;
  } else {
    console.error('Unable to load main-bundle. Unknown script url.');
  }
}

(() => {
  // Check current domain
  let s;
  switch (document.domain) {
    case 'www.youtube.com':
      s = import('./youtube/youtube');
      break;
    case 'www.twitch.tv':
    case 'twitch.tv':
      s = import('./twitch/twitch');
      break;
    case 'mixer.com':
      s = import('./mixer/mixer');
      break;
    default:
      console.log(`Unknown domain: ${document.domain}`);
      break;
  }

  // run
  if (s) {
    s.then((module) => {
      module.default();
    }).catch(() => {
      // Some browsers fail to resolve the final url because import()
      // is called from a CORS-cross-origin script.
      // To solve this, we have an alternative main bundle that contains
      // the scripts of all supported sites.
      loadFullScript();
    });
  }
})();
