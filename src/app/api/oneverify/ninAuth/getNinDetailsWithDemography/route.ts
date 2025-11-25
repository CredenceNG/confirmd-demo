/**
 * OneVERIFY Mock API - Get NIN Details With Demography
 *
 * POST /api/oneverify/ninAuth/getNinDetailsWithDemography
 *
 * Looks up NIN details using demographic information (name, DOB, gender)
 */

import { NextRequest, NextResponse } from "next/server";
import { ninDatabase } from "@/lib/oneverify";
import type { NINDetails } from "@/lib/oneverify";

// Helper to find NIN by demography
function findNINByDemography(
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  gender: string
): NINDetails | null {
  const normalizedFirstName = firstName.toUpperCase();
  const normalizedLastName = lastName.toUpperCase();
  const normalizedGender = gender.toLowerCase().charAt(0); // 'm' or 'f'

  // Convert date formats for comparison (handle both DD-MM-YYYY and YYYY-MM-DD)
  const normalizeDOB = (dob: string): string => {
    if (dob.includes("-")) {
      const parts = dob.split("-");
      if (parts[0].length === 4) {
        // YYYY-MM-DD format
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to DD-MM-YYYY
      }
    }
    return dob;
  };

  const normalizedDOB = normalizeDOB(dateOfBirth);

  for (const nin of Object.values(ninDatabase)) {
    const ninDOB = nin.birthdate;

    // Check if first name and surname match
    const firstNameMatch =
      nin.firstname.toUpperCase() === normalizedFirstName ||
      nin.middlename.toUpperCase() === normalizedFirstName;
    const lastNameMatch = nin.surname.toUpperCase() === normalizedLastName;
    const genderMatch = nin.gender === normalizedGender;
    const dobMatch = ninDOB === normalizedDOB;

    if (firstNameMatch && lastNameMatch && genderMatch && dobMatch) {
      return nin;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Validate headers
    const apiKey = request.headers.get("X-API-KEY");
    const userId = request.headers.get("X-USER-ID");

    if (!apiKey) {
      return NextResponse.json(
        {
          status: 401,
          message: "Missing X-API-KEY header",
          data: null,
        },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          status: 401,
          message: "Missing X-USER-ID header",
          data: null,
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { firstName, lastName, dateOfBirth, gender, requestReason } = body;

    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json(
        {
          status: 400,
          message: "firstName, lastName, dateOfBirth, and gender are required",
          data: null,
        },
        { status: 400 }
      );
    }

    console.log("[OneVERIFY API] getNinDetailsWithDemography:", {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      requestReason,
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Look up by demography
    const ninDetails = findNINByDemography(firstName, lastName, dateOfBirth, gender);

    if (!ninDetails) {
      return NextResponse.json(
        {
          status: 404,
          message: "No NIN record found matching the provided demographics",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "NIN Auth verification successful",
      data: ninDetails,
    });
  } catch (error: any) {
    console.error("[OneVERIFY API] Error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
