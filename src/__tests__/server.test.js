import server from "../server";

describe("Something", () => {
  it("should do something", async () => {
    const s = server();
    const a1 = await s.test("hi there");
    expect(a1).toBe("hi there");
  });

  it("should do something", async done => {
    const s = server();
    s.test("hi there 2", (err, result) => {
      expect(result).toBe("hi there 2");
      done();
    });
  });
});
