
describe('GrabDocs load speed', () => {

  it('loads the homepage quickly', () => {

    const startTime = Date.now();

    cy.visit('https://grabdocs.com/');

    cy.window().then(() => {
      const endTime = Date.now();              
      const loadDuration = endTime - startTime; 
  
      cy.log(`Page loaded in ${loadDuration} ms`);


      expect(loadDuration).to.be.lessThan(5000);
    });
  });

});
