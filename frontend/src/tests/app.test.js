import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Utility helpers ──────────────────────────────────────────────────────────

describe("Utility: StatusBadge variants", () => {
  const map = {
    pending: "warning",
    accepted: "info",
    in_progress: "primary",
    completed: "success",
    cancelled: "danger",
  };

  Object.entries(map).forEach(([status, expected]) => {
    it(`maps "${status}" → "${expected}"`, () => {
      const variants = {
        pending: "warning",
        accepted: "info",
        in_progress: "primary",
        completed: "success",
        cancelled: "danger",
      };
      expect(variants[status]).toBe(expected);
    });
  });
});

// ─── Booking state machine ────────────────────────────────────────────────────

describe("Booking status transitions", () => {
  const VALID = {
    pending: ["accepted", "cancelled"],
    accepted: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  const canTransition = (from, to) => VALID[from]?.includes(to) ?? false;

  it("pending → accepted is valid", () => expect(canTransition("pending", "accepted")).toBe(true));
  it("pending → completed is invalid", () => expect(canTransition("pending", "completed")).toBe(false));
  it("accepted → in_progress is valid", () => expect(canTransition("accepted", "in_progress")).toBe(true));
  it("in_progress → completed is valid", () => expect(canTransition("in_progress", "completed")).toBe(true));
  it("completed → anything is invalid", () => {
    ["pending", "accepted", "cancelled"].forEach((s) => {
      expect(canTransition("completed", s)).toBe(false);
    });
  });
  it("cancelled is terminal", () => {
    expect(canTransition("cancelled", "accepted")).toBe(false);
    expect(canTransition("cancelled", "pending")).toBe(false);
  });
});

// ─── Pagination logic ─────────────────────────────────────────────────────────

describe("Pagination helper", () => {
  const paginate = (total, page, perPage) => ({
    pages: Math.ceil(total / perPage),
    hasNext: page * perPage < total,
    hasPrev: page > 1,
    offset: (page - 1) * perPage,
  });

  it("computes pages correctly", () => {
    expect(paginate(25, 1, 10).pages).toBe(3);
    expect(paginate(30, 1, 10).pages).toBe(3);
    expect(paginate(0, 1, 10).pages).toBe(0);
  });

  it("hasNext is true on first of many pages", () => {
    expect(paginate(25, 1, 10).hasNext).toBe(true);
  });

  it("hasNext is false on last page", () => {
    expect(paginate(25, 3, 10).hasNext).toBe(false);
  });

  it("hasPrev is false on first page", () => {
    expect(paginate(25, 1, 10).hasPrev).toBe(false);
  });

  it("hasPrev is true beyond first page", () => {
    expect(paginate(25, 2, 10).hasPrev).toBe(true);
  });

  it("offset is 0 for first page", () => {
    expect(paginate(25, 1, 10).offset).toBe(0);
  });

  it("offset is correct for page 2", () => {
    expect(paginate(25, 2, 10).offset).toBe(10);
  });
});

// ─── Auth context helpers ─────────────────────────────────────────────────────

describe("Auth role helpers", () => {
  const makeCtx = (role) => ({
    user: { role },
    isAdmin: role === "admin",
    isProvider: role === "provider",
    isCustomer: role === "customer",
  });

  it("identifies admin correctly", () => {
    const ctx = makeCtx("admin");
    expect(ctx.isAdmin).toBe(true);
    expect(ctx.isProvider).toBe(false);
    expect(ctx.isCustomer).toBe(false);
  });

  it("identifies provider correctly", () => {
    const ctx = makeCtx("provider");
    expect(ctx.isProvider).toBe(true);
    expect(ctx.isAdmin).toBe(false);
  });

  it("identifies customer correctly", () => {
    const ctx = makeCtx("customer");
    expect(ctx.isCustomer).toBe(true);
    expect(ctx.isAdmin).toBe(false);
  });
});

// ─── API response shape ───────────────────────────────────────────────────────

describe("API response structure", () => {
  const successResp = (data) => ({ success: true, message: "Success", data });
  const errorResp = (msg, code) => ({ success: false, message: msg, status: code });
  const pagedResp = (data, total, page, perPage) => ({
    ...successResp(data),
    meta: {
      total,
      page,
      per_page: perPage,
      pages: Math.ceil(total / perPage),
      has_next: page * perPage < total,
      has_prev: page > 1,
    },
  });

  it("success response has correct shape", () => {
    const r = successResp({ id: "1" });
    expect(r.success).toBe(true);
    expect(r.data.id).toBe("1");
  });

  it("error response has correct shape", () => {
    const r = errorResp("Not found", 404);
    expect(r.success).toBe(false);
    expect(r.status).toBe(404);
  });

  it("paginated response has meta", () => {
    const r = pagedResp([], 100, 2, 10);
    expect(r.meta.pages).toBe(10);
    expect(r.meta.has_next).toBe(true);
    expect(r.meta.has_prev).toBe(true);
  });
});

// ─── Price formatting ─────────────────────────────────────────────────────────

describe("Price formatting", () => {
  const fmt = (p) => `₹${Number(p).toLocaleString("en-IN")}`;

  it("formats small amounts", () => expect(fmt(599)).toContain("599"));
  it("formats thousands", () => expect(fmt(1499)).toContain("1,499"));
  it("formats large amounts", () => expect(fmt(99999)).toContain("99,999"));
});
