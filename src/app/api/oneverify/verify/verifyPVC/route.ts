/**
 * OneVERIFY Mock API - Verify PVC (Permanent Voter's Card)
 *
 * GET /api/oneverify/verify/verifyPVC?pvc=<pvcNumber>
 *
 * Verifies a Nigerian PVC and returns voter details from INEC database
 */

import { NextRequest, NextResponse } from "next/server";

// Mock PVC database
const pvcDatabase: Record<
  string,
  {
    pvc: string;
    vin: string;
    firstname: string;
    middlename: string | null;
    lastname: string;
    dob: string;
    gender: string;
    occupation: string;
    pollingUnit: string;
    ward: string;
    lga: string;
    state: string;
    registrationDate: string;
    photo: string;
  }
> = {
  "90F5AFEC12295412458": {
    pvc: "90F5AFEC12295412458",
    vin: "90F5AFEC12295412458",
    firstname: "OLUWASEUN",
    middlename: "ADEBAYO",
    lastname: "JOHNSON",
    dob: "1990-05-15",
    gender: "Male",
    occupation: "Software Engineer",
    pollingUnit: "005 - Lekki Phase 1",
    ward: "Ward 8",
    lga: "Eti-Osa",
    state: "Lagos",
    registrationDate: "2019-02-14",
    photo:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z",
  },
  "80A3BCDE98765432109": {
    pvc: "80A3BCDE98765432109",
    vin: "80A3BCDE98765432109",
    firstname: "CHIOMA",
    middlename: "ADANNA",
    lastname: "NWOSU",
    dob: "1988-09-22",
    gender: "Female",
    occupation: "Accountant",
    pollingUnit: "012 - Awolowo Road",
    ward: "Ward 5",
    lga: "Eti-Osa",
    state: "Lagos",
    registrationDate: "2018-11-20",
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

    // Get PVC from query params
    const { searchParams } = new URL(request.url);
    const pvc = searchParams.get("pvc");

    if (!pvc) {
      return NextResponse.json(
        {
          status: 400,
          message: "PVC query parameter is required",
          data: null,
        },
        { status: 400 }
      );
    }

    console.log("[OneVERIFY API] verifyPVC:", { pvc });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Look up PVC
    const voter = pvcDatabase[pvc.toUpperCase()];

    if (!voter) {
      return NextResponse.json(
        {
          status: 404,
          message: "PVC not found in INEC database",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "PVC verification successful",
      data: {
        verified: true,
        voter: {
          pvc: voter.pvc,
          vin: voter.vin,
          firstname: voter.firstname,
          middlename: voter.middlename,
          lastname: voter.lastname,
          dob: voter.dob,
          gender: voter.gender,
          occupation: voter.occupation,
          pollingUnit: voter.pollingUnit,
          ward: voter.ward,
          lga: voter.lga,
          state: voter.state,
          registrationDate: voter.registrationDate,
          photo: voter.photo,
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
