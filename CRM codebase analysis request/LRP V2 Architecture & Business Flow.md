# LRP V2 — Business & Technical Architecture

**Solverminds · Ocean Carrier E-Commerce Platform**

The end-to-end business flow of the LRP liner e-commerce portal, mapped module by module and layer by layer.

| Document | Version | Status | Scope |
|---|---|---|---|
| Architecture & Flow | 1.0 — Draft | As-built review | 12 modules |

---

## Document control

| | |
|---|---|
| **Purpose** | Explain how the LRP V2 portal works as a business — the shipment lifecycle it supports, the modules that deliver it, and the technical layers that run underneath — so that product, delivery, onboarding, QA and client stakeholders share one reference. |
| **Audience** | New developers & onboarding engineers · solution architects & tech leads · business & product stakeholders · client / handover readers · QA & support teams. |
| **Primary goal** | Business-process understanding, with a balanced view of the supporting technical architecture at the component level. |
| **Scope** | The two deployable units of the online channel: the web application (presentation + control) and the business/application module (services + data access), plus the external systems they integrate with. |
| **Out of scope** | The carrier's core operational back-office suite, physical terminal/port systems, and line-by-line source detail. Components are described by role, not by class name. |
| **How to read** | Part 3 is the business spine (the shipment lifecycle). Part 4 walks each module. Part 5 explains the technical layers and integrations. Appendices hold the capability matrix and glossary. |

## Contents

1. Executive summary
2. System overview — business context · actors & roles · access channels · tier architecture · technology stack
3. End-to-end business flow — the shipment lifecycle
4. Module by module — registration & users · access control · schedules · rates & quotation · eBooking · shipping instructions · bill of lading · VGM · tracking · payments & invoicing · insurance / cargo-protect / carbon · arrival, DO/CRO, notices, reports & admin
5. Technical architecture — layered design · request lifecycle · cross-cutting concerns · integration map · domain model · platform evolution
6. Appendices — module capability matrix · glossary · notes & assumptions

---

# 1 · Executive summary

**LRP V2 is the customer-facing e-commerce portal of an ocean container carrier.** It lets shippers, freight forwarders and the carrier's own agency offices carry out the complete export and import shipment lifecycle online — from searching sailing schedules and rates, through placing a booking, filing shipping instructions and verified gross mass, to issuing the bill of lading, paying charges, and tracking the cargo to arrival. Work that once moved by email, phone and counter visits is done as guided, self-service transactions in one web application.

The platform is **white-label and multi-carrier**: the same application is themed and configured per carrier (the login experience alone ships in nine skins) and localized into several languages, including English, Chinese and Spanish. It is built as a classic **three-tier Java enterprise application** — a web presentation and control tier, an EJB business tier, and a stored-procedure data-service tier — talking to the carrier's operational database and to a set of external services for payments, customs/EDI messaging, carbon accounting, mapping and document generation.

**At a glance**

- **12 business modules** spanning the full shipment lifecycle
- **3-tier Java EE** — presentation · business (EJB) · data-service
- **4+ languages** — English, Chinese, Spanish & more
- **2 online payment gateways** — Stripe & N-Genius
- **EDI** — booking & SI exchanged with the carrier back-office
- **~28 AJAX services** powering live, in-page interactions
- **PDF** — Jasper documents: B/L, booking, invoice, CRO & more
- **CO₂e** — carbon emissions estimated per sailing (Climatiq)

## What the platform delivers to the business

- **Self-service the shipment lifecycle.** Customers transact bookings, instructions, VGM and documents themselves, reducing manual data entry and turnaround time for the carrier's commercial and documentation teams.
- **One source of shipment truth.** A booking made online flows forward into shipping instructions, the bill of lading, invoices and tracking — the same reference travels the whole journey, exchanged with the carrier's core systems over EDI.
- **Digital charges and settlement.** Freight and local charges are quoted, invoiced and paid online through integrated payment gateways, with statements and payment history available to the customer.
- **Compliance and transparency built in.** Verified gross mass, dangerous-goods and document uploads support regulatory compliance; live tracking, schedules and a vessel map give customers visibility; carbon estimates support sustainability reporting.
- **Configurable per carrier and per customer.** Cut-off times, visible fields, service restrictions, advisories and module access are all administered from a control panel rather than hard-coded.

> **A note on naming.** Throughout this document, technical components are named by the *role they play* (for example, "the booking control bean" or "the booking data service") rather than by source class names. This keeps the document readable for business and delivery stakeholders while remaining faithful to the actual structure of the system.

---

# 2 · System overview

*Context · Actors · Channels · Architecture · Stack*

Before following the shipment flow, it helps to see the whole board: who uses LRP, how they reach it, where it sits in the carrier's wider landscape, and the technical tiers that make it run.

## 2.1 Business context

LRP is one channel in a larger carrier ecosystem. It is the **digital front door** that customers use to self-serve, but the authoritative shipment, rate, document and finance records live in the carrier's **core operational systems**. LRP captures customer intent and data at the front, validates and enriches it, and exchanges it with those core systems — largely through electronic data interchange (EDI) messages and shared data services. Around this core sit the external services the portal depends on: payment gateways to take money, a carbon-accounting API for emissions, mapping and address services for routing and haulage, mail for notifications, and a reporting engine for printable documents.

> **Domain in one line.** An ocean carrier moves customers' cargo in containers between ports on scheduled vessel voyages. LRP is where the customer and the carrier meet online to agree, document, pay for and track each of those movements.

## 2.2 Actors & roles

The portal serves both external customers and the carrier's own staff, with access shaped by role and by the administrative configuration described in Part 5.

