export const DATA_SHARING_POLICY = `
# Data Sharing and Security Policy

**Voice of the People**
Effective Date: June 28, 2026
Version: 1.0

---

## 1. Overview

This Data Sharing and Security Policy describes in detail what data we share, with whom, under what conditions, and how we protect it. This document supplements our Privacy Policy and is intended to provide transparency to voters, candidates, political advertisers, and other stakeholders who interact with the Voice of the People platform.

---

## 2. Data Shared With Candidates

When a verified candidate or their authorized campaign staff accesses Voice of the People, they can view data about voters in their geographic district(s). We carefully limit what candidates can see to protect voter privacy while enabling meaningful civic engagement.

### 2.1 What Candidates Can See

| Data Element | Shared? | Details |
|---|---|---|
| Voter first name and last initial | Yes | e.g., "Jane D." |
| Voter's public questions | Yes | Only questions submitted publicly |
| Voter's district membership | Yes | Which districts the voter belongs to, not their address |
| Question upvote counts | Yes | Aggregate count only, not which voters upvoted |
| Topic-level engagement statistics | Yes | Anonymized, district-level summaries |
| Voter email address | No | Never shared with candidates |
| Voter full name | No | Never shared with candidates |
| Voter address or address hash | No | Never shared with candidates |
| Voter device information | No | Never shared with candidates |
| Voter identity verification data | No | Never shared with candidates |

### 2.2 How Candidate Access Is Controlled

- Candidates must complete identity verification via Persona and demonstrate eligibility (active candidacy for a Wisconsin office) before gaining candidate-level access.
- Candidates can only view data for voters in the districts they are running to represent.
- All candidate access is logged. Logs are retained for 12 months and may be reviewed for compliance purposes.
- Candidates agree to a Candidate Use Agreement that prohibits using voter data for purposes outside of the platform (e.g., exporting voter information to external databases, using engagement data for commercial purposes unrelated to their campaign).

### 2.3 Questions and Upvotes

- Questions submitted by voters are transmitted to the relevant candidate's dashboard along with the voter's pseudonymous identifier (first name, last initial) and verified district memberships.
- Upvote counts are shared as aggregate numbers. The platform does not reveal the identities of voters who upvoted a particular question.
- If a voter deletes their account or removes a question, the content is removed from candidate-facing views within 24 hours.

---

## 3. Data Shared With Political Advertisers

Campaigns, political action committees (PACs), political party conventions, and major donors ("Political Advertisers") may purchase advertising packages on Voice of the People. We impose strict limits on what data Political Advertisers receive.

### 3.1 What Political Advertisers Can See

Political Advertisers receive **only aggregate, district-level data**. This means:

- **Audience size estimates:** The approximate number of verified active voters in a given district or set of districts. These numbers are rounded to the nearest 50 to prevent reverse-identification.
- **Ad performance metrics:** Total impressions delivered, tap-through rates, and opt-out rates, reported at the district level. No individual voter identifiers are included.
- **Topic interest indices:** Anonymized, aggregate scores indicating voter interest in broad topic categories (e.g., "Economy," "Healthcare," "Education") at the district level. These scores are derived from upvoting patterns and are never linked to individual voters.

### 3.2 What Political Advertisers Cannot See

- Any personally identifiable information (PII) about individual voters, including name, email address, device identifiers, or address.
- Which specific voters saw or tapped on their ad.
- Any voter-level behavioral data.

### 3.3 Advertiser Data Agreement

Before purchasing advertising, Political Advertisers must execute a Political Advertiser Data Agreement that:

- Prohibits use of any platform-derived data for purposes other than evaluating their own ad campaigns.
- Prohibits attempts to re-identify anonymized aggregate data.
- Requires compliance with all applicable federal and state campaign finance laws, including Federal Election Commission (FEC) regulations.

---

## 4. Political Ad Transparency

Voice of the People is committed to full transparency regarding paid political advertising on the platform.

### 4.1 Labeling Requirements

Every paid political advertisement displayed on the platform must:

- Bear the label **"PAID POLITICAL ADVERTISEMENT"** in a clearly visible location.
- Display the full legal name of the sponsoring organization or individual.
- Display the FEC registration number of the sponsor, where applicable.
- Include a tap-accessible disclosure screen showing: sponsor name, sponsor contact information, total estimated expenditure for the ad campaign (updated weekly), and the geographic districts targeted.

### 4.2 FEC Compliance

Voice of the People maintains records of all political advertising transactions, including sponsor identity, expenditure amounts, ad content, and targeting parameters, in accordance with FEC recordkeeping requirements for online platforms. These records are retained for a minimum of three (3) years following the date of the advertisement.

### 4.3 Public Ad Archive

Summaries of all political advertising campaigns run on the platform (sponsor name, district targeted, approximate spend range, campaign dates, and a copy of the ad creative) are made available in a publicly accessible Ad Archive within the App and on our website. Individual voter data is never included in the Ad Archive.

---

## 5. Third-Party Service Providers

Voice of the People uses the following third-party services that may process user data as part of platform operations. Each is engaged under a Data Processing Agreement (DPA) that requires them to protect data consistent with this policy.

### 5.1 Supabase

- **Purpose:** Cloud-hosted PostgreSQL database and authentication.
- **Data processed:** All user account data, voter profiles, candidate profiles, questions, upvotes, and ad campaign metadata.
- **Security:** Data is encrypted at rest and in transit. Row-level security (RLS) policies are enforced at the database layer to ensure users can only access data they are authorized to see.
- **Location:** United States.
- **Privacy policy:** https://supabase.com/privacy

### 5.2 Stripe

- **Purpose:** Payment processing for candidate and advertiser subscription and advertising packages.
- **Data processed:** Payment card information (processed directly by Stripe; we never store raw card numbers), billing address, transaction history.
- **Security:** PCI-DSS Level 1 compliant.
- **Location:** United States.
- **Privacy policy:** https://stripe.com/privacy

### 5.3 Persona

- **Purpose:** Identity verification for voters (Wisconsin resident, 18+) and candidates (verified candidacy).
- **Data processed:** Government-issued ID images and selfie photos during verification. Voice of the People receives only a pass/fail result and a verification token; we do not store ID images.
- **Security:** SOC 2 Type II certified.
- **Location:** United States.
- **Privacy policy:** https://withpersona.com/legal/privacy-policy

### 5.4 Upstash

- **Purpose:** Redis-based rate limiting, caching, and real-time feature support.
- **Data processed:** Temporary, short-lived cache entries that may include session tokens and rate-limiting counters. No long-term personal data is stored in Upstash.
- **Security:** Data encrypted at rest and in transit; entries expire automatically.
- **Location:** United States.
- **Privacy policy:** https://upstash.com/trust/privacy.pdf

### 5.5 Google Civic Information API

- **Purpose:** Mapping voter addresses to official voting districts.
- **Data processed:** We submit a hashed representation of the voter's address. Google's API returns district information.
- **Data shared:** We share only the address hash with Google for the purpose of district lookup. We do not send voter names, emails, or other identifiers.
- **Privacy policy:** https://policies.google.com/privacy

---

## 6. Security Measures

Voice of the People implements multiple layers of technical and organizational security controls.

### 6.1 Encryption

- **In transit:** All data transmitted between users' devices and our servers is encrypted using TLS 1.2 or higher. Connections using older protocols are rejected.
- **At rest:** All data stored in Supabase is encrypted at rest using AES-256. Database backups are also encrypted.
- **Address hashing:** Voter addresses are one-way hashed before storage using a salted cryptographic hash function. The original address cannot be reconstructed from the hash.

### 6.2 Access Controls

- **Row-Level Security (RLS):** Supabase RLS policies are enforced at the database layer, ensuring that even if application-level access controls were bypassed, users and service roles cannot access data outside their authorized scope.
- **Principle of least privilege:** Service accounts and API keys are scoped to the minimum permissions required for their function.
- **Multi-factor authentication:** Required for all Voice of the People administrative accounts.
- **Audit logging:** All administrative access to production systems is logged and reviewed.

### 6.3 Identity Verification

- All voter accounts require successful completion of Persona identity verification before full platform access is granted.
- Candidate accounts require an additional layer of verification confirming active candidacy for a Wisconsin office.

### 6.4 Application Security

- Input validation and parameterized queries to prevent SQL injection.
- Rate limiting via Upstash on all public-facing API endpoints to mitigate brute force and abuse.
- Regular dependency audits and security patch management.
- Penetration testing conducted at least annually by an independent third party.

### 6.5 Physical Security

Voice of the People does not operate its own data centers. All infrastructure is hosted with Supabase, which maintains physical security controls including access logging, surveillance, and physical access restrictions at their facilities.

---

## 7. Data Retention

| Data Category | Retention Period |
|---|---|
| Active voter account data | Retained for the life of the account |
| Active candidate account data | Retained for the life of the account |
| Deleted account personal data | 90 days from deletion, then permanently purged |
| Questions and public content | Removed within 24 hours of account deletion or content removal |
| Ad campaign records (FEC) | Minimum 3 years from date of advertisement |
| Audit and access logs | 12 months |
| Payment transaction records | 7 years (tax and legal compliance) |
| Anonymized aggregate analytics | Indefinite (no link to individual users) |

When data reaches the end of its retention period, it is either permanently deleted or irreversibly anonymized. We do not retain personal data beyond these periods except where required by a legal hold or active legal proceeding.

---

## 8. Data Breach Notification

In the event of a security incident involving unauthorized access to, or disclosure of, personal information, Voice of the People will:

1. **Contain and investigate** the breach immediately upon discovery.
2. **Notify affected users** within **72 hours** of discovery via email and in-app notification. The notice will describe: the nature of the breach, the data categories involved, the approximate date and time of the incident, our response actions, and steps users can take to protect themselves.
3. **Notify regulatory authorities** as required by Wisconsin law and applicable federal regulations within the timeframes mandated.
4. **Provide ongoing updates** as the investigation progresses.

If the breach involves fewer than 500 individuals and poses a low risk of harm, we may document the breach internally and provide notification in the next regular communication cycle, consistent with applicable law.

---

## 9. Cross-Border Data Transfers

Voice of the People is based in Wisconsin, USA, and all data is processed and stored within the United States. We do not currently transfer personal data outside of the United States.

---

## 10. Changes to This Policy

We may update this Data Sharing and Security Policy periodically. When we do, we will update the "Effective Date" at the top of the document and provide in-app notice. Material changes will be communicated prominently. Continued use of the App after the effective date constitutes acceptance of the updated policy.

---

## 11. Contact

For questions about this Data Sharing and Security Policy, data requests, or to report a security concern:

**Email:** privacy@voiceofthepeople.com

To report a security vulnerability responsibly, please email: security@voiceofthepeople.com

We will acknowledge security reports within 48 hours.
`

export const DATA_SHARING_POLICY_VERSION = '1.0'
export const DATA_SHARING_POLICY_DATE = '2026-06-28'
