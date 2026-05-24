import type { NextConfig } from "next";

const basePath = "/sparsh.github.io";

const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: true,
	basePath,
	assetPrefix: basePath,
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
