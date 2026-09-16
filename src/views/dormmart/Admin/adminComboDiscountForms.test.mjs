import assert from "node:assert/strict";
import {
  createEmptyDiscountForm,
  getDiscountStatus,
  hydrateDiscountFormFromCombo,
  toApiLocalDateTime,
} from "./adminComboDiscountForms.js";

const Form = createEmptyDiscountForm();

hydrateDiscountFormFromCombo(Form, {
  Discounts: [
    {
      ComboDiscountId: "7a11e26a-dc18-44b8-bbd4-4c6f69496c10",
      DiscountType: 0,
      DiscountValue: 10,
      StartsAt: "2026-09-12T12:34:00",
      ExpiresAt: "2026-09-15T12:34:00",
      IsActive: true,
    },
  ],
});

assert.deepEqual(Form, {
  ComboDiscountId: "7a11e26a-dc18-44b8-bbd4-4c6f69496c10",
  DiscountType: 0,
  DiscountValue: 10,
  StartsAt: "2026-09-12T12:34",
  ExpiresAt: "2026-09-15T12:34",
  IsActive: true,
});

const EmptyForm = createEmptyDiscountForm();
hydrateDiscountFormFromCombo(EmptyForm, { Discounts: [] });
assert.deepEqual(EmptyForm, createEmptyDiscountForm());

assert.equal(toApiLocalDateTime("2026-09-15T12:34"), "2026-09-15T12:34:00");
assert.equal(toApiLocalDateTime(""), null);

assert.equal(getDiscountStatus({ IsActive: false }, new Date("2026-09-15T12:00:00")), "Inactive");
assert.equal(getDiscountStatus({ IsActive: true, StartsAt: "2026-09-16T12:00:00" }, new Date("2026-09-15T12:00:00")), "Scheduled");
assert.equal(getDiscountStatus({ IsActive: true, ExpiresAt: "2026-09-14T12:00:00" }, new Date("2026-09-15T12:00:00")), "Expired");
assert.equal(getDiscountStatus({ IsActive: true, StartsAt: "2026-09-14T12:00:00", ExpiresAt: "2026-09-16T12:00:00" }, new Date("2026-09-15T12:00:00")), "Active");
