const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const distDir = path.resolve(__dirname, "dist");
const srcDir = path.resolve(__dirname, "src");
const assDir = path.resolve(srcDir, "assets");

const MODE = process.env.NODE_ENV === "dev" ? "development" : "production";

const VERSION_SUFFIX = (() => {
  const d = new Date();
  return [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
  ]
    .map(x => {
      const s = x + "";
      return s.length === 1 ? "0" + s : s;
    })
    .join("");
})();

const pageTemplate = path.resolve(srcDir, "template.html");

const entryPoints = {
  main: ["./src/main.js"],
};

const titles = {
  main: "News",
};

const getHtmlPluginConfig = pageName => {
  return {
    title: pageName in titles ? titles[pageName] : titles.main,
    libname: pageName,
    modifier: `?v=${VERSION_SUFFIX}`,
    chunks: [pageName],
    filename: pageName === "main" ? "index.html" : pageName,
    template: pageTemplate,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
  };
};

const getHtmlPlugins = () => {
  return Object.keys(entryPoints).map(pageName => {
    return new HtmlWebpackPlugin(getHtmlPluginConfig(pageName));
  });
};

module.exports = {
  target: "web",
  mode: MODE,
  entry: entryPoints,
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte"),
    },
    extensions: [".mjs", ".js", ".scss", ".svelte", ".ts", ".tsx"],
    mainFields: ["svelte", "browser", "module", "main"],

    modules: ["node_modules"],
    plugins: [new DirectoryNamedWebpackPlugin(true)],
  },

  output: {
    path: distDir,
    filename: `[name].[contenthash:8].js`,
    chunkFilename: "[name].[contenthash:8].chunk.js",
  },

  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: [
          {
            loader: "svelte-loader",
            options: {
              emitCss: true,
              hotReload: false,
              preprocess: require("./svelte.config.js").preprocess,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                outputStyle: "compressed",
                precision: 8,
                includePaths: [path.resolve(srcDir, "styles")],
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),

    new CopyPlugin({
      patterns: [{ from: assDir, to: distDir, noErrorOnMissing: true }],
    }),

    new MiniCssExtractPlugin({
      filename: `[name].[contenthash:8].css`,
      chunkFilename: "[name].[contenthash:8].chunk.css",
    }),

    ...getHtmlPlugins(),
  ],

  devtool: "source-map",
};
