
Cypress.on('uncaught:exception', (err) => {
  if (/postMessage|Cannot read properties of null/i.test(err.message)) {
    return false; 
  }
});

const EMAIL = Cypress.env('EMAIL') || 'YOUR_EMAIL_HERE';
const PASS  = Cypress.env('PASSWORD') || 'YOUR_PASSWORD_HERE';

function login() {
  cy.visit('https://grabdocs.com/');
  cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click({ force: true });

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

      cy.contains(/Two[- ]?Factor|Verify Code|Authenticator/i, { timeout: 10000 })
        .then(($twofa) => {
          if ($twofa.length) {
            // Enter 2FA code in the app, wait for the app to finish loading,
            // then hit ▶ Resume in Cypress
            cy.pause();
          }
        });

      cy.location('pathname', { timeout: 30000 })
        .should('not.match', /login|signin/i);
    }
  );
}

describe('GrabDocs authentication', () => {
  it('logs in successfully', () => {
    login();
  });
});
