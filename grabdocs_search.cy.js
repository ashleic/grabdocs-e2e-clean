Cypress.on('uncaught:exception', () => false);

const EMAIL = Cypress.env('EMAIL');
const PASS  = Cypress.env('PASSWORD');

const DOC_QUERY  = 'Edgesource Employee Handbook';
const EXPECT_FTO  = /Flexible Time Off/i;

function login() {
  cy.visit('https://grabdocs.com/');
  cy.contains(/Log in|Sign in/i, { timeout: 20000 }).click({ force: true });

  cy.origin('https://app.grabdocs.com', { args: { EMAIL, PASS } }, ({ EMAIL, PASS }) => {
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

    cy.contains(/Home|Chat|Dashboard|Documents/i, { timeout: 60000 }).should('be.visible');
  });
}

describe('REQ 3 - Search/open a particular document (Edgesource Employee Handbook)', () => {
  it('Finds the handbook document, opens it, then asks a doc-specific question', () => {
    login();

    cy.origin(
      'https://app.grabdocs.com',
      { args: { DOC_QUERY, EXPECT_FTO } },
      ({ DOC_QUERY, EXPECT_FTO }) => {

        cy.contains(/Documents|Files|Library/i, { timeout: 30000 }).click({ force: true });

        cy.get('body', { timeout: 30000 }).then(($body) => {
          const $searchInputs = $body.find(
            'input[placeholder*="Search"], input[type="search"], input[aria-label*="Search"]'
          );

          if ($searchInputs.length) {
            cy.wrap($searchInputs.first())
              .should('be.visible')
              .clear()
              .type(DOC_QUERY);
