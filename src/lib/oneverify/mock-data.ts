/**
 * OneVERIFY Mock Data
 *
 * Realistic mock data for Nigerian identity verification
 * Used by the mock API endpoints
 */

import type { NINDetails, BVNDetails } from "./types";

// Placeholder base64 image (small gray square - replace with actual test images)
const PLACEHOLDER_PHOTO =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z";

const PLACEHOLDER_SIGNATURE =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z";

/**
 * Mock NIN database
 * Maps NIN to full NIN details
 */
export const ninDatabase: Record<string, NINDetails> = {
  // Test record 1 - Male, Lagos
  "12345678901": {
    batchid: null,
    birthcountry: "nigeria",
    birthdate: "15-05-1990",
    birthlga: "Eti-Osa",
    birthstate: "Lagos",
    cardstatus: null,
    centralid: null,
    educationallevel: "bachelor",
    email: "adebayo.oluwaseun@example.com",
    emplymentstatus: "employed",
    firstname: "OLUWASEUN",
    gender: "m",
    heigth: 178,
    maritalstatus: "single",
    middlename: "ADEBAYO",
    nin: "12345678901",
    nok_address1: "42 ADMIRALTY WAY, LEKKI PHASE 1",
    nok_address2: null,
    nok_firstname: "FUNKE",
    nok_lga: "Eti-Osa",
    nok_middlename: "ADEOLA",
    nok_state: "Lagos",
    nok_surname: "OLUWASEUN",
    nok_town: "LEKKI",
    nspokenlang: "YORUBA",
    ospokenlang: "ENGLISH",
    pfirstname: null,
    pmiddlename: null,
    profession: "SOFTWARE ENGINEER",
    psurname: null,
    religion: "christianity",
    residence_adressline1: "15 ADMIRALTY WAY, LEKKI PHASE 1",
    residence_town: "LEKKI",
    residence_lga: "Eti-Osa",
    residence_state: "Lagos",
    residencestatus: "resident",
    surname: "JOHNSON",
    telephoneno: "08012345678",
    title: "mr",
    trackingid: null,
    photo: PLACEHOLDER_PHOTO,
    signature: PLACEHOLDER_SIGNATURE,
  },

  // Test record 2 - Female, Anambra
  "23456789012": {
    batchid: null,
    birthcountry: "nigeria",
    birthdate: "22-09-1988",
    birthlga: "Onitsha North",
    birthstate: "Anambra",
    cardstatus: null,
    centralid: null,
    educationallevel: "masters",
    email: "chioma.nwosu@example.com",
    emplymentstatus: "employed",
    firstname: "CHIOMA",
    gender: "f",
    heigth: 165,
    maritalstatus: "married",
    middlename: "ADANNA",
    nin: "23456789012",
    nok_address1: "12 NEW MARKET ROAD, ONITSHA",
    nok_address2: null,
    nok_firstname: "EMEKA",
    nok_lga: "Onitsha North",
    nok_middlename: "CHUKWUDI",
    nok_state: "Anambra",
    nok_surname: "NWOSU",
    nok_town: "ONITSHA",
    nspokenlang: "IGBO",
    ospokenlang: "ENGLISH",
    pfirstname: null,
    pmiddlename: null,
    profession: "ACCOUNTANT",
    psurname: null,
    religion: "christianity",
    residence_adressline1: "42 AWOLOWO ROAD, IKOYI",
    residence_town: "IKOYI",
    residence_lga: "Eti-Osa",
    residence_state: "Lagos",
    residencestatus: "resident",
    surname: "NWOSU",
    telephoneno: "08098765432",
    title: "mrs",
    trackingid: null,
    photo: PLACEHOLDER_PHOTO,
    signature: PLACEHOLDER_SIGNATURE,
  },

  // Test record 3 - Male, Kaduna
  "34567890123": {
    batchid: null,
    birthcountry: "nigeria",
    birthdate: "10-03-1992",
    birthlga: "Kaduna North",
    birthstate: "Kaduna",
    cardstatus: null,
    centralid: null,
    educationallevel: "bachelor",
    email: "ibrahim.mohammed@example.com",
    emplymentstatus: "employed",
    firstname: "IBRAHIM",
    gender: "m",
    heigth: 180,
    maritalstatus: "single",
    middlename: "ABUBAKAR",
    nin: "34567890123",
    nok_address1: "25 YAKUBU GOWON WAY",
    nok_address2: null,
    nok_firstname: "FATIMA",
    nok_lga: "Kaduna North",
    nok_middlename: "AISHA",
    nok_state: "Kaduna",
    nok_surname: "MOHAMMED",
    nok_town: "KADUNA",
    nspokenlang: "HAUSA",
    ospokenlang: "ENGLISH",
    pfirstname: null,
    pmiddlename: null,
    profession: "CIVIL ENGINEER",
    psurname: null,
    religion: "islam",
    residence_adressline1: "78 INDEPENDENCE AVENUE",
    residence_town: "KADUNA",
    residence_lga: "Kaduna North",
    residence_state: "Kaduna",
    residencestatus: "resident",
    surname: "MOHAMMED",
    telephoneno: "08087654321",
    title: "mr",
    trackingid: null,
    photo: PLACEHOLDER_PHOTO,
    signature: PLACEHOLDER_SIGNATURE,
  },

  // Test record 4 - Female, Rivers
  "45678901234": {
    batchid: null,
    birthcountry: "nigeria",
    birthdate: "08-11-1995",
    birthlga: "Port Harcourt",
    birthstate: "Rivers",
    cardstatus: null,
    centralid: null,
    educationallevel: "bachelor",
    email: "ngozi.okeke@example.com",
    emplymentstatus: "employed",
    firstname: "NGOZI",
    gender: "f",
    heigth: 160,
    maritalstatus: "single",
    middlename: "CHIDINMA",
    nin: "45678901234",
    nok_address1: "56 ABA ROAD, PORT HARCOURT",
    nok_address2: null,
    nok_firstname: "CHINEDU",
    nok_lga: "Port Harcourt",
    nok_middlename: "IKENNA",
    nok_state: "Rivers",
    nok_surname: "OKEKE",
    nok_town: "PORT HARCOURT",
    nspokenlang: "IGBO",
    ospokenlang: "ENGLISH",
    pfirstname: null,
    pmiddlename: null,
    profession: "MEDICAL DOCTOR",
    psurname: null,
    religion: "christianity",
    residence_adressline1: "23 TRANS AMADI INDUSTRIAL LAYOUT",
    residence_town: "PORT HARCOURT",
    residence_lga: "Port Harcourt",
    residence_state: "Rivers",
    residencestatus: "resident",
    surname: "OKEKE",
    telephoneno: "08076543210",
    title: "dr",
    trackingid: null,
    photo: PLACEHOLDER_PHOTO,
    signature: PLACEHOLDER_SIGNATURE,
  },

  // Test record 5 - Male, Oyo (recent graduate for NYSC testing)
  "56789012345": {
    batchid: null,
    birthcountry: "nigeria",
    birthdate: "25-07-1998",
    birthlga: "Ibadan North",
    birthstate: "Oyo",
    cardstatus: null,
    centralid: null,
    educationallevel: "bachelor",
    email: "tunde.bakare@example.com",
    emplymentstatus: "unemployed",
    firstname: "BABATUNDE",
    gender: "m",
    heigth: 175,
    maritalstatus: "single",
    middlename: "OLUWOLE",
    nin: "56789012345",
    nok_address1: "15 UNIVERSITY OF IBADAN ROAD",
    nok_address2: null,
    nok_firstname: "ADEWALE",
    nok_lga: "Ibadan North",
    nok_middlename: "OLUMIDE",
    nok_state: "Oyo",
    nok_surname: "BAKARE",
    nok_town: "IBADAN",
    nspokenlang: "YORUBA",
    ospokenlang: "ENGLISH",
    pfirstname: null,
    pmiddlename: null,
    profession: "FRESH GRADUATE",
    psurname: null,
    religion: "christianity",
    residence_adressline1: "15 UNIVERSITY OF IBADAN ROAD",
    residence_town: "IBADAN",
    residence_lga: "Ibadan North",
    residence_state: "Oyo",
    residencestatus: "resident",
    surname: "BAKARE",
    telephoneno: "08065432109",
    title: "mr",
    trackingid: null,
    photo: PLACEHOLDER_PHOTO,
    signature: PLACEHOLDER_SIGNATURE,
  },
};

