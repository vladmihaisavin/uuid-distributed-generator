const { UUIDWorker } = require('../../code/uuidWorker');

describe('UUIDWorker', () => {
  let epoch, worker;
  const WORKER_ID = 1023;

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

  it('get_id should generate increasing ids', () => {

  });

  it('get_id should generate unique ids', () => {

  });

  it('timestamp should be properly masked', () => {

  });

  it('worker id should be properly masked', () => {

  });

  it('thread id should be properly masked', () => {

  });
});