| Actor | Who they are | What they do in LRP |
|---|---|---|
| **Guest / prospect** | An unregistered visitor. | Browses sailing schedules, tariffs and surcharges, tracks a shipment by reference, estimates carbon, and registers for an account. |
| **Registered customer** | A shipper or cargo owner with a login. | The core user — searches rates, places and amends bookings, files shipping instructions and VGM, views the B/L, pays charges, tracks cargo. |
| **Freight forwarder** | An intermediary booking on behalf of cargo owners. | The same transactional set as a customer, typically across many shippers and consignees. |
| **Agency user** | The carrier's local office / agent. | Registers and manages customers, sets special privileges and field configuration, issues advisories, and services bookings on customers' behalf. |
| **Carrier admin / ops** | Head-office administrators. | Runs the control panel — global & cut-off configuration, service restrictions, IP filtering, email templates, and the V1/V2 service switch — plus reports and analytics. |
| **System / scheduled** | Automated processes. | Warms caches at start-up, sends mail alerts and notifications, exchanges EDI files, and receives payment-gateway webhooks. |

## 2.3 Access channels

LRP is reached through the browser as a themed web application. Several access characteristics are worth calling out because they shape the design:

- **Per-carrier login skins.** A landing dispatcher selects one of several branded login experiences (nine variants plus a mobile layout) so the same platform can front different carriers and campaigns.
- **Guest vs. authenticated surface.** Schedules, tariff/surcharge enquiry, tracking and the carbon calculator are reachable before login; the transactional lifecycle (booking, SI, VGM, B/L, payments) requires an authenticated session.
- **Deep-linked partner entry.** External schedule and tracking entry points let partner sites hand users into LRP directly.
- **Localized & secure session.** The UI localizes into multiple languages; sessions are short-lived and carried on secure, HTTP-only cookies.

## 2.4 High-level architecture

LRP follows a conventional layered Java EE design. A request enters through security and analytics filters, is routed by the web/MVC tier to an action, which calls a business-tier component, which in turn calls a data-service component that runs the database work. Cross-cutting concerns (security, caching, validation, localization, reporting, notifications) and external integrations wrap around this spine.

### Diagram 1 — Tier architecture (request flows top to bottom)

```
CLIENTS (browser & partners)
  Desktop web · Mobile web · Per-carrier login skins · Partner deep-links
        │
        ▼
EDGE / CROSS-CUTTING (every request)
  Security filter · XSS blocker · Analytics filter · Session (secure cookie, 30 min)
        │
        ▼
PRESENTATION (what the user sees)
  JSP + Tiles views · Client-side JS · Localization (4+ languages) · JSF (limited)
        │
        ▼
CONTROL / MVC (routing & validation)
  Front controller (*.do) · Actions · Form beans + Validator · ~28 AJAX endpoints · Report & Excel servlets
        │
        ▼
BUSINESS TIER (EJB session beans)
  Booking · Shipping instr. · Bill of lading · VGM · Schedule · Rates/surcharge ·
  Registration · Payment · Finance (Phase 2) · Notice · Amendment · Analytics · Admin
        │
        ▼
DATA SERVICES (DB access — VDS)
  Booking · SI · BL · VGM data services · Registration & dashboard services ·
  Stored-procedure calls · Connection / service locator
        │
        ▼
PERSISTENCE (system of record)
  Carrier operational database · Startup cache
```

*How to read it: each request descends the stack and the response climbs back up. External systems (payments, EDI, carbon, mapping, mail, reporting) attach mainly at the control and business tiers — see Diagram 4.*

## 2.5 Technology stack

The stack is a mature Java enterprise toolset, packaged as a web archive plus a business (EJB) archive and deployed together on a Java EE application server.

### Diagram 7 — Technology & deployment view

- **Client** — HTML, CSS & JavaScript UI; themed asset packs per carrier; browser-side validation and AJAX-driven live fields.
- **Web / MVC framework** — Apache Struts (front controller, action mappings, Tiles page composition, Validator); JSP views; limited JSF; multi-language message resources.
- **Business tier** — Enterprise JavaBeans (session beans) exposing booking, SI, B/L, VGM, schedule, rates, registration, payment, finance and admin services; packaged as an EJB archive.
- **Data access** — A data-service layer (VDS) calling database stored procedures via a JDBC service locator; a value-object model carries data between tiers.
- **Integrations & libraries** — Stripe & N-Genius payments; Climatiq carbon API; EDI over file transfer; Google address/mapping; Jasper reports (PDF); spreadsheet import/export; JavaMail; logging; SHA-256 / crypto utilities.
- **Runtime & operations** — Java EE application server hosting the WAR + EJB JAR; start-up cache warming; secure, HTTP-only session cookies; platform analytics and user-audit capture.

*Deployment: two build units — the web application and the business module — run on one application server against the carrier database, reaching external services over the network and EDI over file transfer.*

---

# 3 · End-to-end business flow

*The shipment lifecycle — the spine of everything LRP does*

Every module in LRP is a stop on one journey: turning a customer's intent to ship cargo into a booked, documented, paid and delivered container movement. Understand this journey and the rest of the system falls into place.

The lifecycle runs in four phases — **plan, book, document, then settle & move**. Each phase hands the next a richer version of the same shipment: a schedule choice becomes a booking, a booking becomes shipping instructions, instructions become a bill of lading, and the bill of lading anchors invoicing, tracking and final release.

### Diagram 2 — The shipment lifecycle (export perspective)

**Phase 1 · Plan**
1. **Register & sign in** — Create and activate an account; enter a themed, secure session.
2. **Find a sailing** — Search schedules by port, by vessel, or between two locations.
3. **Rate & quote** — Check tariff & surcharges, request a rate or price a contract.

**Phase 2 · Book**
4. **Place a booking** — Enter parties, cargo, containers and routing; submit the eBooking.
5. **Confirm** — Booking validated, reference issued and sent to the carrier by EDI.
6. **Equipment & haulage** — Arrange pickup/haulage & appointments; obtain container release.

**Phase 3 · Document**
7. **Shipping instructions** — File the SI before cut-off; transmitted to the carrier by EDI.
8. **Verified gross mass** — Declare VGM per container to meet SOLAS before loading.
9. **Bill of lading** — Carrier drafts B/L from the SI; customer verifies; B/L is issued.

