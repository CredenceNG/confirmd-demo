/**
 * OneVERIFY Mock API - Verify Passport
 *
 * POST /api/oneverify/verify/verifyPassport
 *
 * Verifies a Nigerian passport and returns passport details
 */

import { NextRequest, NextResponse } from "next/server";

// Mock passport database
const passportDatabase: Record<
  string,
  {
    passportId: string;
    firstname: string;
    middlename: string | null;
    lastname: string;
    dob: string;
    gender: string;
    issueDate: string;
    expiryDate: string;
    placeOfBirth: string;
    nationality: string;
    photo: string;
  }
> = {
  A02745229: {
    passportId: "A02745229",
    firstname: "SADE",
    middlename: null,
    lastname: "DAVID",
    dob: "1992-03-09",
    gender: "Female",
    issueDate: "2020-05-15",
    expiryDate: "2030-05-14",
    placeOfBirth: "LAGOS",
    nationality: "NIGERIAN",
    photo:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z",
  },
  A12345678: {
    passportId: "A12345678",
    firstname: "OLUWASEUN",
    middlename: "ADEBAYO",
    lastname: "JOHNSON",
    dob: "1990-05-15",
    gender: "Male",
    issueDate: "2021-01-10",
    expiryDate: "2031-01-09",
    placeOfBirth: "LAGOS",
    nationality: "NIGERIAN",
    photo:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z",
  },
};

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
    const { passportId, firstname, lastname, dob } = body;

    if (!passportId) {
      return NextResponse.json(
        {
          status: 400,
          message: "Passport ID is required",
          data: null,
        },
        { status: 400 }
      );
    }

    console.log("[OneVERIFY API] verifyPassport:", {
      passportId,
      firstname,
      lastname,
      dob,
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Look up passport
    const passport = passportDatabase[passportId.toUpperCase()];

    if (!passport) {
      return NextResponse.json(
        {
          status: 404,
          message: "Passport not found in Immigration database",
          data: null,
        },
        { status: 404 }
      );
    }

    // Verify provided details match
    const firstnameMatch =
      !firstname ||
      passport.firstname.toUpperCase() === firstname.toUpperCase();
    const lastnameMatch =
      !lastname || passport.lastname.toUpperCase() === lastname.toUpperCase();
    const dobMatch = !dob || passport.dob === dob;

    if (!firstnameMatch || !lastnameMatch || !dobMatch) {
      return NextResponse.json(
        {
          status: 400,
          message: "Provided details do not match passport record",
          data: {
            verified: false,
            mismatch: {
              firstname: !firstnameMatch,
              lastname: !lastnameMatch,
              dob: !dobMatch,
            },
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Passport verification successful",
      data: {
        verified: true,
        passport: {
          passportId: passport.passportId,
          firstname: passport.firstname,
          middlename: passport.middlename,
          lastname: passport.lastname,
          dob: passport.dob,
          gender: passport.gender,
          issueDate: passport.issueDate,
          expiryDate: passport.expiryDate,
          placeOfBirth: passport.placeOfBirth,
          nationality: passport.nationality,
          photo: passport.photo,
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
