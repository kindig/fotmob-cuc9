Feature: Check Team standing information
  I want to make sure the games played, points and goal differential are calculated correctly

  @fotmob
  Scenario: Verify Points are correct
    Given User goes to https://fotmob.com
    When User selects the Premier League
    When User examines a team
      | Arsenal |
      | Brighton & Hove Albion |
      | Manchester United |
    Then the teams points are correct
    Then close the browser