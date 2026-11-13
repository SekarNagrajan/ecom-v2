// Modified by Sekar Nagarajan (2026-10-17 02:25)
import { describe, expect, it } from 'vitest';

import { ciRow, db } from '../db';
import { toDateOnly } from './booking-shared.bridge';
import { ratesFromRows } from './booking-rates.bridge';
import {
  FAK_COMMODITY,
  bestTariffRow,
  buildQuote,
  contractTariffRows,
  contractsFromRows,
  createQuote,
  customerAccountCodes,
  equipmentKey,
  fixtureContracts,
  fixtureQuotes,
  fixtureSurcharges,
  fixtureTariffs,
  laneBookingProfile,
  laneRoute,
  laneValidity,
  listQuotes,
  mapTariff,
  matchesEquipment,
  quoteStatusFor,
  quotesFromRows,
  rateEquipmentLabel,
  resetQuotes,
  searchTariffRows,
  stableHash,
  surchargeAmount,
  surchargeCodesForLane,
  surchargesFromRows,
  tariffCommodity,
} from './rates.bridge';

const tariff = (over: Record<string, unknown>) => ciRow({
  rateno: 'M26120100012', loadport: 'INNSA', dischport: 'AEJEA', pol: 'INNSA', pod: 'AEJEA', custcode: '', eqptype: '40HC',
  currency: 'USD', localamount: 1250, validfrom: '2025-01-01T22:15:04.472Z', validto: '2030-11-11T22:15:04.472Z',
  quotestatus: 'A', status: 'A', ratetype: 'TAR', itemno: 55, tos: '', soc: 'N', dgflag: 'N', oogflag: '', nor: '', service: 'ZZZ', allin: '',
  ...over,
});

const tariffs = [
  tariff({}),
  tariff({ eqptype: 'HC40', itemno: 26 }),                                        // same family → collapsed
  tariff({ eqptype: 'DV20', itemno: 8, localamount: 1250, allin: 'BAF,CAF' }),
  tariff({ rateno: 'M25070800010', eqptype: 'DV20', itemno: 1, localamount: 300, validto: '2026-12-31T22:15:04.472Z' }),
  tariff({ rateno: 'M27010100001', pod: 'SGSIN', dischport: 'SGSIN', eqptype: '40HC', itemno: 2, localamount: 1000 }),
  tariff({ rateno: 'X', eqptype: '40HC', itemno: 9, status: 'I' }),                // inactive → ignored
];
const routes = [
  ciRow({ routeid: 'RU1', origin: 'INAMD', BLPOL: 'INNSA', BlPod: 'AEJEA', delivery: 'AEJEA', MainSvc: 'FDR', DefRoute: 'Y', Status: 'A' }),
  ciRow({ routeid: 'RU2', origin: 'INNSA', BLPOL: 'INNSA', BlPod: 'AEJEA', delivery: 'AEJEA', MainSvc: 'FART', DefRoute: 'Y', Status: 'A' }),
];
const charges = [
  ciRow({ chargecode: 'BAF', chargename: 'BUNKER ADJUSTMENT FACTOR', chargetype: 'B', chargegrp: 'SURCHARGE', defpaymode: 'P' }),
  ciRow({ chargecode: 'CAF', chargename: 'CURRENCY ADJUSTMENT FACTOR', chargetype: 'B', chargegrp: 'OTHERS', defpaymode: 'P' }),
  ciRow({ chargecode: 'TOC', chargename: 'TERMINAL HANDLING CHARGE - ORIGIN', chargetype: 'P', chargegrp: 'TERMINAL HANDLING', defpaymode: 'P' }),
  ciRow({ chargecode: 'FST', chargename: 'FREIGHT', chargetype: 'B', chargegrp: 'FREIGHT', defpaymode: 'P' }),
];
const bookings = [
  ciRow({ ebookno: 'BKON1', cust_code: '20001374', ebook_status: 'A', originPortId: 'INNSA', finalPortId: 'AEJEA', preCarriage: 'M', onCarriage: 'C' }),
  ciRow({ ebookno: 'BKON2', cust_code: '20001374', ebook_status: 'T', originPortId: 'INNSA', finalPortId: 'SGSIN' }), // template → ignored
];

