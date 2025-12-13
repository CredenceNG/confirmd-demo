# Credential Attributes Reference

This document lists all credential types and their attributes used in the ConfirmD demo application.

---

## Education Credentials

### 1. Student Card

**Schema:** Student Card
**Credential Definition:** `ISSUE_CRED_DEF_ID`
**Total Attributes:** 15

| # | Attribute Name | Description | Example Value |
|---|----------------|-------------|---------------|
| 1 | `admission_number` | Student admission number | ADM/2020/0001 |
| 2 | `programme` | Academic programme/course | Computer Science |
| 3 | `graduation_year` | Expected year of graduation | 2024 |
| 4 | `surname` | Student's surname | Johnson |
| 5 | `school_name` | Name of educational institution | University of Lagos |
| 6 | `national_id_number` | National ID Number (NIN) | 12345678901 |
| 7 | `department` | Academic department | Computer Science |
| 8 | `othernames` | Other names (first & middle) | Oluwaseun Adebayo |
| 9 | `matric_number` | Matriculation number | UNI/CSC/20/0001 |
| 10 | `date_issued` | Date credential was issued | 2024-01-15T10:30:00 |
| 11 | `date_expiry` | Credential expiry date | 2025-01-15T10:30:00 |
| 12 | `bank_verification_number` | Bank Verification Number (BVN) | 22123456789 |
| 13 | `school_nuc_number` | NUC registration number | NUC/123/0001 |
| 14 | `jamb_number` | JAMB registration number | 12345678XX |
| 15 | `date_of_birth` | Student's date of birth | 1990-05-15T00:00:00 |
| 16 | `gender` | Student's gender | Male |

---

### 2. Statement of Results (Academic Transcript)

**Schema:** Statement of Results
**Credential Definition:** `STATEMENT_OF_RESULT_CRED_DEF_ID`
**Total Attributes:** 13

| # | Attribute Name | Description | Example Value |
|---|----------------|-------------|---------------|
| 1 | `surname` | Student's surname | Nwosu |
| 2 | `othernames` | Other names (first & middle) | Chioma Adanna |
| 3 | `Department` | Academic department (capitalized) | Accounting |
| 4 | `Faculty` | Faculty name (capitalized) | Social Sciences |
| 5 | `matric_number` | Matriculation number | UNI/ACC/18/0042 |
| 6 | `admission_number` | Student admission number | ADM/2018/0042 |
| 7 | `year_end` | Year of graduation | 2022 |
| 8 | `issued_date` | Date transcript was issued | 2022-11-20 |
| 9 | `programme` | Academic programme/course | B.Sc Accounting |
| 10 | `class_of_degree` | Degree classification | Second Class Upper |
| 11 | `awarded_degree` | Degree awarded | Bachelor of Science |
| 12 | `year_start` | Year of admission | 2018 |
| 13 | `school_ref_number` | School reference number | SOR/2022/123456 |

---

### 3. Medical Fitness Certificate

**Schema:** Medical Fitness Certificate
**Credential Definition:** `MEDICAL_FITNESS_CRED_DEF_ID`
**Total Attributes:** 13

| # | Attribute Name | Description | Example Value |
|---|----------------|-------------|---------------|
| 1 | `surname` | Individual's surname | Mohammed |
| 2 | `othernames` | Other names (first & middle) | Ibrahim Abubakar |
| 3 | `date_of_birth` | Date of birth | 1992-03-10 |
| 4 | `gender` | Gender | Male |
| 5 | `national_id_number` | National ID Number (NIN) | 34567890123 |
| 6 | `examination_date` | Date of medical examination | 2024-01-05 |
| 7 | `blood_pressure` | Blood pressure reading | 120/80 |
| 8 | `blood_group` | Blood group | O+ |
| 9 | `genotype` | Genotype | AA |
| 10 | `fitness_declaration` | Fitness status declaration | Fit for Service |
| 11 | `other_fitness_info` | Additional medical notes | None |
| 12 | `issuer_reference_number` | Certificate reference number | MFC-1704470400000 |
| 13 | `issued_date` | Date certificate was issued | 2024-01-05 |
| 14 | `expiry_date` | Certificate expiry date | 2025-01-05 |

---

## Government/NYSC Credentials

### 4. NYSC Green Card (Phase 1)

**Schema:** NYSC Green Card
**Credential Definition:** `NYSC_GREEN_CARD_CRED_DEF_ID`
**Total Attributes:** 10

| # | Attribute Name | Description | Example Value |
|---|----------------|-------------|---------------|
| 1 | `surname` | Corps member's surname | Bakare |
| 2 | `othernames` | Other names (first & middle) | Babatunde Oluwole |
| 3 | `call_up_number` | NYSC call-up number | NYSC/OY/2024/123456 |
| 4 | `address` | Contact address | 15 University of Ibadan Road, Ibadan |
| 5 | `phone_number` | Contact phone number | 08065432109 |
| 6 | `emergency_contact_fullname` | Emergency contact full name | Adewale Olumide Bakare |
| 7 | `emergency_contact_phone_number` | Emergency contact phone | 08012345678 |
| 8 | `emergency_contact_relationship` | Relationship to emergency contact | Father |
| 9 | `emergency_contact_address` | Emergency contact address | Same as above |
| 10 | `service_perssonnel` | Is service personnel (military/paramilitary) | No |

---

### 5. NYSC ID Card (Phase 2)

**Schema:** NYSC ID Card
**Credential Definition:** `NYSC_ID_CARD_CRED_DEF_ID`
**Total Attributes:** 8

