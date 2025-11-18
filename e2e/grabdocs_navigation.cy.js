// cypress/e2e/grabdocs_navigation.cy.js
describe('GrabDocs navigation (robust)', () => {
  it('opens Features and Pricing pages from the homepage', () => {
    // 1) Home
    cy.visit('https://grabdocs.com/');

    // 2) FEATURES: find the real anchor, grab its href, then visit it
    cy.get('a[href*="/features"]', { timeout: 10000 })
      .should('be.visible')
      .should('have.attr', 'href')
      .then((href) => {
        const url = href.startsWith('http') ? href : `https://grabdocs.com${href}`;
        cy.visit(url);
      });

    // 3) Assert we are on /features
    cy.location('pathname', { timeout: 10000 }).should('match', /\/features\/?$/);
    cy.contains(/Features/i, { timeout: 10000 }).should('be.visible');

    // 4) Return home (avoid flakiness from cy.go('back'))
    cy.visit('https://grabdocs.com/');
    cy.location('pathname').should('eq', '/');

    // 5) PRICING: same pattern
    cy.get('a[href*="/pricing"]', { timeout: 10000 })
      .should('be.visible')
      .should('have.attr', 'href')
      .then((href) => {
        const url = href.startsWith('http') ? href : `https://grabdocs.com${href}`;
        cy.visit(url);
      });

    // 6) Assert we are on /pricing and content rendered
    cy.location('pathname', { timeout: 10000 }).should('match', /\/pricing\/?$/);
    cy.contains(/Free|Premium|Pricing/i, { timeout: 10000 }).should('be.visible');
  });
});
