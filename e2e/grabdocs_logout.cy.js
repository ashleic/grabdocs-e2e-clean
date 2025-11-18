// cypress/e2e/grabdocs_auth.cy.js

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
 * Helper: perform login flow (no 2FA).
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

      cy.get(
        'input[type="email"], input[name="email"], input[type="text"]',
        { timeout: 20000 }
      )
        .first()
        .clear()
        .type(EMAIL);

      cy.get(
        'input[type="password"], input[name="password"]',
        { timeout: 20000 }
      )
        .first()
        .clear()
        .type(PASS, { log: false });

      cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click();

      //Confirm we are past the login screen (no 2FA logic)
      cy.location('pathname', { timeout: 30000 })
        .should('not.match', /login|signin/i);
    }
  );
}

describe('GrabDocs authentication', () => {
  it('logs in successfully', () => {
    login();
  });

  it('logs out successfully', () => {
    // Step 1: Log in
    login();

    // Step 2: Do logout on the app domain
    cy.origin('https://app.grabdocs.com', () => {
      // Optional: wait for a known post-login element
      cy.contains(/Documents|New Document|Dashboard|Home/i, { timeout: 60000 })
        .should('be.visible');

      // Open account/user menu
      cy.contains(/Account|Profile|Settings|Menu|User|Avatar/i, { timeout: 20000 })
        .click({ force: true });

      // Click Log out / Sign out
      cy.contains(/Log out|Sign out/i, { timeout: 20000 })
        .click({ force: true });

      // Back on login screen
      cy.location('pathname', { timeout: 20000 })
        .should('match', /login|signin/i);

      cy.contains(/Log in|Sign in/i, { timeout: 20000 })
        .should('be.visible');
    });
  });
});

