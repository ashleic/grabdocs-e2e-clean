// cypress/e2e/load_speed.cy.js
// ----------------------------------------------------------
// Test Name: GrabDocs Load Speed
// Purpose: Measures how long it takes for the GrabDocs homepage
// to fully load and verifies that it loads within a reasonable time limit.
// ----------------------------------------------------------

describe('GrabDocs load speed', () => {

  it('loads the homepage quickly', () => {
    // Record the start time right before visiting the site.
    // This will help us calculate how long it takes to load.
    const startTime = Date.now();

    // Step 1: Visit the GrabDocs homepage.
    // Cypress automatically waits for the page to load.
    cy.visit('https://grabdocs.com/');

    // Step 2: Once the page finishes loading,
    // we capture the current time and calculate the duration.
    cy.window().then(() => {
      const endTime = Date.now();              // current timestamp
      const loadDuration = endTime - startTime; // time difference (in milliseconds)

      // Step 3: Log the duration in Cypress Test Runner.
      cy.log(`Page loaded in ${loadDuration} ms`);

      // Step 4: Assert that the load time is acceptable.
      // Here we set a limit of 5000 ms (5 seconds).
      // You can adjust this limit based on network speed or app performance goals.
      expect(loadDuration).to.be.lessThan(5000);
    });
  });

});
