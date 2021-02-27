[![Build Status](https://travis-ci.com/aarong/feedme-server.svg?branch=master)](https://travis-ci.com/aarong/feedme-server)
[![Coverage Status](https://coveralls.io/repos/github/aarong/feedme-server/badge.svg?branch=master)](https://coveralls.io/github/aarong/feedme-server?branch=master)

[Logo]

# Feedme Server

A Feedme server library for Node.js. Callback and promise/async friendly.

Link to feedme-server-core.

Develop business logic without respect to scaling/clustering architecture.

Action revelations obtain a lock on a feed (i.e. nobody else can reveal) Then
they update central feed data Then they publish an ActionRevelation to the
cluster Then they unlock the feed -- Is there a guarantee that the revelation
has been entirely disseminated before another node does one? -- What you really
need is pubsub ordering -- doesn't exist on Redis. Kafka has this, but you are
limited to low tens of thousands of topics. You could use Redis and incorporate
your own ordering system (i.e. pass version numbers). Am I sure that you can
scale to a huge number of pubsub subscriptions on Redis?

OPTION -- any way to do this with locking? You could lock a feed while you
terminate clients, but how would you know when the terminations have been
performed?

An option is to push this out into the adapter, so that publish() calls back
when the message has been successfully distributed. Then you can't use Redis
Look into other message queues -- but needs to be very fast. You could still
have a Redis adapter that simply doesn't do this

https://otonomo.io/redis-kafka-or-rabbitmq-which-microservices-message-broker-to-choose/
Kafka

- Available managed on AWS
- Preserves order of messages (so you should just need to lock)
- Used to support real-time applications
- Seems to have acknowledgements:
  https://dzone.com/articles/kafka-producer-delivery-semantics
- Intro:
  https://hackernoon.com/thorough-introduction-to-apache-kafka-6fbf2989bbc1
  - Commit log - ordering is at its core, for deterministic processing
  - Low latency, high throughput
  - https://thatcoder.space/getting-started-with-kafka-and-node-js-with-example/

EVEN WITH THIS SOLUTION (ordered pubsub with ack) Terminating an entire feed
works because you publish on the same channel/topic -- But terminating a
client's feed there would be no such guarantee!

- You could publish to the feed topic: bad for heavily-subscribed feeds, but
  this probably is the only guaranteed way. And you wouldn't typically have
  massively-susbcribed feeds where clients are regularly getting terminated
- That's fine for terminating a specific client feed, but what about terminating
  all of a client's feeds? Or disconnecting? In that case I would assume that it
  is less important to sequence, right? Plus I don't even think I used this in
  CatX

Whatever my decision, make sure it's the adapter's decision. What is the new
adapter API? The key issue is that the adapter decides which channels to publish
terminations and disconnects on. So the adapter is more functional async
feedTermination(params) async disconnect(cid) async actionRevelation(params)

QUESTION

- What if ALL messaging to a given client went through a certain topic -- order
  guaranteed
- This might make server-core no good for this

Authorizers, generators, executors

## API

Initialization options:

- transport or serverCore (for testing)
- adapter (optional - defaults to single-process)
- actionDefs
- feedDefs
- maxClientFeeds -- max feeds opening/open per client
- messageThrottles -- applies to all messages, not just actions (i.e. don't
  allow hugely aggressive feedopens/closes either)

Action definitions:

Feed definitions:

Events: starting, start, stopping, stop connect, handshake, disconnect
badServerMessage, transportError

Methods

- start()
- stop()
- async action(cid, an, aa) returns actionData Or action(cid, an, aa, cb[err,
  actionData])
- feedTermination(params) returns void No awaiting
- disconnect(cid) returns void

Objects

ActionRequest .clientId .actionName .actionArgs

ActionResponse async revelation(fn, fa) returns ActionRevelation Or
revelation(fn, fa, cb[err, ActionRevelation]) success(ad) failure(ec, ed)

ActionRevelation delta operations
