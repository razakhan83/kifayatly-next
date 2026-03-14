'use client';

import { useEffect, useState } from 'react';
import { BellRing, Loader2, MessageCircle, Save, Store, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function SettingSection({ icon: Icon, title, description, children }) {
  return (
    <section className="surface-card rounded-xl p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    storeName: '',
    supportEmail: '',
    businessAddress: '',
    whatsappNumber: '',
    karachiDeliveryFee: 0,
    outsideKarachiDeliveryFee: 0,
    freeShippingThreshold: 5000,
    announcementBarEnabled: true,
    announcementBarText: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setForm({
          storeName: data.data.storeName || '',
          supportEmail: data.data.supportEmail || '',
          businessAddress: data.data.businessAddress || '',
          whatsappNumber: data.data.whatsappNumber || '',
          karachiDeliveryFee: data.data.karachiDeliveryFee || 0,
          outsideKarachiDeliveryFee: data.data.outsideKarachiDeliveryFee || 0,
          freeShippingThreshold: data.data.freeShippingThreshold || 0,
          announcementBarEnabled: data.data.announcementBarEnabled ?? true,
          announcementBarText: data.data.announcementBarText || '',
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.message || 'Failed to save settings.');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="surface-card rounded-xl p-6">
            <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="space-y-3">
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Store Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Configure store details, delivery rules, and customer communication.</p>
      </div>

      <div className="space-y-6">
        <SettingSection icon={Store} title="General Information">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Store Name</label>
            <Input value={form.storeName} onChange={(event) => handleChange('storeName', event.target.value)} placeholder="China Unique Store" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Support Email</label>
            <Input type="email" value={form.supportEmail} onChange={(event) => handleChange('supportEmail', event.target.value)} placeholder="support@chinauniquestore.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Business Address</label>
            <Textarea value={form.businessAddress} onChange={(event) => handleChange('businessAddress', event.target.value)} placeholder="Shop #12, Block A, Gulshan..." rows={3} />
          </div>
        </SettingSection>

        <SettingSection icon={MessageCircle} title="WhatsApp Integration" description="Used by the floating contact button and product order links.">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">WhatsApp Number</label>
            <Input value={form.whatsappNumber} onChange={(event) => handleChange('whatsappNumber', event.target.value)} placeholder="923001234567" />
            <p className="mt-1.5 text-xs text-muted-foreground">Format: country code + number without spaces.</p>
          </div>
        </SettingSection>

        <SettingSection icon={Truck} title="Shipping Rates">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Karachi Delivery Fee</label>
              <Input type="number" min="0" value={form.karachiDeliveryFee} onChange={(event) => handleChange('karachiDeliveryFee', Number(event.target.value))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Outside Karachi Fee</label>
              <Input type="number" min="0" value={form.outsideKarachiDeliveryFee} onChange={(event) => handleChange('outsideKarachiDeliveryFee', Number(event.target.value))} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Free Shipping Threshold</label>
            <Input type="number" min="0" value={form.freeShippingThreshold} onChange={(event) => handleChange('freeShippingThreshold', Number(event.target.value))} />
          </div>
        </SettingSection>

        <SettingSection icon={BellRing} title="Announcement Bar">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/35 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Show top banner</p>
              <p className="text-xs text-muted-foreground">Display a promotional banner across the storefront.</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('announcementBarEnabled', !form.announcementBarEnabled)}
              className={`inline-flex min-w-24 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                form.announcementBarEnabled ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'
              }`}
            >
              {form.announcementBarEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Banner Message</label>
            <Input value={form.announcementBarText} onChange={(event) => handleChange('announcementBarText', event.target.value)} placeholder="Free delivery on orders above Rs. 3000!" />
          </div>
        </SettingSection>

        <div className="flex items-center gap-4 pb-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </Button>
          {saved ? <span className="text-sm font-medium text-primary">Settings updated successfully.</span> : null}
        </div>
      </div>
    </div>
  );
}
