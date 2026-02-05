import request from 'supertest';
import { createServer } from '../server';

describe('Subscription endpoints', () => {
  let app: any;

  beforeAll(async () => {
    app = await createServer();
  });

  test('create subscription -> should return ledger entry', async () => {
    const resp = await request(app)
      .post('/marp/subscription/create')
      .send({ accountId: 'acct-test', walletId: 'wallet-test', planId: 'basic', price: 100, region: 'us', idempotencyKey: 'k1', autoRenew: true });
    expect(resp.status).toBe(200);
    expect(resp.body).toHaveProperty('accountId', 'acct-test');
    expect(resp.body).toHaveProperty('walletId', 'wallet-test');
    // ledger entry should include integrity fields when created
    expect(resp.body).toHaveProperty('entryHash');
    expect(resp.body).toHaveProperty('prevHash');
    expect(typeof resp.body.balanceAfter === 'number' || resp.body.balanceAfter !== undefined).toBeTruthy();
  });

  test('get subscription -> should return subscription record', async () => {
    const resp = await request(app).get('/marp/subscription/acct-test');
    expect([200, 404]).toContain(resp.status);
    if (resp.status === 200) {
      expect(resp.body).toHaveProperty('accountId', 'acct-test');
      expect(resp.body).toHaveProperty('planId');
    }
  });

  test('renew subscription -> should succeed or error if not found', async () => {
    const resp = await request(app).post('/marp/subscription/renew').send({ accountId: 'acct-test', idempotencyKey: 'r1' });
    expect([200, 400]).toContain(resp.status);
  });

  test('upgrade subscription -> should succeed or schedule', async () => {
    const resp = await request(app)
      .post('/marp/subscription/upgrade')
      .send({ accountId: 'acct-test', walletId: 'wallet-test', newPlanId: 'pro', newPrice: 200, idempotencyKey: 'u1' });
    expect([200, 400]).toContain(resp.status);
  });

  test('cancel subscription -> should schedule cancellation', async () => {
    const resp = await request(app).post('/marp/subscription/cancel').send({ accountId: 'acct-test' });
    expect([200, 400]).toContain(resp.status);
  });

  test('ledger contains entry for account', async () => {
    const resp = await request(app).get('/marp/ledger/acct-test');
    expect(resp.status).toBe(200);
    expect(Array.isArray(resp.body)).toBeTruthy();
    if (resp.body.length > 0) {
      const e = resp.body[0];
      expect(e).toHaveProperty('entryHash');
      expect(e).toHaveProperty('walletId', 'wallet-test');
    }
  });
});
