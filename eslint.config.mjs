import babelParser from "@babel/eslint-parser"; // Import the parser
import js from "@eslint/js";
import react from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";

export default [
    {
        ignores: [".next/**", "node_modules/**"], // Ignore .next and node_modules
    },
    js.configs.recommended,
    {
        files: ["**/*.js", "**/*.jsx"],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            parser: babelParser, // Use the imported parser
            parserOptions: {
                ecmaFeatures: {
                    jsx: true, // Enable JSX parsing
                },
                requireConfigFile: false, // No need for .babelrc
                babelOptions: {
                    presets: ["@babel/preset-react"], // Support React/JSX
                },
            },
            globals: {
                // Browser globals
                document: "readonly",
                localStorage: "readonly",
                Image: "readonly",
                FileReader: "readonly",
                Blob: "readonly",
                atob: "readonly",
                btoa: "readonly",
                window: "readonly",
                // Node.js globals
                console: "readonly",
                process: "readonly",
                module: "readonly",
                self: "readonly", // Add for browser globals in libraries
                getComputedStyle: "readonly", // Add for browser globals
                clearInterval: "readonly", // Add for browser globals
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                sessionStorage: "readonly",
                FormData: 'readonly',
                URL: 'readonly',
                navigator: 'readonly',
                alert: 'readonly',
                IntersectionObserver: "readonly"
            },
        },
        plugins: {
            react,
            "unused-imports": unusedImports,
        },
        rules: {
            "no-unused-vars": ["error", {
                vars: "all",
                args: "after-used",
                ignoreRestSiblings: true,
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_"
            }], // Strengthen no-unused-vars
            "unused-imports/no-unused-imports": "error", // Auto-remove unused imports
            "unused-imports/no-unused-vars": [
                "error", // Change from "warn" to "error" for stricter enforcement
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            "react/prop-types": "off",
            "no-undef": "error",
            "react/jsx-uses-react": "off",
            "react/jsx-uses-vars": "error",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];