**Phase 4 · Settle & move**
10. **Pay & invoice** — Charges invoiced; pay online; receive receipt & statement.
11. **Track cargo** — Follow container/booking events and vessel position on a live map.
12. **Arrival & release** — Arrival notice, delivery order / import release, manifest.

*Read left to right, top to bottom. Guest users can reach stages 1–3 (and tracking) before login; stages 4–12 require an authenticated session. Import shipments enter the same spine mainly at documentation, tracking and release.*

## 3.1 Plan — schedule & rate

The journey opens with two questions every shipper asks: *when can my cargo sail, and what will it cost?* LRP answers the first through **schedule search** — by port, by vessel, or point-to-point between two locations — returning the voyages, routes and transit legs that connect origin to destination. It answers the second through the **rates** module: customers can browse the published tariff and applicable surcharges, submit a rate request, or price a shipment against a negotiated contract, then save the result as a quotation to carry into a booking.

## 3.2 Book — booking & equipment

With a sailing and a price in hand, the customer places an **eBooking**. This is the pivotal transaction of the whole platform: it captures the parties (shipper, consignee, notify), the cargo and commodities, the container types and quantities, and the routing across legs. On submission the booking is validated, given a booking reference, and transmitted to the carrier's core systems by EDI. Around it sit the equipment concerns — arranging container pickup and **haulage**, booking terminal appointments, and obtaining the container release order that authorizes collection of empty equipment. Bookings can subsequently be **amended** or **cancelled**, with changes flowing back to the carrier.

> **Why the booking matters most.** The booking is the seed record. Its reference, parties, cargo and routing are inherited by the shipping instructions, and from there by the bill of lading, the invoice and every tracking event. Getting the booking right is what makes the rest of the lifecycle flow without re-keying.

## 3.3 Document — shipping instructions, VGM & the B/L

Once cargo is committed, the shipment must be documented for carriage and customs. The customer files **shipping instructions (SI)** — the definitive shipper/consignee/notify details, cargo description, marks and numbers, and B/L preferences — which are validated and sent to the carrier by EDI ahead of the documentation cut-off. In parallel, each packed container's **verified gross mass (VGM)** is declared to satisfy the SOLAS weight requirement before the box can be loaded. The carrier then produces the **bill of lading (B/L)** from the SI; the customer reviews the draft, and once approved the B/L — or a sea waybill — is issued and can be printed.

## 3.4 Settle & move — payment, tracking & release

Charges for the shipment are invoiced and settled online: the customer pays freight and local charges through an integrated **payment gateway**, receives a receipt, and can review invoices, payment history and account statements. As the cargo moves, **tracking** exposes booking and container events and plots the vessel on a live map. At destination the import side of the lifecycle takes over: an **arrival notice** informs the consignee, a **delivery order** authorizes release of the cargo, and the manifest and related documents complete the movement.

## 3.5 The golden thread

What makes the lifecycle coherent is that a small set of references travels the whole way. The booking reference identifies the shipment at booking, is quoted on the SI, and maps to the B/L number; container numbers link cargo to equipment and to VGM; and the B/L anchors invoicing, tracking and release.

```
Booking ref → Shipping instructions → Bill of lading → Invoice & payment → Tracking events → Arrival & delivery order
```

*The same shipment identity is enriched at each stage rather than re-created — the essence of straight-through processing in LRP.*

## 3.6 Export and import perspectives

The spine above is described from the **export** side (the origin, where the shipper books and documents cargo). The **import** side re-uses the same records from the destination: the consignee and agency focus on arrival notices, delivery orders and release, on import charges and payment, and on tracking to the final leg. LRP supports both by keying off the shared shipment references rather than maintaining separate journeys.

| Phase | Export focus (origin) | Import focus (destination) |
|---|---|---|
| **Plan** | Schedule search, rate & quotation. | Confirm inbound sailing & ETA. |
| **Book** | Place booking, equipment & haulage. | Nominated on booking as consignee / notify. |
| **Document** | SI, VGM, B/L issuance. | Review B/L; customs / manifest data. |
| **Settle & move** | Pay origin charges; track departure. | Arrival notice, import charges, delivery order, release. |

---

# 4 · Module by module

*Twelve modules, one lifecycle*

The lifecycle from Part 3 is delivered by twelve business modules. Each is described here in the same shape so they are easy to compare and hand over: its **purpose**, the **actors** who use it, its **key flows**, the **inputs and outputs** it exchanges, and the **integrations and dependencies** it relies on — followed by a flow summary. Modules appear in lifecycle order.

| # | Module | Focus |
|---|---|---|
| 4.1 | Registration, users & agency | Onboarding, customer & agency management, per-customer configuration. |
| 4.2 | Authentication & access control | Login skins, sessions, password reset, privileges. |
| 4.3 | Vessel schedules | Sailing search by port, vessel or location; routes & legs. |
| 4.4 | Rates, quotation & surcharge | Tariff, surcharges, rate requests, contracts, quotations. |
| 4.5 | eBooking | Create, amend, cancel bookings; haulage & appointments. |
| 4.6 | Shipping Instructions | File the definitive documentation instructions (SI). |
| 4.7 | Bill of Lading (DOC) | Draft, verify, issue & print the B/L; manifest. |
| 4.8 | VGM | Declare verified gross mass per container (SOLAS). |
| 4.9 | Tracking & live map | Shipment events, milestones & vessel position. |
| 4.10 | Payments, invoicing & statements | Online payment, invoices, statements, credit control. |
| 4.11 | Insurance, CargoProtect & carbon | Cargo insurance and emissions estimation. |
| 4.12 | Arrival, DO/CRO, notices, reports & admin | Release documents, communications, reporting & control panel. |

## Module 4.1 · Registration, users & agency

*Who exists in LRP and what they may do*

