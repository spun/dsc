import 'whatwg-fetch';

function getManifestUrl() {
  const results = window.performance
    .getEntriesByType('resource')
    // .filter(resource => resource.initiatorType === 'xmlhttprequest') // changes between browsers
    .filter((request) => request.name.includes('manifest.m3u8'));

  return results[results.length - 1].name;
}

// Create and trigger file dowload (https://stackoverflow.com/a/33542499)
function downloadAsFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    // Add to dom
    document.body.appendChild(elem);
    // trigger click event
    elem.click();
    // remove from dom
    document.body.removeChild(elem);
  }
}

function getManifestText(manifestUrl) {
  const baseUrl = manifestUrl.split('manifest.m3u8')[0];

  fetch(manifestUrl)
    .then((response) => response.text())
    .then((text) => {
      const result = text.replace(/^.*\d+\.ts$/gm, (value) => baseUrl + value);
      downloadAsFile('result.m3u8', result);
    })
    .catch((e) => {
      console.error(e);
    });
}

export default () => {
  const manifestUrl = getManifestUrl();
  getManifestText(manifestUrl);
};
