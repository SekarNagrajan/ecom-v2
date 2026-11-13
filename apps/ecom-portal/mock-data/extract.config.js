/**
 * Dataset catalogue for the mock-data extractor.
 *
 * Every entry becomes one fixture file: src/mocks/fixtures/<name>.json
 *
 *   name       fixture file name (also the key used by the MSW handlers)
 *   db         logical datasource from the EJB report: ECOMDB | MASTERDB | REPORTDB | LRPV1DS | VSSDB | ACCDB
 *   sql        string, or (ctx) => string. ctx.list('dataset','column') returns a quoted SQL IN-list
 *              built from a dataset extracted earlier, so children follow their parents.
 *   sp         stored-procedure name (alternative to sql). params: array, or (ctx) => array, bound positionally.
 *   anonymize  { column: kind } – kind ∈ company | firstName | lastName | fullName | email | phone |
 *              address | address2 | city | zip | text | remove. Same input ⇒ same fake output everywhere.
 *   transform  optional (rows, ctx) => rows for last-mile cleanup
 *   enabled    set false to skip
 *
 * Column lists are taken from the report's "Result columns consumed" sections, so what the UI receives
 * from the mock is what the current EJB layer actually returns. Password / token columns are never selected.
 */

/** All dates are shifted so this column's max value lands on "now" (when SHIFT_DATES_TO_NOW=true). */
export const dateAnchor = { dataset: 'bookings', column: 'datecr' };

// Anonymisation rule sets reused across party tables
const PARTY = {
  name: 'company',
  address1: 'address',
  address2: 'address2',
  city: 'city',
  zipCode: 'zip',
  telephone: 'phone',
  fax: 'phone',
  email: 'email',
};
const ENS = {
  cust_name: 'company',
  address: 'address',
  address1: 'address2',
  city: 'city',
  zipcode: 'zip',
  telephone: 'phone',
  email: 'email',
};

