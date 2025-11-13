'use client';

import { useState, useEffect } from 'react';
import { Search, Heart, Users, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { statsAPI, categoryAPI, type Category, type Stats } from '@/lib/api';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, categoriesRes] = await Promise.all([
        statsAPI.get(),
        categoryAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ngos?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover NGOs Making a Difference
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connect with verified organizations and make an impact
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search NGOs by name, cause, or location..."
                  className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Heart className="w-12 h-12 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.total_ngos}</div>
                <div className="text-gray-600">Total NGOs</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <TrendingUp className="w-12 h-12 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.verified_ngos}</div>
                <div className="text-gray-600">Verified NGOs</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.total_volunteers}</div>
                <div className="text-gray-600">Volunteer Posts</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Calendar className="w-12 h-12 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.upcoming_events}</div>
                <div className="text-gray-600">Upcoming Events</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/ngos?category=${category.slug}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <div className="font-semibold text-gray-900">{category.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8">
            Explore NGOs, volunteer opportunities, and upcoming events
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/ngos"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Browse NGOs
            </Link>
            <Link
              href="/volunteer"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Find Volunteer Work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}