function getManifestUrl() {
  const results = window.performance
    .getEntriesByType('resource')
    // .filter(resource => resource.initiatorType === 'xmlhttprequest') // changes between browsers
    .filter(request => request.name.endsWith('manifest.m3u8'));

  return results[results.length - 1].name;
}

function downloadAsFile(filename, text) {
  // Create link element
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
  element.setAttribute('download', filename);
  // Add to dom
  element.style.display = 'none';
  document.body.appendChild(element);
  // trigger click event
  element.click();
  // remove from dom
  document.body.removeChild(element);
}

function getManifestText(manifestUrl) {
  const baseUrl = manifestUrl.replace('manifest.m3u8', '');

  fetch(manifestUrl)
    .then(response => response.text())
    .then((text) => {
      const result = text.replace(/^.*\d+\.ts$/gm, value => baseUrl + value);
      downloadAsFile('result.m3u8', result);
    });
}

export default () => {
  const manifestUrl = getManifestUrl();
  getManifestText(manifestUrl);
};
