# download-script-collection

[![Deploy to GitHub Pages](https://github.com/spun/dsc/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/spun/dsc/actions/workflows/deploy.yml)

[https://spun.github.io/dsc/](https://spun.github.io/dsc/)

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
> npm run dev

### Test

Run all available tests.

**NOTE**: Integration tests are disabled and won't run with `npm test` anymore. Puppeteer keeps breaking in different ways almost every time we update it. Maybe a bookmarklet isn't a great fit for Puppeteer testing.

> npm test

Tests are divided into two folders.

#### 1) `__tests__/unitTests`

We can run just the tests from this folder with:

> npm run test:unit

#### 2) `__tests__/integrationTests`

These tests will run the bookmarklet final code. The tests make use of [puppeteer](https://pptr.dev/) to open a page in a browser and insert the bookmark script.

To make the bookmarklet final script available to puppeteer, a temporary server (`utils/tests_server.js`) will be started. The server will shut down after the tests are done.
In order to serve the correct files, a `build` needs to be done before running the integration tests (our ci GitHub workflows always run `build` before `test`).

Currently, these tests make real connections to the supported pages. Because of that, test results could be flaky (page down, timeout, etc.), but it will give us the best representation of an user running the bookmarklet.

We can run just the tests from this folder with:

> npm run test:integration
