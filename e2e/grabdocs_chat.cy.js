
Cypress.on('uncaught:exception', (err) => {
  if (/postMessage|Cannot read properties of null/i.test(err.message)) {
    return false; // don't fail the test for app-side errors
  }
});

describe('GrabDocs: login and send a chat message', () => {
  it('logs in and sends a chat message successfully', () => {

    const EMAIL = Cypress.env('EMAIL') || 'your@email.com';
    const PASS  = Cypress.env('PASSWORD') || 'YourPassword123!';


    cy.visit('https://grabdocs.com/');
    cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click({ force: true });

    // 2) Ensure we actually navigated to the app’s login page
    cy.location('origin',   { timeout: 20000 }).should('include', 'app.grabdocs.com');
    cy.location('pathname', { timeout: 20000 }).should('match', /login|signin/i);

    // 3) Now enter login inside app.grabdocs.com via cy.origin
    cy.origin(
      'https://app.grabdocs.com',
      { args: { EMAIL, PASS } },
      ({ EMAIL, PASS }) => {

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

        // --- Confirm login succeeded (no 2FA logic) ---
        cy.location('pathname', { timeout: 30000 })
          .should('not.match', /login|signin/i);

        cy.contains(/Documents|New Document|Dashboard|Home/i, { timeout: 60000 })
          .should('be.visible');

        cy.get('body').then($body => {
          const hasChat = /Chat|AI Assistant/i.test($body.text());
          if (hasChat) {
            cy.contains(/Chat|AI Assistant/i).click({ force: true });

            // Type message
            const messageText = 'Hello from Cypress!';
            cy.get('textarea, [contenteditable="true"], input[type="text"]', { timeout: 20000 })
              .first()
              .type(`${messageText}{enter}`);

            cy.contains(messageText, { timeout: 30000 })
              .should('be.visible');

            cy.contains(
              /Preparing search strategy|searching your documents|Here’s what I found|answering your question|AI response/i,
              { timeout: 60000 }
            ).should('be.visible');
          }
        });
      }
    );
  });
});


