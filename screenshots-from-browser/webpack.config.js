const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin'); 


module.exports = {
    context: path.resolve(__dirname, 'src'),            // Папка контекст ./src/
    mode: 'development',                                // Режим сборки
    entry: {                                            // Точки входа
        main: './index.js',
    },
    output: {
        filename: `[name].[hash].js`,
        path: path.resolve(__dirname, 'dist'),
        clean: true                                     // Нововведение WP: Заменяет плагин CleanWebpackPlugin
    },
    plugins: [
        new HTMLWebpackPlugin({                         // Плагин для обработки HTML-шаблона
            template: './index.html',
            minify: {
                collapseWhitespace: false,
            }
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