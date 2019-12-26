// import actionRevelation from "./actionrevelation";

// const proto = {};

// export default function actionResponseFactory(server, coreActionResponse) {
//   this._server = server;
//   this._coreActionResponse = coreActionResponse;

//   const actionResponse = Object.create(proto);
// }

// proto.success = function success(actionData) {};

// proto.failure = function failure(errorCode, errorData) {};

// proto.revelation = function revelation(feedName, feedArgs) {
//   return actionRevelation(server);

//   // Needs to return a promise
// };

// proto.actionRevelation = function actionRevelation(params) {
//   // Not quite -- this goes in an ActionResponse object
//   this._adapter.lock("feed-" + feedSerial),
//     (err, lock) => {
//       if (err) {
//         params.callback(new Error("Could not obtain feed data lock.")); // Attach adapter error
//       } else {
//         this._adapter.get("feed-" + feedSerial, (err, data) => {
//           if (err) {
//             params.callback(new Error("Could not obtain feed data.")); // Attach adapter error
//           } else {
//             const newFeedData = feedDataWriter.apply(params.deltas);
//             // Increment the version number
//             this._adapter.set("feed-" + feedSerial, newFeedData, err => {
//               if (err) {
//                 params.callback(new Error("Could not write feed data.")); // Attach adapter error
//               } else {
//                 this._adapter.publish(
//                   "feed-" + feedSerial,
//                   JSON.stringify({
//                     MessageType: "ActionRevelation",
//                     Version: xxx
//                     // Revelation info, including hash
//                   })
//                 );
//                 lock.unlock();
//                 params.callback();
//               }
//             });
//           }
//         });
//       }
//     };
// };
