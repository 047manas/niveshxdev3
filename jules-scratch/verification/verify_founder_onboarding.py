from playwright.sync_api import sync_playwright, expect, Page

def run(page: Page):
    page.goto("http://localhost:3000/auth?view=signup")

    # Wait for the "Founder" tab to be visible and then click it
    founder_tab = page.get_by_role("tab", name="Founder")
    founder_tab.wait_for(state="visible")
    founder_tab.click()

    # Fill out the user account form
    page.get_by_label("First Name").fill("Jules")
    page.get_by_label("Last Name").fill("Verne")

    # This interaction needs to be handled carefully as the select trigger opens a list
    page.locator('label:has-text("Your Designation") + button').click()
    page.get_by_role("option", name="CEO").click()

    page.get_by_label("Personal LinkedIn Profile").fill("https://www.linkedin.com/in/jules-verne")
    page.get_by_label("Your Work Email").fill("jules.verne@example.com")
    page.get_by_label("Phone Number").last.fill("1234567890")
    page.get_by_label("Create Password").fill("Password123!")
    page.get_by_label("Confirm Password").fill("Password123!")

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/founder_onboarding_step1.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run(page)
        finally:
            browser.close()

if __name__ == "__main__":
    main()
