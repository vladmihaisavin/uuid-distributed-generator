# UUIDs generation

## Challenge

Imagine you are building a system to assign unique numbers to each resource that you manage. You want the ids to be guaranteed unique i.e. no UUIDs. Since these ids are globally unique, each id can only be given out at most once. The ids are **64 bits** long.

Your assignment is to implement **getId**. When a caller requests a new id, the node it connects to calls its internal **getId** function to get a new, globally unique id.

Assume that any node will not receive more than 100,000 requests per second.

## UUID Structure

We know that the ids are 64 bits long, so a proposed decomposition is:

- 42 bit **timestamp** //TODO maybe we don't need these many years
- 10 bit **worker id**
- 4 bits **thread id**
- 8 bits **sequence** //TODO apparently sweet spot is at around 12 bits -> 1mil uuids/sec. to tweak

1. A 42 bit timestamp would suffice for ~139 years ( (2 ^ 42 - 1) / (365 _ 24 _ 3600 \* 1000) ).
2. Since there are a fixed number of nodes in the system, up to 1024, we'll need to allocate 10 bits to store the worker id.
3. If we are to presume that the system has up to 16 threads, we can allocate 4 bits for the thread id.
4. A single thread can generate multiple timestamps in one millisecond, thus we can use a sequence id with a value up to 256 (to mitigate up to 256 uuid conflicts).

## Failure cases

- How do you manage uniqueness after a node crashes and restarts?
- How do you manage uniqueness after the entire system fails and restarts?
- non-monotonic clocks
-
