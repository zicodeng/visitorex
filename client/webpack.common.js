var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

var path = require('path');

module.exports = {
    entry: {
        index: './src/index.tsx',
    },

    output: {
        filename: '[name]-bundle.min.js',
        path: path.resolve(__dirname, 'dist'),
    },

    context: __dirname, // to automatically find tsconfig.json

    resolve: {
        extensions: ['.js', '.json', '.ts', '.tsx', '.scss', '.css'],
        modules: ['node_modules', 'src', 'assets'],
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: /src/,
                use: [
                    { loader: 'cache-loader' },
                    {
                        loader: 'thread-loader',
                        options: {
                            // There should be 1 cpu for the fork-ts-checker-webpack-plugin.
                            workers: require('os').cpus().length - 1,
                        },
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015', 'react'],
                            cacheDirectory: true,
                        },
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            // IMPORTANT! Use happyPackMode mode to speed-up
                            // compilation and reduce errors reported to webpack.
                            happyPackMode: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$|\.scss$/,
                include: /src/,
                use: ExtractTextPlugin.extract({
                    use: [
                        { loader: 'cache-loader' },
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                minimize: true,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                includePaths: [
                                    path.resolve(__dirname, './src/sass'),
                                    path.resolve(
                                        __dirname,
                                        './node_modules/compass-mixins/lib',
                                    ),
                                ],
                                sourceMap: true,
                            },
                        },
                    ],
                    fallback: 'style-loader',
                }),
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                        },
                    },
                ],
            },
        ],
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons',
            filename: 'commons.min.js',
        }),
        new ForkTsCheckerWebpackPlugin({
            checkSyntacticErrors: true,
            watch: ['./src'],
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            chunks: ['commons', 'index'],
        }),
        new ExtractTextPlugin({
            filename: '[name]-style.min.css',
            disable: process.env.NODE_ENV === 'development',
            allChunks: true,
        }),
    ],
};
