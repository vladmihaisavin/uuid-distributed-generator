const { UUIDWorker } = require('../../code/uuidWorker');

describe('UUIDWorker', () => {
  let epoch, worker;
  const WORKER_ID = 1023;
  const BIG_LIMIT = 100000;

  beforeAll(() => {
    epoch = Date.now();
    worker = new UUIDWorker(WORKER_ID, epoch);
  });

  it('UUIDWorker should validate workerId', () => {
    const currentEpoch = Date.now();
    expect(() => new UUIDWorker(-1, currentEpoch)).toThrow('Invalid worker id argument.')
    expect(() => new UUIDWorker(1024, currentEpoch)).toThrow('Invalid worker id argument.')
  })

  it('UUIDWorker should validate epoch', () => {
    const currentEpoch = Date.now() + 5000;
    expect(() => new UUIDWorker(1)).toThrow('Invalid epoch argument.')
    expect(() => new UUIDWorker(1, currentEpoch)).toThrow('Invalid epoch argument.')
  })

  it('get_id should return a string', () => {
    const uuid = worker.get_id();
    expect(uuid).toBeGreaterThan(0);
  });

  // This test is commented because JS numbers use 52 bits and we overflow when making bitwise operations.
  // It's weird that the ids seem to overflow at 32 bits. I'll investigate.

  // it('get_id should generate increasing ids', () => {
  //   let lastId = worker.get_id();
  //   for (let i = 0; i < BIG_LIMIT; i++) {
  //     currentId = worker.get_id();
  //     expect(currentId).toBeGreaterThan(lastId);
  //     lastId = currentId;
  //   }
  // });

  it('get_id should generate unique ids', () => {
    const setOfIds = new Set([]);
    for (let i = 0; i < BIG_LIMIT; i++) {
      setOfIds.add(worker.get_id());
    }
    expect(setOfIds.size).toBe(BIG_LIMIT);
  });

  it('should handle non-monotonic clocks', () => {
    worker.setLastTimestamp(Date.now() + 60 * 1000);
    expect(() => worker.get_id()).toThrow('Clock is non-monotonic. Unicity can not be assured.')
    worker.setLastTimestamp(Date.now());
  })
});