This module controls onboarding and identity. Customers can self-register, or the carrier's agency offices can create and manage customer logins on their behalf. It also holds the per-customer and per-agency configuration that shapes everyone else's experience — which fields appear, which services are allowed, and what advisories are shown.

- **Purpose** — Onboard and maintain customers, users and agency configuration.
- **Actors** — Guest (self-registration), agency user (create/approve customers, field & service configuration, advisories, branding images), customer (profile), admin.
- **Key flows** — New registration & terms acceptance → account save → email activation link → activation; agency-managed customer creation, edit & delete; user creation; special privilege; field configuration; service restriction; customer advisory; branding image upload & re-arrange.
- **Inputs** — Company & contact details, supporting documents, credentials, address (with lookup assistance).
- **Outputs** — A customer account (created as *new*, activated on link click), an activation email, and a registration history / audit trail.
- **Integrations** — Mail (activation), address lookup, file upload, registration data service, captcha.

**Diagram 3.1 — Customer onboarding**
```
Guest → Complete registration → Accept terms + captcha → Save account (status: new)
      → Activation email → Click link → active → Sign in

Agency-managed path:
Agency user → Create / edit customer login → Configure fields & privileges → Publish advisory
```

**Business rules of note.** A newly registered customer is held inactive online until the activation link is used; agency scope limits which customers a user can see; and field/service configuration set here is enforced across the transactional modules.

## Module 4.2 · Authentication & access control

*Getting in, and what you can reach*

Before any transaction, LRP authenticates the user, chooses the branded experience to show, and resolves what that user is allowed to do. Because the platform is white-label, the very first step is selecting which carrier's login skin to present.

- **Purpose** — Authenticate users, present the right branded surface, and enforce role- and privilege-based access.
- **Actors** — All users; admin for privilege and access configuration.
- **Key flows** — Landing dispatcher selects a login skin (nine variants plus mobile); customer/agency/admin sign-in and menu dispatch; self-service password reset via emailed token; admin-initiated reset; special-privilege and menu-access resolution; account lock / expiry handling.
- **Inputs** — Credentials, password-reset tokens.
- **Outputs** — An authenticated, role-scoped session and menu; user-audit entries.
- **Integrations** — Security filter, XSS blocker & IP filter, captcha, mail (reset), crypto (password hashing).

**Diagram 3.2 — Sign-in & access resolution**
```
Visitor → Landing dispatcher → login skin → Enter credentials → Security filter & validation
        → Authenticate → Resolve role & privileges → Role-scoped menu

Password reset path:
Forgot password → Emailed reset token → Validate token → Set new password
```

**Business rules of note.** Sessions expire after a short idle period; locked or expired accounts receive explicit guidance to contact their agency; reset links are single-use and token-validated; and special privileges gate access to specific modules over and above the base role.

## Module 4.3 · Vessel schedules

*When can my cargo sail*

Schedules let customers — and guests — discover the voyages that connect their origin and destination, with the routing and transit legs in between. It is the natural entry point into planning a shipment.

- **Purpose** — Publish and search sailing schedules and routings.
- **Actors** — Guests and registered customers.
- **Key flows** — Search by port, by vessel, or between two locations; view routing & leg details; deep-linked external schedule entry; export vessel information to spreadsheet.
- **Inputs** — Origin / destination ports, vessel, date range.
- **Outputs** — Matching voyages with routes, legs and transit times — or a graceful "no matching schedule" result.
- **Integrations** — Schedule service & cache; spreadsheet export; feeds the carbon calculator and the booking routing step.

**Diagram 3.3 — Schedule search**
```
User → Choose mode: port · vessel · location → Enter criteria & dates → Schedule service
     → Voyages + routes + legs → Proceed to rate / booking
```

*Routing is expressed in transit legs — mainline, feeder, rail, road, barge, combined and inter-terminal — which carry through into booking and carbon estimation.*

## Module 4.4 · Rates, quotation & surcharge

*What will it cost*

The rates module turns a trade lane and cargo profile into a price. It spans open enquiry (published tariff and surcharges, available to guests) and account-based pricing (rate requests, negotiated contracts, and saved quotations that flow into a booking).

- **Purpose** — Price shipments through tariff, surcharge, contract and quotation flows.
- **Actors** — Guests (tariff & surcharge enquiry), customers (rate requests, contracts, quotes).
- **Key flows** — Tariff enquiry; surcharge lookup; rate request; contract-based rates; rate quote; save quotation; all-in amount & surcharge calculation; commodity search.
- **Inputs** — Trade lane, commodity, container type / equipment, contract reference.
- **Outputs** — A rate breakdown with surcharges, an all-in amount, and a saved quotation.
- **Integrations** — Rates service & surcharge calculator; commodity reference data.

**Diagram 3.4 — Pricing a shipment**
```
User → Select lane · commodity · equipment → Tariff or contract? → Rate + surcharge calculation
     → All-in amount → Save quotation → Carry into booking
```

*Surcharges are applied on top of the base rate through a dedicated calculation to produce the all-in amount the customer commits to.*

## Module 4.5 · eBooking

*The pivotal transaction*

eBooking is where intent becomes commitment. It captures everything the carrier needs to accept the cargo — the parties, the goods, the equipment and the routing — validates it, and transmits it to the carrier's core systems. Every downstream document inherits from the record created here.

- **Purpose** — Create, view, amend and cancel container bookings.
- **Actors** — Customers, freight forwarders and agency users.
- **Key flows** — New booking across parties, cargo/commodities, containers, routing and haulage → validate → submit; view-all bookings; edit; amendment (with amendment notification); cancellation; booking & terminal appointment; routing details; spreadsheet import of bookings; booking preview & print.
- **Inputs** — Shipper / consignee / notify parties, cargo & commodity, container types & counts, routing, references, haulage, document uploads (VGM, dangerous-goods, MSDS, other).
- **Outputs** — A booking reference and confirmation, an EDI booking message to the carrier, a booking PDF, and amendment / cancellation records.
- **Integrations** — Booking service & data service; EDI; report engine (PDF); spreadsheet import; mail.

