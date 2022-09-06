# UUIDs generation

## Challenge

Imagine you are building a system to assign unique numbers to each resource that you manage. You want the ids to be guaranteed unique i.e. no UUIDs. Since these ids are globally unique, each id can only be given out at most once. The ids are **64 bits** long.

Your assignment is to implement **get_id**. When a caller requests a new id, the node it connects to calls its internal **get_id** function to get a new, globally unique id.

Assume that any node will not receive more than 100,000 requests per second.

## Problem Disambiguation

1. We need to build a system to assign **unique** numbers to the resources that we manage, so:
   1. The **get_id** method should return a number.
   2. The resources are created at some point in time, and we would like to keep track of that, in order to easily sort them. Thus, we will include a **timestamp** in our UUID.
2. We know that we have up to 1024 nodes in our system. We can't use only the timestamp to uniquely identify a resource, because 1024 nodes will generate at least 1024 identical ids. We will include the **worker id** in the UUID as well.
3. We don't know what are the configurations of the machines hosting the nodes, but we do know that each node runs a process which serves ids. We will assume that only **one thread** is used per node.
4. We have a timestamp and a worker id, but the processor is fast enough to generate multiple UUIDs per millisecond (we expect 100k req/s, so 100 req/ms). We need a mechanism to generate at least 100 unique ids in a millisecond. We'll use a **sequence id**, or a counter.

## UUID Structure

We know that the UUIDs are 64 bits long, so a proposed decomposition is:

- 40 bit **timestamp**
- 10 bit **worker id**
- 14 bits **sequence**

1. A 42 bit timestamp would suffice for ~139 years ( (2 ^ 42 - 1) / (365 \* 24 \* 3600 \* 1000) ), but we don't afford this much space. A normal project has a life span of about 20 years, so **40 bits** for the timestamp would suffice (~34.86 years).
   1. A UNIX timestamp uses 64 bits, but we don't have that luxury. That's why we will create our custom timestamp, which uses a custom epoch (instead of 1/1/1970, we will use Date.now).
   2. In production, we will use a predefined epoch, shared across all the nodes. For testing purposes, we can generate the epoch on the spot.
2. Since there are a fixed number of nodes in the system, up to 1024, we'll need to allocate **10 bits** to store the worker id.
3. A single thread can generate multiple timestamps in one millisecond, thus we need to use a sequence id to mitigate conflicts.
   1. With 12 bits, we would mitigate 4096 conflicts, and we would end up generating around 50k uuids per second, per thread.
   2. With 13 bits we would mitigate 8192 conflicts and we would generate about 300k uuids per second, per thread.
   3. With 14 bits we would generate more than 7.5mil uuids per second, per thread.
   4. Given the fact that we expect 100k requests per second, _12 bits_ should suffice, but we don't need to offer support for multi-threading, so we will use **14 bits**.

## get_id interface

`int get_id()`

Parameters: N/A

## UUIDWorker constructor interface

`constructor(int workerId, int epoch)`

Parameters:

- _int workerId_ - used for identifying the node
- _int epoch_ - used for generating our custom timestamp.

## Corner cases

How do you manage uniqueness after a node crashes and restarts?

> 1. If a node crashes, the other nodes will handle the load. Because of the _worker id_ segment, our UUID is guaranteed to be unique across nodes.
> 2. If the node restarts, it will start processing new requests, with a new timestamp than before it crashed.

How do you manage uniqueness after the entire system fails and restarts?

> After the entire system fails and restarts, we will start generating uuids again, from the new timestamp. Because we have the _worker id_ and the _sequence id_ in the UUID composition, we are assured that we will keep generating unique UUIDs.

How do you handle software failures, i.e. non-monotonic clocks?

> The UUIDWorker keeps track of the _lastTimestamp_. If the _timestamp_ generated at the **get_id** method call is smaller than the _lastTimestamp_, the method throws an error.

How is the uniqueness assured if the **sequence id** overflows?

> When the sequence id reaches the maximum value, the method waits for the next millisecond to proceed with the logic.

## Performance test results

Worker starting with...

- workerIdSize: 10
- sequenceSize: 14
- workerId: 0
- epoch: 1662492047972

---

- time passed: 0.258s
- uuids generated: 1956333
- UUIDs/sec: 7582686.05
