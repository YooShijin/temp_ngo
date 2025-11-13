'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ngoAPI, categoryAPI, type NGO, type Category } from '@/lib/api';
import { MapPin, CheckCircle, ExternalLink, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function NGOsPage() {
  const searchParams = useSearchParams();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    state: '',
    verified: false,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current: 1,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadNGOs();
  }, [filters, pagination.current]);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadNGOs = async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.current };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.state) params.state = filters.state;
      if (filters.verified) params.verified = 'true';

      const res = await ngoAPI.getAll(params);
      setNgos(res.data.ngos);
      setPagination({
        total: res.data.total,
        pages: res.data.pages,
        current: pagination.current,
      });
    } catch (error) {
      console.error('Error loading NGOs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Discover NGOs</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search NGOs..."
            className="border rounded px-4 py-2"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="border rounded px-4 py-2"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="State"
            className="border rounded px-4 py-2"
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          />
          <label className="flex items-center gap-2 px-4 py-2 border rounded">
            <input
              type="checkbox"
              checked={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
            />
            <span>Verified Only</span>
          </label>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            Found {pagination.total} NGO{pagination.total !== 1 ? 's' : ''}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngos.map((ngo) => (
              <div key={ngo.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{ngo.name}</h3>
                  {ngo.verified && (
                    <CheckCircle className="w-6 h-6 text-green-500"  />
                  )}
                </div>

                {ngo.mission && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{ngo.mission}</p>
                )}

                {ngo.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ngo.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}

                {(ngo.city || ngo.state) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {ngo.city}
                      {ngo.city && ngo.state && ', '}
                      {ngo.state}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 mb-4">
                  {ngo.email && (
                    <a
                      href={`mailto:${ngo.email}`}
                      className="text-blue-600 hover:text-blue-800"
                      title={ngo.email}
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                  {ngo.phone && (
                    <a
                      href={`tel:${ngo.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                      title={ngo.phone}
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                  {ngo.website && (
                    <a
                      href={ngo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>

                <Link
                  href={`/ngos/${ngo.id}`}
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination({ ...pagination, current: page })}
                  className={`px-4 py-2 rounded ${
                    page === pagination.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}