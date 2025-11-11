"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ConnectionStatus =
  | "disconnected"
  | "filling-application"
  | "submitting-application"
  | "application-submitted";

interface ApplicationData {
  fullName: string;
  email: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  stateOfResidence: string;
  licenseClass: string;
  frontImage: File | null;
  backImage: File | null;
}

export default function DocumentBackedHoldersPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [applicationId, setApplicationId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [frontImagePreview, setFrontImagePreview] = useState<string>("");
  const [backImagePreview, setBackImagePreview] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [cameraMode, setCameraMode] = useState<'front' | 'back' | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    fullName: "",
    email: "",
    dateOfBirth: "",
    address: "",
    phoneNumber: "",
    licenseNumber: "",
    issueDate: "",
    expiryDate: "",
    stateOfResidence: "Lagos",
    licenseClass: "C",
    frontImage: null,
    backImage: null,
  });

  // Detect if mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
  }, []);

  // Cleanup camera stream on unmount or when camera mode changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start application
  const startApplication = () => {
    setConnectionStatus("filling-application");
  };

  // Start camera
  const startCamera = async (side: 'front' | 'back') => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera
        audio: false
      });

      setStream(mediaStream);
      setCameraMode(side);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMessage('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraMode) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and then to file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `license-${cameraMode}-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const reader = new FileReader();

          reader.onloadend = () => {
            const preview = reader.result as string;

            if (cameraMode === 'front') {
              setApplicationData({ ...applicationData, frontImage: file });
              setFrontImagePreview(preview);
            } else {
              setApplicationData({ ...applicationData, backImage: file });
              setBackImagePreview(preview);
            }
          };

          reader.readAsDataURL(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(null);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === 'front') {
        setApplicationData({ ...applicationData, frontImage: file });
        const reader = new FileReader();
        reader.onloadend = () => {
          setFrontImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setApplicationData({ ...applicationData, backImage: file });
        const reader = new FileReader();
        reader.onloadend = () => {
          setBackImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Submit application
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicationData.frontImage || !applicationData.backImage) {
      setErrorMessage("Please upload both front and back images of your driver's license");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setConnectionStatus("submitting-application");

    try {
      // Generate a mock application ID
      const mockApplicationId = `DL-APP-${Date.now().toString().slice(-8)}`;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setApplicationId(mockApplicationId);
      setConnectionStatus("application-submitted");
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setErrorMessage("Connection error. Please try again.");
      setConnectionStatus("filling-application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Document-Backed Credentials - For Holders</h2>
                  <p className="text-green-100 mt-1">
                    Digitize your physical driver's license into a verifiable credential
                  </p>
                </div>
                <Link
                  href="/"
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  ← Back to Demos
                </Link>
              </div>
            </div>

            <div className="p-6">
              {/* Landing State */}
              {connectionStatus === "disconnected" && (
                <div className="p-8">
                  {/* Hero Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 mb-8 text-center">
                    <div className="text-6xl mb-4">🪪</div>
                    <h3 className="text-2xl font-bold text-green-900 mb-3">
                      Get Your Digital Driver's License
                    </h3>
                    <p className="text-green-800 text-lg max-w-2xl mx-auto">
                      Already have a physical driver's license? Convert it to a secure, verifiable digital credential
                      by uploading scans of your document and providing your details.
                    </p>
                  </div>

                  {/* How It Works */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      How It Works
                    </h3>
                    <div className="space-y-3 text-sm text-blue-800">
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 font-bold text-lg">1.</span>
                        <div>
                          <p className="font-semibold">Scan Your Physical License</p>
                          <p className="text-blue-700">Take clear photos of the front and back of your driver's license</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 font-bold text-lg">2.</span>
                        <div>
                          <p className="font-semibold">Fill In Your Details</p>
                          <p className="text-blue-700">Provide your personal information and license details</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 font-bold text-lg">3.</span>
                        <div>
                          <p className="font-semibold">FRSC Verifies Your Document</p>
                          <p className="text-blue-700">FRSC staff review and verify your physical license images</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 font-bold text-lg">4.</span>
                        <div>
                          <p className="font-semibold">Receive Digital Credential by Email</p>
                          <p className="text-blue-700">Once approved, get your verifiable digital license via email</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      What You'll Need
                    </h3>
                    <ul className="space-y-2 text-sm text-amber-800">
                      <li className="flex items-center gap-2">
                        <span className="text-amber-600 font-bold">✓</span>
                        <span><strong>Valid Physical Driver's License:</strong> Must be current and not expired</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-600 font-bold">✓</span>
                        <span><strong>Clear Photos:</strong> Front and back images of your license (JPEG or PNG)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-600 font-bold">✓</span>
                        <span><strong>Email Address:</strong> Where your digital credential will be sent</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-600 font-bold">✓</span>
                        <span><strong>License Details:</strong> Information from your physical license card</span>
                      </li>
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Why Go Digital?
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="text-2xl mb-2">📱</div>
                        <p className="font-semibold text-purple-900 mb-1">Always With You</p>
                        <p className="text-sm text-purple-700">No need to carry physical card - it's in your phone</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="text-2xl mb-2">🔒</div>
                        <p className="font-semibold text-purple-900 mb-1">Cannot Be Forged</p>
                        <p className="text-sm text-purple-700">Cryptographically signed - impossible to fake</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="text-2xl mb-2">⚡</div>
                        <p className="font-semibold text-purple-900 mb-1">Instant Verification</p>
                        <p className="text-sm text-purple-700">Organizations verify in seconds, not days</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="text-2xl mb-2">🔐</div>
                        <p className="font-semibold text-purple-900 mb-1">You Control Sharing</p>
                        <p className="text-sm text-purple-700">Share only what's needed with your consent</p>
                      </div>
                    </div>
                  </div>

                  {/* Start Button */}
                  <div className="text-center">
                    <button
                      onClick={startApplication}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Start Digitization Process
                    </button>
                  </div>
                </div>
              )}

              {/* Application Form State */}
              {connectionStatus === "filling-application" && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Digitize Your Driver's License</h3>
                      <p className="text-gray-600">Upload your physical license and provide your details</p>
                    </div>

                    {errorMessage && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 text-sm">{errorMessage}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmitApplication} className="space-y-6">
                      {/* Document Upload Section */}
                      <div className="bg-white border-2 border-indigo-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-2xl">📸</span>
                          Upload License Images
                        </h4>
                        <p className="text-sm text-gray-600 mb-6">
                          Please upload clear, well-lit photos of both sides of your physical driver's license
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Front Image */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Front of License <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                              {frontImagePreview ? (
                                <div className="relative">
                                  <img src={frontImagePreview} alt="Front" className="w-full h-48 object-contain rounded" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setApplicationData({ ...applicationData, frontImage: null });
                                      setFrontImagePreview("");
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="text-4xl mb-2">📄</div>
                                  {isMobile && (
                                    <button
                                      type="button"
                                      onClick={() => startCamera('front')}
                                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      Take Photo
                                    </button>
                                  )}
                                  <label className="cursor-pointer block">
                                    <div className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                      <p className="text-sm text-gray-600 mb-1">{isMobile ? 'Or upload from gallery' : 'Click to upload'}</p>
                                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload(e, 'front')}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Back Image */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Back of License <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                              {backImagePreview ? (
                                <div className="relative">
                                  <img src={backImagePreview} alt="Back" className="w-full h-48 object-contain rounded" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setApplicationData({ ...applicationData, backImage: null });
                                      setBackImagePreview("");
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="text-4xl mb-2">📄</div>
                                  {isMobile && (
                                    <button
                                      type="button"
                                      onClick={() => startCamera('back')}
                                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      Take Photo
                                    </button>
                                  )}
                                  <label className="cursor-pointer block">
                                    <div className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                      <p className="text-sm text-gray-600 mb-1">{isMobile ? 'Or upload from gallery' : 'Click to upload'}</p>
                                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload(e, 'back')}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-2xl">👤</span>
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name (as on license) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={applicationData.fullName}
                              onChange={(e) => setApplicationData({ ...applicationData, fullName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Enter your full name exactly as shown on license"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={applicationData.dateOfBirth}
                              onChange={(e) => setApplicationData({ ...applicationData, dateOfBirth: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={applicationData.phoneNumber}
                              onChange={(e) => setApplicationData({ ...applicationData, phoneNumber: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="+234 xxx xxx xxxx"
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={applicationData.email}
                              onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="your.email@example.com"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Your digital credential will be sent to this email address
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Residential Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={applicationData.address}
                              onChange={(e) => setApplicationData({ ...applicationData, address: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              rows={3}
                              placeholder="Enter your full residential address"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* License Information */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-2xl">🪪</span>
                          License Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              License Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={applicationData.licenseNumber}
                              onChange={(e) => setApplicationData({ ...applicationData, licenseNumber: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="e.g., FKJ123456789"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              License Class <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={applicationData.licenseClass}
                              onChange={(e) => setApplicationData({ ...applicationData, licenseClass: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            >
                              <option value="A">Class A - Motorcycle</option>
                              <option value="B">Class B - Personal Vehicle</option>
                              <option value="C">Class C - Commercial Vehicle</option>
                              <option value="D">Class D - Articulated Vehicle</option>
                              <option value="E">Class E - Special Vehicle</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Issue Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={applicationData.issueDate}
                              onChange={(e) => setApplicationData({ ...applicationData, issueDate: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={applicationData.expiryDate}
                              onChange={(e) => setApplicationData({ ...applicationData, expiryDate: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State of Issue <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={applicationData.stateOfResidence}
                              onChange={(e) => setApplicationData({ ...applicationData, stateOfResidence: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            >
                              <option value="Lagos">Lagos</option>
                              <option value="Abuja">Abuja</option>
                              <option value="Kano">Kano</option>
                              <option value="Rivers">Rivers</option>
                              <option value="Oyo">Oyo</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Submitting..." : "Submit for Verification"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConnectionStatus("disconnected")}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Submitting State */}
              {connectionStatus === "submitting-application" && (
                <div className="p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Uploading Documents
                  </h3>
                  <p className="text-xl text-gray-700 mb-6 font-semibold">
                    Please wait while we process your documents...
                  </p>
                  <div className="mt-8">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 max-w-md mx-auto">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <p className="text-green-800 font-semibold">
                        Submitting your documents for verification...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Submitted State */}
              {connectionStatus === "application-submitted" && (
                <div className="p-8">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800 mb-3">
                        Documents Submitted!
                      </h3>
                      <p className="text-lg text-gray-600">
                        Your documents have been successfully submitted to FRSC for verification
                      </p>
                    </div>

                    {applicationId && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Application ID:</strong>
                        </p>
                        <p className="text-lg font-mono text-gray-900">{applicationId}</p>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        What Happens Next?
                      </h4>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">1.</span>
                          <span>FRSC staff will verify your physical license images and details</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">2.</span>
                          <span>Once verified, your document will be processed into a digital credential</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">3.</span>
                          <span>You'll receive an email with a link to claim your digital driver's license</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">4.</span>
                          <span>Click the email link to accept the credential into your digital wallet</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Check Your Email
                      </h4>
                      <p className="text-sm text-yellow-800">
                        We've sent a confirmation to <strong>{applicationData.email}</strong>.
                        You'll receive another email once your physical license is verified and your digital credential is ready.
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Demo Note
                      </h4>
                      <p className="text-sm text-green-800 mb-3">
                        In this demo, the FRSC issuer will now process your document and issue your digital credential
                        using the{" "}
                        <Link href="/document-backed/issuers" className="underline font-semibold">
                          Issuers Demo
                        </Link>.
                        They will extract information from your license images and send the credential to your email.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href="/document-backed/issuers"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-center"
                      >
                        Go to Issuers Demo →
                      </Link>
                      <button
                        onClick={() => {
                          setConnectionStatus("disconnected");
                          setApplicationData({
                            fullName: "",
                            email: "",
                            dateOfBirth: "",
                            address: "",
                            phoneNumber: "",
                            licenseNumber: "",
                            issueDate: "",
                            expiryDate: "",
                            stateOfResidence: "Lagos",
                            licenseClass: "C",
                            frontImage: null,
                            backImage: null,
                          });
                          setFrontImagePreview("");
                          setBackImagePreview("");
                        }}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Submit Another Application
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {cameraMode && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Camera Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Capture License - {cameraMode === 'front' ? 'Front Side' : 'Back Side'}
                  </h3>
                  <button
                    onClick={stopCamera}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Camera View */}
              <div className="relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                  style={{ maxHeight: '60vh' }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-4 border-white border-dashed rounded-lg opacity-50"></div>
                </div>

                {/* Instructions */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <p className="text-white text-center text-sm">
                    Position your license within the frame and ensure it's well-lit
                  </p>
                </div>
              </div>

              {/* Camera Controls */}
              <div className="bg-gray-100 p-4 flex gap-4">
                <button
                  onClick={stopCamera}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Capture Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
