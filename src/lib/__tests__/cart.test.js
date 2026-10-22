import { describe, it, expect } from 'vitest';
import {
  getCartKey,
  addItem,
  removeItem,
  removeItemById,
  getQty,
  getCartCount,
  getSubtotal,
  computeTotals,
  buildOrderPayload,
  validateRequiredOptions,
  selectedModifiersPrice,
  buildSelectedModifiers,
} from '../cart';

const pizza = { id: 'p1', name: 'Margherita', price: 200 };
const coffee = { id: 'c1', name: 'Latte', price: 120 };
const mods = [
  { groupName: 'Size', optionName: 'Large', price: 50 },
  { groupName: 'Extras', optionName: 'Cheese', price: 30 },
];

describe('cart — keys & variants', () => {
  it('uses item id as key when there are no modifiers', () => {
    expect(getCartKey(pizza)).toBe('p1');
  });

  it('builds a deterministic variant key independent of modifier order', () => {
    const a = getCartKey(pizza, [mods[0], mods[1]]);
    const b = getCartKey(pizza, [mods[1], mods[0]]);
    expect(a).toBe(b);
    expect(a).not.toBe('p1');
  });

  it('same item with different modifiers becomes 2 separate cart entries', () => {
    let cart = [];
    cart = addItem(cart, pizza, [mods[0]]);              // Large
    cart = addItem(cart, pizza, [mods[0], mods[1]]);     // Large + Cheese
    expect(cart).toHaveLength(2);
    cart = addItem(cart, pizza, [mods[0], mods[1]]);     // adds to variant 2
    expect(cart).toHaveLength(2);
    expect(cart[1].qty).toBe(2);
    expect(cart[0].qty).toBe(1);
  });
});

describe('cart — add / remove', () => {
  it('merges identical items instead of duplicating', () => {
    let cart = [];
    cart = addItem(cart, coffee);
    cart = addItem(cart, coffee);
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(2);
    expect(getCartCount(cart)).toBe(2);
  });

  it('prices a modifier add-on onto the line item', () => {
    const cart = addItem([], pizza, [mods[0]]);
    expect(cart[0].price).toBe(250); // 200 + 50
    expect(cart[0].basePrice).toBe(200);
  });

  it('removes one unit at a time, then the whole entry', () => {
    let cart = addItem(addItem([], coffee), coffee);
    cart = removeItem(cart, 'c1');
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(1);
    cart = removeItem(cart, 'c1');
    expect(cart).toHaveLength(0);
  });

  it('removing by item id decrements the correct variant and never goes negative', () => {
    let cart = [];
    cart = addItem(cart, pizza);                  // plain
    cart = addItem(cart, pizza, [mods[1]]);       // variant
    cart = removeItemById(cart, 'p1');
    // the plain entry (first match) drops a unit and disappears; the variant remains
    expect(cart).toHaveLength(1);
    expect(getQty(cart, 'p1')).toBe(1);
    cart = removeItemById(cart, 'p1');
    expect(getQty(cart, 'p1')).toBe(0);
    cart = removeItemById(cart, 'p1');
    expect(getQty(cart, 'p1')).toBe(0);
  });

  it('removing an unknown id is a no-op', () => {
    const cart = addItem([], coffee);
    expect(removeItemById(cart, 'ghost')).toEqual(cart);
  });
});

describe('cart — totals & tax', () => {
  it('calculates subtotal across entries and quantities', () => {
    let cart = [];
    cart = addItem(cart, pizza);
    cart = addItem(cart, pizza);
    cart = addItem(cart, coffee, [mods[0]]);
    expect(getSubtotal(cart)).toBe(200 * 2 + 170);
  });

  it('applies percentage tax on subtotal', () => {
    const cart = [addItem([], pizza)[0]]; // reuse
    const totals = computeTotals(cart, 5);
    expect(totals.subtotal).toBe(200);
    expect(totals.taxAmount).toBeCloseTo(10);
    expect(totals.total).toBeCloseTo(210);
  });

  it('handles missing / invalid tax rate safely', () => {
    const cart = addItem([], coffee);
    expect(computeTotals(cart, undefined).taxAmount).toBe(0);
    expect(computeTotals(cart, 'abc').taxAmount).toBe(0);
    expect(computeTotals(cart, 0).total).toBe(120);
    expect(computeTotals([], 5).total).toBe(0);
  });
});

