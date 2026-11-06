import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Case studies that were renamed; old links keep working.
  redirects() {
    return [
      {
        source: "/work/killing-the-dur",
        destination: "/work/killing-the-document-update-request",
        permanent: true,
      },
      {
        source: "/work/health-checkup-v2",
        destination: "/work/health-checkup",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