**Diagram 3.5 — Booking lifecycle**
```
Customer → New booking → Parties · cargo · containers · routing → Validate
         → Submit → reference issued → EDI to carrier → Confirm & print

After confirmation:
View bookings → Amend (with notice) → Cancel → Proceed to shipping instructions
```

**Business rules of note.** Booking submission is guarded by a validation form and cut-off configuration; supporting documents are attached by type; and bulk creation is possible via spreadsheet import for high-volume customers.

## Module 4.6 · Shipping Instructions (SI)

*The definitive documentation*

Shipping instructions are the customer's formal statement of how the shipment should be documented and to whom the bill of lading should be issued. The SI takes the booking as its starting point and adds the precise party details, cargo description and B/L preferences the carrier needs to produce the transport document.

- **Purpose** — Capture and submit the definitive documentation instructions for a booked shipment.
- **Actors** — Customers and freight forwarders.
- **Key flows** — SI summary (bookings awaiting instructions) → edit SI → submit SI; spreadsheet import of SIs; SI preview; duplicate-submission handling.
- **Inputs** — Shipper / consignee / notify parties, cargo description, marks & numbers, B/L type & references, document uploads (VGM, dangerous-goods, letter of instruction, MSDS).
- **Outputs** — A submitted SI, an EDI SI message to the carrier, and the source data for the bill of lading.
- **Integrations** — SI service & data service; EDI; spreadsheet import.

**Diagram 3.6 — Filing shipping instructions**
```
Customer → SI summary → pick booking → Edit SI: parties · cargo · marks
         → Validate & de-duplicate → Submit → EDI to carrier → Feeds the bill of lading
```

*SIs must be filed before the documentation cut-off; the platform detects duplicate submissions and returns the customer to the summary rather than creating conflicting instructions.*

## Module 4.7 · Bill of Lading (DOC)

*The transport document*

The bill of lading (B/L) is the contract of carriage, the receipt for the goods and — for an original B/L — a document of title. LRP produces the B/L from the shipping instructions, lets the customer verify the draft, and manages issuance and printing. The manifest (MCN) shares much of this machinery.

- **Purpose** — Draft, verify, issue and print bills of lading and related documents.
- **Actors** — Customers (verify & print), carrier / agency (issue), documentation teams (manifest).
- **Key flows** — B/L edit → B/L view / verify → submit; draft and original B/L print; original-B/L print & batch print; B/L charges view; manifest (MCN) edit, submit & print.
- **Inputs** — SI-derived data, container & seal details, parties, and charges.
- **Outputs** — A draft B/L, an issued original B/L or sea waybill, printed PDFs, and the manifest.
- **Integrations** — B/L service & data service; report engine (PDF); EDI.

**Diagram 3.7 — From SI to issued B/L**
```
Shipping instructions → Carrier drafts B/L → Customer views / verifies draft
                      → Approve → B/L issued → Print draft / original
```

**Business rules of note.** B/L type (original, sea waybill, regional variants) drives print behaviour; an issued B/L cannot be reprinted; and batch printing supports documentation teams handling many B/Ls at once.

## Module 4.8 · VGM

*Verified gross mass (SOLAS)*

Under the SOLAS convention, a packed container may not be loaded onto a vessel unless its verified gross mass has been declared. This module captures the VGM per container, along with the weighing method and the responsible party, and transmits it to the carrier ahead of loading.

- **Purpose** — Capture and submit verified gross mass for packed containers.
- **Actors** — Customers and forwarders.
- **Key flows** — VGM entry against a booking's containers → submit; live VGM lookup; VGM document upload.
- **Inputs** — Container number, verified weight, weighing method, weighing party, authorised signatory.
- **Outputs** — A submitted VGM record, transmission to the carrier, and a confirmation.
- **Integrations** — VGM service & data service; EDI; file upload; weight conversion.

**Diagram 3.8 — Declaring VGM**
```
Customer → Select booking & containers → Enter weight · method · signatory
         → Validate → Submit → carrier → Confirmed for load
```

*VGM is required per container and must be in place before loading; weights are normalised through a conversion utility so units are consistent.*

## Module 4.9 · Tracking & live map

*Where is my cargo*

Tracking gives customers visibility of a shipment's progress without contacting the carrier. It resolves a reference into a timeline of events and milestones, and plots the carrying vessel on a live map. Because visibility is a marketing surface as much as an operational one, tracking is available to guests.

- **Purpose** — Expose shipment status, events and vessel position.
- **Actors** — Guests and registered customers.
- **Key flows** — Track by reference (booking, B/L or container); tracking details with the full movement history; deep-linked external tracking entry; live vessel map.
- **Inputs** — A shipment reference number.
- **Outputs** — An event timeline, milestone status, and a plotted vessel position.
- **Integrations** — Tracking service; mapping (live map); partner deep-link entry.

**Diagram 3.9 — Tracking a shipment**
```
User → Enter reference → Tracking service → Event timeline + all movements → Live vessel map
```

*When a reference has no result the customer receives clear guidance to re-enquire or contact the nearest office, rather than an empty screen.*

## Module 4.10 · Payments, invoicing & statements

*Settling the charges*

This module turns charges into cash and exposes the customer's financial position. It integrates two online payment gateways, records the outcome via secure webhooks, and presents invoices, receipts, payment history and account statements. Much of the finance data is served by the platform's "Phase 2" finance capability.

- **Purpose** — Take online payments and present invoices, receipts and statements.
- **Actors** — Customers; agency / credit-control staff.
- **Key flows** — Online payment via Stripe (checkout, webhook, success / cancel) and N-Genius (order creation, encrypted webhook, success / cancel); payment history; customer statement (account summary, invoice, payment & outstanding views); new invoice; credit control; receipt & invoice print; container-release order.
- **Inputs** — Selected invoices / charges and card payment details (entered on the gateway).
- **Outputs** — A payment confirmation, a receipt, an updated statement, and invoice / receipt PDFs.
- **Integrations** — Stripe & N-Genius gateways; finance (Phase 2) service; report engine (PDF).

