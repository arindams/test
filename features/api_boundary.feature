@api
Feature: API Boundary and Invalid Payload Validation

  Scenario Outline: Send boundary POST requests to posts endpoint
    Given The API service is reachable
    When I send a POST request with payload type "<testCase>"
    Then The response status code should be acceptable without internal server errors and response should have for request payload "<testCase>"

    Examples:
      | testCase                   |
      | Excessively Long Title     |
      | Special Characters Title   |
      | Missing Required Fields    |