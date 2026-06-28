export const PRIVACY_POLICY = `
# Privacy Policy

**Voice of the People**
Effective Date: June 28, 2026
Version: 1.0

---

## 1. Introduction

Voice of the People ("we," "us," or "our") is a civic engagement platform that connects Wisconsin voters with political candidates. We are committed to protecting your personal information and being transparent about how we collect, use, and share it. This Privacy Policy explains our practices in plain language.

By creating an account or using the Voice of the People mobile application (the "App"), you agree to the terms of this Privacy Policy. If you do not agree, please do not use the App.

---

## 2. Information We Collect

### 2.1 Information You Provide Directly

- **Full Name:** Used to create your voter profile and verify eligibility.
- **Email Address:** Used for account authentication, notifications, and communications.
- **Residential Address (Hashed):** We hash your address using a one-way cryptographic process. We do not store your street address in plain text. The hash is used solely to determine your voting district assignments.
- **Voting District:** Derived from your address hash in combination with the Google Civic Information API. This tells us which federal, state, and local districts you reside in.
- **Government-Issued Identity Data (via Persona):** To verify that you are a real Wisconsin resident aged 18 or older, we use Persona, a third-party identity verification service. Persona may collect a photo of your ID document and a selfie. We receive only a pass/fail verification result and a unique verification token; we do not store copies of your ID documents.

### 2.2 Information Collected Automatically

- **Device Information:** Device model, operating system version, unique device identifiers, and mobile network information.
- **App Usage Data:** Pages viewed, features used, time spent in the App, button taps, and navigation paths.
- **Log Data:** IP address, timestamps, crash reports, and error logs.
- **Push Notification Tokens:** If you enable push notifications, we collect a device token to deliver them.

### 2.3 Information From Third Parties

- **Google Civic Information API:** We query this API using your hashed address to retrieve your official district memberships (congressional district, state senate district, state assembly district, county, municipality, and school board district).
- **Persona:** Identity verification result (verified / not verified) and a fraud-risk signal.

---

## 3. How We Use Your Information

### 3.1 Platform Operation

- Authenticate your account and keep it secure.
- Display your verified voter status to candidates in your districts.
- Route your questions and upvotes to the candidates who represent your geographic districts.
- Enforce eligibility requirements (Wisconsin resident, 18+).

### 3.2 District Matching and Candidate Visibility

Your voting district data is the core of how the App works. We use it to:

- Show you only the candidates and elected officials who represent your specific districts.
- Show candidates only the questions and engagement from voters in their districts.
- Ensure political advertising is shown only to voters in the advertiser's targeted districts.

### 3.3 Political Advertising

Voice of the People displays targeted political advertisements. Here is what you need to know:

- **How it works:** Campaigns, political action committees (PACs), political party conventions, and major donors ("Political Advertisers") may purchase advertising packages to display sponsored content to voters in specific geographic districts.
- **Targeting:** Ads are targeted by voting district only. We do not share your name, email address, or any personally identifiable information with Political Advertisers for targeting purposes.
- **Labeling:** Every political advertisement is clearly labeled "PAID POLITICAL ADVERTISEMENT" and includes the name of the sponsoring organization and, where applicable, their Federal Election Commission (FEC) registration number.
- **Your choice:** You may opt out of seeing political advertisements at any time by going to **Settings > Privacy > Political Advertising** and toggling off "Show Political Ads." Opting out does not affect your ability to use any other feature of the App.

### 3.4 Platform Improvement and Analytics

We use aggregated, anonymized usage data to understand how voters and candidates use the App, identify bugs, improve features, and plan new functionality. This data cannot be used to identify you individually.

### 3.5 Legal Compliance

We may use and disclose your information as required by applicable law, court order, subpoena, or governmental authority, or to protect the rights, property, or safety of Voice of the People, our users, or the public.

---

## 4. How We Share Your Information

### 4.1 With Candidates in Your District

Candidates and their authorized campaign staff who represent your voting districts can see:

- Your first name and last initial (e.g., "Jane D.").
- The text of questions you have submitted publicly.
- The number of upvotes a question has received (not which specific voters upvoted).
- Your verified district memberships (which districts you are in, not your address).
- Anonymized engagement statistics (e.g., "47 voters in the 25th Assembly District asked about this topic").

Candidates **cannot** see your email address, full address hash, or device information.

### 4.2 With Political Advertisers

We share **only aggregate, anonymized data** with Political Advertisers. This means:

- District-level engagement statistics (e.g., total active voters in a district, general topic interest percentages).
- Ad performance metrics (impressions, tap-through rates) reported at the district level.

We **never** share your name, email address, device identifiers, or any other personally identifiable information with Political Advertisers.

### 4.3 With Service Providers

We work with trusted third-party service providers who process data on our behalf under contractual obligations to protect it:

- **Supabase:** Cloud database and authentication infrastructure. Your data is stored in Supabase's hosted PostgreSQL environment with row-level security (RLS) policies enforced.
- **Stripe:** Payment processing for candidate advertising packages. We do not store credit card numbers; Stripe handles all payment data under PCI-DSS compliance.
- **Persona:** Identity verification. Persona processes your ID documents under their own privacy policy and provides us only with a verification result.
- **Upstash:** Redis-based rate limiting and caching layer used for platform performance and abuse prevention.
- **Google Civic Information API:** District lookup from your hashed address.

### 4.4 Legal Disclosures

We may disclose your information if required by law, to comply with legal process, to enforce our Terms of Service, or to protect the safety of users or the public.

### 4.5 Business Transfers

If Voice of the People is acquired, merges with another company, or transfers substantially all of its assets, your information may be transferred as part of that transaction. We will notify you via email or an in-app notice before your data is transferred and becomes subject to a different privacy policy.

### 4.6 No Sale of Personal Data

We do not sell your personal information to third parties, consistent with the Wisconsin Consumer Act and applicable state privacy laws.

---

## 5. Data Retention

- **Active accounts:** We retain your personal information for as long as your account is active.
- **Deleted accounts:** When you delete your account, we retain your data for 90 days to allow for fraud prevention, legal hold compliance, and account recovery if the deletion was in error. After 90 days, your personal information is permanently deleted or irreversibly anonymized.
- **Anonymized data:** Aggregate, anonymized data (with no link back to you) may be retained indefinitely for platform analytics.

---

## 6. Your Rights and Choices

### 6.1 Access

You may request a copy of the personal information we hold about you by contacting us at privacy@voiceofthepeople.com.

### 6.2 Correction

If your information is inaccurate, you may update it in **Settings > Account** or by contacting us.

### 6.3 Deletion

You may delete your account at any time in **Settings > Account > Delete Account**. As noted above, data is permanently purged after a 90-day retention window.

### 6.4 Opt Out of Political Advertising

You may opt out of seeing political advertisements at any time in **Settings > Privacy > Political Advertising**.

### 6.5 Push Notifications

You may disable push notifications in your device's operating system settings at any time.

### 6.6 California and Other State Residents

If you are a resident of a state with applicable consumer privacy laws (including California's CCPA/CPRA), you may have additional rights, including the right to know, correct, delete, and opt out of the sale or sharing of personal information. Contact us at privacy@voiceofthepeople.com to exercise these rights.

---

## 7. Security

We implement industry-standard technical and organizational measures to protect your information, including:

- Encryption of data in transit using TLS 1.2 or higher.
- Encryption of data at rest within our database infrastructure.
- Row-level security (RLS) policies enforced at the database layer via Supabase.
- Identity verification of all voters via Persona before account activation.
- Rate limiting via Upstash to prevent automated abuse.
- Regular security reviews of our codebase and infrastructure.

No method of electronic storage or transmission is 100% secure. In the event of a data breach involving your personal information, we will notify you within 72 hours of discovery, as required by applicable law.

---

## 8. Children's Privacy

Voice of the People is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has created an account, please contact us at privacy@voiceofthepeople.com and we will promptly delete the account.

---

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. When we do, we will revise the "Effective Date" at the top of this document. For material changes, we will provide prominent in-app notice and, where required by law, seek your renewed consent. Continued use of the App after the effective date of an updated policy constitutes acceptance of the new terms.

---

## 10. Contact Us

If you have questions, concerns, or requests related to this Privacy Policy, please contact us:

**Email:** privacy@voiceofthepeople.com

**Mailing Address:**
Voice of the People
Privacy Team
Wisconsin, USA

We will respond to all inquiries within 30 days.
`

export const PRIVACY_POLICY_VERSION = '1.0'
export const PRIVACY_POLICY_DATE = '2026-06-28'
