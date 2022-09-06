class UUIDWorker {
  // bit size for the worker id (2 ^ 10 = 1024)
  #workerIdSize = 10;
  #maxWorkerIdValue = -1 ^ (-1 << this.#workerIdSize);
  // bit size for the sequence used to mitigate conflicts (2 ^ 14 = 16384)
  #sequenceSize = 14;
  #maxSequenceValue = -1 ^ (-1 << this.#sequenceSize);

  #timestampLeftShift = this.#workerIdSize + this.#sequenceSize;
  #workerIdLeftShift = this.#sequenceSize;

  #workerId = null;
  #epoch = null;
  #lastTimestamp = Date.now();
  #sequence = 0;

  constructor(workerId, epoch) {
    if (workerId < 0 || workerId > this.#maxWorkerIdValue) {
      throw new Error('Invalid worker id argument.');
    }
    if (!epoch || epoch > Date.now()) {
      throw new Error('Invalid epoch argument.');
    }
    this.#workerId = workerId;
    this.#epoch = epoch;
    console.info(
      `Worker starting with...`,
      `\nworkerIdSize: ${this.#workerIdSize} `,
      `\nsequenceSize: ${this.#sequenceSize} `,
      `\nworkerId: ${this.#workerId}`,
      `\nepoch: ${this.#epoch}`
    );
  }

  // Used for testing purposes only (i.e. simulating non-monotonic clock scenarios)
  setLastTimestamp(newTimestamp) {
    this.#lastTimestamp = newTimestamp;
  }

  // The subject of the assignment. This method should generate a new, guaranteed unique, UUID
  get_id() {
    let currentTimestamp = Date.now();
    if (currentTimestamp < this.#lastTimestamp) {
      log.error(`Clock is non-monotonic. Waiting until ${this.#lastTimestamp}...`);
      throw new Error('Clock is non-monotonic. Unicity can not be assured.');
    }

    if (currentTimestamp === this.#lastTimestamp) {
      this.#sequence++;
      // reached when a thread generated more than 16384 UUIDs in one millisecond.
      if (this.#sequence > this.#maxSequenceValue) {
        currentTimestamp = this.getNextMillisecondTimestamp(this.#lastTimestamp);
      }
    } else {
      this.#sequence = 0;
    }
    this.#lastTimestamp = currentTimestamp;

    return ((currentTimestamp - this.#epoch) << this.#timestampLeftShift) |
      (this.#workerId << this.#workerIdLeftShift) |
      this.#sequence;
  }

  getNextMillisecondTimestamp(prevTimestamp) {
    let newTimestamp = Date.now();
    while (newTimestamp <= prevTimestamp) {
      newTimestamp = Date.now();
    }
    return newTimestamp;
  }
};

module.exports = {
  UUIDWorker
};
