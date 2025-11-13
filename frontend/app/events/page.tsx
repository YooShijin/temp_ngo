"use client";

import { useState, useEffect } from "react";
import { eventAPI, type Event } from "@/lib/api";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await eventAPI.getAll({ upcoming: true });
      setEvents(res.data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
        <p className="text-xl text-gray-600">
          Join events and campaigns organized by NGOs
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No upcoming events scheduled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="mb-3">
                <div className="text-sm text-purple-600 font-semibold mb-1">
                  {event.ngo_name}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {event.title}
                </h3>
              </div>

              {event.description && (
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {event.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.event_date).toLocaleString()}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {event.registration_link ? (
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Register <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold cursor-not-allowed">
                  Registration Closed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
