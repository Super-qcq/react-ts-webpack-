module.exports = {
    clean: ['dist/about'],
    less: [],
    staticFrom:['src/about/staticFile'],
    webpack: [
        {
            source: ['src/about/index.tsx'],
            target: 'dist/about',
            name: 'about',
            htmlPath: 'src/about/html/',
            htmlName: 'index',
            htmlType: 'html'
        }
    ]
}
