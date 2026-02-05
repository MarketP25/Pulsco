import { ActivityEngine, UsageEvent } from '../types';

// places: per-checkin or per-listing fee
export const calculate: ActivityEngine = (event: UsageEvent, region, atIso, policy) => {
  const units = event.units || 1;
  let perCheckin = 0.10; // $0.10 per checkin
  if (policy && policy.payload && typeof policy.payload.perUnit === 'number') perCheckin = policy.payload.perUnit;
  const base = units * perCheckin;
  return { base, fees: 0, subtotal: base, tax: 0, total: base, description: `Places ${units} checkins` };
};

export default { calculate };
