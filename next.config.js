const branchName = process.env.BRANCH_NAME ? "/" + process.env.BRANCH_NAME : "";

const nextConfig = {
    reactStrictMode: true,
    assetPrefix: branchName,
    basePath: "hashibutogarasu.github.io/vertical-image-api",
    swcMinify: true,
    images: {
        unoptimized: true,
    },
}