import { expect, test } from "@playwright/test";

test("login as mentee, create task, edit, advance status", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("mentee.a@demo.local");
  await page.getByLabel("Password").fill("demo-mentee-a");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/tasks/);
  await expect(page.getByText(/Mentee A · mentee/)).toBeVisible();

  const stamp = Date.now();
  const title = `E2E task ${stamp}`;
  const desc = `e2e-desc-${stamp}`;
  await page.getByPlaceholder("New task title").fill(title);
  await page.getByPlaceholder("Description (optional)").fill(desc);
  await page.getByRole("button", { name: "Create" }).click();

  const card = page.locator("li").filter({ hasText: title });
  await expect(card).toBeVisible();
  await expect(card.getByText(desc)).toBeVisible();

  await card.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Edit title").fill(`${title} edited`);
  await page.getByLabel("Edit description").fill(`${desc} edited`);
  await page.getByRole("button", { name: "Save" }).click();

  const edited = page.locator("li").filter({ hasText: `${title} edited` });
  await expect(edited.getByText(`${desc} edited`)).toBeVisible();
  await edited.getByRole("button", { name: "→ doing" }).click();
  await expect(edited.getByText("status: doing")).toBeVisible();
});

test("mentor assigns task to mentee", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("mentor@demo.local");
  await page.getByLabel("Password").fill("demo-mentor");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/tasks/);
  await expect(page.getByText(/Demo Mentor · mentor/)).toBeVisible();

  const stamp = Date.now();
  const title = `Mentor assign ${stamp}`;
  await page.getByPlaceholder("New task title").fill(title);
  await page.getByLabel("Assign to mentee").selectOption({ label: "Mentee A" });
  await page.getByRole("button", { name: "Create" }).click();

  const card = page.locator("li").filter({ hasText: title });
  await expect(card).toBeVisible();
  await expect(card.getByText(/assignee: Mentee A/)).toBeVisible();
});

test("IDOR: mentee A gets 404 on mentee B task API", async ({ page, request }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("mentee.a@demo.local");
  await page.getByLabel("Password").fill("demo-mentee-a");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/tasks/);

  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  const res = await request.get("/api/tasks/t-seed-b", {
    headers: { Cookie: cookieHeader },
  });
  expect(res.status()).toBe(404);
});
