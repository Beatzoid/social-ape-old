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
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            parserOptions: {
                project: ["tsconfig.json", "tsconfig.dev.json"],
                sourceType: "module",
                tsconfigRootDir: __dirname
            }
        }
    ],
    parser: "@typescript-eslint/parser",
    ignorePatterns: [
        "/build/**/*" // Ignore built files.
    ],
    plugins: ["@typescript-eslint", "import"],
    rules: {
        "no-restricted-imports": [
            "error",
            {
                patterns: [
                    "@material-ui/*/*/*",
                    "!@material-ui/core/test-utils/*"
                ]
            }
        ],
        "import/no-named-as-default": 0,
        "require-jsdoc": 0,
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
