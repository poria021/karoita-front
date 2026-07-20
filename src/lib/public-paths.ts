
export const publicPathsConfig = {
  exactPaths: ['/'],
  prefixes: ['/docs/', '/auth/'],
};

export function isPublicPath(pathname: string): boolean {
  if (publicPathsConfig.exactPaths.includes(pathname)) {
    return true;
  }

  for (const prefix of publicPathsConfig.prefixes) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}
