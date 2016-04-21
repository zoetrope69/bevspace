import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';

const ENV = process.env.NODE_ENV || 'development';

const CSS_MAPS = ENV !== 'production';

module.exports = {
  context: `${__dirname}/src`,
  entry: './index.js',

  output: {
    path: `${__dirname}/build`,
    publicPath: '/',
    filename: 'bundle.js',
  },

  resolve: {
    extensions: ['', '.jsx', '.js', '.json', '.scss'],
    modulesDirectories: [
      `${__dirname}/src/lib`,
      `${__dirname}/node_modules`,
      'node_modules',
    ],
    alias: {
      config: `${__dirname}/config.json`,
      components: `${__dirname}/src/components`,		// used for tests
      style: `${__dirname}/src/style`,
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
    },
  },

  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        exclude: /src\//,
        loader: 'source-map-loader',
      },
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(scss|css)$/,
        include: /src\/components\//,
        loader: ExtractTextPlugin.extract('style?singleton', [
          `css-loader?sourceMap=${CSS_MAPS}&modules&importLoaders=1&localIdentName=[local]${process.env.CSS_MODULES_IDENT || '_[hash:base64:5]'}`,
          'postcss-loader',
          `sass-loader?sourceMap=${CSS_MAPS}`,
        ].join('!')),
      },
      {
        test: /\.(scss|css)$/,
        exclude: /src\/components\//,
        loader: ExtractTextPlugin.extract('style?singleton', [
          `css-loader?sourceMap=${CSS_MAPS}`,
          `postcss-loader`,
          `sass-loader?sourceMap=${CSS_MAPS}`,
        ].join('!')),
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(xml|html|txt|md)$/,
        loader: 'raw-loader',
      },
      {
        test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
        loader: ENV === 'production' ? 'file-loader?name=[path][name]_[hash:base64:5].[ext]' : 'url',
      },
    ],

    noParse: [/lie\.js$/, /leveldown/, /moment.js/],
  },

  postcss: () => [
    autoprefixer({ browsers: 'last 2 versions' }),
  ],

  plugins: ([
    new webpack.ProvidePlugin({
      'Promise': 'exports?global.Promise!es6-promise',
      'fetch': 'exports?self.fetch!whatwg-fetch',
    }),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('style.css', {
      allChunks: true,
      disable: ENV !== 'production',
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        NODE_ENV: ENV,
        REMOTE_DB: process.env.REMOTE_DB || 'http://localhost:5984',
      }),
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: { collapseWhitespace: true },
    }),
  ]).concat(ENV==='production' ? [
    new webpack.optimize.OccurenceOrderPlugin(),
  ] : []),

  stats: { colors: true },

  node: {
    global: true,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false,
  },

  devtool: ENV === 'production' ? 'source-map' : 'cheap-module-eval-source-map',

  devServer: {
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    colors: true,
    publicPath: '/',
    contentBase: './src',
    historyApiFallback: true,
    proxy: [
      // OPTIONAL: proxy configuration:
      // {
      // 	path: '/optional-prefix/**',
      // 	target: 'http://target-host.com',
      // 	rewrite: req => { req.url = req.url.replace(/^\/[^\/]+\//, ''); }   // strip first path segment
      // }
    ],
  },
};
