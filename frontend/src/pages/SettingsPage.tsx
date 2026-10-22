import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Palette,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getAuthHeaders,
  getMyProfile,
  type AuthUser,
} from "../lib/authApi";

type SettingsRole = "attendee" | "organizer" | "volunteer" | "scanner";
type Language = "English" | "Hindi";

interface SettingsPageProps {
  role: SettingsRole;
}

interface UserSettings {
  language: Language;
  emailNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  compactMode: boolean;
  soundOnScan: boolean;
  vibrationOnScan: boolean;
  notificationPreferences: Record<string, boolean>;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const API_BASE_URL = "http://localhost:3000";

const roleLabels: Record<SettingsRole, string> = {
  attendee: "Attendee",
  organizer: "Organizer",
  volunteer: "Volunteer",
  scanner: "Scanner",
};

const defaultSettings: UserSettings = {
  language: "English",
  emailNotifications: true,
  pushNotifications: true,
  eventReminders: true,
  compactMode: false,
  soundOnScan: true,
  vibrationOnScan: true,
  notificationPreferences: {},
};

const emptyPasswordForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

async function requestSettings(
  method: "GET" | "PATCH",
  settings?: Partial<UserSettings>,
): Promise<UserSettings> {
  const response = await fetch(`${API_BASE_URL}/auth/me/settings`, {
    method,
    headers: {
      ...getAuthHeaders(),
      ...(settings ? { "Content-Type": "application/json" } : {}),
    },
    ...(settings ? { body: JSON.stringify(settings) } : {}),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Unable to load or save your settings.",
    );
  }

  return {
    ...defaultSettings,
    ...(data as Partial<UserSettings>),
    notificationPreferences: {
      ...defaultSettings.notificationPreferences,
      ...(data?.notificationPreferences ?? {}),
    },
  };
}

export default function SettingsPage({ role }: SettingsPageProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(emptyPasswordForm);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setError("");

      try {
        const [user, userSettings] = await Promise.all([
          getMyProfile(),
          requestSettings("GET"),
        ]);

        if (cancelled) return;

        setProfile(user);
        setSettings(userSettings);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your settings.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setSuccess("");
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    setSuccess("");

    try {
      const updatedSettings = await requestSettings("PATCH", settings);
      setSettings(updatedSettings);
      setSaved(true);
      setSuccess("Your preferences have been saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  function updatePasswordField(
    field: keyof PasswordForm,
    value: string,
  ) {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));
    setPasswordError("");
    setPasswordSuccess("");
  }

  async function handleChangePassword(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(
        "Your new password must contain at least 8 characters.",
      );
      return;
    }

    if (
      !/[a-z]/.test(passwordForm.newPassword) ||
      !/[A-Z]/.test(passwordForm.newPassword) ||
      !/\d/.test(passwordForm.newPassword)
    ) {
      setPasswordError(
        "Your new password must contain an uppercase letter, a lowercase letter, and a number.",
      );
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("The new password and confirmation do not match.");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError(
        "Your new password must differ from your current password.",
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(" ")
          : typeof data?.message === "string"
            ? data.message
            : "Unable to change your password.";

        throw new Error(message);
      }

      setPasswordForm(emptyPasswordForm);
      setPasswordSuccess(
        typeof data?.message === "string"
          ? data.message
          : "Password changed successfully.",
      );
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "Unable to change your password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  function togglePasswordVisibility(
    field: keyof typeof showPasswords,
  ) {
    setShowPasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="border-b border-[#E2E8F0] pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">
          {roleLabels[role]} account
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#1E293B] sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          Manage your preferences and account experience.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-[#64748B]">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading your settings...
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5">
            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <UserRound className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-bold text-[#1E293B]">Account</h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Your account identity and active role.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <AccountDetail label="Role" value={roleLabels[role]} />
                <AccountDetail
                  label="Name"
                  value={profile?.fullName ?? "Not available"}
                />
                <div className="rounded-xl bg-[#F8FAFC] px-4 py-3 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                    Email
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-[#1E293B]">
                    {profile?.email ?? "Not available"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-bold text-[#1E293B]">Notifications</h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Manage your saved notification preferences.
                  </p>
                </div>
              </div>

              <div className="mt-5 divide-y divide-[#E2E8F0]">
                <SettingToggle
                  label="Email updates"
                  description="Preference for product updates and account messages."
                  checked={settings.emailNotifications}
                  onChange={(value) =>
                    updateSetting("emailNotifications", value)
                  }
                />
                <SettingToggle
                  label="Push notifications"
                  description="Preference for browser or device notifications. Delivery requires push notification setup."
                  checked={settings.pushNotifications}
                  onChange={(value) =>
                    updateSetting("pushNotifications", value)
                  }
                />
                <SettingToggle
                  label="Event reminders"
                  description="Preference for reminders about events, shifts, and deadlines."
                  checked={settings.eventReminders}
                  onChange={(value) =>
                    updateSetting("eventReminders", value)
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <Palette className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-bold text-[#1E293B]">
                    Appearance and language
                  </h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Choose your preferences for EventPulse.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="settings-language"
                  className="block text-sm font-semibold text-[#1E293B]"
                >
                  Language preference
                </label>
                <select
                  id="settings-language"
                  value={settings.language}
                  onChange={(event) =>
                    updateSetting("language", event.target.value as Language)
                  }
                  className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] sm:max-w-xs"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
                <p className="mt-1 text-xs text-[#64748B]">
                  This saves your language preference; translating the interface requires separate localization support.
                </p>
              </div>

              <div className="mt-5 border-t border-[#E2E8F0] pt-4">
                <SettingToggle
                  label="Compact mode"
                  description="Preference for tighter spacing in lists and dashboards."
                  checked={settings.compactMode}
                  onChange={(value) => updateSetting("compactMode", value)}
                />
              </div>
            </section>

            {role === "scanner" && (
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-bold text-[#1E293B]">
                      Scanner preferences
                    </h2>
                    <p className="mt-1 text-sm text-[#64748B]">
                      Save feedback preferences for ticket scanning.
                    </p>
                  </div>
                </div>

                <div className="mt-5 divide-y divide-[#E2E8F0]">
                  <SettingToggle
                    label="Sound on scan"
                    description="Preference for an audio cue after scanning."
                    checked={settings.soundOnScan}
                    onChange={(value) => updateSetting("soundOnScan", value)}
                  />
                  <SettingToggle
                    label="Vibration on scan"
                    description="Preference for vibration feedback on supported devices."
                    checked={settings.vibrationOnScan}
                    onChange={(value) =>
                      updateSetting("vibrationOnScan", value)
                    }
                  />
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <LockKeyhole className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-bold text-[#1E293B]">
                    Privacy and security
                  </h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Change your password using your current password.
                  </p>
                </div>
              </div>

              {passwordError && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div
                  role="status"
                  className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
                <PasswordField
                  id="current-password"
                  label="Current password"
                  value={passwordForm.currentPassword}
                  visible={showPasswords.current}
                  onChange={(value) =>
                    updatePasswordField("currentPassword", value)
                  }
                  onToggleVisibility={() =>
                    togglePasswordVisibility("current")
                  }
                  autoComplete="current-password"
                />

                <PasswordField
                  id="new-password"
                  label="New password"
                  value={passwordForm.newPassword}
                  visible={showPasswords.new}
                  onChange={(value) =>
                    updatePasswordField("newPassword", value)
                  }
                  onToggleVisibility={() => togglePasswordVisibility("new")}
                  autoComplete="new-password"
                  minLength={8}
                />

                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  value={passwordForm.confirmPassword}
                  visible={showPasswords.confirm}
                  onChange={(value) =>
                    updatePasswordField("confirmPassword", value)
                  }
                  onToggleVisibility={() =>
                    togglePasswordVisibility("confirm")
                  }
                  autoComplete="new-password"
                  minLength={8}
                />

                <p className="text-xs leading-5 text-[#64748B]">
                  Use at least 8 characters, including an uppercase letter, a
                  lowercase letter, and a number.
                </p>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2563EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  {changingPassword
                    ? "Changing password..."
                    : "Change password"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#475569]">
                  <LogOut className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-bold text-[#1E293B]">
                    Account management
                  </h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Sign out of your EventPulse account on this device.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-5 py-2.5 text-sm font-semibold text-[#334155] transition hover:bg-[#F8FAFC]"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </section>
          </div>

          <div className="sticky bottom-0 mt-6 flex flex-col gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC]/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-[#15803D]">
                <Check className="h-4 w-4" />
                Preferences saved
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save preferences"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface AccountDetailProps {
  label: string;
  value: string;
}

function AccountDetail({ label, value }: AccountDetailProps) {
  return (
    <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-[#1E293B]">
        {value}
      </p>
    </div>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <span>
        <span className="block text-sm font-semibold text-[#1E293B]">
          {label}
        </span>
        <span className="mt-1 block text-xs leading-5 text-[#64748B]">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-[#2563EB]"
      />
    </label>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
  autoComplete: string;
  minLength?: number;
}

function PasswordField({
  id,
  label,
  value,
  visible,
  onChange,
  onToggleVisibility,
  autoComplete,
  minLength,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-[#1E293B]"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={128}
          required
          className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 pr-12 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          title={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 inline-flex items-center justify-center rounded-r-xl px-3 text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
