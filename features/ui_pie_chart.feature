@ui
Feature: Home Loan EMI and Pie Chart Validation

  Scenario Outline: Validate EMI calculation using fixture profile ""
    Given I launch the EMI calculator application
    When I navigate to the Home Loan section
    And I enter loan details using fixture key "<fixtureKey>"
    Then The calculated EMI should match the displayed EMI value
    And The pie chart should be visible and contain valid non-zero values

    Examples:
      | fixtureKey |
      | tier1      |
      | tier2      |