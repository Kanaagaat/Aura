// frontend/src/lib/prelaunch.ts
const PREVIEW_FLAG = 'aura_preview_access';

function readEnv(name: string): string | undefined {
  return (import.meta.env as Record<string, string | undefined>)[name];
}

export function isPublicLaunchEnabled(): boolean {
  const value = readEnv('VITE_PUBLIC_LAUNCH') ?? readEnv('PUBLIC_LAUNCH') ?? 'false';
  return value.toLowerCase() !== 'false';
}

export function hasPreviewAccess(): boolean {
  if (isPublicLaunchEnabled()) return true;
  return sessionStorage.getItem(PREVIEW_FLAG) === 'true';
}

export function unlockPreviewAccess(search: string): boolean {
  if (isPublicLaunchEnabled()) return false;

  const previewSecret = readEnv('VITE_PREVIEW_SECRET') ?? readEnv('PREVIEW_SECRET') ?? '';
  const providedSecret = new URLSearchParams(search).get('preview_secret');

  // Vite is a client-side SPA, so this is MVP preview protection only.
  // For stronger secrecy, move this check to server middleware or an edge function.
  if (previewSecret && providedSecret === previewSecret) {
    sessionStorage.setItem(PREVIEW_FLAG, 'true');
    return true;
  }

  return false;
}
