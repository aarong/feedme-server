import callbackify from "callbackify";
// import check from "check-types";

const proto = {};

/**
 * Factory function.
 * @param {Object} options
 * @param {Object} options.serverCore
 * @param {Object} options.adapter // Nomen? clusterAdapter? But it's also storage
 * @param {Object} options.actionDefs
 * @param {Object} options.feedDefs
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @returns {Server}
 */

export default function serverFactory() {
  const server = Object.create(proto);

  // server._core = options.serverCore;
  // server._adapter = options.adapter;
  // server._actionDefs = options.actionDefs;
  // server._feedDefs = options.feedDefs;

  // // server._handshakeResponses = {}; // Indexed by cid; stored when client submits handshake before client channel is open
  // // server._feedOpenResponses = {}; // Indexed by feedSerial; arrays; only present if authorized; don't worry about removing on disconnect
  // // server._serverFeedStates = {}; // opening, open, closing
  // // server._serverFeedData = {};

  // // Listen for server-core events
  // [
  //   "starting",
  //   "start",
  //   "stopping",
  //   "stop",
  //   "connect",
  //   "handshake",
  //   "action",
  //   "feedOpen",
  //   "feedClose",
  //   "disconnect",
  //   "badClientMessage",
  //   "transportError"
  // ].forEach(evt => {
  //   server._core.on(evt, server._coreHandlers[evt].bind(server));
  // });

  // // Listen for adapter events
  // ["connecting", "connect", "disconnecting", "disconnect", "message"].forEach(
  //   evt => {
  //     server._adapter.on(evt, server._adapterHandlers[evt].bind(server));
  //   }
  // );

  return server;
}

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

proto.test = callbackify(async myarg => {
  await wait(100);
  return myarg;
});

// Server-core event listeners

proto._coreHandlers = {};

proto._coreHandlers.starting = function _coreStarting() {};

proto._coreHandlers.start = function _coreStart() {};

proto._coreHandlers.stopping = function _coreStopping() {};

proto._coreHandlers.stop = function _coreStop() {};

proto._coreHandlers.connect = function _coreConnect() {
  //   this._adapter.subscribe("client-" & clientId, err => {
  //     if (err) {
  //       // Retry
  //     } else if (this._handshakeResponses[cid]) {
  //       this._handshakeResponses[cid].success();
  //     }
  //   });
};

proto._coreHandlers.handshake = function _coreHandshake() {
  //   if (this._adapter.channelState(`client-${hsreq.clientId}`) === "open") {
  //     hsres.success();
  //   } else {
  //     this._handshakeResponses[hsreq.clientId] = hsres;
  //   }
};

proto._coreHandlers.action = function _coreAction() {
  //   this.action(
  //     areq.clientId,
  //     areq.actionName,
  //     areq.actionArgs,
  //     (err, actionData) => {
  //       if (err) {
  //         // Send clientErrorCode/Data or generic message
  //       } else {
  //         ares.success(actionData);
  //       }
  //     }
  //   );
};

proto._coreHandlers.feedOpen = function _coreFeedOpen() {
  //   // Make sure feed definition exists
  //   // Make sure arguments satisfy schema
  //   this._feedDefs[feedSerial].authorizer(
  //     foreq.clientId,
  //     foreq.feedArgs,
  //     err => {
  //       if (err) {
  //         fores.failure("ACCESS_DENIED", {});
  //         return;
  //       }
  //       if (this._serverFeedStates[feedSerial] === "open") {
  //         fores.success(this._serverFeedData[feedSerial]);
  //       } else {
  //         this._feedOpenResponses[feedSerial].push(fores);
  //         this._considerServerFeedState(feedName, feedArgs);
  //       }
  //     }
  //   );
};

proto._coreHandlers.feedClose = function _coreFeedClose() {
  //   this._considerServerFeedState(fcreq.feedName, fcreq.feedArgs);
  //   fcres.success();
};

proto._coreHandlers.disconnect = function _coreDisconnect() {
  //   this._adapter.unsubscribe(`client-${clientId}`, err => {
  //     // Retry
  //   });
};

proto._coreHandlers.badClientMessage = function _coreBadClientMessage() {};

proto._coreHandlers.transportError = function _coreTransportError() {};

// Adapter event handlers

proto._adapterHandlers = {};

proto._adapterHandlers.connecting = function _adapterConnecting() {};

proto._adapterHandlers.connect = function _adapterConnect() {};

proto._adapterHandlers.disconnecting = function _adapterDisconnecting() {};

proto._adapterHandlers.disconnect = function _adapterDisconnect() {};

proto._adapterHandlers.message = function _adapterMessage() {
  //   if (msg.MessageType === "ActionRevelation") {
  //     // If the feed is opening, queue
  //     // If the feed is open, apply deltas to feed data and do this._core.actionRevelation(...)
  //     // Otherwise discard
  //   } else if (msg.MessageType === "FeedTermination") {
  //     // Do this._core.feedTermination(...)
  //   } else if (msg.MessageType === "Disconnect") {
  //     this._core.disconnect(msg.ClientId);
  //     // Unsubsribe handled by event listener
  //   }
};

// // Public API

// proto.start = function start() {};

// proto.stop = function stop() {};

// proto.action = function action(clientId, actionName, actionArgs, callback) {
//   //   if (!(actionName in this._actionDefs)) {
//   //     const err = new Error("NOT_DEFINED: Action not defined.");
//   //     err.clientErrorCode = "NOT_DEFINED";
//   //     err.clientErrorData = {};
//   //     callback(err);
//   //     return;
//   //   }
//   //   // Make sure arguments satisfy schema
//   //   this._actionDefs[areq.actionName].executor(
//   //     areq.clientId,
//   //     areq.actionArgs,
//   //     callback
//   //   );
// };

// proto.feedTermination = function feedTermination(params) {
//   //   // Check usage and publish appropriate message to adapter feed/client channel
// };

// proto.disconnect = function disconnect(clientId) {
//   //   // Publish appropriate message to feed/client channel
// };

// // Internal helpers

// proto._considerServerFeedState = async function _considerFeedState(
//   feedName,
//   feedArgs
// ) {
//   //   // Wait for previous call to return if opening/closing
//   //   const actualState = this._serverFeedStates[feedSerial];
//   //   const desiredState =
//   //     this._core.feedClientCount(feedName, feedArgs) > 0 ? "open" : "closed";
//   //   if (actualState === "closed" && desiredState === "open") {
//   //     // Open the server feed
//   //     this._adapter.subscribe("feed-" + feedSerial, err => {
//   //       if (err) {
//   //         // Schedule a retry? Look at client options
//   //       } else {
//   //         this._adapter.get("feed-" + feedSerial, (err, data) => {
//   //           if (err) {
//   //             // Schedule a retry? Look at client options
//   //           } else {
//   //             // If the data is empty
//   //             // Lock the feed
//   //             // Check again that it is empty - if not, then _considerFeedState
//   //             // Run the generator, set the feed data, and unlock
//   //             // If the data is not empty
//   //             // Discard ActionRevelations built into the data
//   //             // Return FeedOpenResponse messages
//   //             // Process ActionRevelation messages
//   //           }
//   //         });
//   //       }
//   //     });
//   //   } else if (actualState === "open" && desiredState === "closed") {
//   //     // Close the server feed - straight-forward
//   //   }
// };
