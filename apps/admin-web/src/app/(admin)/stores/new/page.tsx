'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@localmart/ui';
import { storesApi, categoriesApi, geoApi } from '@/lib/api';
import type { Category, City, Zone } from '@localmart/api-client';
import dynamic from 'next/dynamic';
import { useStoreCatalogStore } from '@/stores/store-catalog.store';

const MapPicker = dynamic(
  () => import('@/components/location/MapPicker').then(mod => mod.MapPicker),
  { ssr: false, loading: () => <div className="w-full h-64 rounded-xl bg-neutral-100 animate-pulse" /> }
);

export default function NewStorePage() {
  const router = useRouter();
  const { setStatus, fetchList } = useStoreCatalogStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  
  const [formData, setFormData] = useState({
    ownerPhoneNumber: '',
    ownerName: '',
    name: '',
    storeCode: '',
    businessCategoryId: '',
    cityId: '',
    zoneId: '',
    address: '',
    latitude: '',
    longitude: '',
    deliveryRadiusKm: '5',
  });

  useEffect(() => {
    Promise.all([
      categoriesApi.list(),
      geoApi.listCities()
    ]).then(([cats, cits]) => {
      setCategories(cats.filter(c => c.isActive !== false));
      setCities(cits);
    }).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (formData.cityId) {
      geoApi.listZones(formData.cityId).then(z => setZones(z)).catch(e => console.error(e));
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
    setLoading(true);
    setError('');
    try {
      await storesApi.create({
        ...formData,
        zoneId: formData.zoneId || undefined,
        storeCode: formData.storeCode || undefined,
        ownerName: formData.ownerName || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        deliveryRadiusKm: formData.deliveryRadiusKm ? parseFloat(formData.deliveryRadiusKm) : undefined,
      });
      // Reset filter to show all stores (new store is DRAFT, not PENDING)
      setStatus('');
      await fetchList();
      router.push('/stores');
    } catch (err: any) {
      setError(err.message || 'Failed to create store');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <PageHeader
        title="Add New Store"
        description="Register a new merchant on the platform"
      />

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6 mt-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Owner Phone Number *</label>
            <input
              type="text"
              name="ownerPhoneNumber"
              required
              placeholder="+919876543210"
              value={formData.ownerPhoneNumber}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Owner Name</label>
            <input
              type="text"
              name="ownerName"
              placeholder="e.g. Rajesh Sharma"
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Store Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Sharma Groceries"
              value={formData.name}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Store Code (Optional)</label>
            <input
              type="text"
              name="storeCode"
              placeholder="e.g. SHARMA-BLR"
              value={formData.storeCode}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Delivery Radius (km) *</label>
            <input
              type="number"
              step="0.1"
              required
              name="deliveryRadiusKm"
              placeholder="e.g. 5.0"
              value={formData.deliveryRadiusKm}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Business Category *</label>
            <select
              name="businessCategoryId"
              required
              value={formData.businessCategoryId}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            >
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">City *</label>
            <select
              name="cityId"
              required
              value={formData.cityId}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            >
              <option value="">Select a city</option>
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
              <option value="">Select a zone</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Latitude (Optional)</label>
            <input
              type="number"
              step="any"
              name="latitude"
              placeholder="e.g. 12.9716"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Longitude (Optional)</label>
            <input
              type="number"
              step="any"
              name="longitude"
              placeholder="e.g. 77.5946"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Store Address *</label>
          <div className="text-xs text-neutral-500 mb-2">
            You can pinpoint the location on the map, and we will automatically grab the coordinates and address.
          </div>
          <MapPicker
            lat={formData.latitude ? parseFloat(formData.latitude) : null}
            lng={formData.longitude ? parseFloat(formData.longitude) : null}
            onPositionChange={handleMapChange}
          />
          <textarea
            name="address"
            required
            rows={3}
            placeholder="Physical address of the store"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-4 mt-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Store'}
          </Button>
        </div>
      </form>
    </div>
  );
}