describe('rates bridge — equipment vocabulary', () => {
  it('parses codes in both spellings and the portal labels onto one key', () => {
    expect(equipmentKey('40HC')).toEqual({ size: '40', family: 'HC' });
    expect(equipmentKey('HC40')).toEqual({ size: '40', family: 'HC' });
    expect(equipmentKey('RE20')).toEqual({ size: '20', family: 'RF' });
    expect(equipmentKey("40' High Cube Dry")).toEqual({ size: '40', family: 'HC' });
    expect(equipmentKey("20' Dry Standard")).toEqual({ size: '20', family: 'DV' });
    expect(equipmentKey("40' Reefer Container")).toEqual({ size: '40', family: 'RF' });
    expect(equipmentKey('ALL')).toBeNull();
    expect(equipmentKey('')).toBeNull();
  });

  it('matches fixture codes against the filter and labels them in the filter vocabulary', () => {
    expect(matchesEquipment('20DC', equipmentKey("20' Standard Dry"))).toBe(true);
    expect(matchesEquipment('DV20', equipmentKey("20' Standard Dry"))).toBe(true);
    expect(matchesEquipment('40DC', equipmentKey("20' Standard Dry"))).toBe(false);
    expect(matchesEquipment('DFBN', null)).toBe(true);
    expect(rateEquipmentLabel('40HC')).toBe("40' High Cube Dry");
    expect(rateEquipmentLabel('20DC')).toBe("20' Standard Dry");
    expect(rateEquipmentLabel('RE40')).toBe("40' Reefer Container");
    expect(rateEquipmentLabel('20TK')).toBe("20' Tank");
    expect(rateEquipmentLabel('DFBN')).toBe('DRY 45 CONTAINER'); // no portal family → Masters description
    expect(rateEquipmentLabel('QQQQ')).toBe('QQQQ'); // no family, no master → code
  });
});

