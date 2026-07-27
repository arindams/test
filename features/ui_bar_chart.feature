@ui
Feature: Personal Loan Bar Chart and Tooltip Validation

  Scenario: Verify Personal Loan schedule bar chart using standard fixture profile
    Given I launch the EMI calculator application
    When I switch to the Personal Loan section
    And I fill in personal loan parameters via slider using standard fixture profile
    Then The bar chart payment schedule should be visible
    And Hovering over chart bars should display active tooltip text