export const datasets = [
  // ────────────────────────────────────────────────────────────────────────────
  // MASTER DATA  (EcomV1MasterBean.getEcomV1MasterCache – LRPV1DS)
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'ports', db: 'LRPV1DS',
    sql: `select portcode, portname from ports(nolock) where status='A' and portcode not like 'xx%' order by portname` },
  { name: 'countries', db: 'LRPV1DS',
    sql: `select distinct countryname, countrycode, isdcode from country(nolock) where status='a' order by countryname asc` },
  { name: 'commodities', db: 'LRPV1DS',
    sql: `select distinct comdtycode, comdtyname from commodity(nolock) where status='A' order by comdtyname` },
  { name: 'packages', db: 'LRPV1DS',
    sql: `select packagecode, description from package(nolock) where status='A' order by description` },
  { name: 'services', db: 'LRPV1DS',
    sql: `select servicename, servicecode from service(nolock) where status='Active' order by servicename` },
  { name: 'vessels', db: 'LRPV1DS',
    sql: `select distinct rtrim(ltrim(VesselCode)) as VesselCode, VesselName from vesselmaster(nolock) where VesselCode not like 'xx%' order by VesselName` },
  { name: 'terminals', db: 'LRPV1DS',
    sql: `select terminalname, terminalcode from terminalanddepot(nolock) order by terminalname` },
  { name: 'equipments', db: 'LRPV1DS',
    sql: `select distinct Equiptype, equipdesc, TareKg from equipments(nolock) where status='A' order by Equiptype` },
  { name: 'transportServices', db: 'LRPV1DS',
    sql: `select trptsvccode, trptsvcname from transportservice(nolock) where status='A'` },
  { name: 'depots', db: 'LRPV1DS',
    sql: `select depot, description from DepotCode where status='A'` },
  { name: 'inTransitPods', db: 'LRPV1DS',
    sql: `select upper(dmsfinaldest) as dmsfinaldest, upper(dmsfinaldestdesc) as dmsfinaldestdesc from DMSInTransit where pod='Y' and status='A'` },

  // MASTERDB reference data
  { name: 'states', db: 'MASTERDB',
    sql: `select statecode, statedesc, countrycode from Statesmaster(nolock) where status='A' order by countrycode, statedesc` },
  { name: 'portCountryMap', db: 'MASTERDB',
    sql: `select portcode, countrycode from ports(nolock) where status='A'` },
  { name: 'carriers', db: 'MASTERDB',
    sql: `select carriercode, CARRIERNAME, ADDRESS, city, ZIPCODE from CARRIER(nolock)` },

  // REPORTDB reference data
  { name: 'shipmentTerms', db: 'REPORTDB',
    sql: `select ShipTerms, termsDesc from shipmentTerms(nolock) where status='A'` },
  { name: 'schedules', db: 'REPORTDB',
    sql: `select top 800 service, vessel, voyage, bound, port, terminal, arrdate, depdate, type, groupcallid
            from allschedules(nolock)
           where depdate between dateadd(day,-30,getdate()) and dateadd(day,75,getdate())
           order by depdate` },

  // ────────────────────────────────────────────────────────────────────────────
  // PORTAL CONFIG & CONTENT (ECOMDB)
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'menus', db: 'ECOMDB',
    sql: `select MenuId, MenuName, Category, RefNo, ClassValue, AttrValue, LabelValue, MenuType, ParentMenu, menuorder
            from MenuRegistration(nolock)
           where MenuStatus='A' and userttype='U' and menuorder is not null
           order by ParentMenu, menuorder` },
  { name: 'messages', db: 'ECOMDB',
    sql: `select Module, criteria, Type, usertype, subject, message
            from ecom_messageformat(nolock)
           where Status='A' and Type in ('msg','Img')` },
  { name: 'languages', db: 'ECOMDB', sql: `select langcode, langname from ecom_lang` },
  { name: 'advisories', db: 'ECOMDB',
    sql: `select id, advisoryname, description, createddate, status from EcomCustomerAdvisory(nolock) where status='A' order by createddate desc` },
  { name: 'loginImages', db: 'ECOMDB',
    sql: `select id, imagename, imagepath, displayorder, status from EcomImageUpload(nolock) where status='A' order by displayorder` },
  { name: 'hotlineContacts', db: 'ECOMDB',
    sql: `select countrycode, portcode, countryname, portname, ContactName, phone, email from ecomhotlinecontacts(nolock) order by countryname, portname`,
    anonymize: { ContactName: 'fullName', phone: 'phone', email: 'email' } },
  { name: 'cutoffConfig', db: 'ECOMDB',
    sql: `select port, terminal, cfsclosing, vgmclosing, docclosing, ediclosing, fullcntrclosing, excludeweekend from ecom_cutoffconfig(nolock)` },
  { name: 'notices', db: 'ECOMDB',
    sql: `select top 50 title, filename, cruser, crdate, chgdate from ecom_notice(nolock) order by crdate desc`,
    anonymize: { cruser: 'email' } },
  { name: 'notifications', db: 'ECOMDB',
    sql: `select top 60 enm.msgid, enm.message, enm.crdate, ed.custcode
            from EcomNotificationMaster enm(nolock)
            inner join EcomNotificationDetails ed(nolock) on enm.msgid = ed.msgid
           where enm.status='A'
           order by enm.crdate desc` },
  { name: 'globalConfig', db: 'ECOMDB',
    sql: `select pathname, pathvalue from globalconfigproduct(nolock)`,
    // Keep feature flags, drop anything that looks like a credential, URL or mailbox.
    transform: rows => rows.filter(r => !/pass|pwd|secret|key|token|url|mail|path/i.test(String(r.pathname))) },
  { name: 'fieldConfig', db: 'ECOMDB',
    sql: `select id, fieldcode, searchtype, searchvalue, shipmenttype, inputtype, status from fieldconfigdetails(nolock) where status='A'` },

  // ────────────────────────────────────────────────────────────────────────────
  // CUSTOMERS & USERS – sample the customers with the most recent bookings
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'activeCustomers', db: 'ECOMDB',
    sql: ctx => `select top ${ctx.env.SAMPLE_CUSTOMERS} cust_code, max(datecr) as lastBooking, count(*) as bookingCount
                   from ecombooking(nolock)
                  where cust_code is not null and cust_code <> ''
                  group by cust_code
                  order by max(datecr) desc` },

  { name: 'customerMaster', db: 'MASTERDB',
    sql: ctx => `select cm.CustCode, cm.CustName, cm.Address1, cm.Address2, cm.city, cm.statecode, cm.otherscity, cm.ZipCode,
                        cm.Phone, cm.countryid, cm.controllocation, cm.email, cm.custtype, cm.inactiveflag, cm.status
                   from customermaster cm(nolock)
                  where cm.CustCode in ${ctx.list('activeCustomers', 'cust_code')}`,
    anonymize: { CustName: 'company', Address1: 'address', Address2: 'address2', city: 'city', ZipCode: 'zip', Phone: 'phone', email: 'email' } },

  { name: 'users', db: 'ECOMDB',
    // ecom_reg_details – password / random_number deliberately NOT selected
    sql: ctx => `select loginname, User_Email, Title, First_Name, Last_Name, User_Phone, User_Mobile, User_Fax,
                        Comp_Name, Address, Address2, City, Pin_Code, Country, State, Comp_Phone, TaxID,
                        cust_code, control_location, agencycode, prefLang, preferredTimezone, status, isValid, userrole, registered_Date
                   from ecom_reg_details(nolock)
                  where status='A' and cust_code in ${ctx.list('activeCustomers', 'cust_code')}`,
    anonymize: {
      loginname: 'email', User_Email: 'email', First_Name: 'firstName', Last_Name: 'lastName',
      User_Phone: 'phone', User_Mobile: 'phone', User_Fax: 'phone', Comp_Phone: 'phone',
      Comp_Name: 'company', Address: 'address', Address2: 'address2', City: 'city', Pin_Code: 'zip', TaxID: 'remove',
    } },

  { name: 'userDetails', db: 'ECOMDB',
    sql: ctx => `select emailid, userrole, customercode, status, accepteddate, menuid, preferredTimezone, ccmailid, logindate, logoutdate, lastpwdup
                   from ecomuserdetails(nolock)
                  where customercode in ${ctx.list('activeCustomers', 'cust_code')}`,
    anonymize: { emailid: 'email', ccmailid: 'email' } },

  { name: 'customerMenus', db: 'ECOMDB',
    sql: ctx => `select custid, menuid from SplPrivilegeMenu(nolock) where custid in ${ctx.list('activeCustomers', 'cust_code')}` },

  // ────────────────────────────────────────────────────────────────────────────
  // BOOKINGS (ECOMDB) – parent first, then every child by ebookno
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'bookings', db: 'ECOMDB',
    sql: ctx => `select top ${ctx.env.SAMPLE_BOOKINGS}
                        ebookno, extBookNo, cust_code, agencyid, ebook_status, templatename, isamendment, version, appversion,
                        originPortId, finalPortId, loadPortId, dischargePortId, intransitport, preCarriage, onCarriage,
                        bookDate, bookReady, routeId, rateno, trptsvccode, nat_code, oceanfreight, salesagreedrate,
                        emptypickup, emptypickupdate, pickup_point, haulercode, haulagetype, pickupdate, dropdate,
                        AgencyRefNo, exportRef, custPO, customerreference, ShipperReference, ACID, cargoprotectid,
                        releasetype, ensfiling, enstype, t2lfiling, sisubmitparty,
                        remarks, declined_remarks, ccmailid, usercr, userup, datecr, dateup, submitted_date
                   from ecombooking(nolock)
                  where cust_code in ${ctx.list('activeCustomers', 'cust_code')}
                  order by dateup desc`,
    anonymize: { ccmailid: 'email', usercr: 'email', userup: 'email' } },

  { name: 'bookingCust', db: 'ECOMDB',
    sql: ctx => `select ebookno, cid, custTypeId, custId, countryId, name, address1, address2, city, zipCode, telephone, fax, email,
                        flag, toorder, stateid, eori, persontype
                   from ecombooking_cust(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')}`,
    anonymize: PARTY },
  { name: 'bookingCargo', db: 'ECOMDB',
    sql: ctx => `select ebookno, conid, containerno, eqpType, eqpSize, quantity, soc, ref_nor, dgFlag, tareWeight, grossWeight,
                        cargoWeight, weightUnit, eqpstatus, oog
                   from ecombooking_cargo(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')}` },
  { name: 'bookingCommodity', db: 'ECOMDB',
    sql: ctx => `select ebookno, conid, itemno, commodityFlag, commodity, HSCommodity, [package], packageQty, cargoVolume, volumnUnit,
                        nettwt, descr, bycode, byname, slcode, slname, cmdty_hblno
                   from ecombooking_commodity(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')}`,
    anonymize: { byname: 'company', slname: 'company' } },
  { name: 'bookingDg', db: 'ECOMDB',
    sql: ctx => `select ebookno, conid, itemno, MarinePollutant, unNo, [class], FlashPt, FlashPtUnit
                   from ecombooking_dg(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')}` },
  { name: 'bookingOog', db: 'ECOMDB',
    sql: ctx => `select ebookno, conid, containerno, leftft, rightft, [forward], alt, topft, unit, comItemNo
                   from ecombooking_oog(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')}` },
  { name: 'bookingRefer', db: 'ECOMDB',
    sql: ctx => `select ebookno, conid, itemno, containerno, ref_setTemp, ref_minTemp, ref_maxTemp, ref_tempUnit, humidity, humidity_flag,
                        drains, co2value, o2value, ventpercentage
                   from ecombooking_refer(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')}` },
  { name: 'bookingLeg', db: 'ECOMDB',
    sql: ctx => `select ebookno, leg_no, bound, dbound, servicecode, vesselcode, voyagecode, loadportid, dischargeportid, etddate, etadate,
                        legtypeid, groupcallid, callIdLoading, callIdDischarge, loadterminal, dischargeTerminal
                   from ecombooking_leg(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')} order by ebookno, leg_no` },
  { name: 'bookingHaulage', db: 'ECOMDB',
    sql: ctx => `select ebookno, eqprowid, eqpId, eqptypeid, loadLocation, loadlocationname, contactPerson, contactAddress, contactPhone,
                        contactEmail, referenceNumber, dropDate, remarks, docType, overWeight, stopSequence, TMSClientCode
                   from ecombooking_haulage(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')}`,
    anonymize: { contactPerson: 'fullName', contactAddress: 'address', contactPhone: 'phone', contactEmail: 'email' } },
  { name: 'bookingConf', db: 'ECOMDB',
    sql: ctx => `select ebookno, bkgcutoff, doccutoff, vgmcutoff, bbrorocutoff, hazcutoff, portentrycutoff
                   from ecombooking_conf(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')}` },
  { name: 'bookingFiles', db: 'ECOMDB',
    sql: ctx => `select ebookno, filecatgeory, filename from ecombooking_files(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')}` },
  { name: 'bookingIcs', db: 'ECOMDB',
    sql: ctx => `select ebookno, eucustom, bill_type, ens_type, payment_mode, cust_name, address, address1, country, state, telephone,
                        email, enseori, filing_type, city, zipcode
                   from ecombooking_ics_new(nolock) where ebookno in ${ctx.list('bookings', 'ebookno')}`,
    anonymize: ENS },
  { name: 'insurance', db: 'ECOMDB',
    sql: ctx => `select book_no, lrpbook_no, eqpid, commodity, quoteno, policy_no, insurance_amount, partytype, suminsured, status,
                        contactName, insuredParty, email, datecr
                   from ecom_insurance(nolock) where book_no in ${ctx.list('bookings', 'ebookno')}`,
    anonymize: { contactName: 'fullName', insuredParty: 'company', email: 'email' } },

  // ────────────────────────────────────────────────────────────────────────────
  // SHIPPING INSTRUCTIONS & B/L DRAFTS (ECOMDB) – editbl=0 rows are SIs, editbl=1 rows are B/L amendments
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'shippingInstructions', db: 'ECOMDB',
    sql: ctx => `select top ${ctx.env.SAMPLE_SI}
                        eSINo, blno, bookno, custcode, status, editbl, blversion, appversion,
                        Vessel, Voyage, bound, pol, pod, pla, pld, plaHeaderName, polHeaderName, podHeaderName, pldHeaderName,
                        shipper, shippername, consigee, consigeename, notify, notifyname,
                        AESNumber, AESDiscliamer, releasetype, declaredvalue, blType, bltype_UAE, Freight, ACID, cargoprotectid,
                        t2lfiling, packinglst, invoiceupload, telexrls, enstype, mpci_id, nvocc,
                        custremarks, declined_remarks, ccmailid, CrUser, CrDate, ChgUser, ChgDate
                   from ecomSI(nolock)
                  where custcode in ${ctx.list('activeCustomers', 'cust_code')}
                  order by ChgDate desc`,
    anonymize: { shippername: 'company', consigeename: 'company', notifyname: 'company', ccmailid: 'email', CrUser: 'email', ChgUser: 'email' } },

  { name: 'siCust', db: 'ECOMDB',
    sql: ctx => `select eSINo, custTypeId, custId, countryId, name, address1, address2, city, zipCode, telephone, fax, email,
                        flag, toorder, stateId, eori, persontype
                   from ecomSI_cust(nolock) where eSINo in ${ctx.list('shippingInstructions', 'eSINo')}`,
    anonymize: PARTY },
  { name: 'siCargo', db: 'ECOMDB',
    sql: ctx => `select eSINo, conId, eqpType, eqpSize, containerno, shipperOwn, carrierSeal, ShipperSeal, tareWeight, cargoWeight,
                        grossweight, weightUnit, ref_nor, eqpstatus, oog, dgflag, rate_eqpTypeid
                   from ecomSI_cargo(nolock) where eSINo in ${ctx.list('shippingInstructions', 'eSINo')} order by eSINo, conId` },
  { name: 'siCommodity', db: 'ECOMDB',
    sql: ctx => `select eSINo, conId, containerno, itemno, commodity, [package], packageQty, itemWeight, itemWeightUnit, itemVolume,
                        itemVolumeUnit, marksNo, marksDesc, hscommodity, hazardous, nettwt, hssuffixcode, bycode, byname, slcode, slname, cmdty_hblno
                   from ecomSI_commodity(nolock) where eSINo in ${ctx.list('shippingInstructions', 'eSINo')}`,
    anonymize: { byname: 'company', slname: 'company' } },
  { name: 'siDg', db: 'ECOMDB',
    sql: ctx => `select eSIno as eSINo, conId, containerno, itemno, MarinePollutant, unNo, [class], FlashPt, FlashPtUnit, imocontact, imophone
                   from ecomSI_dg(nolock) where eSIno in ${ctx.list('shippingInstructions', 'eSINo')}`,
    anonymize: { imocontact: 'fullName', imophone: 'phone' } },
  { name: 'siOog', db: 'ECOMDB',
    sql: ctx => `select eSIno as eSINo, conId, comItemNo, containerno, leftft, rightft, [forward], Alt, topft, Unit
                   from ecomSI_oog(nolock) where eSIno in ${ctx.list('shippingInstructions', 'eSINo')}` },
  { name: 'siReefer', db: 'ECOMDB',
    sql: ctx => `select eSIno as eSINo, conId, containerno, ref_setTemp, ref_minTemp, ref_maxTemp, ref_tempUnit, humidity, humidity_flag,
                        drains, co2value, o2value, ventpercentage
                   from ecomSI_reefer(nolock) where eSIno in ${ctx.list('shippingInstructions', 'eSINo')}` },
  { name: 'siCharges', db: 'ECOMDB',
    sql: ctx => `select ec.esino as eSINo, ec.chargeid, c.chargename, ec.payagencyid, ec.custtypeid, ec.prepaidcollect, ec.eqptypeid
                   from ecomsi_charges ec(nolock)
                   inner join charges c(nolock) on ec.chargeid = c.chargecode
                  where c.status='A' and ec.esino in ${ctx.list('shippingInstructions', 'eSINo')}` },
  { name: 'siFiles', db: 'ECOMDB',
    sql: ctx => `select eSINo, FileCatgeory, FileName from ecomSI_files(nolock) where eSINo in ${ctx.list('shippingInstructions', 'eSINo')}` },
  { name: 'siIcs', db: 'ECOMDB',
    sql: ctx => `select eSINo, eucustom, bill_type, ens_type, payment_mode, cust_name, address, address1, country, state, telephone,
                        email, enseori, filing_type, city, zipcode
                   from ecomsi_ics_new(nolock) where eSINo in ${ctx.list('shippingInstructions', 'eSINo')}`,
    anonymize: ENS },
  { name: 'siRequestMaster', db: 'ECOMDB',
    sql: ctx => `select reqID, userId, requestedSI, createdSI, bookno, custcode, crDate, chgDate
                   from ecomSIRequestMaster(nolock) where bookno in ${ctx.list('shippingInstructions', 'bookno')}`,
    anonymize: { userId: 'email' } },

  // ────────────────────────────────────────────────────────────────────────────
  // VGM (ECOMDB)
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'vgm', db: 'ECOMDB',
    sql: ctx => `select top ${ctx.env.SAMPLE_VGM}
                        book_no, bl_no, eqptype, eqpid, vgm_source, vgm_type, vgm_ref_number, VGM_order_Number, vgm_obtained_date,
                        vgm_weight, vgm_unit, vgm_obtained_method, vgm_company_name, VGM_Address1, VGM_Address2, VGM_Zipcode, VGM_City,
                        VGM_Country, vgm_authorized_person, Telephone, Fax, Email, status, version_no, oprstatus, usercr, datecr, dateup
                   from ecom_vgmsolas(nolock)
                  where book_no in ${ctx.list('bookings', 'extBookNo')} or book_no in ${ctx.list('bookings', 'ebookno')}
                  order by datecr desc`,
    anonymize: { vgm_company_name: 'company', VGM_Address1: 'address', VGM_Address2: 'address2', VGM_City: 'city', VGM_Zipcode: 'zip',
                 vgm_authorized_person: 'fullName', Telephone: 'phone', Fax: 'phone', Email: 'email', usercr: 'email' } },

  // ────────────────────────────────────────────────────────────────────────────
  // ONLINE PAYMENTS (ECOMDB)
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'payments', db: 'ECOMDB',
    sql: ctx => `select top ${ctx.env.SAMPLE_PAYMENTS}
                        requestId, customerCode, loginName, paymentType, currency, amountUsd, amountCents, status, description,
                        agencyCode, errorMessage, createdAt, updatedAt
                   from Ecom_OnlinePayment(nolock)
                  where customerCode in ${ctx.list('activeCustomers', 'cust_code')}
                  order by createdAt desc`,
    anonymize: { loginName: 'email' } },
  { name: 'paymentReferences', db: 'ECOMDB',
    sql: ctx => `select requestId, refType, refNo, custType, amountUsd, amountCents, remarks, createdAt
                   from Ecom_OnlinePayment_Reference(nolock) where requestId in ${ctx.list('payments', 'requestId')}` },

  // ────────────────────────────────────────────────────────────────────────────
  // SUMMARY STORED PROCEDURES – these drive the list screens in the current app.
  // Parameter order is positional and taken from the Java call sites; confirm against the SP
  // definitions (sp_helptext) before enabling. Disabled by default.
  // ────────────────────────────────────────────────────────────────────────────
  { name: 'bookingSummary', db: 'REPORTDB', enabled: false,
    // EcomBookingBean.getBookingDetail(usercode, fromDate, toDate, type, custType, v1DataEnableStatus)
    sp: 'usp_getecombookingsummary',
    params: ctx => [ctx.values('activeCustomers', 'cust_code')[0], '2024-01-01', '2026-12-31', 'ALL', 'AP', 'N'] },
  { name: 'siSummary', db: 'REPORTDB', enabled: false,
    // EcomShippingInstructionBean.getSISummary – single parameter (customer id)
    sp: 'usp_ecomSISummaryNew',
    params: ctx => [ctx.values('activeCustomers', 'cust_code')[0]] },
  { name: 'blSummary', db: 'LRPV1DS', enabled: false,
    // EcomBLBean.getBLSummary – single parameter (customer id)
    sp: 'usp_GetBLNumbersEcomOn',
    params: ctx => [ctx.values('activeCustomers', 'cust_code')[0]] },
];
