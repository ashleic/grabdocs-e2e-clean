// cypress/e2e/grabdocs_settings.cy.js

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
 * CLEAN LOGIN (NO 2FA)
 */
function login() {
  cy.visit('https://grabdocs.com/');

  cy.contains(/Log in|Sign in/i, { timeout: 20000 })
    .click({ force: true });

  cy.origin(
    'https://app.grabdocs.com',
    { args: { EMAIL, PASS } },
    ({ EMAIL, PASS }) => {
      cy.location('origin', { timeout: 20000 })
        .should('include', 'app.grabdocs.com');

      cy.location('pathname', { timeout: 20000 })
        .should('match', /login|signin/i);

      cy.get('input[type="email"], input[name="email"], input[type="text"]', { timeout: 30000 })
        .first()
        .clear()
        .type(EMAIL);

      cy.get('input[type="password"], input[name="password"]', { timeout: 30000 })
        .first()
        .clear()
        .type(PASS, { log: false });

      cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click();

      cy.location('pathname', { timeout: 30000 })
        .should('not.match', /login|signin/i);

      cy.contains(/Home|Dashboard|Documents/i, { timeout: 30000 })
        .should('be.visible');
    }
  );
}

describe('GrabDocs Settings – switch Light → Dark theme', () => {
  it('opens Settings > Display and changes theme to Dark', () => {
    // Step 1: login
    login();

    // Step 2: do everything else on app.grabdocs.com
    cy.origin('https://app.grabdocs.com', () => {
      // Click avatar/initials button (1–3 uppercase letters)
      cy.get('button', { timeout: 20000 })
        .contains(/^[A-Z]{1,3}$/)
        .click({ force: true });

      // Click Settings in dropdown
      cy.contains(/Settings/i, { timeout: 20000 })
        .click({ force: true });

      // Ensure Settings page is visible
      cy.contains(/Settings/i, { timeout: 20000 })
        .should('be.visible');

      // Click the "Display" tab
      cy.contains(/^Display$/i, { timeout: 20000 })
        .click({ force: true });

      // Wait for Display settings / Theme section to appear
      cy.contains(/Theme Preferences|Theme/i, { timeout: 20000 })
        .should('be.visible');

      // Grab the select that is associated with "Select Theme" and change to Dark
      cy.contains(/Select Theme/i, { timeout: 20000 })
        .parent()                 // container around the label + select
        .find('select')           // the dropdown itself
        .select('Dark');          // <-- string, not regex

      // Assert the dropdown now shows "Dark"
      cy.contains(/Select Theme/i)
        .parent()
        .find('select')
        .find('option:selected')
        .should('have.text', 'Dark');
    });
  });
});

