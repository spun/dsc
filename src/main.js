(() => {
  // publicPath configuration
  __webpack_public_path__ /* eslint-disable-line no-undef, camelcase */ = process.env.APP_PATH;

  // Check current domain
  let s;
  switch (document.domain) {
    case 'www.youtube.com':
      s = import(/* webpackChunkName: "youtube" */ './youtube/youtube');
      break;
    case 'twitch.tv':
      s = import(/* webpackChunkName: "twitch" */ './twitch/twitch');
      break;
    case 'mixer.com':
      s = import(/* webpackChunkName: "mixer" */ './mixer/mixer');
      break;
    default:
      console.log(`Unknown domain: ${document.domain}`);
      break;
  }

  // run
  if (s) {
    s.then((module) => {
      module.default();
    });
  }
})();
