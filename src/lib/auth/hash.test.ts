import { hashPassword, verifyPassword } from "./hash";

describe("hash utilities", () => {
  it("hashes and verifies passwords", async () => {
    const hashed = await hashPassword("Regnova123");
    await expect(verifyPassword("Regnova123", hashed)).resolves.toBe(true);
  });

  it("fails for incorrect password", async () => {
    const hashed = await hashPassword("Regnova123");
    await expect(verifyPassword("WrongPass1", hashed)).resolves.toBe(false);
  });
});