/**
 * Mock BVN database
 * Maps BVN to full BVN details
 */
export const bvnDatabase: Record<string, BVNDetails> = {
  // Linked to NIN 12345678901
  "22123456789": {
    bvn: "22123456789",
    firstname: "OLUWASEUN",
    middlename: "ADEBAYO",
    surname: "JOHNSON",
    dateofbirth: "1990-05-15",
    gender: "Male",
    phonenumber: "08012345678",
    phonenumber2: null,
    email: "adebayo.oluwaseun@example.com",
    enrollmentbank: "GTBANK",
    enrollmentbranch: "LEKKI",
    levelofaccount: "Level 3",
    lga: "Eti-Osa",
    stateoforigin: "Lagos",
    stateofresidence: "Lagos",
    maritalstatus: "Single",
    nin: "12345678901",
    registrationdate: "2015-03-20",
    watchlisted: false,
    photo: PLACEHOLDER_PHOTO,
  },

  // Linked to NIN 23456789012
  "22234567890": {
    bvn: "22234567890",
    firstname: "CHIOMA",
    middlename: "ADANNA",
    surname: "NWOSU",
    dateofbirth: "1988-09-22",
    gender: "Female",
    phonenumber: "08098765432",
    phonenumber2: "08123456789",
    email: "chioma.nwosu@example.com",
    enrollmentbank: "ACCESS BANK",
    enrollmentbranch: "IKOYI",
    levelofaccount: "Level 3",
    lga: "Onitsha North",
    stateoforigin: "Anambra",
    stateofresidence: "Lagos",
    maritalstatus: "Married",
    nin: "23456789012",
    registrationdate: "2014-07-15",
    watchlisted: false,
    photo: PLACEHOLDER_PHOTO,
  },

  // Linked to NIN 34567890123
  "22345678901": {
    bvn: "22345678901",
    firstname: "IBRAHIM",
    middlename: "ABUBAKAR",
    surname: "MOHAMMED",
    dateofbirth: "1992-03-10",
    gender: "Male",
    phonenumber: "08087654321",
    phonenumber2: null,
    email: "ibrahim.mohammed@example.com",
    enrollmentbank: "ZENITH BANK",
    enrollmentbranch: "KADUNA MAIN",
    levelofaccount: "Level 2",
    lga: "Kaduna North",
    stateoforigin: "Kaduna",
    stateofresidence: "Kaduna",
    maritalstatus: "Single",
    nin: "34567890123",
    registrationdate: "2016-01-08",
    watchlisted: false,
    photo: PLACEHOLDER_PHOTO,
  },

  // Linked to NIN 45678901234
  "22456789012": {
    bvn: "22456789012",
    firstname: "NGOZI",
    middlename: "CHIDINMA",
    surname: "OKEKE",
    dateofbirth: "1995-11-08",
    gender: "Female",
    phonenumber: "08076543210",
    phonenumber2: null,
    email: "ngozi.okeke@example.com",
    enrollmentbank: "UBA",
    enrollmentbranch: "PORT HARCOURT",
    levelofaccount: "Level 3",
    lga: "Port Harcourt",
    stateoforigin: "Rivers",
    stateofresidence: "Rivers",
    maritalstatus: "Single",
    nin: "45678901234",
    registrationdate: "2017-05-22",
    watchlisted: false,
    photo: PLACEHOLDER_PHOTO,
  },

  // Linked to NIN 56789012345
  "22567890123": {
    bvn: "22567890123",
    firstname: "BABATUNDE",
    middlename: "OLUWOLE",
    surname: "BAKARE",
    dateofbirth: "1998-07-25",
    gender: "Male",
    phonenumber: "08065432109",
    phonenumber2: null,
    email: "tunde.bakare@example.com",
    enrollmentbank: "FIRST BANK",
    enrollmentbranch: "UNIVERSITY OF IBADAN",
    levelofaccount: "Level 1",
    lga: "Ibadan North",
    stateoforigin: "Oyo",
    stateofresidence: "Oyo",
    maritalstatus: "Single",
    nin: "56789012345",
    registrationdate: "2020-02-14",
    watchlisted: false,
    photo: PLACEHOLDER_PHOTO,
  },
};

