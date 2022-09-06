const { UUIDWorker } = require('../../code/uuidWorker');

const WORKER_ID = 0;
const epoch = Date.now();
const worker = new UUIDWorker(WORKER_ID, epoch);
const results = [];

const start = Date.now();
let end;
while (true) {
  end = Date.now();
  results.push(worker.get_id());
  if (end - start > 250) {
    break;
  }
}
const duration = (end - start) / 1000;

console.log('----');
console.log(`time passed: ${duration}s`);
console.log(`uuids generated: ${results.length}`);
console.log(`UUIDs/sec: ${(results.length / duration).toFixed(2)}`)
