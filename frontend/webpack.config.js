const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './src/index.tsx',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].[contenthash].js',
            publicPath: '/',
            clean: true
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: 'ts-loader'
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'postcss-loader'
                    ]
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource'
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
                favicon: './public/favicon.ico'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'public',
                        to: '.',
                        globOptions: {
                            ignore: ['**/index.html', '**/favicon.ico']
                        }
                    }
                ]
            }),
            ...(isProduction ? [new CompressionPlugin()] : [])
        ],
        optimization: {
            minimize: isProduction,
            minimizer: [new TerserPlugin()],
            splitChunks: {
                chunks: 'all'
            }
        },
        devServer: {
            historyApiFallback: true,
            hot: true,
            port: 3000,
            proxy: {
                '/api': {
                    target: 'http://localhost:8000',
                    changeOrigin: true
                }
            }
        },
        devtool: isProduction ? 'source-map' : 'eval-source-map'
    };
}; 