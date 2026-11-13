// Created by Sekar Nagarajan (2026-11-13 01:20)
import { beforeEach, describe, expect, it } from "vitest";

import { PRECONFIGURED_TENANTS, useTenantStore } from "./tenant.store";

describe("tenant store", () => {
  beforeEach(() => {
    useTenantStore.setState({ activeTenant: PRECONFIGURED_TENANTS.TENANT_01, source: "preset" });
  });

  it("installs the API tenant as authoritative", () => {
    const api = {
      ...PRECONFIGURED_TENANTS.TENANT_01,
      logoUrl: "/cdn/acme.svg",
      primaryColor: "#123456",
    };
    useTenantStore.getState().setCustomTenant(api);
    expect(useTenantStore.getState().source).toBe("api");
    expect(useTenantStore.getState().activeTenant.logoUrl).toBe("/cdn/acme.svg");
  });

  it("does not replace the API tenant with the preset of the same id (login / rehydrate)", () => {
    const api = {
      ...PRECONFIGURED_TENANTS.TENANT_01,
      logoUrl: "/cdn/acme.svg",
      primaryColor: "#123456",
    };
    useTenantStore.getState().setCustomTenant(api);
    useTenantStore.getState().setTenant("TENANT_01");
    expect(useTenantStore.getState().activeTenant.primaryColor).toBe("#123456");
    expect(useTenantStore.getState().source).toBe("api");
  });

  it("switches to another preset when the user belongs to a different tenant", () => {
    useTenantStore.getState().setTenant("TENANT_02");
    expect(useTenantStore.getState().activeTenant.id).toBe("TENANT_02");
    expect(useTenantStore.getState().source).toBe("preset");
  });

  it("ignores unknown or empty tenant ids instead of falling back to the default", () => {
    useTenantStore.getState().setTenant("TENANT_03");
    useTenantStore.getState().setTenant("NOPE");
    useTenantStore.getState().setTenant("");
    expect(useTenantStore.getState().activeTenant.id).toBe("TENANT_03");
  });

  it("ships the house brand as the default tenant", () => {
    expect(PRECONFIGURED_TENANTS.TENANT_01.logoUrl).toBe("/logo.png");
    expect(PRECONFIGURED_TENANTS.TENANT_01.primaryColor.toLowerCase()).toBe("#0a91ff");
  });
});
