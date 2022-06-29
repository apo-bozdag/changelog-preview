#!/usr/bin/env node
'use strict';

const {argv} = require('yargs').options({
    changelogPath: {
        default: 'CHANGELOG.md',
        describe: 'The path to the changelog file formatted in Markdown.'
    },
    buildPath: {
        default: 'build',
        describe: 'The path of the directory where the static site assets will be created.'
    },
});

const {previewChangelog} = require('..');

previewChangelog(argv);