**Diagram 3.10 — Online payment**
```
Customer → Select invoices / charges → Choose gateway → Redirect to Stripe / N-Genius
         → Pay on gateway → Webhook + success / cancel → Receipt & updated statement
```

**Business rules of note.** Payment initiation uses secured actions; the authoritative result arrives by webhook rather than the browser redirect; and statements distinguish account summary, invoices, payments and outstanding balances for credit control. Gateway webhooks are deliberately exempt from the interactive security filter so the payment processor can confirm results server-to-server.

## Module 4.11 · Insurance, CargoProtect & carbon

*Value-added services*

Two customer value-adds sit alongside the core lifecycle: cargo insurance (branded CargoProtect) and carbon-emissions estimation. Both attach to a shipment or a sailing and produce a quantified result — a premium and policy, or an emissions figure.

- **Purpose** — Offer cargo insurance and estimate shipment carbon emissions.
- **Actors** — Customers; guests (carbon calculator).
- **Key flows** — CargoProtect: premium quotation, policy view, survey & FAQ, policy PDF; insurance lookups; carbon calculator from login and against a chosen schedule.
- **Inputs** — Cargo value & details; route / schedule and container or transport mode.
- **Outputs** — An insurance premium and policy document (PDF); a per-sailing / per-leg carbon estimate (CO₂e).
- **Integrations** — Carbon-accounting API (Climatiq) with request logging; insurance service; report engine (PDF).

**Diagram 3.11 — Insurance & carbon**
```
CargoProtect:      Customer → Enter cargo value → Premium quotation → Purchase → Policy PDF
Carbon calculator: User → Choose schedule / route → Climatiq estimate → CO₂e by leg
```

*Carbon estimates are derived from the same schedule and leg data used for planning, so the figure reflects the actual routing under consideration.*

## Module 4.12 · Arrival, DO/CRO, notices, reports & admin

*Release, communication & control*

This final group gathers the destination-side release documents, the platform's outbound communications, its reporting surface, and the carrier's control panel. These capabilities support the lifecycle end-to-end rather than a single stage.

- **Purpose** — Handle arrival & release documents, customer communications, reporting, and administrative configuration.
- **Actors** — Consignees & agency (release), all users (notices), admins (config & reports).
- **Key flows** —
  - *Arrival & release:* arrival notice, delivery-order summary & print, container-release order, manifest print.
  - *Communications:* notices, mail alerts, customer advisories, contact-us.
  - *Reporting:* statistics reports, user analytics, dashboards & charts, user audit, spreadsheet export.
  - *Admin / control panel:* global & cut-off configuration, field configuration, service restriction, IP & SQL filtering, email templates, special privilege, and the V1/V2 service switch.
- **Inputs** — Shipment references (release); configuration values (admin); report parameters.
- **Outputs** — Arrival notices, delivery orders & CROs (PDF); alerts & advisories; reports, dashboards & audit trails; saved configuration.
- **Integrations** — Report engine (PDF); mail; analytics; configuration store & cache.

**Diagram 3.12 — Release documents & administration**
```
Import release: Arrival notice → Delivery order → Container release order → Cargo released
Administration: Admin → Global · cut-off · field config → Service restriction · IP / SQL filter
              → V1 / V2 service switch → Reports & analytics
```

*Cut-off, field and service configuration set here is enforced throughout the transactional modules; the V1/V2 switch governs the platform-evolution behaviour described in Part 5.6.*

---

# 5 · Technical architecture

*How the platform is built — at the component level*

Part 4 explained what each module does for the business. This part explains how the system is structured to deliver it: the layers, the path a request travels, the concerns that cut across every module, the systems LRP integrates with, its domain model, and how the platform is evolving.

## 5.1 Layered design

LRP separates responsibilities into clear tiers (introduced visually in Diagram 1). Keeping presentation, control, business logic and data access apart is what lets the platform be themed per carrier, localized, reconfigured and progressively modernized without rewriting the whole application.

| Layer | Responsibility | What lives here |
|---|---|---|
| **Presentation** | Render what the user sees and gather input. | JSP pages composed with Tiles, client-side JavaScript, localized message resources, a small amount of JSF. |
| **Control / MVC** | Route requests, bind & validate input, orchestrate the use case, select the response. | The front controller, action mappings, form beans + validator, AJAX endpoints, and report / spreadsheet servlets. |
| **Business** | Apply business rules and coordinate a transaction. | EJB session beans per capability — booking, SI, B/L, VGM, schedule, rates, registration, payment, finance, admin. |
| **Data services** | Read and write the system of record. | The VDS data-service components calling stored procedures through a JDBC service locator; a value-object model. |
| **Persistence** | Store the authoritative data. | The carrier operational database; a start-up cache for reference data. |
| **Cross-cutting** | Concerns every request shares. | Security, validation, caching, localization, configuration, reporting, notification, audit — see 5.3. |

## 5.2 The request lifecycle

Almost every interaction follows the same path down and back up the stack. Diagram 6 traces a typical transactional request — for example, submitting a booking — from the browser to the database and back to a rendered page.

### Diagram 6 — Request → Action → EJB → Data → Database (and back)

