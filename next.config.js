const branchName = process.env.BRANCH_NAME ? "/" + process.env.BRANCH_NAME : "";

const nextConfig = {
    reactStrictMode: true,
    assetPrefix: branchName,
    basePath: branchName,
    swcMinify: true,
    images: {
        unoptimized: true,
    },
}
module.exports = nextConfig;