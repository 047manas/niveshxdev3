from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the auth page (defaults to sign up)
    page.goto("http://localhost:3000/auth")

    # Take a screenshot of the sign-up page
    page.screenshot(path="jules-scratch/verification/signup_page.png")

    # Click the "Log in" button to switch to the login form
    page.locator("p button:has-text('Log in')").click()

    # Expect the login button to be visible
    login_button = page.get_by_role("button", name="Log In")
    expect(login_button).to_be_visible()

    # Take a screenshot of the login page
    page.screenshot(path="jules-scratch/verification/login_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
