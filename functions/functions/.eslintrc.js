module.exports = {
    root: true,
    env: {
        es6: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "google",
        "plugin:@typescript-eslint/recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
        tsconfigRootDir: __dirname
    },
    ignorePatterns: [
        "/lib/**/*" // Ignore built files.
    ],
    plugins: ["@typescript-eslint", "import"],
    rules: {
        "max-len": ["error", 100],
        "operator-linebreak": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        curly: 0,
        "object-curly-spacing": ["error", "always"],
        "quote-props": ["error", "as-needed"],
        quotes: ["error", "double"],
        indent: 0,
        "comma-dangle": 0
    }
};
