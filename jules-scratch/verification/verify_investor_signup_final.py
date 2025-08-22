from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:3000/auth?view=signup", timeout=60000)

        investor_tab = page.get_by_role("tab", name="Investor")
        expect(investor_tab).to_be_visible(timeout=15000)
        investor_tab.click()

        # --- Fill Step 1 ---
        form_locator = page.locator("form")
        expect(page.get_by_label("First Name *")).to_be_visible()
        page.get_by_label("First Name *").fill("Investor")
        page.get_by_label("Last Name *").fill("User")
        page.get_by_label("Email *").fill("investor@example.com")
        page.get_by_label("Phone Number *").fill("9876543210")
        page.get_by_label("LinkedIn Profile *").fill("https://www.linkedin.com/in/investoruser")
        page.get_by_label("Create Password *").fill("Password123")
        page.get_by_label("Confirm Password *").fill("Password123")
        form_locator.get_by_role("button", name="Next").click()

        # --- Fill Step 2 ---
        expect(page.get_by_text("Step 2 of 2")).to_be_visible()
        page.locator("div:has(> label:has-text('Investor Type *'))").locator("button").click()
        page.get_by_role("option", name="Family Office").click()

        page.get_by_label("Equity investments").check()
        page.get_by_label("Debt financing").check()

        page.get_by_label("₹ 25-1 Cr").check()

        page.get_by_label("What sectors / startups are you interested in? *").fill("AI, SaaS, FinTech")

        # Final validation check
        expect(page.get_by_role("button", name="Complete Profile")).to_be_enabled()

        page.screenshot(path="jules-scratch/verification/investor_final_verification.png")
        print("Final investor signup screenshot taken successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/investor_final_error.png")

    finally:
        browser.close()

with sync_playwright() as p:
    run(p)
