import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  todayKey,
  STATUS_CONFIG,
  getStatusConfig,
  isOrderUnclaimed,
  isOrderClaimedByOther,
  unclaimedCount,
  filterStaffTodayOrders,
  activeKitchenOrders,
  resolveClaim,
} from '../orderLogic';

const ts = (isoString) => ({ toDate: () => new Date(isoString) });
const today = new Date();
const isoToday = (h, m) => {
  const d = new Date(today);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

describe('formatDuration', () => {
  it('formats seconds, minutes and hours', () => {
    expect(formatDuration(0)).toBe('0m 00s');
    expect(formatDuration(59)).toBe('0m 59s');
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(3661)).toBe('1h 01m');
  });

  it('never returns negative values', () => {
    expect(formatDuration(-30)).toBe('0m 00s');
    expect(formatDuration(undefined)).toBe('0m 00s');
    expect(formatDuration(NaN)).toBe('0m 00s');
  });
});

describe('todayKey', () => {
  it('returns an ISO yyyy-mm-dd string', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('status machine', () => {
  it('walks the full waiter workflow end to end', () => {
    const path = ['pending', 'preparing', 'ready', 'completed'];
    for (let i = 0; i < path.length; i++) {
      const cfg = getStatusConfig(path[i]);
      expect(cfg.next).toBe(path[i + 1] ?? null);
    }
  });

  it('every status has a label and color, unknown falls back to pending', () => {
    for (const key of Object.keys(STATUS_CONFIG)) {
      expect(STATUS_CONFIG[key].label).toBeTruthy();
      expect(STATUS_CONFIG[key].color).toMatch(/^#/);
    }
    expect(getStatusConfig('weird_status').label).toBe(STATUS_CONFIG.pending.label);
    expect(getStatusConfig(undefined).next).toBe('preparing');
  });
});

describe('claim race — first waiter to tap wins', () => {
  const me = 'w1';
  const openOrder = { id: 'o1', status: 'pending' };

  it('win when the order is clean', () => {
    expect(resolveClaim(openOrder, me)).toBe('win');
  });

  it('second waiter loses the race when the doc already has pickedBy', () => {
    const claimed = { ...openOrder, pickedBy: { id: 'w2', name: 'Riya' } };
    expect(resolveClaim(claimed, me)).toBe('lost');
  });

  it('re-claiming my own open order is not a loss', () => {
    const claimed = { ...openOrder, pickedBy: { id: me, name: 'Me' } };
    expect(resolveClaim(claimed, me)).toBe('mine');
  });

  it('aborts when the order was deleted or already progressed', () => {
    expect(resolveClaim(null, me)).toBe('aborted');
    expect(resolveClaim({ status: 'preparing' }, me)).toBe('aborted');
    expect(resolveClaim({ status: 'cancelled' }, me)).toBe('aborted');
  });

  it('classification helpers agree with the resolver', () => {
    const claimed = { ...openOrder, pickedBy: { id: 'w2', name: 'Riya' } };
    expect(isOrderUnclaimed(openOrder)).toBe(true);
    expect(isOrderUnclaimed(claimed)).toBe(false);
    expect(isOrderClaimedByOther(claimed, me)).toBe(true);
    expect(isOrderClaimedByOther(claimed, 'w2')).toBe(false);
  });
});

describe('unclaimed badge count', () => {
  it('counts only pending & unclaimed orders', () => {
    const orders = [
      { id: 'a', status: 'pending' },
      { id: 'b', status: 'pending', pickedBy: { id: 'w2', name: 'Riya' } },
      { id: 'c', status: 'preparing' },
      { id: 'd', status: 'ready' },
      { id: 'e' }, // missing status — not pending
    ];
    expect(unclaimedCount(orders)).toBe(1);
    expect(unclaimedCount([])).toBe(0);
  });
});

describe('staff feed filter (today + hotel exclusion)', () => {
  it('shows only today\u2019s non-hotel orders', () => {
    const orders = [
      { id: 'a1', status: 'pending', createdAt: ts(isoToday(9, 5)) },
      { id: 'a2', status: 'pending', createdAt: ts(isoToday(9, 5)), source: 'hotel' },
      { id: 'a3', status: 'pending', createdAt: ts('2020-01-01T10:00:00.000Z') },
      { id: 'a4', status: 'pending', createdAt: null }, // serverTimestamp pending
    ];
    const result = filterStaffTodayOrders(orders);
    expect(result.map(o => o.id)).toEqual(['a1']);
  });

  it('returns empty when created dates are missing', () => {
    expect(filterStaffTodayOrders([{ id: 'x' }])).toEqual([]);
  });
});

describe('kitchen display filter', () => {
  it('shows only pending, confirmed and preparing orders', () => {
    const orders = [
      { id: 'k1', status: 'pending' },
      { id: 'k2', status: 'confirmed' },
      { id: 'k3', status: 'preparing' },
      { id: 'k4', status: 'ready' },
      { id: 'k5', status: 'completed' },
      { id: 'k6', status: 'cancelled' },
    ];
    expect(activeKitchenOrders(orders).length).toBe(3);
  });
});
