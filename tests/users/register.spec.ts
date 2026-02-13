import request from "supertest";
import app from "../../src/app";
describe("POST/auth/register", () => {
  describe("given all fields", () => {
    it("should return the 201 status code", async () => {
      // arrange
      const userData = {
        firstName: "iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret",
      };
      // act
      const response = await request(app).post("/auth/register").send(userData);
      // assert
      expect(response.statusCode).toBe(201);
    });
  });
  it("should return valid json response", async () => {
    // arrange
      const userData = {
        firstName: "iraj",
        lastName: "M",
        email: "irajj.259@gmail.com",
        password: "secret",
      };
      // act
      const response = await request(app).post("/auth/register").send(userData);
      // assert
      expect((response.headers as Record<string, string>)['content-type']).toEqual(expect.stringContaining("json"))
  });
  describe("fields missing", () => {});
});
