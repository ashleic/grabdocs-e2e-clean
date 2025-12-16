Cypress.on('uncaught:exception', () => false);

const EMAIL = Cypress.env('EMAIL');
const PASS  = Cypress.env('PASSWORD');

function login() {
  cy.visit('https://grabdocs.com/');
  cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click({ force: true });

  cy.origin(
    'https://app.grabdocs.com',
    { args: { EMAIL, PASS } },
    ({ EMAIL, PASS }) => {

      cy.get(
        'input[type="email"], input[name="email"], input[type="text"], input[name="username"]',
        { timeout: 30000 }
      )
        .first()
        .clear()
        .type(EMAIL);

      cy.get('input[type="password"], input[name="password"]', { timeout: 30000 })
        .first()
        .clear()
        .type(PASS, { log: false });

      cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click();

      cy.get('body', { timeout: 30000 }).then(($body) => {
        if (/two[-\s]?factor|verification|authenticator|enter code|otp/i.test($body.text())) {
          cy.log('2FA detected. Complete verification, then click Resume.');
          cy.pause();
        }
      });

      cy.contains(/Chat|Dashboard|Home/i, { timeout: 60000 }).should('be.visible');
    }
  );
}

describe('REQ – Verify chat appears in Chat History', () => {
  it('asks a question and confirms it appears in history', () => {

    login();

    const MESSAGE = `benefits-check-${Date.now()}`;

    cy.origin(
      'https://app.grabdocs.com',
      { args: { MESSAGE } },
      ({ MESSAGE }) => {

        cy.get('textarea', { timeout: 60000 })
          .should('be.visible')
          .and('not.be.disabled');

        cy.get('textarea')
          .first()
          .click()
          .type(`What benefits are available to employees? ${MESSAGE}{enter}`);

        cy.contains(/benefits/i, { timeout: 90000 }).should('exist');

        cy.get('[title="Show History"], [aria-label="Show History"]', { timeout: 30000 })
          .first()
          .click({ force: true });

        cy.contains(/Chat History/i, { timeout: 30000 })
          .should('be.visible');

        cy.contains(new RegExp(MESSAGE, 'i'), { timeout: 30000 })
          .should('be.visible');
      }
    );
  });
});
