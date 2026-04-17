import {
  FULL_ADMIN_PERMISSION,
  canAccessAllowedRoles,
  hasAdminPermission,
  normalizeAdminPermissions,
} from "./access-control";

describe("access-control", () => {
  it("permite que admin_full acesse os demais painéis", () => {
    expect(canAccessAllowedRoles("admin", ["cliente"], [FULL_ADMIN_PERMISSION])).toBe(true);
    expect(canAccessAllowedRoles("admin", ["franqueado"], [FULL_ADMIN_PERMISSION])).toBe(true);
  });

  it("mantem admin limitado fora dos painéis de cliente/corretor/etc", () => {
    expect(canAccessAllowedRoles("admin", ["cliente"], ["admin_suporte"])).toBe(false);
  });

  it("respeita o match normal de roles de negócio", () => {
    expect(canAccessAllowedRoles("cliente", ["cliente"])).toBe(true);
    expect(canAccessAllowedRoles("cliente", ["corretor"])).toBe(false);
  });

  it("colapsa as permissoes quando acesso total esta marcado", () => {
    expect(normalizeAdminPermissions(["admin_suporte", FULL_ADMIN_PERMISSION])).toEqual([
      FULL_ADMIN_PERMISSION,
    ]);
  });

  it("trata admin_full como permissão suficiente para qualquer modulo", () => {
    expect(hasAdminPermission([FULL_ADMIN_PERMISSION], ["admin_kyc"])).toBe(true);
    expect(hasAdminPermission(["admin_suporte"], ["admin_kyc"])).toBe(false);
  });
});
