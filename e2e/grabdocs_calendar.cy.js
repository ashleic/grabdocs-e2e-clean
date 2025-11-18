
Cypress.on('uncaught:exception', (err) => {
  if (/postMessage|Cannot read properties of null/i.test(err.message)) {
    return false; // don't fail the test for app-side errors
  }
});

const EMAIL = Cypress.env('EMAIL') || 'YOUR_EMAIL_HERE';
const PASS  = Cypress.env('PASSWORD') || 'YOUR_PASSWORD_HERE';
function login() {
  // Land on the marketing site
  cy.visit('https://grabdocs.com/');

  cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click({ force: true });

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

      cy.location('pathname', { timeout: 30000 })
        .should('not.match', /login|signin/i);
    }
  );
}

describe('GrabDocs Calendar', () => {
  it('opens the Calendar tab and creates a new event', () => {
    // Step 1: log in
    login();

    const EVENT_TITLE = `Cypress Test Event ${Date.now()}`;
    cy.origin(
      'https://app.grabdocs.com',
      { args: { EVENT_TITLE } },
      ({ EVENT_TITLE }) => {
        cy.contains(/Calendar/i, { timeout: 20000 })
          .click({ force: true });
        cy.location('pathname', { timeout: 20000 })
          .should('include', 'calendar');

        cy.contains(/New Event|Create Event|Add Event|New Meeting/i, { timeout: 20000 })
          .click({ force: true });
        cy.get(
          'input[name="title"], input[placeholder*="Title"], input[placeholder*="Event name"], input[type="text"]',
          { timeout: 20000 }
        )
          .first()
          .clear()
          .type(EVENT_TITLE);
        cy.contains(/Save|Create|Done/i, { timeout: 20000 })
          .click({ force: true });
        cy.contains(EVENT_TITLE, { timeout: 30000 })
          .should('be.visible');
      }
    );
  });
});

