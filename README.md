# download-script-collection

![build](https://github.com/spun/dsc/workflows/build/badge.svg)

[http://spun.github.com/dsc/](http://spun.github.com/dsc/)

## Project structure

This repository contains the necessary code to generate a bookmarklet and a webpage where users can drag and drop the bookmarklet to their browsers.

The final webpage is hosted using GitHub Pages. To help with the deployment to the gh-pages branch, we are mixing code from the bookmarklet and the web within the same repository.

### Folders

#### Folder `src-bookmarklet`

Contains the bookmarklet code. `main.js` checks the current webpage against the supported sites and requests and runs the appropriate script to make the download possible.

#### Folder `src-web`

Contains the html and assets of the webpage. The contents of this folder will be copied and merged with the final bookmarklet scripts on build. Web files don't receive any special treatment from the builder (no transformation, no minification, etc.). This could be improved, but right now the webpage is not the main priority of this repository and I don't want to end with yet another react webpage. :dancer:

## How to run

### Install dependencies

> npm install

### Build

Generate the final bookmarklet scripts and merge them with the content from `src-web`
> npm run build

### Run dev server

Generate and serve the bookmarklet code.
> npm run serve
