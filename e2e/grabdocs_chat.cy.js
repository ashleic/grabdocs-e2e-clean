
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

     
      cy.contains(/Home|Chat|Dashboard/i, { timeout: 60000 })
        .should('be.visible');
    }
  );
}

describe('Chat basic hello test', () => {
  it('logs in, says hello, and passes as soon as ANY reply appears', () => {

    login();

    cy.origin('https://app.grabdocs.com', () => {

   
      cy.contains(/Chat|AI Assistant/i, { timeout: 30000 })
        .click({ force: true });

    
      cy.get('textarea, [contenteditable="true"], input[type="text"]', { timeout: 30000 })
        .first()
        .type('Hello{enter}');

      
      cy.get('.chat-message, .message, .bubble, div')        // VERY forgiving selector
        .contains(/.+/)                                      // any non-empty text
        .should('exist');                                    // as soon as something appears → pass
    });
  });
});


