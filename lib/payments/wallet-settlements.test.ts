import assert from "node:assert/strict";
import test from "node:test";
import { mapWalletSettlements } from "./wallet-settlements.ts";

const row = { id: "fixture-journal", organization_id: "fixture-org", journal_type: "historical_balance_settlement",
  amount_cents: 50000, currency: "USD", status: "posted", description: "Acuerdo por diferencial histórico a favor.",
  created_at: "2026-11-09T02:00:00Z", metadata: { hecom_cliente_id: "fixture-client" } };

test("shows the existing agreement, amount and context without repricing or mutating it", () => {
  const before = JSON.stringify(row);
  assert.deepEqual(mapWalletSettlements([row], "fixture-client", "fixture-org"), [{ id: row.id,
    createdAt: row.created_at, amountCents: 50000, currency: "USD", description: row.description, status: "posted" }]);
  assert.equal(JSON.stringify(row), before);
});

test("a reversed agreement remains identified as reversed, not as available money", () => {
  assert.equal(mapWalletSettlements([{ ...row, status: "reversed" }], "fixture-client", "fixture-org")[0].status, "reversed");
});

test("rejects foreign clients or organizations, duplicate identities and invalid money or dates", () => {
  for (const change of [{ organization_id: "another" }, { metadata: { hecom_cliente_id: "another" } },
    { amount_cents: -1 }, { amount_cents: null }, { amount_cents: 1.5 }, { created_at: "invalid" },
    { status: "draft" }, { currency: "invalid" }, { journal_type: "deposit_confirmed" }]) {
    assert.throws(() => mapWalletSettlements([{ ...row, ...change }], "fixture-client", "fixture-org"));
  }
  assert.throws(() => mapWalletSettlements([row, row], "fixture-client", "fixture-org"));
  assert.deepEqual(mapWalletSettlements([], "fixture-client", "fixture-org"), []);
});
