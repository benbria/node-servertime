module.exports = {
  presets: [["@babel/env", { targets: { node: "10" } }]],
  plugins: ["@babel/proposal-class-properties", "@babel/syntax-dynamic-import"]
};
