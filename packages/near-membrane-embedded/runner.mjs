/* eslint-disable import/no-extraneous-dependencies */
import * as cp from 'child_process';
import * as fs from 'fs';
import recast from 'recast';
import * as rollup from 'rollup';
import { globby } from 'globby';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import resolve from '@rollup/plugin-node-resolve';
import tempfile from 'tempfile';

// Gather information about available engines from the esvu generated status settings.
const engineStatusJSON = fs.readFileSync('./status.json', 'utf8');
const engineStatus = engineStatusJSON ? JSON.parse(engineStatusJSON) : null;
const enginesInstalled = engineStatus ? Object.keys(engineStatus.installed) : [];

// This is complete bundled & embed-safe source for near-membrane-embed.
// It includes all of near-membrane-base and near-membrane-embed
const nearMembraneSourceText = fs.readFileSync('./lib/index.js', 'utf8');

// This provides necessary environment definitions for running jasmine in an embedded host
const environmentSourceText = fs.readFileSync('./test/__bootstrap__/environment.js', 'utf8');

// This provides a bare-bones jasmine test results reporter. The output is JSON, which
// is printed to stdout by the shelled binary invocation. The JSON is captured and parsed
// and used to report test run condition.
const jasmineReporterSourceText = fs.readFileSync(
    './test/__bootstrap__/jasmine-reporter.js',
    'utf8'
);

// This provides the jasmine test suite invocation machinery
const jasmineExecSourceText = fs.readFileSync('./test/__bootstrap__/jasmine-exec.js', 'utf8');

function preprocessor(ast) {
    recast.visit(ast, {
        visitIdentifier(path) {
            if (path.value.type === 'Identifier' && path.value.name === 'window') {
                path.value.name = 'globalThis';
            }
            this.traverse(path);
        },
        visitNode(path) {
            if (path.node.type === 'Program') {
                const body = [];
                for (const node of path.node.body) {
                    if (node.type !== 'ImportDeclaration') {
                        body.push(node);
                    }
                }
                path.node.body = body;
            }
            this.traverse(path);
        },
    });
    return ast;
}

async function bootstrapAndRunTests() {
    const setupBundle = await rollup.rollup({
        context: 'globalThis',
        input: './test/__bootstrap__/jasmine-setup.js',
    });

    // The jasmine tests that near-membrane-embedded is borrowing from near-membrane-node
    // were written to run in jest and take advantage of jest's extended expect API.
    // In order to provide that API to our embedded environment, we need to run it through
    // rollup.
    const expectBundle = await rollup.rollup({
        input: './node_modules/expect/build/index.js',
        plugins: [
            // For reasons I cannot explain, it appears that this order matters!
            commonjs(),
            nodePolyfills(),
            resolve(),
        ],
    });

    const expectOutputOptions = {
        // This option is ignored, but is left in place for debugging. Uncomment the bundle write
        // invocation below to
        file: 'expect.js',
        format: 'iife',
        name: 'expect',
    };

    // Uncomment to inspect the built "expect.js" bundle
    // await expectBundle.write(expectOutputOptions);

    const [jasmineCoreAndSetupSourceText, expectSourceText] = await Promise.all([
        await setupBundle.generate({ format: 'es' }).then(({ output }) => output[0].code),
        await expectBundle.generate(expectOutputOptions).then(({ output }) => output[0].code),
    ]);

    // Gather and prepare test source file material. We're borrowing near-membrane-node's tests
    // because those will not have references to DOM APIs.
    const rawTestFiles = await globby('../near-membrane-node/src/__tests__/*.spec.js');
    const preparedTests = await Promise.all(
        rawTestFiles.map(
            (file) =>
                new Promise((resolve) => {
                    const source = fs.readFileSync(file, 'utf8');
                    const ast = preprocessor(recast.parse(source));
                    const processedTestMaterialSourceText = recast.print(ast).code;
                    // This builds the entire test environment with the test material itself
                    // to run directly in an embedded runtime via shell.
                    const prepared = `
                ${environmentSourceText}

                ${jasmineCoreAndSetupSourceText}

                ${expectSourceText}

                ${jasmineReporterSourceText}

                ${nearMembraneSourceText}

                ${processedTestMaterialSourceText}

                ${jasmineExecSourceText}
                `.trim();

                    resolve({
                        file,
                        prepared,
                    });
                })
        )
    );

    const outcomes = [];
    for (const engine of enginesInstalled) {
        const capture = [];
        outcomes.push([engine, capture]);
        for (const test of preparedTests) {
            const tf = tempfile();
            fs.writeFileSync(tf, test.prepared);
            const executor = cp.spawnSync(`./engines/${engine}`, [tf], { detached: true });
            const rawStderr = executor.stderr.toString();
            const rawStdout = executor.stdout.toString();

            if (rawStderr) {
                console.log(`RUNNER ERROR:
                ${rawStderr}
                `);
            } else {
                try {
                    capture.push([test.file, JSON.parse(rawStdout)]);
                } catch (error) {
                    console.log([test.file, error.message, rawStdout]);
                }
            }
        }
    }
    const failures = [];
    outcomes.forEach(([engine, results]) => {
        results.forEach(([testFile, specResults]) => {
            specResults.forEach((specResult) => {
                console.log(
                    `(${engine}) ${specResult.fullName}: ${specResult.status.toUpperCase()}\n`
                );
                // console.log(specResult);
                if (specResult.status === 'failed') {
                    failures.push({
                        engine,
                        specResult,
                        testFile,
                    });
                }
            });
        });
    });

    failures.forEach((failure) => {
        const { engine, specResult } = failure;

        console.log(`${specResult.fullName} FAILED:`);

        specResult.failedExpectations.forEach((expectation) => {
            console.log(`(${engine}) ${specResult.fullName}: ${specResult.status.toUpperCase()}\n`);
            console.log(`
                ${expectation.message}
            `);
        });
        console.log('\n');
    });
}

bootstrapAndRunTests();
