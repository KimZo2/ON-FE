/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Phaser는 클라이언트 사이드에서만 로드
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
  // 외부 패키지를 트랜스파일하지 않도록 설정
  transpilePackages: [],
  reactStrictMode: false

  // // 실험적 기능 (필요한 경우)
  // experimental: {
  //   esmExternals: 'loose'
  // }
};

export default nextConfig;
