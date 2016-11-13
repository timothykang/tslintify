import * as browserify from 'browserify';
import * as test from 'tape';

import tslintify = require('../src/tslintify');

test('lint clean', function (t) {
    browserify()
        .plugin(tslintify)
        .add('./tests/lint/clean.ts')
        .on('error', () => t.fail('unexpected error'))
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('lint dirty', function (t) {
    t.plan(1);

    browserify()
        .plugin(tslintify)
        .add('./tests/lint/dirty.ts')
        .on('error', error => {
            if (error.indexOf('[1, 1]: " should be \'') !== -1) {
                t.pass('quotemark');
            }
        })
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('resolve tslint.json', function (t) {
    t.plan(1);

    browserify()
        .plugin(tslintify)
        .add('./tests/tslint-json/dirty.ts')
        .on('error', error => {
            if (error.indexOf('[1, 1]: \' should be "') !== -1) {
                t.pass('quotemark');
            }
        })
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('project', function (t) {
    browserify()
        .plugin(tslintify, { project: '.' })
        .add('./tests/tslint-json/dirty.ts')
        .on('error', () => t.fail('unexpected error'))
        .bundle()
        .on('end', () => t.end())
        .resume();
});
