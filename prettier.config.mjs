export default {
    singleQuote: true,
    tabWidth: 4,
    quoteProps: 'consistent',
    trailingComma: 'all',
    plugins: ['@shopify/prettier-plugin-liquid'],
    overrides: [
        {
            files: ['*.html'],
            options: {
                tabWidth: 2,
                printWidth: 1000,
            },
        },
        {
            files: ['*.md'],
            options: {
                proseWrap: 'always',
            },
        },
    ],
};
