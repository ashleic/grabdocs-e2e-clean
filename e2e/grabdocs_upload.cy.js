
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
      cy.location('origin',   { timeout: 20000 })
        .should('include', 'app.grabdocs.com');
      cy.location('pathname', { timeout: 20000 })
        .should('match', /login|signin/i);

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

      cy.location('pathname', { timeout: 30000 })
        .should('not.match', /login|signin/i);
    }
  );
}

describe('GrabDocs Upload', () => {
  it('uploads a test file from fixtures', () => {
    // Step 1: log in (no 2FA)
    login();
    cy.origin('https://app.grabdocs.com', () => {
      // Ensure the file input exists
      cy.get('input[type="file"]', { timeout: 20000 })
        .first()
        .should('exist');
      const fileName = 'test-upload.pdf';
      cy.get('input[type="file"]', { timeout: 20000 })
        .first()
        .selectFile(`cypress/fixtures/${fileName}`, { force: true });
      cy.contains('test-upload', { timeout: 30000 })
        .should('be.visible');
    });
  });
});
