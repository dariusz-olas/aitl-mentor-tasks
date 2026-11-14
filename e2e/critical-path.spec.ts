import { expect, test } from "@playwright/test";

test("login as mentee, create task, edit, advance status", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("mentee.a@demo.local");
  await page.getByLabel("Password").fill("demo-mentee-a");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/tasks/);
  await expect(page.getByText(/Mentee A · mentee/)).toBeVisible();

  const title = `E2E task ${Date.now()}`;
  await page.getByPlaceholder("New task title").fill(title);
  await page.getByPlaceholder("Description (optional)").fill("e2e desc");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText("e2e desc")).toBeVisible();

  const card = page.locator("li").filter({ hasText: title });
  await card.getByRole("button", { name: "Edit" }).click();
  await card.getByLabel("Edit title").fill(`${title} edited`);
  await card.getByLabel("Edit description").fill("e2e desc edited");
  await card.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(`${title} edited`)).toBeVisible();
  await expect(page.getByText("e2e desc edited")).toBeVisible();

  const edited = page.locator("li").filter({ hasText: `${title} edited` });
  await edited.getByRole("button", { name: "→ doing" }).click();
  await expect(edited.getByText("status: doing")).toBeVisible();
});

test("IDOR: mentee A gets 404 on mentee B task API", async ({ page, request }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("mentee.a@demo.local");
  await page.getByLabel("Password").fill("demo-mentee-a");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/tasks/);

  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  const res = await request.get("http://127.0.0.1:3000/api/tasks/t-seed-b", {
    headers: { Cookie: cookieHeader },
  });
  expect(res.status()).toBe(404);
});
