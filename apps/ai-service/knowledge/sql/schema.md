# Portal data schema (logical)

This describes business entities exposed by the e-com portal APIs — not a live database dump.
SQL Analysis mode may illustrate SELECT queries against these logical tables. Execution requires
a configured SQL_SERVICE_URL and SQL capability.

## bookings
Logical booking headers for a tenant.
Typical columns: booking_id, booking_reference, status, origin, delivery, cargo_ready_date,
vessel_name, voyage, created_at, customer_code.
Related: cargo_lines, booking_parties.

## cargo_lines
Containers / commodities on a booking.
Typical columns: booking_id, container_type, quantity, hs_code, weight_kg.

## booking_parties
Shipper, consignee, notify and agreement party rows.
Typical columns: booking_id, party_role, party_name, party_code.

## schedules
Published sailings / routes.
Typical columns: schedule_id, pol, pod, etd, eta, vessel_name, voyage, service_code.

## tracking_events
Container activity events.
Typical columns: container_no, booking_reference, bl_no, event_code, event_time, location.

## shipping_instructions
SI headers linked to bookings.
Typical columns: si_id, booking_reference, status, submitted_at.

## bills_of_lading
B/L documents.
Typical columns: bl_no, booking_reference, status, issued_at.

## vgm_declarations
Verified gross mass rows.
Typical columns: container_no, booking_reference, vgm_kg, method, status, submitted_at.

## Read-only policy
Only SELECT / WITH / EXPLAIN / SHOW / DESCRIBE are permitted. Destructive statements are rejected.
Tenant isolation is enforced by the SQL service — never remove tenant predicates in generated SQL.