| # | Attribute Name | Description | Example Value |
|---|----------------|-------------|---------------|
| 1 | `surname` | Corps member's surname | Bakare |
| 2 | `othernames` | Other names (first & middle) | Babatunde Oluwole |
| 3 | `id_number` | NYSC ID card number | NYSC-1704470400000 |
| 4 | `service_state` | State of deployment | Lagos |
| 5 | `service_start_date` | Service start date | 2024-03-01 |
| 6 | `service_end_date` | Service end date | 2025-02-28 |
| 7 | `issued_date` | ID card issue date | 2024-03-01 |
| 8 | `expiry_date` | ID card expiry date | 2026-02-28 |

---

### 6. NYSC Certificate of National Service (Phase 4)

**Schema:** NYSC Certificate
**Credential Definition:** `NYSC_CERTIFICATE_CRED_DEF_ID`
**Total Attributes:** 6

| # | Attribute Name | Description | Example Value |
|---|----------------|-------------|---------------|
| 1 | `full_name` | Full name of corps member | Babatunde Oluwole Bakare |
| 2 | `call_up_number` | NYSC call-up number | NYSC/OY/2024/123456 |
| 3 | `start_date` | Service start date | 2024-03-01 |
| 4 | `end_date` | Service end date | 2025-02-28 |
| 5 | `issued_date` | Certificate issue date | 2025-03-15 |
| 6 | `certificate_number` | Certificate number | CERT/2025/123456 |

---

## Finance Credentials

### 7. eKYC (Electronic Know Your Customer)

**Schema:** eKYC Credential
**Credential Definition:** `EKYC_CRED_DEF_ID`
**Total Attributes:** 12

| # | Attribute Name | Description | Example Value |
|---|----------------|-------------|---------------|
| 1 | `full_name` | Customer's full name | Oluwaseun Adebayo Johnson |
| 2 | `date_of_birth` | Date of birth | 1990-05-15T00:00:00 |
| 3 | `national_id_number` | National ID Number (NIN) | 12345678901 |
| 4 | `bank_verification_number` | Bank Verification Number (BVN) | 22123456789 |
| 5 | `gender` | Gender | Male |
| 6 | `phone_number` | Contact phone number | 08012345678 |
| 7 | `residential_address` | Residential address | 15 Admiralty Way, Lekki Phase 1, Lagos |
| 8 | `state_of_origin` | State of origin | Lagos |
| 9 | `lga` | Local Government Area | Eti-Osa |
| 10 | `nationality` | Nationality | Nigerian |
| 11 | `kyc_verification_date` | Date of KYC verification | 2024-01-15T10:30:00 |
| 12 | `kyc_status` | KYC verification status | VERIFIED |

---

## Credential Attribute Count Summary

| Credential Type | Total Attributes | Category |
|----------------|------------------|----------|
| Student Card | 16 | Education |
| Statement of Results | 13 | Education |
| Medical Fitness Certificate | 14 | Education/Health |
| NYSC Green Card | 10 | Government |
| NYSC ID Card | 8 | Government |
| NYSC Certificate | 6 | Government |
| eKYC | 12 | Finance |

---

## Common Attributes Across Credentials

### Identity Attributes
- `surname` / `full_name` - Present in all credentials
- `othernames` - Present in 6 out of 7 credentials
- `national_id_number` - Present in 4 credentials (Student Card, Medical Fitness, eKYC)
- `date_of_birth` - Present in 3 credentials (Student Card, Medical Fitness, eKYC)
- `gender` - Present in 3 credentials (Student Card, Medical Fitness, eKYC)

### Contact Attributes
- `phone_number` - Present in 3 credentials (NYSC Green Card, NYSC ID Card Emergency, eKYC)
- `address` / `residential_address` - Present in 2 credentials (NYSC Green Card, eKYC)

### Academic Attributes
- `matric_number` - Present in 2 credentials (Student Card, Statement of Results)
- `programme` - Present in 2 credentials (Student Card, Statement of Results)
- `department` / `Department` - Present in 2 credentials (Student Card, Statement of Results)

### Temporal Attributes
- `issued_date` - Present in 4 credentials (Student Card, Statement of Results, Medical Fitness, NYSC ID, NYSC Certificate)
- `expiry_date` / `date_expiry` - Present in 3 credentials (Student Card, Medical Fitness, NYSC ID)

---

## Notes

1. **Attribute Naming Convention**: Most attributes use snake_case (e.g., `date_of_birth`), but Statement of Results uses PascalCase for `Department` and `Faculty`.

2. **Required vs Optional**: All attributes shown are marked as `isRequired: true` in the credential issuance payloads.

3. **Default Values**: If a value is not provided, defaults are used:
   - Text fields: `"N/A"`
   - Numbers (NIN/BVN): `"00000000000"`
   - Dates: Current timestamp or calculated based on context
   - IDs: Auto-generated (e.g., `NYSC-{timestamp}`)

4. **NYSC Credential Lifecycle**: The NYSC demo demonstrates a 4-phase credential lifecycle where later credentials reference earlier ones:
   - Phase 1: Green Card (requires Student Card + Statement of Results + Medical Fitness)
   - Phase 2: ID Card (requires Green Card)
   - Phase 3: Portal Access (requires ID Card)
   - Phase 4: Certificate (requires completed service)

5. **Credential Verification**: Proof requests can specify specific credentials by their Schema ID and Credential Definition ID to ensure only credentials from authorized issuers are accepted.
