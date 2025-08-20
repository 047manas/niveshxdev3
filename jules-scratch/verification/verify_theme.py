from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the home page and take a screenshot
    page.goto("http://localhost:3000")
    page.screenshot(path="jules-scratch/verification/home_page.png")

    # Navigate to the auth page and take a screenshot
    page.goto("http://localhost:3000/auth")
    page.screenshot(path="jules-scratch/verification/auth_page.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
