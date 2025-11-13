"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ngoAPI, type NGO } from "@/lib/api";
import {
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle,
  Calendar,
} from "lucide-react";

export default function NGODetailPage() {
  const params = useParams();
  const [ngo, setNgo] = useState<NGO | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNGO();
  }, []);

  const loadNGO = async () => {
    try {
      const res = await ngoAPI.getById(Number(params.id));
      setNgo(res.data);
    } catch (error) {
      console.error("Error loading NGO:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>;
  }

  if (!ngo) {
    return <div className="max-w-4xl mx-auto px-4 py-8">NGO not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-4xl font-bold text-gray-900">{ngo.name}</h1>
          {ngo.verified && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Verified</span>
            </div>
          )}
        </div>

        {ngo.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {ngo.categories.map((cat) => (
              <span
                key={cat.id}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {cat.icon} {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Mission */}
        {ngo.mission && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Mission</h2>
            <p className="text-gray-700 text-lg">{ngo.mission}</p>
          </div>
        )}

        {/* Description */}
        {ngo.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700">{ngo.description}</p>
          </div>
        )}

        {/* Transparency Score */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Transparency Score</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${ngo.transparency_score}%` }}
              ></div>
            </div>
            <span className="font-bold text-gray-900">
              {ngo.transparency_score}/100
            </span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>

        <div className="space-y-3">
          {(ngo.city || ngo.state) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                {ngo.address && <p className="text-gray-700">{ngo.address}</p>}
                <p className="text-gray-700">
                  {ngo.city}
                  {ngo.city && ngo.state && ", "}
                  {ngo.state}
                </p>
              </div>
            </div>
          )}

          {ngo.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <a
                href={`mailto:${ngo.email}`}
                className="text-blue-600 hover:underline"
              >
                {ngo.email}
              </a>
            </div>
          )}

          {ngo.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <a
                href={`tel:${ngo.phone}`}
                className="text-blue-600 hover:underline"
              >
                {ngo.phone}
              </a>
            </div>
          )}

          {ngo.website && (
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-gray-400" />
              <a
                href={ngo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {ngo.website}
              </a>
            </div>
          )}

          {(ngo as any).registration_no && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Registration Number</p>
                <p className="text-gray-700 font-mono">
                  {(ngo as any).registration_no}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Donate Now
        </button>
        <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
          Volunteer
        </button>
      </div>
    </div>
  );
}
