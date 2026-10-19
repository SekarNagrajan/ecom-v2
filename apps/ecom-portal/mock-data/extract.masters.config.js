/**
 * Second dataset catalogue: everything that is NOT in the e-commerce database.
 * Run AFTER `npm run dump` (it reads the dumped fixtures for its IN-lists):
 *
 *   node extract.js --config ./extract.masters.config.js        (npm run extract:masters)
 *
 * Datasources (see .env): MASTERDB=Masters, LRPV1DS=Documentation (LRP booking / B/L / container moves),
 * VSSDB=VSS (vessels, services, sailing schedules), COMDB=Commercial (routing, tariffs),
 * ACCDB=Accounts (invoices, receipts), IMPDB=Imports (arrival notices, delivery orders).
 *
 * Every dataset is scoped to the shipments / customers already in the fixtures where that makes sense,
 * and topped up with a few hundred recent rows so lookups have breadth.
 */

/** Dates are shifted by the offset the dump recorded in _manifest.json (anchor not re-extracted here). */
export const dateAnchor = { dataset: 'bookings', column: 'dateup' };

const PARTY = { name: 'company', address1: 'address', address2: 'address2', city: 'city', zipCode: 'zip', telephone: 'phone', fax: 'phone', email: 'email', contact: 'fullName' };

/**
 * Rates module showcase lanes — top Commercial.bookingrates_tariff port pairs on LRP V2 Testing.
 * Extract prioritises these so Tariff / Surcharge / Contract / RFQ tabs all have demo data.
 */
export const RATES_SHOWCASE_LANES = [
  ['INNSA', 'AEJEA'],
  ['INNSA', 'SADMM'],
  ['INNSA', 'SGSIN'],
  ['INMUN', 'SGSIN'],
  ['INMAA', 'SGSIN'],
  ['INMAA', 'SADMM'],
  ['USILG', 'GTPBR'],
  ['SGSIN', 'MYPKG'],
  ['INMUN', 'AEJEA'],
  ['AEJEA', 'INNSA'],
];
export const RATES_SHOWCASE_PORTS = [...new Set(RATES_SHOWCASE_LANES.flat())];

/** SQL OR-clause matching the showcase POL/POD pairs (case-insensitive). */
function showcaseLanePredicate(loadCol = 'loadport', discCol = 'dischport') {
  return RATES_SHOWCASE_LANES
    .map(([pol, pod]) => `(upper(rtrim(${loadCol}))='${pol}' and upper(rtrim(${discCol}))='${pod}')`)
    .join(' or ');
}

/** Quoted IN-list from several (dataset, column) pairs of the dumped fixtures; missing datasets are ignored. */
function listOf(ctx, pairs, extra = []) {
  const vals = new Set(extra);
  for (const [ds, col] of pairs) {
    try { for (const v of ctx.values(ds, col)) vals.add(String(v).trim()); } catch { /* dataset not dumped */ }
  }
  const arr = [...vals].filter(Boolean);
  return arr.length ? '(' + arr.map(v => `'${v.replace(/'/g, "''")}'`).join(',') + ')' : "('')";
}
const bookNos = ctx => listOf(ctx, [['bookings', 'extBookNo'], ['shippingInstructions', 'bookno'], ['vgm', 'book_no']]);
const blNos = ctx => listOf(ctx, [['shippingInstructions', 'blno'], ['vgm', 'bl_no']]);
const ports = ctx => listOf(ctx, [['bookings', 'originPortId'], ['bookings', 'finalPortId'], ['bookings', 'loadPortId'], ['bookings', 'dischargePortId'],
  ['bookingLeg', 'loadPortId'], ['bookingLeg', 'dischargePortId'], ['shippingInstructions', 'pol'], ['shippingInstructions', 'pod'],
  ['shippingInstructions', 'pla'], ['shippingInstructions', 'pld'], ['cutoffConfig', 'port']], RATES_SHOWCASE_PORTS);
const vessels = ctx => listOf(ctx, [['bookingLeg', 'vesselCode'], ['shippingInstructions', 'Vessel']]);
const services = ctx => listOf(ctx, [['bookingLeg', 'serviceCode']]);
const commodities = ctx => listOf(ctx, [['bookingCommodity', 'commodity'], ['siCommodity', 'commodity']]);
/** Login customer, its AP customer codes and every party code on the sampled bookings. */
const customers = ctx => listOf(ctx, [['users', 'Cust_Code'], ['userDetails', 'CustomerCode'], ['customerMapping', 'LoginCustCode'], ['customerMapping', 'APcustCode'], ['bookingCust', 'custId'], ['siCust', 'custId']]);

