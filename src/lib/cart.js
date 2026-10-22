// ─── Cart logic (pure functions, shared by the guest menu) ───────────────────
// Extracted verbatim from MenuView so the real ordering logic is unit-testable.
// Every function is a pure transformation — no state, no Firestore calls.

export function getCartKey(item, modifiers = []) {
  if (modifiers.length === 0) return item.id;
  return item.id + '_' + modifiers.map(m => `${m.groupName}_${m.optionName}`).sort().join('|');
}

export function addItem(prevCart, item, modifiers = []) {
  const cartKey = getCartKey(item, modifiers);
  const modifierPrice = modifiers.reduce((s, m) => s + (m.price || 0), 0);
  const exists = prevCart.find(i => i.cartKey === cartKey);
  if (exists) {
    return prevCart.map(i => (i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i));
  }
  return [
    ...prevCart,
    { ...item, cartKey, modifiers, qty: 1, basePrice: item.price, price: item.price + modifierPrice },
  ];
}

export function removeItem(prevCart, cartKey) {
  const item = prevCart.find(i => i.cartKey === cartKey);
  if (item?.qty === 1) return prevCart.filter(i => i.cartKey !== cartKey);
  return prevCart.map(i => (i.cartKey === cartKey ? { ...i, qty: i.qty - 1 } : i));
}

// Menu cards only know the item id — decrement whichever cart entry
// (including modifier variants) belongs to that item.
export function removeItemById(prevCart, id) {
  const idx = prevCart.findIndex(i => i.id === id);
  if (idx === -1) return prevCart;
  if (prevCart[idx].qty <= 1) return prevCart.filter((_, index) => index !== idx);
  return prevCart.map((i, index) => (index === idx ? { ...i, qty: i.qty - 1 } : i));
}

export function getQty(cart, id) {
  return cart.reduce((s, i) => s + (i.id === id ? i.qty : 0), 0);
}

export function getCartCount(cart) {
  return cart.reduce((s, i) => s + i.qty, 0);
}

export function getSubtotal(cart) {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

// ─── Totals with restaurant tax ──────────────────────────────────────────────
export function computeTotals(cart, taxRate = 0) {
  const subtotal = getSubtotal(cart);
  const safeRate = Number(taxRate) || 0;
  const taxAmount = subtotal * (safeRate / 100);
  return { subtotal, taxAmount, total: subtotal + taxAmount };
}

// ─── Order payload for a specific payment method ─────────────────────────────
// Places the cart into the shape the orders collection expects. Kept in one
// place so cash / UPI / Razorpay orders are always structured identically.
export function buildOrderPayload({ cart, tableNumber, taxRate, method, extra = {}, instructions = '' }) {
  const { subtotal, taxAmount, total } = computeTotals(cart, taxRate);
  return {
    tableNumber,
    items: cart.map(i => ({
      id: i.id, name: i.name, price: i.price, qty: i.qty,
      modifiers: i.modifiers || [],
      basePrice: i.basePrice ?? i.price,
    })),
    subtotal,
    taxAmount,
    total,
    status: 'pending',
    paymentMethod: method,
    instructions: instructions.trim() || '',
    ...extra,
  };
}

// ─── Required-modifier validation ───────────────────────────────────────────
// A group is satisfied when exactly one option (single) or ≥1 option (multi)
// is selected. Returns true only when every required group is satisfied.
export function validateRequiredOptions(groups = [], itemOptions = []) {
  const required = groups.filter(g => g.required);
  return required.every(g => {
    const state = itemOptions.find(s => s.groupName === g.groupName);
    if (!state) return false;
    if (g.type === 'single') return state.selected !== null;
    return Array.isArray(state.selected) && state.selected.length > 0;
  });
}

// ─── Modifier price shown in the "Add to Cart" button ───────────────────────
export function selectedModifiersPrice(itemOptions = []) {
  return itemOptions.reduce((s, g) => {
    if (g.type === 'single') {
      return s + (g.selected !== null ? (g.options[g.selected]?.price || 0) : 0);
    }
    return s + (g.selected || []).reduce((ss, oi) => ss + (g.options[oi]?.price || 0), 0);
  }, 0);
}

// Collect the selected modifiers into the cart's modifier shape.
export function buildSelectedModifiers(itemOptions = []) {
  return itemOptions.flatMap(g => {
    if (g.type === 'single') {
      if (g.selected === null) return [];
      return [{ groupName: g.groupName, optionName: g.options[g.selected]?.name ?? 'Option', price: g.options[g.selected]?.price ?? 0 }];
    }
    const indices = g.selected || [];
    return indices.map(i => ({ groupName: g.groupName, optionName: g.options[i]?.name ?? 'Option', price: g.options[i]?.price ?? 0 }));
  });
}
