import { NextRequest, NextResponse } from "next/server";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * POST /api/confirmd/students/register
 * Register a new student
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "dateOfBirth",
      "nin",
      "bvn",
      "gender",
      "stateOfOrigin",
      "lga",
      "address",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          error: "invalid_email",
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Validate phone number format (Nigerian)
    const phoneRegex = /^(\+234|0)[789]\d{9}$/;
    if (!phoneRegex.test(body.phoneNumber)) {
      return NextResponse.json(
        {
          error: "invalid_phone",
          message: "Invalid Nigerian phone number format",
        },
        { status: 400 }
      );
    }

    // Validate NIN (11 digits)
    if (!/^\d{11}$/.test(body.nin)) {
      return NextResponse.json(
        {
          error: "invalid_nin",
          message: "NIN must be 11 digits",
        },
        { status: 400 }
      );
    }

    // Validate BVN (11 digits)
    if (!/^\d{11}$/.test(body.bvn)) {
      return NextResponse.json(
        {
          error: "invalid_bvn",
          message: "BVN must be 11 digits",
        },
        { status: 400 }
      );
    }

    const result = await confirmdClient.registerStudent(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error?.error || "registration_failed",
          message:
            result.error?.error_description ||
            "Failed to register student",
        },
        { status: result.error?.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Student registered successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "server_error",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
