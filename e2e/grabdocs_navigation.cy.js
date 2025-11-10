// cypress/e2e/grabdocs_navigation.cy.js
// Goal: prove the Features + Pricing links go to the right pages.

describe('GrabDocs navigation (stable)', () => {
  it('opens Features and Pricing from the homepage', () => {
    // 1) Open homepage
    cy.visit('https://grabdocs.com/');

    // 2) FEATURES: get the real link → read its href → visit it
    cy.get('a[href*="/features"]', { timeout: 10000 })
      .should('have.attr', 'href')
      .then((href) => {
        const url = href.startsWith('http') ? href : `https://grabdocs.com${href}`;
        cy.visit(url);
      });

    // 3) Confirm /features loaded
    cy.location('pathname', { timeout: 10000 }).should('include', '/features');

    // 4) Back to homepage
    cy.go('back');
    cy.location('pathname').should('eq', '/');

    // 5) PRICING: same pattern
    cy.get('a[href*="/pricing"]', { timeout: 10000 })
      .should('have.attr', 'href')
      .then((href) => {
        const url = href.startsWith('http') ? href : `https://grabdocs.com${href}`;
        cy.visit(url);
      });

    // 6) Confirm /pricing loaded and content is present
    cy.location('pathname', { timeout: 10000 }).should('include', '/pricing');
    cy.contains(/Free|Premium|Pricing/i, { timeout: 10000 }).should('be.visible');
  });
});