1. **Browser** — The user submits a form or triggers an action; a request is sent (a full-page action, or a live AJAX call).
2. **Filters** — Security, XSS and analytics filters inspect the request and confirm a valid session before anything else runs.
3. **Front controller** — The MVC front controller matches the URL to an action mapping and selects the action to run.
4. **Bind & validate** — Request parameters bind to a form bean; declarative and rule-based validation runs, with config-driven field rules applied.
5. **Action** — The action orchestrates the use case and calls the appropriate business component in the EJB tier.
6. **Business bean** — The session bean applies business rules, coordinates the transaction, and calls the data service (and EDI / payment / mail where relevant).
7. **Data service** — The VDS component runs stored procedures against the database via the service locator.
8. **Database → VOs** — Results return from the database and are mapped into value objects that travel back up the tiers.
9. **View** — The action forwards to a Tiles-composed JSP, localized to the user's language; the HTML returns to the browser.

*Variations: AJAX endpoints return a fragment or data instead of a full page; report and spreadsheet servlets return a PDF or workbook; payment-gateway webhooks re-enter at the filter layer on a path exempted from the interactive security check.*

## 5.3 Cross-cutting concerns

Several concerns apply to every module rather than belonging to any one of them. Centralizing them keeps behaviour consistent and configurable.

| Concern | How it works |
|---|---|
| **Security & access** | Request filters (security, XSS blocking, IP filtering), short-lived sessions on secure HTTP-only cookies, captcha on sensitive forms, password hashing and crypto utilities, and special-privilege / menu-access checks per user. |
| **Validation** | Three layers — client-side JavaScript for immediate feedback, declarative server-side rules, and administrator-defined field configuration that turns fields on/off and mandatory per carrier and customer. |
| **Caching & start-up** | A cache loader warms reference data (ports, vessels, look-ups) at application start so high-frequency screens like schedules and booking respond quickly. |
| **Localization** | Message resources provide the UI in multiple languages (including English, Chinese and Spanish), selected per session. |
| **Configuration** | Global settings, documentation cut-offs, visible fields, and service restrictions are administered from the control panel rather than hard-coded — the same platform behaves differently per carrier. |
| **Reporting** | A reporting engine generates the printable documents — B/L, booking, invoice, receipt, CRO, arrival notice, delivery order, manifest — as PDFs, plus spreadsheet import/export. |
| **Notification** | Mail drives activation links, password resets, amendment notices, mail alerts and customer advisories. |
| **Audit & analytics** | A user-audit trail records who did what; an analytics filter captures platform usage for reporting and dashboards. |

> **Why configuration matters here.** Because cut-offs, visible fields, service restrictions and access are all data-driven, a large share of "how LRP behaves" for a given carrier lives in configuration, not code. Reading the control-panel settings is essential to understanding any specific deployment.

## 5.4 Integration & external systems

LRP is a front-end to a wider landscape. It owns the customer experience but delegates authoritative processing to the carrier's core systems and to specialist external services.

### Diagram 4 — External-systems map

```
                          ┌─────────────────────────┐
                          │      LRP V2 portal       │
                          │ web + business + data    │
                          └────────────┬────────────┘
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
   Carrier core     Stripe        N-Genius          Climatiq        Google       Mail server
   (↔ EDI file)   (↔ redirect+   (↔ order API+    (→ REST API)    (→ REST API)   (→ SMTP)
                    webhook)       webhook)
```

| System | Purpose | Direction | Mechanism |
|---|---|---|---|
| **Carrier core** | Authoritative booking, documentation & status processing. | Bidirectional | EDI files over transfer |
| **Stripe** | Online card payment. | Bidirectional | Hosted checkout + webhook |
| **N-Genius** | Online card payment (regional). | Bidirectional | Order API + encrypted webhook |
| **Climatiq** | Carbon-emissions figures. | Outbound | REST API (logged) |
| **Google** | Address search & map display. | Outbound | REST / JS API |
| **Mail server** | Transactional email. | Outbound | SMTP |

*The database is the system of record within LRP; the systems above are external. Document generation and spreadsheet handling are in-process libraries rather than network integrations.*

## 5.5 Domain & data model

The lifecycle is underpinned by a compact set of domain entities. The "golden thread" from Part 3 is simply these entities sharing references.

### Diagram 5 — Principal domain entities

| Entity | Key attributes |
|---|---|
| **Customer / Agency** | *customer id* · company · type · owning agency · status |
| **Party** | role (shipper · consignee · notify) · name · address |
| **Booking** | *booking ref* · customer · voyage · source · status |
| **Container / Equipment** | *container no* · type · count · seal |
| **Cargo / Commodity** | commodity · description · marks · DG flag · weight |
| **Schedule / Voyage** | *voyage* · vessel · service · ports · dates |
| **Routing / Leg** | *leg* · from → to port · mode · transit |
| **Shipping Instruction** | *SI ref* · booking ref · parties · B/L type |
| **Bill of Lading** | *B/L no* · SI / booking ref · type · issue status |
| **VGM** | booking · *container no* · weight · method · signatory |
| **Charge / Invoice** | *invoice* · B/L · charges · amount · currency · status |
| **Payment** | *payment* · invoice · gateway · amount · result |

**Key relationships**

| Relationship | Meaning |
|---|---|
| Customer 1 — * Booking | A customer (or forwarder) places many bookings. |
| Booking * — 1 Voyage | Each booking is assigned to a scheduled voyage and its legs. |
| Booking 1 — * Container / Cargo | A booking carries one or more containers and commodities. |
| Booking 1 — 1 Shipping Instruction | Instructions are filed against the booking they document. |
| SI 1 — 1 Bill of Lading | The B/L is produced from the submitted SI. |
| Booking / Container 1 — * VGM | Each packed container gets a verified gross mass. |
| B/L 1 — * Invoice 1 — * Payment | Charges are invoiced against the B/L and settled by payments. |
| Party * — * Booking | Shipper, consignee and notify parties recur across bookings. |

*Ports are referenced throughout by UN/LOCODE; the booking reference and B/L number are the two identifiers that most often tie records together.*

## 5.6 Platform evolution

LRP is not static. Two threads of change matter for understanding the current codebase: a **versioned modernization** of the core transactional services, and the **Phase 2** finance capability. Both are designed to be adopted incrementally rather than in a single cut-over.

### The V1 / V2 service switch

