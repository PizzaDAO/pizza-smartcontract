const path = require( 'path' );
const webpack = require('webpack');

module.exports = {

    // bundling mode
    mode: 'development',

    // entry files
    entry: './app/dapp2.js',

    // output bundles (location)
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'dapp.js',
    },

    // file resolutions
    resolve: {
        extensions: [ '.ts', '.js' ],
        fallback: {
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/")
        }
    },

    // plugins
    plugins: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser'
        })
     ],

    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: [
                    /node_modules/,

                ]
            }
        ]
    }
};
