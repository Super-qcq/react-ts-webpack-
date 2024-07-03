module.exports = {
    clean: ['dist/home'],
    less: [],
    webpack: [
        {
            source: ['src/home/index.tsx'],
            target: 'dist/home',
            name: 'home',
            htmlPath: 'src/home/html/',
            htmlName: 'index',
            htmlType: 'html'
        }
    ]
}