Redesigned ("V1") versions of the core business components — booking, B/L, SI, VGM, dashboard and master data — run alongside the original ("V2"/base) ones. An administrator setting routes selected modules to the modernized path, so the carrier can modernize one capability at a time and roll back safely if needed. This is the mechanism behind the "Innovation" development track this codebase sits in.

```
Request → Service switch (per module) → Original service (base)  ─┐
                                       → Modernized service (V1) ─┴→ Same data services & DB
```

*Both paths ultimately reach the same data services and database, so records stay consistent regardless of which service version handles a given module.*

### Phase 2 — finance & accounts

Phase 2 added the financial surface that turns LRP from a transactional portal into a settlement channel: customer statements (account summary, invoices, payments and outstanding balances), new-invoice handling, container-release orders, credit control, and tariff / surcharge views. It is what makes the "settle" phase of the lifecycle possible online.

---

# 6 · Appendices

## Appendix A · Module capability matrix

| Module | Phase | Primary actors | Key outputs | Integrations |
|---|---|---|---|---|
| **4.1 Registration & users** | Onboard | Guest, agency, admin | Account, activation, config | Mail, address lookup |
| **4.2 Auth & access** | Access | All; admin | Session, role-scoped menu | Security filters, mail, crypto |
| **4.3 Schedules** | Plan | Guest, customer | Voyages, routes, legs | Schedule svc, cache, Excel |
| **4.4 Rates & quotation** | Plan | Guest, customer | Quote, all-in amount | Rates svc, surcharge calc |
| **4.5 eBooking** | Book | Customer, forwarder, agency | Booking ref, PDF | EDI, reports, Excel, mail |
| **4.6 Shipping instructions** | Document | Customer, forwarder | Submitted SI | EDI, Excel |
| **4.7 Bill of lading** | Document | Customer, carrier | B/L & manifest PDFs | Reports, EDI |
| **4.8 VGM** | Document | Customer | VGM record | EDI, file upload |
| **4.9 Tracking & map** | Move | Guest, customer | Event timeline, map | Tracking svc, maps |
| **4.10 Payments & invoicing** | Settle | Customer, credit control | Receipt, statement, PDFs | Stripe, N-Genius, reports |
| **4.11 Insurance & carbon** | Value-add | Customer, guest | Policy PDF, CO₂e | Climatiq, reports |
| **4.12 Arrival, notices & admin** | Release / support | Consignee, agency, admin | DO/CRO, notices, reports, config | Reports, mail, analytics |

## Appendix B · Glossary

### Shipping & logistics terms

| Term | Meaning |
|---|---|
| **Booking** | A request, accepted by the carrier, to carry cargo on a specific voyage; identified by a booking reference. |
| **Shipping instructions (SI)** | The shipper's definitive instructions for how the shipment should be documented and the B/L issued. |
| **Bill of lading (B/L)** | The transport document: contract of carriage, receipt for the goods, and (for an original B/L) a document of title. |
| **Sea waybill** | A non-negotiable transport receipt used where a document of title is not required. |
| **VGM** | Verified gross mass — the mandatory (SOLAS) verified weight of a packed container, required before loading. |
| **CRO** | Container release order — authorization to collect empty equipment for stuffing. |
| **Delivery order (DO)** | Authorization at destination to release cargo to the consignee. |
| **Arrival notice** | Notification to the consignee that a shipment has arrived (or is about to). |
| **Manifest (MCN)** | The consolidated list of all cargo carried on a voyage. |
| **Voyage / leg** | A vessel's scheduled sailing; a leg is one segment of the routing (mainline, feeder, rail, road, barge, combined or inter-terminal). |
| **Haulage** | Inland transport of the container to or from the port. |
| **Shipper / consignee / notify** | The sending party, the receiving party, and a party to be notified of arrival. |
| **Tariff / surcharge / contract** | Published base pricing; additional charges applied on top; and negotiated customer-specific rates. |
| **UN/LOCODE** | The standard five-letter code identifying a port or location. |
| **DG / MSDS** | Dangerous goods; the material safety data sheet documenting them. |

### Technical terms

| Term | Meaning |
|---|---|
| **EDI** | Electronic data interchange — structured messages exchanged with the carrier's core systems (here, for bookings and SIs). |
| **MVC / front controller** | The web pattern that routes each request to an action and selects a view; the front controller is its single entry point. |
| **Form bean / validator** | The object that request input binds to, and the rules that check it before processing. |
| **Tiles** | The page-composition framework that assembles headers, menus and content into each screen. |
| **EJB / session bean** | Enterprise JavaBean — the business-tier components that apply rules and coordinate transactions. |
| **Data service (VDS)** | The layer that reads and writes the database, largely through stored procedures. |
| **Value object** | A simple data carrier that moves information between tiers. |
| **Webhook** | A server-to-server callback — used by the payment gateways to confirm a payment result. |
| **Cache warming** | Loading reference data into memory at start-up so common screens respond quickly. |
| **White-label** | One platform themed and configured to appear as different carriers' own portals. |

## Appendix C · Notes & assumptions

- This is an **as-built architectural view** derived from the structure and configuration of the online-channel codebase (the web application and the business module), not a line-by-line specification.
- **Components are named by role**, not by source class name, to keep the document readable across a mixed audience.
- **Behaviour is configuration-dependent.** Cut-offs, visible fields, service restrictions, access and the V1/V2 switch are administered per carrier and customer, so a specific deployment may enable or hide capabilities described here.
- **The carrier's core operational systems are the system of record** for authoritative shipment, document and finance data; LRP is the customer-facing channel that captures intent and exchanges data with them.
- Diagrams are conceptual and emphasize flow and responsibility over exact wire-level detail.

---

*LRP V2 — Business & Technical Architecture · Version 1.0 (draft, as-built review) · prepared August 2026 · Solverminds. Prepared for onboarding, architecture reference, client handover and QA/support use.*
