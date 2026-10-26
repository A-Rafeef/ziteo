import { expect, test } from "@playwright/test";

test("seller workspace requires sign-in and offers Google and email", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("autocomplete", "current-password");
  await expect(page.getByRole("textbox", { name: /phone|otp/i })).toHaveCount(0);
});

test("password reset has email validation and no login password field", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(page.getByRole("heading", { name: "Let’s get you back in." })).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveAttribute("type", "email");
  await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
});

test("expired confirmation links explain the next step", async ({ page }) => {
  await page.goto("/login?error=invalid_link");
  await expect(page.getByRole("alert")).toContainText("request a fresh reset link");
});

test("auth mutations reject other origins and signout needs POST", async ({ request }) => {
  const password = await request.post("/auth/password", { headers: { Origin: "https://untrusted.example" }, data: { mode: "reset", email: "seller@example.com" } });
  expect(password.status()).toBe(403);
  const signout = await request.post("/auth/signout", { headers: { Origin: "https://untrusted.example" } });
  expect(signout.status()).toBe(403);
  expect((await request.get("/auth/signout")).status()).toBe(405);
});
