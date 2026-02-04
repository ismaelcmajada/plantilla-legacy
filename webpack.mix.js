const mix = require("laravel-mix")
const webpack = require("webpack")
const { VuetifyPlugin } = require("webpack-plugin-vuetify")
const path = require("path")

mix
  .js("resources/js/app.js", "public/js")
  .vue({ version: 3 })
  .postCss("resources/css/app.css", "public/css", [])

mix.webpackConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "resources/js"),
    },
  },
  plugins: [
    // IMPORTANTE: después del plugin de Vue (Mix lo maneja)
    new VuetifyPlugin({ autoImport: true }),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
    }),
  ],
})

if (!mix.inProduction()) {
  mix.sourceMaps()
}
