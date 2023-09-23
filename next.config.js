const urlPrefix = process.env.URL_PREFIX ? '/' + process.env.URL_PREFIX : ''

const nextConfig = {
    reactStrictMode: true,
    assetPrefix: urlPrefix,
    basePath: urlPrefix,
    swcMinify: true,
    images: {
        unoptimized: true,
    },
}