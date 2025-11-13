"use client";

import { useState, useEffect } from "react";
import { volunteerAPI, type VolunteerPost } from "@/lib/api";
import { MapPin, Calendar, Users } from "lucide-react";

export default function VolunteerPage() {
  const [posts, setPosts] = useState<VolunteerPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await volunteerAPI.getAll({ active: true });
      setPosts(res.data);
    } catch (error) {
      console.error("Error loading volunteer posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Volunteer Opportunities</h1>
        <p className="text-xl text-gray-600">
          Make a difference by volunteering with verified NGOs
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">
            No volunteer opportunities available yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="mb-3">
                <div className="text-sm text-blue-600 font-semibold mb-1">
                  {post.ngo_name}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {post.title}
                </h3>
              </div>

              {post.description && (
                <p className="text-gray-700 mb-4">{post.description}</p>
              )}

              {post.requirements && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Requirements:
                  </h4>
                  <p className="text-gray-700 text-sm">{post.requirements}</p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {post.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location}</span>
                  </div>
                )}
                {post.deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Apply by: {new Date(post.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
