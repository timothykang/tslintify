import { BrowserifyObject, InputFile } from 'browserify';
import { readFileSync } from 'fs';
import { PassThrough, Transform } from 'stream';
import { Linter } from 'tslint';
import { findConfiguration } from 'tslint/lib/configuration';
import { findConfigFile, getSupportedExtensions, parseConfigFileTextToJson, sys } from 'typescript';

declare module 'typescript' {
    // stub method missing from typescript.d.ts
    function getSupportedExtensions(options): string[];
}

export = (b: BrowserifyObject, options) => {
    const projectDir = options.p || options.project || options.basedir || process.cwd();
    const tsConfigFile = findConfigFile(projectDir, sys.fileExists);
    const parsed = parseConfigFileTextToJson(tsConfigFile, readFileSync(tsConfigFile, 'UTF-8'));
    const extensions = getSupportedExtensions(parsed.config.compilerOptions) || [];
    const linter = new Linter({
        fix: !!options.fix,
        formatter: options.t || options.format || 'prose',
        formattersDirectory: options.s || options['formatters-dir'],
        rulesDirectory: options.r || options['rules-dir'],
    });

    b.transform((file: InputFile) => {
        if (
            typeof file !== 'string' ||
            file.lastIndexOf('.') === -1 ||
            extensions.indexOf(file.slice(file.lastIndexOf('.'))) === -1
        ) {
            return new PassThrough();
        }

        let configuration;

        try {
            configuration = findConfiguration(options.p || options.project, file);
        } catch (error) {
            b.emit('error', `Failed to find TSLint configuration for ${file}`);
            return new PassThrough();
        }

        let buffer = new Buffer(0);

        const transform = new Transform({
            transform: (chunk, encoding, callback) => {
                buffer = Buffer.concat([
                    buffer,
                    typeof chunk === 'string' ? new Buffer(chunk, encoding) : chunk,
                ]);

                callback(null, chunk);
            },
        });

        transform.on('finish', () => {
            linter.lint(file, buffer.toString(), configuration.results);

            const { failureCount, output } = linter.getResult();

            if (failureCount) {
                if (options.warn) {
                    if (b.hasOwnProperty('argv')) {
                        // CLI
                        console.warn(output);
                    } else {
                        b.emit('warning', output);
                    }
                } else {
                    b.emit('error', output);
                }
            }
        });

        return transform;
    });
};
