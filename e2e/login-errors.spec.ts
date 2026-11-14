import { expect, test, type Page } from "@playwright/test";

// Spec: .ai/specs/S5-login-error-feedback.md (AC7, cases a–h).

const LOGIN_API = "**/api/auth/login";
const SECRET_MESSAGE =
  "AUTH_SECRET is required (min 16 chars). Copy .env.example → .env and set a real secret.";

// Scoped to the form: Next.js adds its own role="alert" route announcer.
function loginAlert(page: Page) {
  return page.locator("form").getByRole("alert");
}

async function submit(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function sessionCookies(page: Page) {
  const cookies = await page.context().cookies();
  return cookies.filter((c) => c.name === "aitl_session");
}

test.describe("S5 login error feedback", () => {
  test("a: wrong password shows the API reason and sets no session cookie", async ({
    page,
  }) => {
    await page.goto("/login");
    await submit(page, "mentee.a@demo.local", "wrong-password");

    await expect(loginAlert(page)).toHaveText("Invalid credentials");
    await expect(page).toHaveURL(/\/login$/);
    expect(await sessionCookies(page)).toHaveLength(0);
  });

  test("b: unknown email shows the same text as a wrong password", async ({
    page,
  }) => {
    await page.goto("/login");
    await submit(page, "nobody@example.com", "whatever");

    await expect(loginAlert(page)).toHaveText("Invalid credentials");
    await expect(page).toHaveURL(/\/login$/);
    expect(await sessionCookies(page)).toHaveLength(0);
  });

  test("c: 403 configuration message is shown as returned", async ({ page }) => {
    await page.route(LOGIN_API, (route) =>
      route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ error: SECRET_MESSAGE }),
      }),
    );
    await page.goto("/login");
    await submit(page, "mentee.a@demo.local", "demo-mentee-a");

    await expect(loginAlert(page)).toHaveText(SECRET_MESSAGE);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("d: non-JSON error response falls back to Login failed", async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));
    await page.route(LOGIN_API, (route) =>
      route.fulfill({
        status: 500,
        contentType: "text/plain",
        body: "Internal Server Error",
      }),
    );
    await page.goto("/login");
    await submit(page, "mentee.a@demo.local", "demo-mentee-a");

    await expect(loginAlert(page)).toHaveText("Login failed");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(pageErrors).toHaveLength(0);
  });

  test("e: aborted request falls back to Login failed", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));
    await page.route(LOGIN_API, (route) => route.abort());
    await page.goto("/login");
    await submit(page, "mentee.a@demo.local", "demo-mentee-a");

    await expect(loginAlert(page)).toHaveText("Login failed");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(pageErrors).toHaveLength(0);
  });

  test("f: retry clears the alert while pending, then signs in", async ({
    page,
  }) => {
    await page.goto("/login");
    await submit(page, "mentee.a@demo.local", "wrong-password");
    await expect(loginAlert(page)).toHaveText("Invalid credentials");

    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(LOGIN_API, async (route) => {
      await gate;
      await route.continue();
    });

    try {
      await submit(page, "mentee.a@demo.local", "demo-mentee-a");
      const button = page.getByRole("button", { name: "Sign in" });
      await expect(button).toBeDisabled();
      await expect(loginAlert(page)).toHaveCount(0);
    } finally {
      // Always let the held request go, so a failed assertion cannot leave
      // the route handler waiting during teardown.
      release();
    }
    await expect(page).toHaveURL(/\/tasks/);
    await expect(page.getByText(/Mentee A · mentee/)).toBeVisible();
  });

  test("g: invalid email shows the 400 reason from the real API", async ({
    page,
  }) => {
    await page.goto("/login");
    await submit(page, "not-an-email", "whatever");

    await expect(loginAlert(page)).toHaveText("Invalid body");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("h: markup in the message is shown as text, not rendered", async ({
    page,
  }) => {
    const markup = '<b>Invalid</b><img src="x" onerror="window.__s5 = 1">';
    await page.route(LOGIN_API, (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: markup }),
      }),
    );
    await page.goto("/login");
    await submit(page, "mentee.a@demo.local", "demo-mentee-a");

    await expect(loginAlert(page)).toHaveText(markup);
    await expect(loginAlert(page).locator("b, img")).toHaveCount(0);
    expect(
      await page.evaluate(() => (window as { __s5?: number }).__s5),
    ).toBeUndefined();
  });
});
