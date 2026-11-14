import { expect, test } from "@playwright/test";

test("login as mentee, create task, advance status", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("mentee.a@demo.local");
  await page.getByLabel("Password").fill("demo-mentee-a");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/tasks/);
  await expect(page.getByText(/Mentee A · mentee/)).toBeVisible();

  const title = `E2E task ${Date.now()}`;
  await page.getByPlaceholder("New task title").fill(title);
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText(title)).toBeVisible();

  const card = page.locator("li").filter({ hasText: title });
  await card.getByRole("button", { name: "→ doing" }).click();
  await expect(card.getByText("status: doing")).toBeVisible();
});
