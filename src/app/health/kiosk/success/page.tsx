"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function KioskSuccessContent() {
  const searchParams = useSearchParams();
  const visitNumber = searchParams.get("visitNumber") || "V00000000-000";
  const patientName = searchParams.get("patientName") || "Patient";
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdown, setCountdown] = useState(60);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown to return to kiosk home
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = "/health/kiosk";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate random queue number (for demo purposes)
  const queueNumber = Math.floor(Math.random() * 20) + 1;

  // Random department assignment for demo
  const departments = [
    { name: "General Medicine", room: "Room 101-105", floor: "1st Floor", color: "blue" },
    { name: "Cardiology", room: "Room 201-205", floor: "2nd Floor", color: "red" },
    { name: "Orthopedics", room: "Room 301-305", floor: "3rd Floor", color: "orange" },
    { name: "Pediatrics", room: "Room 401-405", floor: "4th Floor", color: "green" },
    { name: "ENT", room: "Room 106-110", floor: "1st Floor", color: "purple" },
  ];
  const [department] = useState(() => departments[Math.floor(Math.random() * departments.length)]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex flex-col">
      {/* Kiosk Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">General Hospital</h1>
              <p className="text-sm text-green-200">Patient Check-In Kiosk</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-white">
              {currentTime.toLocaleTimeString()}
            </p>
            <p className="text-sm text-green-200">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full text-center">

          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Welcome Message */}
          <h2 className="text-3xl font-bold text-white mb-2">
            Check-In Complete!
          </h2>
          <p className="text-xl text-green-200 mb-8">
            Welcome, {patientName}
          </p>

          {/* Visit Ticket */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 max-w-md mx-auto">
            {/* Ticket Header */}
            <div className={`bg-gradient-to-r from-${department.color}-600 to-${department.color}-700 px-6 py-4`} style={{background: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))`}}>
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 -mx-6 -mt-4">
                <p className="text-sm text-teal-100 uppercase tracking-wider">Visit Number</p>
                <p className="text-4xl font-mono font-bold text-white tracking-widest">{visitNumber}</p>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6">
              {/* Queue Number */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
                <p className="text-sm text-amber-700 uppercase tracking-wider mb-1">Queue Number</p>
                <p className="text-6xl font-bold text-amber-600">{queueNumber.toString().padStart(2, '0')}</p>
              </div>

              {/* Department Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Proceed to</p>
                <p className="text-xl font-bold text-gray-900">{department.name}</p>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {department.floor}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {department.room}
                  </span>
                </div>
              </div>

              {/* Time */}
              <div className="text-sm text-gray-500">
                Check-in Time: {currentTime.toLocaleTimeString()}
              </div>
            </div>

            {/* Ticket Footer - Tear Line */}
            <div className="border-t-2 border-dashed border-gray-200 relative">
              <div className="absolute -left-3 -top-3 w-6 h-6 bg-gradient-to-br from-slate-900 to-green-900 rounded-full"></div>
              <div className="absolute -right-3 -top-3 w-6 h-6 bg-gradient-to-br from-slate-900 to-green-900 rounded-full"></div>
            </div>

            <div className="p-4 bg-gray-50">
              <p className="text-xs text-gray-500">
                Please keep this ticket and proceed to the waiting area.
                Your number will be called when it's your turn.
              </p>
            </div>
          </div>

          {/* Directions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Directions
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-2">🚶</div>
                <p className="text-sm text-white">Walk to {department.floor}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-2">🪧</div>
                <p className="text-sm text-white">Follow signs to {department.name}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-2">🪑</div>
                <p className="text-sm text-white">Wait in {department.room} area</p>
              </div>
            </div>
          </div>

          {/* Auto-return countdown */}
          <p className="text-sm text-green-300">
            Returning to home screen in {countdown} seconds...
          </p>

          {/* Manual Return Button */}
          <Link
            href="/health/kiosk"
            className="inline-block mt-4 px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-colors border border-white/20"
          >
            Start New Check-In
          </Link>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-green-300">
            Need assistance? Please visit the reception desk.
          </p>
          <Link href="/" className="text-sm text-green-300 hover:text-white transition-colors">
            Back to Demos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function KioskSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <KioskSuccessContent />
    </Suspense>
  );
}
