const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin'); 
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: './index.js',
    },
    output: {
        filename: `[name].[hash].js`,
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    devServer: {
        port: 1234,
        watchFiles: ['src/**/*.html', 'public/**/*', 'src/**/*.js', 'src/*.html', 'src/*.js', 'src/**/*.css', 'src/*.css'],
    },
    devtool: 'source-map',
    plugins: [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: false,
            }
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/favicon.ico'),
                    to: path.resolve(__dirname, 'dist'),
                },
                {
                    from: path.resolve(__dirname, 'src/assets'),
                    to: path.resolve(__dirname, 'dist/assets'),
                },
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.s[ac]ss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
        ]
    }
}