export const datasets = [
  // ────────────────────────────────────────────────────────────────────────────
  // MASTER DATA (Masters)
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'ports', db: 'MASTERDB',
    sql: `select PortCode as portcode, PortName as portname, CountryCode as countrycode, StateCode as statecode, Latitude as latitude, Longitude as longitude, PortType as porttype
            from ports(nolock) where status='A' and PortCode not like 'xx%' order by PortName` },
  { name: 'portCountryMap', db: 'MASTERDB',
    sql: `select PortCode as portcode, CountryCode as countrycode from ports(nolock) where status='A'` },
  { name: 'countries', db: 'MASTERDB',
    sql: `select distinct CountryName as countryname, CountryCode as countrycode, ISDCode as isdcode, Currency as currency from Country(nolock) where status='A' order by CountryName` },
  { name: 'states', db: 'MASTERDB',
    sql: `select statecode, statedesc, countrycode from Statesmaster(nolock) where status='A' order by countrycode, statedesc` },
  { name: 'commodities', db: 'MASTERDB',
    sql: ctx => `select * from (
                    select ComdtyCode as comdtycode, ComdtyName as comdtyname, ComdtyType as comdtytype from commodity(nolock) where status='A' and ComdtyCode in ${commodities(ctx)}
                    union
                    select * from (select top 300 ComdtyCode, ComdtyName, ComdtyType from commodity(nolock) where status='A' and isnull(isGrp,'N') <> 'Y' order by ComdtyName) t
                  ) c order by comdtyname` },
  { name: 'packages', db: 'MASTERDB',
    sql: `select packagecode, description from package(nolock) where status='A' order by description` },
  { name: 'equipments', db: 'MASTERDB',
    sql: `select top 200 EquipType as Equiptype, EquipDesc as equipdesc, TareKg, GrossKg, Teus, Length, Width, Height, Type as eqptype, Status as status from Equipments order by EquipType` },
  { name: 'terminals', db: 'MASTERDB',
    sql: ctx => `select terminalCode as terminalcode, TerminalName as terminalname, PortCode as portcode, Type as type from TerminalandDepot where PortCode in ${ports(ctx)}
                 union select * from (select top 200 terminalCode, TerminalName, PortCode, Type from TerminalandDepot order by PortCode) t order by portcode, terminalname` },
  { name: 'transportServices', db: 'MASTERDB',
    sql: `select trptsvccode, trptsvcname, receipt, delivery, trptterm from transportservice(nolock) where status='A'` },
  { name: 'depots', db: 'MASTERDB',
    sql: ctx => `select top 300 Depot as depot, Description as description, PortCode as portcode, PortName as portname, type from DepotCode(nolock)
                  where Status='A' order by case when PortCode in ${ports(ctx)} then 0 else 1 end, PortCode` },
  { name: 'inTransitPods', db: 'MASTERDB',
    sql: `select upper(dmsfinaldest) as dmsfinaldest, upper(dmsfinaldestdesc) as dmsfinaldestdesc, dmspod, dmspoddesc from DMSInTransit(nolock) where pod='Y' and status='A'` },
  { name: 'carriers', db: 'MASTERDB',
    sql: `select carriercode, carriername as CARRIERNAME, address as ADDRESS, city, zipcode as ZIPCODE from carrier(nolock)` },
  { name: 'shipmentTerms', db: 'MASTERDB',
    sql: `select ShipTerms, termsDesc from shipmentterms(nolock) where status='A'` },
  { name: 'charges', db: 'MASTERDB',
    sql: `select chargecode, chargename, chargetype, chargemode, chargegrp, defpaymode from charges(nolock) where status='A' order by chargename` },
  { name: 'customerMaster', db: 'MASTERDB',
    sql: ctx => `select CustCode, CustName, Address1, Address2, City, State, statecode, CountryID as countryid, ZipCode, Phone, Email, controllocation, custtype, inactiveflag, status, currency, creditperiod, NVOCC, agencycode
                   from CustomerMaster(nolock) where CustCode in ${customers(ctx)}`,
    anonymize: { CustName: 'company', Address1: 'address', Address2: 'address2', City: 'city', ZipCode: 'zip', Phone: 'phone', Email: 'email' } },

  // ────────────────────────────────────────────────────────────────────────────
  // VESSELS, SERVICES, SCHEDULES (VSS)
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'vessels', db: 'VSSDB',
    sql: ctx => `select VesselCode, VesselName, CallSign, VESSELTYPE as VesselType, FLAG as Flag, PortOfRegistry, BUILT as BuiltYear, IMO as ImoNumber, Loa as LengthOverall, Nominaltues as TeuNominal, Grt as GrossTonnage, Nrt as NetTonnage, Vesselowner as VesselOwner
                   from Vesselmaster(nolock)
                  where VesselCode not like 'xx%' and (rtrim(VesselCode) in ${vessels(ctx)} or VesselCode in (select distinct vessel from allschedules_ecom where depdate between dateadd(day,-30,getdate()) and dateadd(day,90,getdate())))
                  order by VesselName` },
  { name: 'services', db: 'VSSDB',
    sql: ctx => `select servicecode, servicename, serviceType as servicetype, frequency, status from service(nolock)
                  where servicecode in ${services(ctx)} or servicecode in (select distinct service from allschedules_ecom where depdate between dateadd(day,-30,getdate()) and dateadd(day,90,getdate()))
                  order by servicename` },
  { name: 'schedules', db: 'VSSDB',
    // Prefer Rates/Booking showcase ports so Master Details routing finds sailings for those lanes.
    sql: `select top 2500 header, vessel, voyage, service, bound, port, terminal, callorder, arrdate, depdate, type, groupcallid, status
            from allschedules_ecom
           where depdate between dateadd(day,-45,getdate()) and dateadd(day,120,getdate())
           order by case when upper(rtrim(port)) in ('INNSA','AEJEA','SADMM','SGSIN','INMUN','INMAA','USILG','GTPBR','MYPKG','AEDXB') then 0 else 1 end,
                    depdate, groupcallid, callorder` },
  { name: 'portCalls', db: 'VSSDB',
    sql: ctx => `select top 300 groupcallid, servicecode, vessel_code as vesselcode, voyage, portcode, callorder, eosp, pob, firstlineashore, allfastfwe, startcargoops, etd, PULLOUTFROMBERTH as pulloutfromberth
                   from arrival_master(nolock) where rtrim(vessel_code) in ${vessels(ctx)} order by etd desc` },

  // ────────────────────────────────────────────────────────────────────────────
  // LRP DOCUMENTATION for the sampled shipments (Documentation) — tracking, B/L facts
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'lrpBookings', db: 'LRPV1DS',
    sql: ctx => `select book_no, agencyid, custRefNo, agencyRefNo, serviceCode, vesselCode, voyageCode, bound, originPortId, finalPortId, loadPortId, dischargePortId, originPortDesc, finalPortDesc,
                        polTerminal, polAt, podTerminal, podAt, bookDate, bookReady, bookDeadline, status, actStatus, shipperRefNo, isDGBook, shipment_type, transportServiceId, transportTermId, preCarriage, onCarriage, inTransitPort, datecr, dateup
                   from booking(nolock) where book_no in ${bookNos(ctx)}` },
  { name: 'lrpBookingLegs', db: 'LRPV1DS',
    sql: ctx => `select book_no, leg_no, bound, serviceCode, vesselCode, voyageCode, callIdLoading, callIdDischarge, legTypeId, loadPortId, dischargePortId, polTerminal, podTerminal, etdDate, etaDate, status, statusLoad, statusDischarge, vendorName
                   from booking_leg(nolock) where book_no in ${bookNos(ctx)} order by book_no, leg_no` },
  { name: 'lrpBookingCargo', db: 'LRPV1DS',
    sql: ctx => `select cid, book_no, cargoNo, eqpStatus, type, oog, eqpTypeId, eqpId, shipperOwn, seal1No, seal2No, nor, setTemp, tempUnit, tareWeight, cargoWeight, grossWeight, weightUnit, dgflag, status, movetype, pickupDate, GateClearance, GateInClearanceDate
                   from booking_cargo(nolock) where book_no in ${bookNos(ctx)}` },
  { name: 'lrpBookingCust', db: 'LRPV1DS',
    sql: ctx => `select cid, book_no, custTypeId, custId, countryId, stateId, name, address1, address2, city, zipCode, telephone, fax, contact, email, persontype, eori
                   from booking_cust(nolock) where book_no in ${bookNos(ctx)}`, anonymize: PARTY },
  { name: 'lrpBl', db: 'LRPV1DS',
    sql: ctx => `select bl_no, agencyid, book_no, custRefNo, agencyRefNo, blType, shipmentStatus, serviceCode, vesselCode, voyageCode, bound, originPortId, finalPortId, loadPortId, dischargePortId, originPortDesc, finalPortDesc,
                        polTerminal, polAt, podTerminal, podAt, status, actStatus, originals, copies, printedOriginals, printedCopies, isFCN, isvoyageclosed, OnboardDate, PrintedDate, paymenttermsId, shipperRefNo, isDGbook, datecr, dateup
                   from bl(nolock) where bl_no in ${blNos(ctx)} or book_no in ${bookNos(ctx)}` },
  { name: 'lrpBlCargo', db: 'LRPV1DS',
    sql: ctx => `select cid, bl_no, cargoNo, eqpStatus, eqpTypeId, eqpId, shipperOwn, seal1No, seal2No, nor, setTemp, tempUnit, tareWeight, cargoWeight, grossWeight, weightUnit, dgflag, status, impstatus, expstatus, impfree, expfree
                   from bl_cargo(nolock) where bl_no in ${blNos(ctx)}` },
  { name: 'lrpBlCust', db: 'LRPV1DS',
    sql: ctx => `select cid, bl_no, custTypeId, custId, countryId, stateId, name, address1, address2, city, zipCode, telephone, fax, contact, email, persontype, eori
                   from bl_cust(nolock) where bl_no in ${blNos(ctx)}`, anonymize: PARTY },
  { name: 'telexReleases', db: 'LRPV1DS',
    sql: ctx => `select bl_no, tlxdate, remarks, surrenderedby, status, datecr from bltelexrelease(nolock) where bl_no in ${blNos(ctx)}`, anonymize: { surrenderedby: 'fullName' } },
  { name: 'containerMoves', db: 'LRPV1DS',
    sql: ctx => `select top 1500 OperationDNo, OperationNo, Operator, ContainerNo, EquipmentType, containerStatus, bookNo, originPort, blpol, blpolTerminal, blpod, blpodTerminal, deliveryPort, opspol, opspolTerminal, opspod, opspodTerminal,
                        VesselCode, Voyage, ServiceCode, Bound, SealNo, Wt, CommodityCode, CargoType, OprType, DGClass, Temperature, OOG, CarriageType, nor, status, nxtStatus, agencyCode, prevOperation, actDate, mode, MtyRtnLoc, datecr, dateup
                   from operationDetail(nolock) where bookNo in ${bookNos(ctx)} order by bookNo, ContainerNo, OperationNo` },

  // ────────────────────────────────────────────────────────────────────────────
  // ROUTING & TARIFFS (Commercial)
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'routes', db: 'COMDB',
    sql: ctx => `select top 500 id, routeid, origin, orgMode, BLPOL, BLPOLTer, mode, BLPOLSvc, OpsPol1, OpsPol1Ter, opsMode1, OpsPOLSVC1, OpsPol2, OpsPol2Ter, opsMode2, OpsPOLSVC2, BlPod, BlPodTer, delivery, DelMode, DefRoute, MainSvc, Status, TransitTime, fromdate, todate, priority1, advRoute
                   from Routedetail(nolock) where Status='A' and (origin in ${ports(ctx)} or delivery in ${ports(ctx)} or BLPOL in ${ports(ctx)} or BlPod in ${ports(ctx)})
                   order by case when (${showcaseLanePredicate('origin', 'delivery')} or ${showcaseLanePredicate('BLPOL', 'BlPod')}) then 0 else 1 end, DefRoute desc, origin, delivery` },
  { name: 'tariffs', db: 'COMDB',
    // Prioritise the 10 Rates showcase port pairs so every Rates tab has searchable Commercial data.
    sql: ctx => `select top 800 rateno, loadport, dischport, pol, pod, CustCode as custcode, eqptype, currency, localamount, validfrom, validto, quotestatus, status, ratetype, itemno, tos, soc, dgflag, oogflag, nor, service, allin
                   from bookingrates_tariff
                  where validto >= dateadd(day,-180,getdate())
                    and isnull(status,'A') <> 'D'
                    and (
                      ${showcaseLanePredicate('loadport', 'dischport')}
                      or upper(rtrim(loadport)) in ${ports(ctx)}
                      or upper(rtrim(dischport)) in ${ports(ctx)}
                      or CustCode in ${customers(ctx)}
                    )
                  order by case when ${showcaseLanePredicate('loadport', 'dischport')} then 0 else 1 end, validto desc, rateno, itemno` },
  // Service contracts (corporate rates): the demo customers' contracts plus recent contracts on the sampled lanes,
  // then every child table by corporate number (lines with real amounts, surcharges, routing, parties, commodities).
  { name: 'contracts', db: 'COMDB',
    sql: ctx => `select top 80 CorporateNo, CustCode, Teus20, Teus40, TotalTeus, Period, Tos, ValidFrom, ValidTo, status, serviceFlag, Identifier, agencyCode, region, customerType, shipper, Consignee, notfiy, forwarder, localAgencyCode
                   from corporateMaster(nolock)
                  where CustCode in ${customers(ctx)}
                     or CorporateNo in (select distinct corporateNo from corporateDetailN(nolock)
                                         where (${showcaseLanePredicate('pol', 'pod')} or (pol in ${ports(ctx)} and pod in ${ports(ctx)}))
                                           and validTo >= dateadd(day,-180,getdate()) and isnull(statusFlag,'A') <> 'D')
                  order by case when CustCode in ${customers(ctx)} then 0 else 1 end, ValidTo desc` },
  { name: 'contractLines', db: 'COMDB',
    sql: ctx => `select top 800 Id, corporateNo, itemNo, custCode, pol, pod, eqpType, locAmt, locCurrency, type, det, adv, validFrom, validTo, servicecode, Tservice, TOS, DgFlag, Soc, Nor, Allin, BaseAmt, UsdBaseAmt, Roe, localofrAmt, TransitTime, routType, conStatus, statusFlag, remarks, weight, Flexi, MTY, totalvolume, period
                   from corporateDetailN(nolock) where corporateNo in ${ctx.list('contracts', 'CorporateNo')} order by corporateNo, itemNo` },
  { name: 'contractSurcharges', db: 'COMDB',
    sql: ctx => `select top 1200 id, corporateNo, itemNo, chargeCode, currency, amount, AmtUSD, chargeMode, chargetype, Allin, Vatos, Tariff, Status, statusFlag, roe, surEqp
                   from CorporateSurcharge(nolock) where corporateNo in ${ctx.list('contracts', 'CorporateNo')} order by corporateNo, itemNo, chargeCode` },
  { name: 'contractRouting', db: 'COMDB',
    sql: ctx => `select top 400 id, CorporateNo, itemNo, origin, originMode, pol, polter, polSer, polmode, trans1, trans1Ter, trans1Ser, trans2, trans2Ter, trans2Ser, pod, podTer, podMode, delivery, svcCode, defRout, routeid, poltranstime, podtranstime, priority1, statusFlag
                   from Corporaterouting(nolock) where CorporateNo in ${ctx.list('contracts', 'CorporateNo')} order by CorporateNo, itemNo` },
  { name: 'contractCustomers', db: 'COMDB',
    sql: ctx => `select id, corporateNo, itemNo, custCode, statusFlag, shipper, Consignee, notfiy, forwarder from CorporateCustomer(nolock) where corporateNo in ${ctx.list('contracts', 'CorporateNo')}` },
  { name: 'contractCommodities', db: 'COMDB',
    sql: ctx => `select id, corporateNo, itemNo, commodityCode, statusFlag from CorporateCommodity(nolock) where corporateNo in ${ctx.list('contracts', 'CorporateNo')}` },
  { name: 'lclTariffs', db: 'COMDB',
    sql: `select top 100 rateno, loadport, dischport, eqptype, currency, localamount, validfrom, validto, status, ratetype, itemno, commodity, minBaseQty, vwRatio, minBLFreight
            from bookingrates_lcltariff where validto >= dateadd(day,-90,getdate()) order by validto desc` },

  // ────────────────────────────────────────────────────────────────────────────
  // INVOICES, RECEIPTS, DELIVERY ORDERS (Accounts) — customer statement module
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'invoices', db: 'ACCDB',
    sql: ctx => `select top 400 id, status, invno, groupinvno, invdate, invduedate, invrefno, CustRefno, agencyrefno, invsource, invcategory, locationcode, agencycode, custcode, custname, vslcode, voycode, sercode, bound, pol, pod, shipmentDate,
                        invtype, seawaybl, surrender, invroe, invcurrency, invamount, amtreceived, amtbalance, invstatus, fcnno, originport, finalport, deliveryorderno, deliveryissdate, doprintstatus, finvstatus, isprinted, dateprinted, crdate, chgdate
                   from invoicemaster(nolock) where custcode in ${customers(ctx)} or invno in (select InvoiceNumber from invoicedbls(nolock) where BLNumber in ${blNos(ctx)})
                   order by invdate desc`,
    anonymize: { custname: 'company' } },
  { name: 'invoiceBls', db: 'ACCDB',
    sql: ctx => `select id, BLNumber, hblno, MCNnumber, InvoiceNumber, locationcode, Shipmenttype, payagency, agencycode from invoicedbls(nolock) where BLNumber in ${blNos(ctx)}
                 union
                 select d.id, d.BLNumber, d.hblno, d.MCNnumber, d.InvoiceNumber, d.locationcode, d.Shipmenttype, d.payagency, d.agencycode
                   from invoicedbls(nolock) d join (select top 400 invno from invoicemaster(nolock) where custcode in ${customers(ctx)} order by invdate desc) m on m.invno = d.InvoiceNumber` },
  { name: 'invoiceCharges', db: 'ACCDB',
    sql: ctx => `select top 1500 invdno, invno, blnumber, chargecode, chargename, conttype, itmqty, baseunit, itmcurrency, itmrate, itmtotal, itmROE, itmtotallocalinusd, itmTotalLocal, taxtot, cntrno, cntrtype, chargetype, paymode, freedays, paiddays, paidamount
                   from invoicedetail(nolock) where invno in (select top 400 invno from invoicemaster(nolock) where custcode in ${customers(ctx)} or invno in (select InvoiceNumber from invoicedbls(nolock) where BLNumber in ${blNos(ctx)}) order by invdate desc)
                   order by invno, invdno` },
  { name: 'receipts', db: 'ACCDB',
    sql: ctx => `select top 200 id, ReceiptNo, ReceiptDate, CustCode, CustName, locationcode, agencycode, Receiptmode, ReceiptCurrency, ReceiptAmt, ExcessAmt, BalAmt, Status, receiptstatus, receipttype, rectamtinusd, bl_no, remarks, CrDate
                   from receiptmaster(nolock) where CustCode in ${customers(ctx)} order by ReceiptDate desc`,
    anonymize: { CustName: 'company' } },
  { name: 'receiptAllocations', db: 'ACCDB',
    sql: ctx => `select ReceiptNo, ReceiptDNo, InvNo, ReceiptAmt, AmtBalance, receiptinvamt, rectamtinusd, rectbalamtinusd, custcode from receiptdetail(nolock)
                  where ReceiptNo in (select top 200 ReceiptNo from receiptmaster(nolock) where CustCode in ${customers(ctx)} order by ReceiptDate desc)` },

  // ────────────────────────────────────────────────────────────────────────────
  // IMPORT DOCUMENTATION (Imports) — arrival notices, delivery-order versions
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'arrivalNotices', db: 'IMPDB',
    sql: ctx => `select top 200 id, blnumber, hblnumber, arrivalnoticeno, prevarrivalno, usercode, locationcode, agencycode, custtype, customertype, status, IsPrinted, ecomprintstatus, servicecode, vesselcode, voyage, bound, portcode, terminalcode, groupcallid,
                        remainder, Reminderage, ArrivalNoticeParty, ArrivalNoticetype, ConsigneeNotice, NotifyNotice, emailprintstatus, CrDate, ChgDate
                   from reportcargoarrival(nolock) order by case when blnumber in ${blNos(ctx)} then 0 else 1 end, CrDate desc`,
    anonymize: { usercode: 'email' } },
  { name: 'deliveryOrderVersions', db: 'IMPDB',
    sql: `select top 100 * from deliveryorderversion(nolock)` },
];