describe('rates bridge — tariffs', () => {
  it('filters by lane and equipment, collapses one row per rate number + label and orders cheapest first', () => {
    const rows = searchTariffRows(tariffs, { loadPort: 'INNSA', dischPort: 'AEJEA', eqpType: "40' High Cube Dry" });
    expect(rows.map(r => `${r.rateno}/${r.itemno}`)).toEqual(['M26120100012/26']); // HC40 (itemno 26) sorts before 40HC (55)
    const dry = searchTariffRows(tariffs, { loadPort: 'INNSA - Nhava Sheva', dischPort: 'AEJEA', eqpType: 'DV20' });
    expect(dry.map(r => `${r.rateno}:${r.localamount}`)).toEqual(['M25070800010:300', 'M26120100012:1250']);
    expect(searchTariffRows(tariffs, { loadPort: 'INNSA', dischPort: 'AEJEA' })).toHaveLength(3);
    expect(searchTariffRows(tariffs, { loadPort: 'USNYC', dischPort: 'SGSIN' })).toEqual([]);
  });

  it('honours the validity date filter', () => {
    expect(searchTariffRows(tariffs, { loadPort: 'INNSA', dischPort: 'AEJEA', eqpType: 'DV20', date: '2027-06-01' }).map(r => r.rateno)).toEqual(['M26120100012']);
    expect(searchTariffRows(tariffs, { loadPort: 'INNSA', dischPort: 'AEJEA', date: '2024-01-01' })).toEqual([]);
  });

  it('maps a row onto TariffDTO with master names, service from the routes and the FAK commodity', () => {
    const dto = mapTariff(tariffs[0], routes);
    expect(dto).toMatchObject({
      id: 'trf-M26120100012-55',
      loadPort: 'INNSA', loadPortName: 'NHAVA SHEVA,MUMBAI',
      dischPort: 'AEJEA', dischPortName: 'JEBEL ALI, UAE',
      eqpType: "40' High Cube Dry",
      commodityCode: FAK_COMMODITY.code, commodityName: FAK_COMMODITY.name,
      currency: 'USD', tariffAmount: 1250, localAmount: 1250,
      effectiveFrom: toDateOnly('2025-01-01T22:15:04.472Z'), effectiveTo: toDateOnly('2030-11-11T22:15:04.472Z'),
      soc: 'No', nor: false,
      transService: 'FART', // the default route whose origin is the POL itself wins over the INAMD one
    });
    expect(mapTariff(tariffs[0], []).transService).toBeUndefined(); // 'ZZZ' is not a real service
    expect(mapTariff(tariff({ soc: 'Y', nor: 'Y', service: 'ME1' }), []).transService).toBe('ME1');
    expect(tariffCommodity('AUTO-PARTS')).toEqual({ code: 'AUTO-PARTS', name: 'AUTO-PARTS (FAK)' });
    expect(tariffCommodity('ALL')).toEqual({ ...FAK_COMMODITY });
  });

  it('picks the cheapest exact code, then the family, for the booking wizard', () => {
    expect(bestTariffRow(tariffs, 'INNSA', 'AEJEA', 'DV20')?.rateno).toBe('M25070800010');
    expect(bestTariffRow(tariffs, 'INNSA', 'AEJEA', '20DC')?.rateno).toBe('M25070800010'); // family match
    expect(bestTariffRow(tariffs, 'INNSA', 'AEJEA', 'RE20')).toBeUndefined();
    expect(laneRoute(routes, 'INNSA', 'AEJEA')?.routeid).toBe('RU2');
    expect(laneRoute(routes, 'INNSA', 'SGSIN')).toBeUndefined();
  });

  it('feeds the published tariff into the booking rate picker without breaking the placeholder path', () => {
    const header = ciRow({ ebookno: 'B1', ebook_status: 'A', originPortId: 'INNSA', finalPortId: 'AEJEA', rateno: '', salesagreedrate: '', version: 1, cust_code: '20001374', dateup: '2026-10-01' });
    const cargo = [ciRow({ ebookno: 'B1', eqpSize: 'DV20' }), ciRow({ ebookno: 'B1', eqpSize: 'RE20' })];
    const withTariff = ratesFromRows([header], cargo, [], tariffs);
    expect(withTariff[0].rate).toMatchObject({ rateNo: 'M25070800010', amount: 300, currency: 'USD', rateType: 'TAR' });
    expect(withTariff[1].rate).toMatchObject({ rateNo: 'RT-INNSAAEJEA-RE20', rateType: 'CMS' }); // no reefer tariff → placeholder
    expect(ratesFromRows([header], cargo, [])[0].rate.rateNo).toBe('RT-INNSAAEJEA-DV20');
  });
});

