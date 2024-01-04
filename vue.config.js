var AppCachePlugin = require('appcache-webpack-plugin');
var TerserPlugin = require("terser-webpack-plugin");
// var UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // terser replaced uglify
const webpack = require('webpack')

module.exports = {

   // see https://stackoverflow.com/questions/61198657/vue-cli-minifies-for-production-but-how-can-properties-and-other-definitions-al
  // and https://stackoverflow.com/questions/61758978/how-to-remove-comments-in-chunk-vendors-js#:~:text=Assuming%20Vue%20CLI%203%20or%20newer%2C%20this%20is,from%20the%20minified%20output.%20Edit%20vue.config.js%20to%20include%3A
  // and https://cli.vuejs.org/migrations/migrate-from-v3.html#vue-cli-service
  chainWebpack: (config) => {
    // config.optimization.minimizer('terser').tap((args) => {
    //     const { terserOptions } = args[0]
    //     terserOptions.output = {
    //       ...args[0].terserOptions.output,
    //       comments: false  // exclude all comments from output
    //     }
    //     terserOptions.keep_classnames = true
    //     terserOptions.keep_fnames = true
    //     return args
    //   })

    // NOTE: We are using vue CLI 3.12.1 so do it this way, NOT the version 5 way commented out above
    // Basically this just gets rid of the source map files
    // NOTE: This does NOT minimize (we never have even withouth this) any file outside of the src folder!
    config.optimization.minimizer([new TerserPlugin({ 
      terserOptions: { 
        compress: {
          drop_console: true
        }
      }})
    ]),

    // include csv files in the build (i.e. our langauge packs). SRR 12/06/2023
    // NOTE: Can't use the 'csv-loader' because it returns a garbage array that I can't use. 
    // The 'file-loader' makes it so when we import it gives us the path and we can do a fetch on it and get the actual string / formatting. SRR 12/07/2023
    config.module
      .rule('csv-loader')
      .test(/\.csv$/)
      .use('raw-loader')
        .loader('raw-loader')
      // .use('csv-loader')
      //   .loader('csv-loader')
      //   .end();
      // .use('file-loader')
      //   .loader('file-loader')
      //   .options({
      //     name: '[name].[ext]',
      //     outputPath: 'langPacks',
      //     emitFile: true,
      //   })
      //   .end()

  }, // chainWebpack

  pwa: {
    name: 'CenPoint Lite',
    themeColor: '#3C6880',
    msTileColor: '#3C6880',
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
        swSrc: "src/service-worker.js",
        //skipWaiting: true, see https://stackoverflow.com/questions/51715127/what-are-the-downsides-to-using-skipwaiting-and-clientsclaim-with-workbox
    }
  }, // pwa

  lintOnSave: false,
  
  css: {
    loaderOptions: {
      sass: {
        data: `
            @import "~@/sass/main.scss"; 
            @import "~@/sass/variables.scss";
        `
      },
    },
  }, // css

  configureWebpack: {
    plugins: [
        new AppCachePlugin({
            exclude: ['web.config', 'favicon.ico.vue'],
            output: 'cplite.appcache',
        }),

        new webpack.ProvidePlugin({
          "window.Quill": "quill/dist/quill.js",
          Quill: "quill/dist/quill.js"
        }),

        // // get rid of comments when we 'build'. see https://stackoverflow.com/questions/66078993/how-to-uglify-a-js-file-upon-building-the-vue-project
        // new webpack.optimization().UglifyJsPlugin({
        //   uglifyOptions: {
        //     minimize: true
        //   }
        // })

    ], // plugins
    //devtool: 'source-map' // make it so we can debug in vs code  

  }, // configureWebpack
  
} // moduel.exports