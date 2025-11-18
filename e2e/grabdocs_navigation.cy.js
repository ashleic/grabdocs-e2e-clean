
describe('GrabDocs navigation (robust)', () => {
  it('opens Features and Pricing pages from the homepage', () => {

    cy.visit('https://grabdocs.com/');

    cy.get('a[href*="/features"]', { timeout: 10000 })
      .should('be.visible')
      .should('have.attr', 'href')
      .then((href) => {
        const url = href.startsWith('http') ? href : `https://grabdocs.com${href}`;
        cy.visit(url);
      });

    cy.location('pathname', { timeout: 10000 }).should('match', /\/features\/?$/);
    cy.contains(/Features/i, { timeout: 10000 }).should('be.visible');

    cy.visit('https://grabdocs.com/');
    cy.location('pathname').should('eq', '/');

    cy.get('a[href*="/pricing"]', { timeout: 10000 })
      .should('be.visible')
      .should('have.attr', 'href')
      .then((href) => {
        const url = href.startsWith('http') ? href : `https://grabdocs.com${href}`;
        cy.visit(url);
      });

    cy.location('pathname', { timeout: 10000 }).should('match', /\/pricing\/?$/);
    cy.contains(/Free|Premium|Pricing/i, { timeout: 10000 }).should('be.visible');
  });
});
