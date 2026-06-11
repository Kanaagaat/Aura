// frontend/src/components/EditProfileModal.tsx
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '../store/useAuraStore';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import type { UserProfile } from '../types';

interface EditProfileModalProps {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
}

const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024; // 1.5 MB

export function EditProfileModal({ open, profile, onClose }: EditProfileModalProps) {
  const updateProfile = useAuraStore((s) => s.updateProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useBodyScrollLock(open);

  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [telegram, setTelegram] = useState(profile.telegram_username || '');
  const [instagram, setInstagram] = useState(profile.instagram_handle || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Image is too large (max 1.5 MB). Try a smaller photo.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.onerror = () => setError('Could not read that image.');
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        avatar_url: avatarUrl,
        display_name: displayName,
        bio,
        telegram_username: telegram.replace('@', ''),
        instagram_handle: instagram.replace('@', ''),
      });
      onClose();
    } catch (e) {
      setError((e as Error).message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed z-[80] inset-x-0 bottom-0 md:inset-0 md:m-auto md:h-fit md:max-w-md
                       bg-white rounded-t-[28px] md:rounded-[28px] shadow-[0_-4px_40px_rgba(0,0,0,0.15)]
                       max-h-[92dvh] overflow-hidden flex flex-col"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-[#D4D0C8]" />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pt-5 pb-4">
              <h2 className="font-serif text-2xl text-[#1C1C1A] mb-6">Edit Profile</h2>

              {/* Avatar editor */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-[#E6E2D9] flex items-center justify-center text-3xl">
                      🧘
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-[#1C1C1A] text-white flex items-center justify-center shadow-md hover:bg-[#2C2C2A] transition-colors"
                    aria-label="Change photo"
                  >
                    <span className="material-symbols-outlined text-lg">photo_camera</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-xs text-[#7A9E7E] font-medium hover:underline"
                >
                  Upload new photo
                </button>
              </div>

              {/* Avatar URL */}
              <Field label="Photo URL (optional)">
                <input
                  type="text"
                  value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder={avatarUrl.startsWith('data:') ? 'Using uploaded photo' : 'https://…'}
                  className={inputClass}
                />
              </Field>

              <Field label="Display Name">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Bio">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="A line about your vibe…"
                />
                <p className="text-[10px] text-[#B0ACA4] mt-1 text-right">{bio.length}/160</p>
              </Field>

              <Field label="Telegram Handle">
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="username"
                  className={inputClass}
                />
              </Field>

              <Field label="Instagram Handle">
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="username"
                  className={inputClass}
                />
              </Field>

              {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
            </div>

            <div className="shrink-0 flex gap-3 border-t border-[#EEECE8] bg-white/96 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-8px_22px_rgba(0,0,0,0.04)]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-[#EEECE8] py-3 text-sm font-medium text-[#5A5750] hover:bg-[#FAFAF7] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-full bg-[#1C1C1A] text-white py-3 text-sm font-medium hover:bg-[#2C2C2A] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const inputClass =
  'w-full bg-[#FAFAF7] border border-[#EEECE8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7A9E7E] transition-colors text-[#1C1C1A]';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
