/**
 * NIN Verification API (Mock)
 *
 * Simulates NIN verification from NIMC database
 * Returns customer details including full name, address, BVN, phone, and photo
 */

import { NextRequest, NextResponse } from "next/server";

// Mock database of NIN records
const ninDatabase: Record<string, {
  nin: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  stateOfOrigin: string;
  lga: string;
  bvn: string;
  nationality: string;
  photoUrl: string;
}> = {
  "12345678901": {
    nin: "12345678901",
    fullName: "Adebayo Oluwaseun",
    dateOfBirth: "1990-05-15",
    gender: "Male",
    phoneNumber: "08012345678",
    address: "15 Admiralty Way, Lekki Phase 1, Lagos",
    stateOfOrigin: "Lagos",
    lga: "Eti-Osa",
    bvn: "22123456789",
    nationality: "Nigerian",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo"
  },
  "23456789012": {
    nin: "23456789012",
    fullName: "Chioma Nwosu",
    dateOfBirth: "1988-09-22",
    gender: "Female",
    phoneNumber: "08098765432",
    address: "42 Awolowo Road, Ikoyi, Lagos",
    stateOfOrigin: "Anambra",
    lga: "Onitsha North",
    bvn: "22234567890",
    nationality: "Nigerian",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma"
  },
  "34567890123": {
    nin: "34567890123",
    fullName: "Ibrahim Mohammed",
    dateOfBirth: "1992-03-10",
    gender: "Male",
    phoneNumber: "08087654321",
    address: "78 Independence Avenue, Kaduna",
    stateOfOrigin: "Kaduna",
    lga: "Kaduna North",
    bvn: "22345678901",
    nationality: "Nigerian",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim"
  },
  "45678901234": {
    nin: "45678901234",
    fullName: "Ngozi Okeke",
    dateOfBirth: "1995-11-08",
    gender: "Female",
    phoneNumber: "08076543210",
    address: "23 Trans Amadi Industrial Layout, Port Harcourt",
    stateOfOrigin: "Rivers",
    lga: "Port Harcourt",
    bvn: "22456789012",
    nationality: "Nigerian",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ngozi"
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nin, expectedName } = body;

    // Validate input
    if (!nin) {
      return NextResponse.json(
        {
          success: false,
          error: "missing_nin",
          message: "NIN is required for verification",
        },
        { status: 400 }
      );
    }

    // Validate NIN format (11 digits)
    if (!/^\d{11}$/.test(nin)) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_nin_format",
          message: "NIN must be exactly 11 digits",
        },
        { status: 400 }
      );
    }

    console.log("[NIN Verification] Verifying NIN:", nin);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Look up NIN in mock database
    const record = ninDatabase[nin];

    if (!record) {
      console.log("[NIN Verification] NIN not found:", nin);
      return NextResponse.json(
        {
          success: false,
          error: "nin_not_found",
          message: "No record found for this NIN in NIMC database",
        },
        { status: 404 }
      );
    }

    console.log("[NIN Verification] Record found:", {
      nin: record.nin,
      fullName: record.fullName,
    });

    // Check if name matches (if expected name provided)
    let nameMatch = true;
    if (expectedName) {
      nameMatch = record.fullName.toLowerCase() === expectedName.toLowerCase();
      console.log("[NIN Verification] Name match:", {
        expected: expectedName,
        actual: record.fullName,
        match: nameMatch,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        nameMatch,
        record: {
          nin: record.nin,
          fullName: record.fullName,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          phoneNumber: record.phoneNumber,
          address: record.address,
          stateOfOrigin: record.stateOfOrigin,
          lga: record.lga,
          bvn: record.bvn,
          nationality: record.nationality,
          photoUrl: record.photoUrl,
        },
      },
    });
  } catch (error: any) {
    console.error("[NIN Verification] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "verification_failed",
        message: "Failed to verify NIN",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
