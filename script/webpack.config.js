var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

// list and enumerate external modules to leave as externals
var nodeModules = {
    fs: 'commonjs fs',
    readline: 'commonjs readline'
};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    entry: ['../server.ts'],
    context: __dirname,
    node: {
        __filename: true,
        __dirname: true,
    },
    target: 'node',
    output: {
        filename: "./build/server.js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    plugins: [
        new webpack.DefinePlugin({
            $dirname: '++dirname',
        }),
    ],

    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    externals: nodeModules
};
