// actionDef.executor = async (areq, ares) => {
//   // The app can use either async or sync function; server doesn't care

//   // Lock the feed for revelation
//   try {
//     const feed = await ares.revelation("Chatroom", { ChatroomId: 123 });
//   } catch (e) {
//     ares.failure("INTERNAL_ERROR", {});
//     return; // Stop
//   }

//   const feedData = await feed.data(); // Await because not automatically retrieved - generally shouldn't be needed
//   feed.set([], { feed: data });

//   // The success function returns a response to the invoker - either action() or client
//   // And it publishes the revelations (which require actionData)
//   ares.success({ action: "data" });

//   // Post-action application processing
// };
