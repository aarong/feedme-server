# Adapter Interface

Must be build using async/promises, but developers can always use promisify

State: disconnected, connecting, connected, disconnecting

Events: connecting, connect, disconnecting, disconnect, message

Methods

- connect()
- disconnect()
- state()
- async subscribe(channel) returns void
- async unsubsribe(channel) returns void
- async publish(channel, msg) returns void
- async channelState(channel) returns string (closed, opening, open, closing)
- async lock(resource) returns lock (is lock.unlock async?)
- async get(key) returns value
- async set(key, value) returns void

# Cluster Messaging Protocol

ActionRevelation, FeedTermination, Disconnect

# Cluster Storage

Versioning system
