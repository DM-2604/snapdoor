'use client';
// app/(admin)/settings/page.tsx — Platform key-value settings editor

import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { adminApi } from '@/lib/api';
import { useSettingsStore } from '@/stores/settings.store';

const KNOWN_SETTINGS = [
  { key: 'platform.maintenance_mode', label: 'Maintenance Mode', description: 'true = API returns 503 for non-admin calls', placeholder: 'false' },
  { key: 'platform.max_otp_attempts', label: 'Max OTP Attempts', description: 'Max OTP requests per phone per 10 minutes', placeholder: '5' },
  { key: 'platform.default_commission_pct', label: 'Default Commission %', description: 'Global fallback commission (Tier 5)', placeholder: '10' },
  { key: 'platform.delivery_radius_km', label: 'Delivery Radius (km)', description: 'Max delivery distance from store to customer', placeholder: '5' },
  { key: 'platform.support_phone', label: 'Support Phone', description: 'Shown to customers in the app', placeholder: '+91 80000 00000' },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});
  const { loadSetting: loadStoreSetting, updateSettingCache } = useSettingsStore();

  async function loadSetting(key: string) {
    if (values[key] !== undefined) return; // already loaded in form
    const val = await loadStoreSetting(key);
    if (val !== undefined) {
      setValues(prev => ({ ...prev, [key]: String(val) }));
    }
  }

  async function handleSave(key: string) {
    setSaving(key);
    setMessages(prev => ({ ...prev, [key]: undefined as any }));
    try {
      const rawVal = values[key] ?? '';
      // Try to parse as JSON for non-string types, fall back to plain string
      let parsed: unknown;
      try { parsed = JSON.parse(rawVal); } catch { parsed = rawVal; }
      await adminApi.setSetting(key, parsed);
      updateSettingCache(key, parsed);
      setMessages(prev => ({ ...prev, [key]: { type: 'success', text: 'Saved!' } }));
      setTimeout(() => setMessages(prev => ({ ...prev, [key]: undefined as any })), 3000);
    } catch (e: any) {
      setMessages(prev => ({ ...prev, [key]: { type: 'error', text: e.message } }));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <PageHeader title="Platform Settings" description="Key-value configuration for the LocalMart platform" />

      <div className="space-y-3">
        {KNOWN_SETTINGS.map(setting => (
          <div
            key={setting.key}
            className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6"
            onFocus={() => loadSetting(setting.key)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <label
                  htmlFor={`setting-${setting.key}`}
                  className="text-sm font-semibold text-neutral-900"
                >
                  {setting.label}
                </label>
                <p className="text-xs text-neutral-500 mt-0.5 mb-3">{setting.description}</p>
                <div className="flex gap-2">
                  <input
                    id={`setting-${setting.key}`}
                    value={values[setting.key] ?? ''}
                    onChange={e => setValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                    onFocus={() => loadSetting(setting.key)}
                    placeholder={setting.placeholder}
                    className="flex-1 py-2 rounded-xl border border-neutral-300 bg-neutral-50 px-4 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 font-mono transition-all"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSave(setting.key)}
                    disabled={saving === setting.key}
                    className="shrink-0"
                  >
                    {saving === setting.key ? <Spinner size={13} /> : <Save size={13} />}
                    Save
                  </Button>
                </div>
                {messages[setting.key] && (
                  <p className={`mt-2 text-xs font-medium ${messages[setting.key].type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {messages[setting.key].text}
                  </p>
                )}
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl mt-0.5 shrink-0">
                <Settings size={18} className="text-emerald-600" />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-neutral-300 font-mono">{setting.key}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
