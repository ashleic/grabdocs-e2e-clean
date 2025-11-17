// 0) Ignore noisy app errors so Cypress doesn't fail on them
Cypress.on('uncaught:exception', (err) => {
  if (/postMessage|Cannot read properties of null/i.test(err.message)) {
    return false; // don't fail the test for app-side errors
  }
});

// 1) Pull creds from env
const EMAIL = Cypress.env('EMAIL') || 'YOUR_EMAIL_HERE';
const PASS  = Cypress.env('PASSWORD') || 'YOUR_PASSWORD_HERE';

/**
 * Helper: perform login flow (with 2FA pause).
 */
function login() {
  // Land on the marketing site
  cy.visit('https://grabdocs.com/');

  // Click "Sign in"
  cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click({ force: true });

  // Handle login on app.grabdocs.com
  cy.origin(
    'https://app.grabdocs.com',
    { args: { EMAIL, PASS } },
    ({ EMAIL, PASS }) => {
      cy.location('origin',   { timeout: 20000 }).should('include', 'app.grabdocs.com');
      cy.location('pathname', { timeout: 20000 }).should('match', /login|signin/i);

      cy.get('input[type="email"], input[name="email"], input[type="text"]', { timeout: 20000 })
        .first().clear().type(EMAIL);

      cy.get('input[type="password"], input[name="password"]', { timeout: 20000 })
        .first().clear().type(PASS, { log: false });

      cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click();

      // 2FA block: pause so you can enter the code
      cy.contains(/Two[- ]?Factor|Verify Code|Authenticator/i, { timeout: 10000 })
        .then(($twofa) => {
          if ($twofa.length) {
            // Enter the code in GrabDocs, wait for the app to finish loading,
            // then click ▶ Resume in Cypress.
            cy.pause();
          }
        });

      // sanity check: no longer on login URL
      cy.location('pathname', { timeout: 30000 })
        .should('not.match', /login|signin/i);
    }
  );
}

describe('GrabDocs Settings tabs', () => {
  it('opens Settings and clicks Security, Display, Video, and Usage', () => {
    // Step 1: log in
    login();

    // Step 2: everything else happens on the app.grabdocs.com origin
    cy.origin('https://app.grabdocs.com', () => {
      // Open the avatar menu (AC circle) and click Settings
      cy.contains('button', /^AC$/i, { timeout: 20000 })
        .click({ force: true });

      cy.contains(/Settings/i, { timeout: 20000 })
        .click({ force: true });

      // Ensure Settings page loaded
      cy.contains(/Settings/i, { timeout: 20000 })
        .should('be.visible');

      // Step 3: click each of the core tabs
      const tabs = ['Security', 'Display', 'Video', 'Usage'];

      tabs.forEach((label) => {
        cy.contains(new RegExp(`^${label}$`, 'i'), { timeout: 20000 })
          .click({ force: true });

        // Optional mini-assert: tab content area exists
        // (kept generic since we don't know exact text per tab)
        cy.contains(/Profile|Change Password|Two[- ]?Factor|Theme|Usage/i)
          .should('exist');
      });
    });
  });
});
