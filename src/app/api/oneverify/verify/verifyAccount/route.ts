/**
 * OneVERIFY Mock API - Verify Bank Account
 *
 * GET /api/oneverify/verify/verifyAccount?accountId=<accountNumber>&bankCode=<bankCode>
 *
 * Verifies a Nigerian bank account and returns account holder details
 */

import { NextRequest, NextResponse } from "next/server";

// Mock bank account database
const accountDatabase: Record<
  string,
  {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountName: string;
    bvn: string;
    accountStatus: "active" | "dormant" | "closed";
    accountType: string;
  }
> = {
  "0221416896_058": {
    accountNumber: "0221416896",
    bankCode: "058",
    bankName: "GTBank",
    accountName: "OLUWASEUN ADEBAYO JOHNSON",
    bvn: "22123456789",
    accountStatus: "active",
    accountType: "Savings",
  },
  "0123456789_044": {
    accountNumber: "0123456789",
    bankCode: "044",
    bankName: "Access Bank",
    accountName: "CHIOMA ADANNA NWOSU",
    bvn: "22234567890",
    accountStatus: "active",
    accountType: "Current",
  },
  "1234567890_057": {
    accountNumber: "1234567890",
    bankCode: "057",
    bankName: "Zenith Bank",
    accountName: "IBRAHIM ABUBAKAR MOHAMMED",
    bvn: "22345678901",
    accountStatus: "active",
    accountType: "Savings",
  },
};

// Bank codes mapping
const bankCodes: Record<string, string> = {
  "058": "GTBank",
  "044": "Access Bank",
  "057": "Zenith Bank",
  "011": "First Bank",
  "033": "UBA",
  "032": "Union Bank",
  "035": "Wema Bank",
  "221": "Stanbic IBTC",
  "214": "FCMB",
  "050": "Ecobank",
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

    // Get params from query
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const bankCode = searchParams.get("bankCode");

    if (!accountId || !bankCode) {
      return NextResponse.json(
        {
          status: 400,
          message: "accountId and bankCode query parameters are required",
          data: null,
        },
        { status: 400 }
      );
    }

    console.log("[OneVERIFY API] verifyAccount:", { accountId, bankCode });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Validate bank code
    if (!bankCodes[bankCode]) {
      return NextResponse.json(
        {
          status: 400,
          message: "Invalid bank code",
          data: null,
        },
        { status: 400 }
      );
    }

    // Look up account
    const key = `${accountId}_${bankCode}`;
    const account = accountDatabase[key];

    if (!account) {
      return NextResponse.json(
        {
          status: 404,
          message: "Bank account not found",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Account verification successful",
      data: {
        verified: true,
        account: {
          accountNumber: account.accountNumber,
          bankCode: account.bankCode,
          bankName: account.bankName,
          accountName: account.accountName,
          bvn: account.bvn,
          accountStatus: account.accountStatus,
          accountType: account.accountType,
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
