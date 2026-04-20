Feature: Initial POC - Basic form

  Scenario: Happy path basic form
    Given the user navigates to "https://demoqa.com/text-box"
    When the user types on element found by "placeholder" "Full Name" the text 'Testing the form'
    And the user types on element found by "id" "userEmail" the text "test@mail.com"
    And the user types on element found by "id" "currentAddress" the text 'Adding any current address'
    And the user types on element found by "id" "permanentAddress" the text 'Adding a testing permanent address'
    Then the element found by "placeholder" "Full Name" was successfully filled with the text 'Testing the form'
    And the element found by "id" "userEmail" was successfully filled with the text "test@mail.com"
    And the element found by "id" "currentAddress" was successfully filled with the text "Adding any current address"
    And the element found by "id" "permanentAddress" was successfully filled with the text "Adding a testing permanent address"
    And the user clicks on element found by "role" "button,Submit"
    Then the element found by "id" "name" is visible
    Then the element found by "id" "email" is visible
    Then the element found by "text" "Current Address :" is visible
    Then the element found by "text" "Permananet Address :" is visible