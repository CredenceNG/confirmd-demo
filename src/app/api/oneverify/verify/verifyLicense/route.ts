/**
 * OneVERIFY Mock API - Verify Driver's License
 *
 * GET /api/oneverify/verify/verifyLicense?id=<licenseNumber>
 *
 * Verifies a Nigerian driver's license and returns license details
 */

import { NextRequest, NextResponse } from "next/server";

// Mock license database
const licenseDatabase: Record<
  string,
  {
    licenseNumber: string;
    firstname: string;
    middlename: string | null;
    lastname: string;
    dob: string;
    gender: string;
    issueDate: string;
    expiryDate: string;
    licenseClass: string;
    stateOfIssue: string;
    address: string;
    bloodGroup: string;
    photo: string;
  }
> = {
  "75222761530": {
    licenseNumber: "75222761530",
    firstname: "OLUWASEUN",
    middlename: "ADEBAYO",
    lastname: "JOHNSON",
    dob: "1990-05-15",
    gender: "Male",
    issueDate: "2022-06-01",
    expiryDate: "2027-05-31",
    licenseClass: "B",
    stateOfIssue: "Lagos",
    address: "15 Admiralty Way, Lekki Phase 1, Lagos",
    bloodGroup: "O+",
    photo:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z",
  },
  "82134567890": {
    licenseNumber: "82134567890",
    firstname: "CHIOMA",
    middlename: "ADANNA",
    lastname: "NWOSU",
    dob: "1988-09-22",
    gender: "Female",
    issueDate: "2021-03-15",
    expiryDate: "2026-03-14",
    licenseClass: "B",
    stateOfIssue: "Anambra",
    address: "42 Awolowo Road, Ikoyi, Lagos",
    bloodGroup: "A+",
    photo:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z",
  },
};

export async function GET(request: NextRequest) {
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

    // Get license ID from query params
    const { searchParams } = new URL(request.url);
    const licenseId = searchParams.get("id");

    if (!licenseId) {
      return NextResponse.json(
        {
          status: 400,
          message: "License ID (id) query parameter is required",
          data: null,
        },
        { status: 400 }
      );
    }

    console.log("[OneVERIFY API] verifyLicense:", { licenseId });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Look up license
    const license = licenseDatabase[licenseId];

    if (!license) {
      return NextResponse.json(
        {
          status: 404,
          message: "Driver's license not found in FRSC database",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "License verification successful",
      data: {
        verified: true,
        license: {
          licenseNumber: license.licenseNumber,
          firstname: license.firstname,
          middlename: license.middlename,
          lastname: license.lastname,
          dob: license.dob,
          gender: license.gender,
          issueDate: license.issueDate,
          expiryDate: license.expiryDate,
          licenseClass: license.licenseClass,
          stateOfIssue: license.stateOfIssue,
          address: license.address,
          bloodGroup: license.bloodGroup,
          photo: license.photo,
        },
      },
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
