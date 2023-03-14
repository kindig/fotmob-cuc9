Feature: Verify Schedule
  Select the Bundesliga and show the schedule for a given round

  @fotmob
  Scenario: Show Matches for a given round
    Given User goes to https://fotmob.com
    When User selects a league
      | Bundesliga |
    When User Clicks on Matches
    When User Clicks on By Round
    When User Clicks on the Round dropdown for round
      | 27 |
    Then Report the schedule
    Then close the browser