/**
 * Phone to NIN/BVN mapping for phone verification
 */
export const phoneDatabase: Record<
  string,
  { nin: string | null; bvn: string | null; carrier: string }
> = {
  "08012345678": { nin: "12345678901", bvn: "22123456789", carrier: "MTN" },
  "08098765432": { nin: "23456789012", bvn: "22234567890", carrier: "Airtel" },
  "08087654321": { nin: "34567890123", bvn: "22345678901", carrier: "MTN" },
  "08076543210": { nin: "45678901234", bvn: "22456789012", carrier: "Glo" },
  "08065432109": { nin: "56789012345", bvn: "22567890123", carrier: "9mobile" },
};

/**
 * Get NIN details by NIN number
 */
export function getNINDetails(nin: string): NINDetails | null {
  return ninDatabase[nin] || null;
}

/**
 * Get BVN details by BVN number
 */
export function getBVNDetails(bvn: string): BVNDetails | null {
  return bvnDatabase[bvn] || null;
}

/**
 * Get phone verification details
 */
export function getPhoneDetails(
  phoneNumber: string
): { nin: string | null; bvn: string | null; carrier: string } | null {
  // Normalize phone number (remove +234 prefix, add 0)
  let normalized = phoneNumber.replace(/^\+234/, "0").replace(/\s/g, "");
  if (normalized.startsWith("234")) {
    normalized = "0" + normalized.slice(3);
  }
  return phoneDatabase[normalized] || null;
}

/**
 * Find NIN by linked BVN
 */
export function findNINByBVN(bvn: string): string | null {
  const bvnDetails = bvnDatabase[bvn];
  return bvnDetails?.nin || null;
}

/**
 * Find BVN by linked NIN
 */
export function findBVNByNIN(nin: string): string | null {
  for (const [bvn, details] of Object.entries(bvnDatabase)) {
    if (details.nin === nin) {
      return bvn;
    }
  }
  return null;
}
