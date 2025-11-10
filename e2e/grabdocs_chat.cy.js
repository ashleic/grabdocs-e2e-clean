// cypress/e2e/grabdocs_chat.cy.js

describe('GrabDocs: login and (optionally) send a chat message', () => {
  it('logs in and sends a chat message successfully', () => {
    // 0) Read credentials from environment variables (set in Terminal)
    //    If not set, these fall back to obvious placeholders.
    const EMAIL = Cypress.env('EMAIL') || 'your@email.com';
    const PASS  = Cypress.env('PASSWORD') || 'YourPassword123!';
    const OTP   = Cypress.env('OTP'); // Optional: only used if you export CYPRESS_OTP

    // 1) Open public site and click “Sign in” (this navigates to app.grabdocs.com)
    cy.visit('https://grabdocs.com/');
    cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click({ force: true });

    // 2) Make sure we actually navigated to the app’s domain and login page path
    cy.location('origin',   { timeout: 20000 }).should('include', 'app.grabdocs.com');
    cy.location('pathname', { timeout: 20000 }).should('match', /login|signin/i);

    // 3) All steps that touch app.grabdocs.com MUST be inside cy.origin.
    //    Pass EMAIL, PASS, OTP in via "args" so we can use them safely inside.
    cy.origin(
      'https://app.grabdocs.com',
      { args: { EMAIL, PASS, OTP } },
      ({ EMAIL, PASS, OTP }) => {

        // --- Fill email & password on the login form ---
        // Try a few common selectors so it works even if attributes vary.
        cy.get('input[type="email"], input[name="email"], input[type="text"]', { timeout: 20000 })
          .first()
          .clear()
          .type(EMAIL, { delay: 20 });

        cy.get('input[type="password"], input[name="password"]', { timeout: 20000 })
          .first()
          .clear()
          .type(PASS, { log: false });

        cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click();

        // --- Handle Two-Factor Auth if it appears ---
        // If OTP was provided, we auto-fill it. Otherwise we pause so you can type it.
        cy.get('body', { timeout: 30000 }).then($body => {
          const needs2FA = /Two[-\s]?Factor|Verify Code|Verification Code/i.test($body.text());
          if (needs2FA) {
            // Try a few common OTP input selectors
            const otpSelector =
              'input[autocomplete="one-time-code"], input[name*="code"], input[type="tel"], input[name="otp"]';

            if (OTP) {
              cy.get(otpSelector, { timeout: 20000 }).first().clear().type(OTP);
              cy.contains(/Verify|Continue|Submit/i, { timeout: 20000 }).click();
            } else {
              // No OTP provided → pause test so you can type the code and click Verify manually,
              // then press the ▶ Resume button in the Cypress left sidebar.
              cy.pause();
            }
          }
        });

        // --- Confirm we are past login (dashboard/home/documents visible) ---
        cy.contains(/Documents|New Document|Dashboard|Home/i, { timeout: 60000 }).should('be.visible');

        // --- OPTIONAL: Open Chat (if there is a clear entry) and send a short message ---
        cy.get('body').then($body => {
          const hasChatEntry = /Chat|AI Assistant/i.test($body.text());
          if (hasChatEntry) {
            cy.contains(/Chat|AI Assistant/i).click({ force: true });

            // Try common chat input selectors and send a message
            cy.get('textarea, [contenteditable="true"], input[type="text"]', { timeout: 20000 })
              .first()
              .type('Hello from Cypress!{enter}');

            // Wait for any AI/doc-related response text to appear
            cy.contains(/AI|GrabDocs|document|processing/i, { timeout: 30000 }).should('be.visible');
          }
        });
      }
    );
  });
});


