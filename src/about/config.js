module.exports = {
    clean: ['dist/about'],
    less: [],
    staticFrom:['src/about/imgs','src/about/audio'],
    webpack: [
        {
            source: ['src/about/index.tsx'],
            target: 'dist/about/js',
            name: 'main',
            htmlPath: 'src/about/html/',
            htmlName: 'index',
            htmlType: 'html'
        },
        {
            source: ['src/about/homeIndex.tsx'],
            target: 'dist/about/js',
            name: 'homeIndex',
            htmlPath: 'src/about/html/',
            htmlName: 'homeIndex',
            htmlType: 'html'
        }
    ]
}
