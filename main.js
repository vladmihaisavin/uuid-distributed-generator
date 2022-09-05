class UUIDWorker {
  #workerIdSize = 10;
  #maxWorkerIdValue = -1 ^ (-1 << this.#workerIdSize);
  #threadIdSize = 4;
  #maxThreadIdValue = -1 ^ (-1 << this.#threadIdSize);
  #sequenceSize = 12;
  #maxSequenceValue = -1 ^ (-1 << this.#sequenceSize);

  #timestampLeftShift = this.#workerIdSize + this.#threadIdSize + this.#sequenceSize;
  #workerIdLeftShift = this.#threadIdSize + this.#sequenceSize;
  #threadIdLeftShift = this.#sequenceSize;

  #workerId = null;
  #epoch = null;
  #lastTimestamp = -1;
  #sequence = 0;

  constructor(workerId, epoch) {
    if (workerId < 0 || workerId > this.#maxWorkerIdValue) {
      throw new Error('Invalid worker id argument.');
    }
    this.#workerId = workerId;
    this.#epoch = epoch;
    console.info(
      `Worker starting with...`,
      `\nworkerIdSize: ${this.#workerIdSize} `,
      `\nthreadIdSize: ${this.#threadIdSize} `,
      `\nsequenceSize: ${this.#sequenceSize} `,
      `\nworkerId: ${this.#workerId}`,
      `\nepoch: ${this.#epoch}`
    );
  }

  getId(threadId) {
    let currentTimestamp = Date.now();

    if (currentTimestamp < this.#lastTimestamp) {
      log.error(`Clock is non-monotonic. Waiting until ${this.#lastTimestamp}...`);
      throw new Error('Clock is non-monotonic. Unicity can not be assured.');
    }

    if (threadId < 0 || threadId > this.#maxThreadIdValue) {
      throw new Error('Invalid thread id argument.');
    }

    if (currentTimestamp === this.#lastTimestamp) {
      this.#sequence++;
      // reached when a thread generated more than 256 UUIDs in one millisecond.
      if (this.#sequence > this.#maxSequenceValue) {
        currentTimestamp = this.getNextMillisecondTimestamp(this.#lastTimestamp)
      }
    } else {
      this.#sequence = 0
    }

    this.#lastTimestamp = currentTimestamp;
    return (
      ((currentTimestamp - this.#epoch) << this.#timestampLeftShift) |
      (this.#workerId << this.#workerIdLeftShift) |
      (threadId << this.#threadIdLeftShift) |
      this.#sequence
    ).toString(2);
  }

  getNextMillisecondTimestamp(prevTimestamp) {
    let newTimestamp = Date.now();
    while (newTimestamp <= prevTimestamp) {
      newTimestamp = Date.now();
    }
    return newTimestamp;
  }
}

const WORKER_ID = 0;
const THREAD_ID = 0;
const epoch = Date.now();
const worker = new UUIDWorker(WORKER_ID, epoch);
const results = [];

const start = Date.now();
let end;
while (true) {
  end = Date.now();
  results.push(worker.getId(THREAD_ID));
  if (end - start > 250) {
    break;
  }
}
const duration = (end - start) / 1000;

console.log('----');
console.log(`time passed: ${duration}s`);
console.log(`uuids generated: ${results.length}`);
console.log(`UUIDs/sec: ${(results.length / duration).toFixed(2)}`)
