// cypress/e2e/grabdocs_auth.cy.js

// 0) Ignore noisy app errors so Cypress doesn't fail on them
Cypress.on('uncaught:exception', (err) => {
  if (/postMessage|Cannot read properties of null/i.test(err.message)) {
    return false; // don't fail the test for app-side errors
  }
});

// 1) Pull creds from env (fallbacks only help you notice missing vars)
const EMAIL = Cypress.env('EMAIL') || 'YOUR_EMAIL_HERE';
const PASS  = Cypress.env('PASSWORD') || 'YOUR_PASSWORD_HERE';

/**
 * Helper: perform login flow.
 * - Starts on marketing site
 * - Clicks Sign in (navigates to app.grabdocs.com)
 * - Fills email/password on the app origin via cy.origin()
 * - Pauses on 2FA so you can type the code, then you click ▶ Resume in Cypress
 */
function login() {
  // Land on the marketing site
  cy.visit('https://grabdocs.com/');

  // Click "Sign in" (this navigates to the app subdomain)
  cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click({ force: true });

  // All actions on app.grabdocs.com must live inside cy.origin()
  cy.origin(
    'https://app.grabdocs.com',
    { args: { EMAIL, PASS } },
    ({ EMAIL, PASS }) => {
      // We should now be on the app domain and the login page
      cy.location('origin',   { timeout: 20000 }).should('include', 'app.grabdocs.com');
      cy.location('pathname', { timeout: 20000 }).should('match', /login|signin/i);

      // Fill login form (be flexible with selectors)
      cy.get('input[type="email"], input[name="email"], input[type="text"]', { timeout: 20000 })
        .first().clear().type(EMAIL);
      cy.get('input[type="password"], input[name="password"]', { timeout: 20000 })
        .first().clear().type(PASS, { log: false });

      // Submit
      cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click();

      // If 2FA appears, we pause so you can enter the code manually,
      // then click ▶ Resume in Cypress.
      cy.contains(/Two[- ]?Factor|Verify Code|Authenticator/i, { timeout: 5000 })
        .then(($twofa) => {
          if ($twofa.length) {
            cy.pause(); // <-- enter the 6-digit code in the app, then resume the run
          }
        });

      // After 2FA succeeds, we expect to land on a "logged in" screen
      cy.contains(/Documents|Dashboard|Home|New Document/i, { timeout: 60000 })
        .should('be.visible');
    }
  );
}

describe('GrabDocs authentication', () => {
  it('logs in successfully', () => {
    login();
  });

  it('logs out successfully', () => {
    // Ensure we are logged in first (fast if session cookie still valid)
    login();

    // Do the logout on the app origin
    cy.origin('https://app.grabdocs.com', () => {
      // Open any user/account menu that contains the logout action
      cy.contains(/Account|Profile|Settings|Menu|User|Avatar/i, { timeout: 20000 })
        .click({ force: true });

      cy.contains(/Log out|Sign out/i, { timeout: 20000 })
        .click({ force: true });

      // Back to the login screen
      cy.location('pathname', { timeout: 20000 }).should('match', /login|signin/i);
      cy.contains(/Log in|Sign in/i, { timeout: 20000 }).should('be.visible');
    });
  });
});
