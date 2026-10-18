// Created by Sekar Nagarajan (2026-10-17 00:20)
import { describe, expect, it } from 'vitest';
import { db } from '../db';
import { fixtureCountries, fixtureEquipmentTypes, fixturePorts, fixtureStates, mapPort } from './lookups.bridge';
import { codeLabel, countryDialCode, dialCodes, equipmentLabel, equipmentRow, equipmentTeus, portLabel } from './masters.bridge';

describe('lookups bridge (master fixtures)', () => {
  it('serves the landing port typeahead from the ports master with "CODE - NAME" labels', () => {
    expect(mapPort({ portcode: 'innsa', portname: 'NHAVA SHEVA,MUMBAI' })).toEqual({ portCode: 'INNSA', portName: 'NHAVA SHEVA,MUMBAI', label: 'INNSA - NHAVA SHEVA,MUMBAI' });
    const byCode = fixturePorts('innsa');
    expect(byCode[0]).toEqual({ portCode: 'INNSA', portName: 'NHAVA SHEVA,MUMBAI', label: 'INNSA - NHAVA SHEVA,MUMBAI' });
    const byName = fixturePorts('jebel ali');
    expect(byName.some(p => p.portCode === 'AEJEA')).toBe(true);
    expect(fixturePorts('').length).toBeLessThanOrEqual(50);
  });

  it('serves active equipment types with the master description', () => {
    const types = fixtureEquipmentTypes();
    expect(types.length).toBe(db.equipments.filter(e => String(e.status).toUpperCase() === 'A').length);
    expect(types.find(t => t.code === '40HC')).toEqual({ code: '40HC', name: 'HIGH CUBE 40 CONTAINER' });
    expect(types.every(t => t.code && t.name)).toBe(true);
  });

  it('serves two-letter countries sorted by name and the states of a country', () => {
    const countries = fixtureCountries();
    expect(countries.find(c => c.code === 'IN')).toEqual({ code: 'IN', name: 'India' });
    expect(countries.every(c => /^[A-Z]{2}$/.test(c.code))).toBe(true);
    expect([...countries].sort((a, b) => a.name.localeCompare(b.name))).toEqual(countries);
    expect(fixtureStates('US').some(s => s.code === 'NY' && s.name === 'New York')).toBe(true);
    expect(fixtureStates('US').every(s => db.states.some(r => r.statecode === s.code && r.countrycode === 'US'))).toBe(true);
    expect(fixtureStates('ZZ')).toEqual([]);
  });
});

describe('masters bridge helpers', () => {
  it('resolves equipment codes written either way round and through aliases', () => {
    expect(equipmentRow('20DC')?.Equiptype).toBe('20DC');
    expect(equipmentRow('DC20')?.Equiptype).toBe('20DC'); // swapped
    expect(equipmentRow('20DV')?.Equiptype).toBe('DV20'); // swapped
    expect(equipmentRow('20RF')?.Equiptype).toBe('20RE'); // RF → RE alias
    expect(equipmentRow('20GP')?.Equiptype).toBe('20DC'); // GP → DC alias
    expect(equipmentRow('99ZZ')).toBeUndefined();
    expect(equipmentLabel('99ZZ')).toBe('99ZZ');
    expect(equipmentTeus('40HC')).toBe(2);
    expect(equipmentTeus('RE20')).toBe(1);
    expect(equipmentTeus('20ZZ')).toBe(1); // unknown 20' → 1
    expect(equipmentRow('20')).toBeUndefined(); // void (status V) master rows never match
    expect(equipmentTeus('20')).toBe(1);
  });

  it('builds labels and dial codes from the masters with code fallbacks', () => {
    expect(portLabel('INNSA')).toBe('INNSA - NHAVA SHEVA,MUMBAI');
    expect(portLabel('ZZZZZ')).toBe('ZZZZZ');
    expect(codeLabel('BAGS', 'BAGS')).toBe('BAGS');
    expect(codeLabel('DRUM', 'DRUMS')).toBe('DRUM - DRUMS');
    expect(countryDialCode('IN')).toBe('+91');
    expect(countryDialCode('ZZ')).toBe('');
    const codes = dialCodes();
    expect(codes).toContain('+971');
    expect(codes.indexOf('+971')).toBeLessThan(codes.indexOf('+1'));
  });
});
