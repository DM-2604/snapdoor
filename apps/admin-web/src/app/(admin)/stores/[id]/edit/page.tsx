'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { storesApi, categoriesApi, geoApi } from '@/lib/api';
import type { Category, City, Zone } from '@localmart/api-client';
import type { StoreDetail } from '@localmart/api-client';

const MapPicker = dynamic(
  () => import('@/components/location/MapPicker').then(mod => mod.MapPicker),
  { ssr: false, loading: () => <div className="w-full h-64 rounded-xl bg-neutral-100 animate-pulse" /> }
);

export default function EditStorePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [store, setStore] = useState<StoreDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    businessCategoryId: '',
    cityId: '',
    zoneId: '',
    latitude: '',
    longitude: '',
    deliveryRadiusKm: '',
  });

  useEffect(() => {
    Promise.all([
      storesApi.get(id),
      categoriesApi.list(),
      geoApi.listCities(),
    ]).then(([s, cats, cits]) => {
      setStore(s);
      setCategories(cats.filter((c: any) => c.isActive !== false));
      setCities(cits);
      setFormData({
        name: s.name ?? '',
        address: s.address ?? '',
        businessCategoryId: s.businessCategory?.id ?? '',
        cityId: s.city?.id ?? '',
        zoneId: s.zone?.id ?? '',
        latitude: s.location?.lat?.toString() ?? '',
        longitude: s.location?.lng?.toString() ?? '',
        deliveryRadiusKm: s.deliveryRadiusKm?.toString() ?? '5',
      });
    }).catch(() => setError('Failed to load store')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (formData.cityId) {
      geoApi.listZones(formData.cityId).then(z => setZones(z)).catch(() => setZones([]));
    } else {
      setZones([]);
    }
  }, [formData.cityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMapChange = (lat: number, lng: number, addr?: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
      ...(addr ? { address: addr } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await storesApi.update(id, {
        name: formData.name || undefined,
        address: formData.address || undefined,
        businessCategoryId: formData.businessCategoryId || undefined,
        cityId: formData.cityId || undefined,
        zoneId: formData.zoneId || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        deliveryRadiusKm: formData.deliveryRadiusKm ? parseFloat(formData.deliveryRadiusKm) : undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/stores/${id}`), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!store) return <p className="text-sm text-red-600">{error || 'Store not found.'}</p>;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-emerald-600 mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Edit Store</h1>
        <p className="text-sm text-neutral-500 mt-1">Update basic details for <span className="font-semibold text-neutral-700">{store.name}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
            ✓ Saved! Redirecting…
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-neutral-700">Store Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Business Category</label>
            <select
              name="businessCategoryId"
              value={formData.businessCategoryId}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">City</label>
            <select
              name="cityId"
              value={formData.cityId}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            >
              <option value="">Select city</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Zone (Optional)</label>
            <select
              name="zoneId"
              value={formData.zoneId}
              onChange={handleChange}
              disabled={!formData.cityId}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition disabled:bg-neutral-100"
            >
              <option value="">Select zone</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g. 12.9716"
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g. 77.5946"
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Delivery Radius (km)</label>
            <input
              type="number"
              step="0.1"
              name="deliveryRadiusKm"
              value={formData.deliveryRadiusKm}
              onChange={handleChange}
              placeholder="e.g. 5.0"
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>
        </div>

        {/* Map + Address */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-700">Location on Map</label>
          <p className="text-xs text-neutral-500">Search for an address or click/drag the pin to update coordinates and address automatically.</p>
          <MapPicker
            lat={formData.latitude ? parseFloat(formData.latitude) : null}
            lng={formData.longitude ? parseFloat(formData.longitude) : null}
            onPositionChange={handleMapChange}
          />
          <div className="space-y-2 mt-3">
            <label className="text-sm font-medium text-neutral-700">Store Address</label>
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Physical address of the store"
              className="w-full p-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