describe('cart — order payload', () => {
  it('builds the exact order document shape for every payment method', () => {
    const cart = addItem([], pizza);
    const payload = buildOrderPayload({
      cart, tableNumber: '5', taxRate: 10, method: 'Cash', instructions: '  extra spicy  ',
    });
    expect(payload).toMatchObject({
      tableNumber: '5',
      status: 'pending',
      paymentMethod: 'Cash',
      instructions: 'extra spicy',
      subtotal: 200,
      total: 220,
      taxAmount: 20,
      items: [{ id: 'p1', name: 'Margherita', price: 200, qty: 1, modifiers: [], basePrice: 200 }],
    });
  });

  it('keeps modifier info on item lines and preserves basePrice', () => {
    const cart = addItem([], pizza, [mods[0]]);
    const payload = buildOrderPayload({ cart, tableNumber: '2', taxRate: 0, method: 'UPI QR' });
    expect(payload.items[0].price).toBe(250);
    expect(payload.items[0].basePrice).toBe(200);
    expect(payload.items[0].modifiers).toEqual([mods[0]]);
  });

  it('extra fields (payment status, razorpay id) survive into payload', () => {
    const payload = buildOrderPayload({
      cart: addItem([], coffee), tableNumber: '1', taxRate: 0, method: 'Razorpay Online',
      extra: { paymentStatus: 'paid', razorpayPaymentId: 'pay_123' },
    });
    expect(payload.paymentStatus).toBe('paid');
    expect(payload.razorpayPaymentId).toBe('pay_123');
  });

  it('blank instructions become empty string', () => {
    const payload = buildOrderPayload({ cart: addItem([], coffee), tableNumber: '1', taxRate: 0, method: 'Cash', instructions: '   ' });
    expect(payload.instructions).toBe('');
  });
});

describe('cart — required modifiers', () => {
  const requiredGroup = {
    groupName: 'Size', type: 'single', required: true,
    options: [{ name: 'Small', price: 0 }, { name: 'Large', price: 50 }],
  };
  const optionalGroup = {
    groupName: 'Extras', type: 'multi', required: false,
    options: [{ name: 'Cheese', price: 30 }],
  };

  it('blocks add when a required group has no selection', () => {
    const state = [{ ...requiredGroup, selected: null }];
    expect(validateRequiredOptions([requiredGroup], state)).toBe(false);
  });

  it('allows add when every required group is satisfied', () => {
    const state = [{ ...requiredGroup, selected: 1 }];
    expect(validateRequiredOptions([requiredGroup, optionalGroup], state)).toBe(true);
  });

  it('requires at least one selection in a required multi-select group', () => {
    const multiRequired = { ...optionalGroup, required: true };
    const empty = [{ ...multiRequired, selected: [] }];
    const picked = [{ ...multiRequired, selected: [0] }];
    expect(validateRequiredOptions([multiRequired], empty)).toBe(false);
    expect(validateRequiredOptions([multiRequired], picked)).toBe(true);
  });

  it('multi-select modifier prices sum up for the button total', () => {
    const group2 = { groupName: 'Extras', options: [{ name: 'Cheese', price: 30 }, { name: 'olive', price: 20 }] };
    const state = [{ ...group2, type: 'multi', selected: [0, 1] }];
    expect(selectedModifiersPrice(state)).toBe(50);
  });

  it('builds flattened modifiers for the cart', () => {
    const state = [
      { groupName: 'Size', type: 'single', required: true, selected: 1, options: requiredGroup.options },
      { groupName: 'Extras', type: 'multi', required: false, selected: [], options: optionalGroup.options },
    ];
    const result = buildSelectedModifiers(state);
    expect(result).toEqual([{ groupName: 'Size', optionName: 'Large', price: 50 }]);
  });
});