describe('rates bridge — surcharges', () => {
  it('is deterministic: same code + size → same amount, larger boxes cost more', () => {
    expect(stableHash('BAF')).toBe(stableHash('BAF'));
    expect(stableHash('BAF')).not.toBe(stableHash('CAF'));
    expect(surchargeAmount('BAF', "20' Standard Dry")).toBe(surchargeAmount('baf', '20DC'));
    expect(surchargeAmount('BAF', "40' High Cube Dry")).toBe(Math.round(surchargeAmount('BAF', '20DC') * 1.5));
    expect(surchargeAmount('BAF', '20DC')).toBeGreaterThanOrEqual(40);
    expect(surchargeAmount('BAF', '20DC')).toBeLessThanOrEqual(275);
  });

  it('takes the all-in codes of the lane first, then the standard accessorials, and drops freight / unknown codes', () => {
    expect(surchargeCodesForLane(tariffs.slice(0, 3))).toEqual(['BAF', 'CAF', 'PSS', 'EBS', 'TOC', 'THD']);
    const rows = surchargesFromRows(charges, tariffs, { pol: 'INNSA', pod: 'AEJEA', eqpType: "40' High Cube Dry" });
    expect(rows.map(s => s.chargeCode)).toEqual(['BAF', 'CAF', 'TOC']);
    expect(rows[0]).toMatchObject({
      id: 'sur-BAF-INNSAAEJEA-40',
      chargeName: 'BUNKER ADJUSTMENT FACTOR',
      origin: 'INNSA', delivery: 'AEJEA', loadRegion: 'India', dischargeRegion: 'United Arab Emirates',
      eqpType: "40' High Cube Dry", currency: 'USD', isNor: false,
      effectiveFrom: toDateOnly('2025-01-01T22:15:04.472Z'), effectiveTo: toDateOnly('2030-11-11T22:15:04.472Z'),
    });
  });

  it('falls back to the lane’s most common equipment label and the calendar year when nothing is known', () => {
    const rows = surchargesFromRows(charges, tariffs.slice(2), { origin: 'INNSA', delivery: 'AEJEA' });
    expect(rows[0].eqpType).toBe("20' Standard Dry"); // the lane's rows are both DV20
    const none = surchargesFromRows(charges, tariffs, { pol: 'USNYC', pod: 'SGSIN' }, new Date('2026-10-17'));
    expect(none.map(s => s.chargeCode)).toEqual(['BAF', 'CAF', 'TOC']);
    expect(none[0]).toMatchObject({ eqpType: "20' Standard Dry", effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31' });
    expect(laneValidity([], new Date('2026-10-17'))).toEqual({ from: '2026-01-01', to: '2026-12-31' });
  });
});

describe('rates bridge — contracts', () => {
  const src = { tariffs, routes, charges, bookings, customerCode: '20001374' };

  it('uses real custcode rows when present, else the demo customer’s booked lanes', () => {
    const real = [tariff({ custcode: '1111', rateno: 'C1' }), tariff({})];
    expect(contractTariffRows(real, bookings, '20001374').map(r => r.rateno)).toEqual(['C1']);
    const derived = contractTariffRows(tariffs, bookings, '20001374');
    expect(derived.every(r => r.custcode === '20001374')).toBe(true);
    expect(derived.some(r => r.pod === 'SGSIN')).toBe(false); // template booking lane excluded
    expect(derived).toHaveLength(4); // the active INNSA>AEJEA rows
  });

  it('groups per rate number + equipment label (newest validity, then rate number) with surcharges and carriage terms', () => {
    const out = contractsFromRows(src, { pol: 'INNSA', pod: 'AEJEA' });
    expect(out.map(c => `${c.contractNo}|${c.eqpType}`)).toEqual([ // all share validfrom → rate number order
      "M25070800010|20' Standard Dry",
      "M26120100012|20' Standard Dry",
      "M26120100012|40' High Cube Dry",
    ]);
    const newer = contractsFromRows({ ...src, tariffs: [tariffs[0], tariff({ rateno: 'A', validfrom: '2026-01-01' })] }, {});
    expect(newer.map(c => c.contractNo)).toEqual(['A', 'M26120100012']);
    const hc = out[2];
    expect(hc).toMatchObject({
      id: 'ctr-M26120100012-26', rateNo: 'M26120100012/26',
      customerCode: '20001374', customerName: 'Wisozk, Turcotte and Anderson',
      originPort: 'INNSA', deliveryPort: 'AEJEA', deliveryPortName: 'JEBEL ALI, UAE',
      commodity: FAK_COMMODITY.code, oceanFreight: 1250, currency: 'USD',
      soc: 'No', carrTerms: 'CY/DOOR', transService: 'FART', nor: false,
    });
    expect(hc.surcharges.map(s => s.chargeCode)).toEqual(['BAF', 'CAF', 'TOC']);
    expect(hc.subjectToChargesAmount).toBe(hc.surcharges.reduce((n, s) => n + s.amount, 0));
    expect(contractsFromRows(src, { pol: 'INNSA', pod: 'AEJEA', contractNo: '2507' })).toHaveLength(1);
    expect(contractsFromRows(src, { customerCode: 'NOPE' })).toEqual([]);
  });
});

describe('rates bridge — quotes', () => {
  const searches = [
    { id: '918', custcode: '20001374', originport: 'INNSA', destport: 'AEJEA', crDate: '2026-10-17T06:00:00Z' },
    { id: '917', custcode: '20001374', originport: 'INNSA', destport: 'AEJEA', crDate: '2026-10-17T05:00:00Z' }, // same lane + day → folded
    { id: '910', custcode: '20001374', originport: 'INNSA', destport: 'AEJEA', crDate: '2026-10-14T05:00:00Z' },
    { id: '880', custcode: '20001374', originport: 'INBLR', destport: 'AESHJ', crDate: '2026-09-01T05:00:00Z' },
    { id: '700', custcode: '2024000011', originport: 'INNSA', destport: 'AEJEA', crDate: '2026-10-16T05:00:00Z' }, // other customer
  ].map(ciRow);
  const quoteSrc = {
    searches, tariffs, customerCode: '20001374', customer: 'Acme',
    bookings: [ciRow({ ebookno: 'BK1', originPortId: 'INNSA', finalPortId: 'AEJEA', ebook_status: 'A' })],
    cargo: [ciRow({ ebookno: 'BK1', eqpSize: 'RE20', quantity: 2, cargoWeight: 12000 }), ciRow({ ebookno: 'BK1', eqpSize: 'RE20', quantity: 2, cargoWeight: 14000 })],
    commodities: [ciRow({ ebookno: 'BK1', descr: 'Frozen Fish' })],
  };

  it('profiles a lane from what the customer books there and falls back to 20ft dry FAK', () => {
    expect(laneBookingProfile(quoteSrc.bookings, quoteSrc.cargo, quoteSrc.commodities, 'INNSA', 'AEJEA'))
      .toEqual({ eqpType: "20' Reefer Container", eqpQuantity: 2, commodity: 'Frozen Fish', cargoWeightKg: 13000 });
    expect(laneBookingProfile([], [], [], 'INBLR', 'AESHJ')).toMatchObject({ eqpType: "20' Standard Dry", eqpQuantity: 1, cargoWeightKg: 18000 });
  });

  it('ages enquiries into pending → quoted / accepted → accepted / expired deterministically', () => {
    expect(quoteStatusFor(0.5, '1', false)).toBe('PENDING_REVIEW');
    expect(['PENDING_REVIEW', 'QUOTED', 'ACCEPTED']).toContain(quoteStatusFor(3, '1', false));
    expect(['ACCEPTED', 'EXPIRED']).toContain(quoteStatusFor(40, '880', true));
    expect(quoteStatusFor(40, '880', true)).toBe(quoteStatusFor(40, '880', true));
    expect(quoteStatusFor(3, '1', false, false)).toBe('PENDING_REVIEW'); // no tariff → cannot be quoted
    expect(quoteStatusFor(40, '1', true, false)).toBe('EXPIRED');
  });

  it('derives one quote per lane and day from the customer’s own route searches, newest first', () => {
    const now = new Date('2026-10-17T10:00:00Z');
    const quotes = quotesFromRows(quoteSrc, now);
    // newest search per lane first (918 INNSA→AEJEA, 880 INBLR→AESHJ), then earlier days of known lanes (910)
    expect(quotes.map(q => q.id)).toEqual(['qte-log-918', 'qte-log-880', 'qte-log-910']);
    expect(quotes[0]).toMatchObject({ quoteNo: 'QTE260918', status: 'PENDING_REVIEW', quotedAmountUsd: 0, originPort: 'INNSA', deliveryPort: 'AEJEA', eqpType: "20' Reefer Container", customerName: 'Acme', validFrom: '2026-10-17', validTo: '2026-11-01' });
    expect(quotes[1].status).toBe('EXPIRED'); // INBLR→AESHJ has no tariff and its validity lapsed
    expect(['PENDING_REVIEW', 'QUOTED', 'ACCEPTED']).toContain(quotes[2].status);
    if (quotes[2].status !== 'PENDING_REVIEW') expect(quotes[2].quotedAmountUsd).toBeGreaterThan(0); // priced from the INNSA→AEJEA reefer tariff
    expect(quotesFromRows(quoteSrc, now, 1)).toHaveLength(1);
  });

  it('lists session requests ahead of the fixture-derived enquiries and prices new requests from the lane tariff', () => {
    resetQuotes();
    expect(listQuotes()).toEqual(fixtureQuotes());
    expect(fixtureQuotes().length).toBeGreaterThan(0);
    const input = { originPort: 'INNSA', deliveryPort: 'AEJEA', eqpType: 'DV20', eqpQuantity: 2, commodity: 'GEN-CGO', cargoWeightKg: 18000 };
    const q = buildQuote(input, tariffs, 'Acme', new Date('2026-10-17T10:30:00'));
    expect(q).toMatchObject({
      customerName: 'Acme', originPort: 'INNSA', originPortName: 'NHAVA SHEVA,MUMBAI', deliveryPort: 'AEJEA',
      eqpType: 'DV20', eqpQuantity: 2, quotedAmountUsd: 300, status: 'PENDING_REVIEW',
      validFrom: '2026-10-17', validTo: '2026-11-01', createdAt: '2026-10-17 10:30',
    });
    expect(q.quoteNo).toMatch(/^QTE\d{6}$/);
    expect(buildQuote({ ...input, expectedAmountUsd: 999 }, tariffs, 'Acme').quotedAmountUsd).toBe(999);
    expect(buildQuote({ ...input, originPort: 'USNYC' }, tariffs, 'Acme').quotedAmountUsd).toBe(0);
    const created = createQuote(input);
    expect(created.customerName).toBe('Wisozk, Turcotte and Anderson');
    expect(listQuotes()[0].id).toBe(created.id);
    expect(listQuotes()).toHaveLength(fixtureQuotes().length + 1);
    resetQuotes();
  });

  it('gives every rates tab data on the demo lane', () => {
    expect(fixtureTariffs({ loadPort: 'INNSA', dischPort: 'AEJEA' }).length).toBeGreaterThan(0);
    const surcharges = fixtureSurcharges({ pol: 'INNSA', pod: 'AEJEA' });
    expect(surcharges.length).toBeGreaterThan(0);
    expect(surcharges.every(x => x.amount > 0 && x.chargeName)).toBe(true);
    const contracts = fixtureContracts({ pol: 'INNSA', pod: 'AEJEA' });
    expect(contracts.length).toBeGreaterThan(0);
    expect(contracts.every(c => c.contractNo.startsWith('SVM') && c.customerCode === '20001374' && c.oceanFreight >= 0)).toBe(true); // corporate contracts of the demo customer
    expect(fixtureContracts({}).length).toBeGreaterThanOrEqual(contracts.length);
    const statuses = new Set(fixtureQuotes().map(q => q.status));
    expect(fixtureQuotes().length).toBeGreaterThanOrEqual(5);
    expect(statuses.size).toBeGreaterThanOrEqual(2);
    expect(fixtureQuotes().every(q => q.originPortName && q.deliveryPortName && q.quoteNo.startsWith('QTE'))).toBe(true);
  });
});

describe('rates bridge — corporate contracts', () => {
  const contracts = [ciRow({ CorporateNo: 'SVMECO240005080', CustCode: '20001374', status: 'A', Period: 'YEARLY', ValidFrom: '2024-05-08T00:00:00Z', ValidTo: '2035-05-08T00:00:00Z' })];
  const line = (over: Record<string, unknown>) => ciRow({
    corporateNo: 'SVMECO240005080', itemNo: 1, custCode: '20001374', pol: 'INNSA', pod: 'AEJEA', eqpType: '20DC', locAmt: 536, locCurrency: 'USD',
    validFrom: '2024-05-08T00:00:00Z', validTo: '2035-05-08T00:00:00Z', servicecode: 'TOM', Tservice: 'CY / CY', TOS: 'ALL', Soc: 'N', Nor: 'N', conStatus: 'Y', statusFlag: 'A', ...over,
  });
  const contractLines = [
    line({}),
    line({ itemNo: 2, eqpType: 'RE20', locAmt: 1230 }),
    line({ itemNo: 3, statusFlag: 'V' }),                                   // void → ignored
    line({ corporateNo: 'OTHER1', custCode: 'SVM1483', itemNo: 1 }),          // another customer
  ];
  const contractSurcharges = [
    ciRow({ corporateNo: 'SVMECO240005080', itemNo: 1, chargeCode: 'THD', currency: 'USD', amount: 150, surEqp: 'DV20', statusFlag: 'A' }),
    ciRow({ corporateNo: 'SVMECO240005080', itemNo: 1, chargeCode: 'BAF', currency: 'USD', amount: 90, surEqp: 'DV40', statusFlag: 'A' }),  // 40' box → not for the 20' line
    ciRow({ corporateNo: 'SVMECO240005080', itemNo: 1, chargeCode: 'ADM', currency: 'USD', amount: 25, surEqp: 'LP', statusFlag: 'A' }),    // per B/L → applies
    ciRow({ corporateNo: 'SVMECO240005080', itemNo: 2, chargeCode: 'ECP', currency: 'USD', amount: 300, surEqp: 'RE20', statusFlag: 'A' }),
  ];
  const contractRouting = [ciRow({ CorporateNo: 'SVMECO240005080', itemNo: 1, origin: 'INNSA', pol: 'INNSA', pod: 'AEJEA', delivery: 'AEDXB', svcCode: 'TOM', defRout: 'Y' })];
  const contractCommodities = [ciRow({ corporateNo: 'SVMECO240005080', itemNo: 1, commodityCode: '62' })];
  const src = { tariffs, routes, charges, bookings, customerCode: '20001374', contracts, contractLines, contractSurcharges, contractRouting, contractCommodities };

  it('maps a corporate contract line with its own surcharges, routing and commodity', () => {
    const out = contractsFromRows(src, { pol: 'INNSA', pod: 'AEJEA' }, new Date('2026-10-17'));
    expect(out.map(c => c.id)).toEqual(['ctr-SVMECO240005080-1', 'ctr-SVMECO240005080-2']);
    expect(out[0]).toMatchObject({
      contractNo: 'SVMECO240005080', rateNo: 'SVMECO240005080/1', customerCode: '20001374', customerName: 'Wisozk, Turcotte and Anderson',
      originPort: 'INNSA', deliveryPort: 'AEDXB', eqpType: "20' Standard Dry", oceanFreight: 536, currency: 'USD',
      soc: 'No', nor: false, carrTerms: 'CY/CY', transService: 'TOM', effectiveFrom: '2024-05-08', effectiveTo: '2035-05-08', commodity: '62',
    });
    expect(out[0].surcharges.map(x => `${x.chargeCode}:${x.amount}`)).toEqual(['THD:150', 'ADM:25']);
    expect(out[0].subjectToChargesAmount).toBe(175);
    expect(out[1].surcharges.map(x => x.chargeCode)).toEqual(['ECP']);
  });

  it('scopes contracts to the customer’s account codes and falls back to tariff-derived contracts when it has none', () => {
    expect(contractsFromRows(src, { customerCode: 'SVM1483' }).map(c => c.contractNo)).toEqual(['OTHER1']);
    expect(contractsFromRows({ ...src, customerCodes: ['20001374', 'SVM1483'] }, {}).map(c => c.contractNo)).toEqual(['OTHER1', 'SVMECO240005080', 'SVMECO240005080']); // same validity → contract number order
    const none = contractsFromRows({ ...src, contractLines: [] }, { pol: 'INNSA', pod: 'AEJEA' }); // no corporate lines → tariff-derived contracts of the booked lanes
    expect(none.length).toBeGreaterThan(0);
    expect(none.every(c => c.id.startsWith('ctr-M'))).toBe(true); // tariff numbers, not corporate numbers
    expect(contractsFromRows({ ...src, customerCode: '99999', customerCodes: ['99999'] }, {})).toEqual([]); // unknown customer: no contracts, no bookings
    expect(customerAccountCodes('20001374', [ciRow({ LoginCustCode: '20001374', APcustCode: '20120004232', Status: 'A' }), ciRow({ LoginCustCode: 'X', APcustCode: 'Y', Status: 'A' })])).toEqual(['20001374', '20120004232']);
  });

  it('serves real surcharge amounts for a lane from the contract lines and keeps the placeholder path for other lanes', () => {
    const real = surchargesFromRows(charges, tariffs, { pol: 'INNSA', pod: 'AEJEA', eqpType: "20' Standard Dry" }, new Date('2026-10-17'), { contractLines, contractSurcharges });
    expect(real.map(x => `${x.chargeCode}:${x.amount}:${x.currency}`)).toEqual(['ADM:25:USD', 'THD:150:USD']);
    expect(real[0]).toMatchObject({ id: 'sur-SVMECO240005080-1-ADM', origin: 'INNSA', delivery: 'AEJEA', loadRegion: 'India', effectiveTo: '2035-05-08' });
    const reefer = surchargesFromRows(charges, tariffs, { pol: 'INNSA', pod: 'AEJEA', eqpType: "20' Reefer Container" }, new Date('2026-10-17'), { contractLines, contractSurcharges });
    expect(reefer.map(x => x.chargeCode)).toEqual(['ECP']);
    const placeholder = surchargesFromRows(charges, tariffs, { pol: 'USNYC', pod: 'SGSIN' }, new Date('2026-10-17'), { contractLines, contractSurcharges });
    expect(placeholder.map(x => x.chargeCode)).toEqual(['BAF', 'CAF', 'TOC']);
  });
});

describe('rates bridge — fixtures', () => {
  it('serves the demo lane INNSA→AEJEA from the Commercial tariff view', () => {
    const all = fixtureTariffs({ loadPort: 'INNSA', dischPort: 'AEJEA' });
    expect(all.length).toBeGreaterThan(10);
    expect(new Set(all.map(t => `${t.loadPort}>${t.dischPort}`))).toEqual(new Set(['INNSA>AEJEA']));
    expect(new Set(all.map(t => t.id)).size).toBe(all.length);
    const hc = fixtureTariffs({ loadPort: 'INNSA', dischPort: 'AEJEA', eqpType: "40' High Cube Dry", commodity: 'GEN-CGO' });
    expect(hc.length).toBeGreaterThan(0);
    expect(hc.every(t => t.eqpType === "40' High Cube Dry" && t.currency === 'USD' && t.tariffAmount > 0)).toBe(true);
    expect(hc[0].transService).toBeTruthy();
    const dry = fixtureTariffs({ loadPort: 'INNSA', dischPort: 'AEJEA', eqpType: "20' Dry Standard" });
    expect(dry.length).toBeGreaterThan(0);
    expect(fixtureTariffs({ loadPort: 'USNYC', dischPort: 'SGSIN' })).toEqual([]);
  });

  it('serves the demo customer’s corporate contracts and their real surcharges on that lane', () => {
    const contracts = fixtureContracts({ pol: 'INNSA', pod: 'AEJEA' });
    expect(contracts.length).toBeGreaterThan(0);
    expect(contracts.every(c => c.contractNo.startsWith('SVM') && c.customerCode === '20001374' && c.customerName === 'Wisozk, Turcotte and Anderson')).toBe(true);
    expect(contracts.every(c => c.originPort === 'INNSA' && c.deliveryPort === 'AEJEA' && c.currency === 'USD' && c.carrTerms === 'CY/CY')).toBe(true);
    expect(contracts.some(c => c.surcharges.length > 0 && c.subjectToChargesAmount > 0)).toBe(true);
    const surcharges = fixtureSurcharges({ pol: 'INNSA', pod: 'AEJEA', eqpType: "20' Standard Dry" });
    expect(surcharges.length).toBeGreaterThan(0);
    expect(surcharges.every(s => s.id.startsWith('sur-SVM') && s.chargeName && s.amount > 0 && s.loadRegion === 'India')).toBe(true); // the customer's own contract surcharges
    const placeholder = fixtureSurcharges({ pol: 'USNYC', pod: 'SGSIN' });
    expect(placeholder.map(s => s.chargeCode)).toEqual(['BAF', 'CAF', 'PSS', 'EBS', 'TOC', 'THD']); // no contract on that lane → placeholders on real codes
    expect(db.tariffs.every(r => r.ratetype === 'TAR' && !r.custcode)).toBe(true); // the published tariffs still carry no customer codes
  });
});
