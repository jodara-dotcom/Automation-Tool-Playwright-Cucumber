Feature: Click on elements

  Scenario: User clicks an element
    Given the user navigates to "https://demoqa.com/dragabble"
    When the user clicks on element found by "id" "draggableExample-tab-axisRestriction"
    Then the element found by "id" "restrictedX" is visible