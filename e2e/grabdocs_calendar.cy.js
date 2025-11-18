// cypress/e2e/grabdocs_calendar.cy.js

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
 * Helper: perform login flow (no 2FA handling).
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
        .first()
        .clear()
        .type(EMAIL);

      cy.get('input[type="password"], input[name="password"]', { timeout: 20000 })
        .first()
        .clear()
        .type(PASS, { log: false });

      cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click();

      // Quick sanity check that we're no longer on a login URL
      cy.location('pathname', { timeout: 30000 })
        .should('not.match', /login|signin/i);
    }
  );
}

describe('GrabDocs Calendar', () => {
  it('opens the Calendar tab and creates a new event', () => {
    // Step 1: log in
    login();

    // Unique event title so we can assert on it
    const EVENT_TITLE = `Cypress Test Event ${Date.now()}`;

    // Step 2: interact on the app.grabdocs.com origin
    cy.origin(
      'https://app.grabdocs.com',
      { args: { EVENT_TITLE } },
      ({ EVENT_TITLE }) => {
        // Click the Calendar tab in the top nav
        cy.contains(/Calendar/i, { timeout: 20000 })
          .click({ force: true });

        // Verify we are on the calendar page
        cy.location('pathname', { timeout: 20000 })
          .should('include', 'calendar');

        // ---- Create a new calendar event ----

        // Click a "new event" style button
        cy.contains(/New Event|Create Event|Add Event|New Meeting/i, { timeout: 20000 })
          .click({ force: true });

        // Fill in the event title (try common title inputs)
        cy.get(
          'input[name="title"], input[placeholder*="Title"], input[placeholder*="Event name"], input[type="text"]',
          { timeout: 20000 }
        )
          .first()
          .clear()
          .type(EVENT_TITLE);

        // Click Save / Create / Done
        cy.contains(/Save|Create|Done/i, { timeout: 20000 })
          .click({ force: true });

        // Assert the event appears on the calendar
        cy.contains(EVENT_TITLE, { timeout: 30000 })
          .should('be.visible');
      }
    );
  });
});

