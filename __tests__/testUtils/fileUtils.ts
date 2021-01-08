import { FSWatcher } from 'fs';

const fs = require('fs');
const path = require('path');

export function prepareEmptyDir(dir: string) {
  // Check if the directory exists
  if (!fs.existsSync(dir)) {
    // If it doesn't exit, create folder
    fs.mkdirSync(dir);
  } else {
    // If it exists, check if empty
    const files = fs.readdirSync(dir);
    // Delete any existing file
    files.forEach((file: string) => {
      const existingFilePath = path.join(dir, file);
      fs.unlinkSync(existingFilePath);
    });
  }
}

/**
 * Watch directory for changes and resolve when the expeted file appears or
 * reject when timeout.
 * https://github.com/puppeteer/puppeteer/issues/4676#issuecomment-509594763
 */
export function checkFileExistsWithTimeout(filePath: string, timeout: number) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath);
    let fileWatcher: FSWatcher;

    const timer = setTimeout(() => {
      fileWatcher?.close();
      reject(new Error('File did not exists and was not created during the timeout.'));
    }, timeout);

    fileWatcher = fs.watch(dir, (eventType:string, filename:string) => {
      if (eventType === 'rename' && filename === basename) {
        clearTimeout(timer);
        fileWatcher?.close();
        resolve(0);
      }
    });

    fs.access(filePath, fs.constants.R_OK, (err: Error) => {
      if (!err) {
        clearTimeout(timer);
        fileWatcher?.close();
        resolve(0);
      }
    });
  });
}
