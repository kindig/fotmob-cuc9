// Test for

const {Given, When, Then, setDefaultTimeout} = require('@cucumber/cucumber');
setDefaultTimeout(30 * 1000);
const assert = require('assert');
let { webDriver, Builder, By, until} = require('selenium-webdriver');
// const chrome = require('selenium-webdriver/chrome');
// const chromedriver = require('chromedriver');
// const messages = require("@cucumber/messages");
// const isAbove  = require("chai").assert;

let points_match = false;
let teams_match = false;
let played_match = false;
let goal_diff_matches = false;
let league_name = null;
let match_day_option = null;
let match_day_number = "";

async function closeBrowser(ex){
    console.log(ex);
    await webDriver.quit();
}

async function click_hidden_element(element) {
    await webDriver.executeScript("arguments[0].click()", element);
    webDriver.wait(function () {
        return webDriver.executeScript('return document.readyState').then(function (readyState) {
            console.log("ReadyState === complete");
            return readyState === "complete";
        });
    });
}

Given(/^User goes to https:\/\/fotmob\.com$/, async function () {
    webDriver = new Builder().forBrowser("chrome").build();
    try {
        // Go to the fotmob.com website

        await webDriver.get("https://fotmob.com");
        await webDriver.manage().window().maximize();

    } catch (ex) {
       await closeBrowser(ex);
    }
});

When('User selects the Premier League', async function () {
    try {

        let pl_link_path = "/leagues/47/overview/premier-league";
        let pl_xpath = "//a[@href='" + pl_link_path + "']";
        let xpath = By.xpath(pl_xpath);
        let linkElement = await webDriver.findElement(xpath);

        // Received Unable to click on element at (460, 316) hijinx
        await click_hidden_element(linkElement);

        //*[@id="__next"]/main/section/section/div/section/section/div/div/h3
        let prem_title = "//*[@id='__next']/main/section/div/section/header/span[2]";
        await webDriver.wait(until.elementLocated(By.xpath(prem_title)), 10000);
        let prem_element = webDriver.findElement(By.xpath(prem_title));
        let pl_name = await prem_element.getAttribute("innerHTML");
        assert.deepEqual("Premier League", pl_name);

    } catch (ex) {
        await closeBrowser(ex);
    }
    console.log("Loaded the Premier League Table");
});

When('User selects a league', async function (leagueTable) {

    let league_list  = leagueTable.raw();

    try {

        for (let ii in league_list) {
            league_name = league_list[ii].toString().toLowerCase();
            let league_link = "/leagues/54/overview/" + league_name;

            let league_xpath = "//a[@href='" + league_link + "']";

            let xpath = By.xpath(league_xpath);
            let linkElement = await webDriver.findElement(xpath);

            // Received Unable to click on element at (460, 316) hijinx
            await click_hidden_element(linkElement);

            let league_title = "//*[@id='__next']/main/section/div/section/header/span[2]";
            await webDriver.wait(until.elementLocated(By.xpath(league_title)), 10000);
            let league_element = webDriver.findElement(By.xpath(league_title));
            let league_innerhtml = await league_element.getAttribute("innerHTML");
            assert.deepEqual(league_name, league_innerhtml.toLowerCase());
        }
    } catch (ex) {
        await closeBrowser(ex);
    }
    console.log("Loaded the Premier League Table");
});

When('User Clicks on Matches', async function () {

    try {
        let match_link = "/leagues/54/matches/" + league_name;
        let match_xpath = "//a[@href='" + match_link + "']";
        let xpath = By.xpath(match_xpath);
        let linkElement = await webDriver.findElement(xpath);
        await click_hidden_element(linkElement);
    } catch (ex) {
        await closeBrowser(ex);
    }

});

When('User Clicks on By Round', async function () {
    try {
        // This avoids searching each div...
        let xpath_str = "//button[contains(text(), 'by round')]"
        await webDriver.wait(until.elementLocated(By.xpath(xpath_str)), 10000);
        let by_round = await webDriver.findElement(By.xpath(xpath_str));

        await click_hidden_element(by_round);

        let round_select_xpath = "//select";
        await webDriver.wait(until.elementLocated(By.xpath(round_select_xpath)), 10000);

    } catch (ex) {
        await closeBrowser(ex);
    }
});

When('User Clicks on the Round dropdown for round', async function (dataTable) {
    try {
        let round_select_xpath = By.xpath("//select");
        let round_element = await webDriver.findElement(round_select_xpath);
        await click_hidden_element(round_element);

        match_day_number = dataTable.raw()[0][0];
        //  //*[@id="__next"]/main/section/div[2]/section/div/div[1]/div/select/option[25]
        let option_xpath = By.xpath("//option[" + match_day_number + "]");
        await webDriver.wait(until.elementLocated(option_xpath), 10000);
        match_day_option = await round_element.findElement(option_xpath);
        await match_day_option.click();
    } catch (ex) {
        await closeBrowser(ex);
    }
});

Then('Report the schedule', async function () {
    await match_day_option.click();
    let di_xpath = By.xpath("//div[@data-index=" + (parseInt(match_day_number) - 1).toString() + "]");
    await webDriver.wait(until.elementLocated(di_xpath), 10000);
    let match_day_div_element = await match_day_option.findElement(di_xpath);
    let match_day_header = await match_day_div_element.findElements(By.xpath(".//h3"));

    let games = null;

    for (let ii in match_day_header) {
        let day = await (match_day_header[ii]).getAttribute("innerHTML");
        let games_divs = By.xpath(".//following-sibling::div");
        games = await (match_day_header[ii]).findElements(games_divs);
        console.log("");
        console.log("Found " + games.length + " matches on" + day);
        for (let jj in games){

            let blah = await (games[jj]);
            let team1_ele = await blah.findElement(By.xpath(".//a/span/span"));
            let team2_ele = await blah.findElement(By.xpath(".//a/span/span[2]"));
            let time_ele = await blah.findElement(By.xpath(".//a/span/div/span"));
            let team1 = await team1_ele.getAttribute("innerHTML");
            let team2 = await team2_ele.getAttribute("innerHTML");
            let time = await time_ele.getAttribute("innerHTML");
            console.log(day + ": " + time + " -> " + team1 + " - " + team2);

        }
    }



    assert.great

});

When('User examines a team', async function(dataTable) {

    let team_list  = dataTable.raw();

    // let team_list = ['Arsenal'];

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let points = 0;
    let plus = 0;
    let minus = 0;
    let goal_diff = 0;
    let played = 0;

    try {
        await webDriver.wait(until.elementLocated(By.css(".Table")), 10000);
        let standings_table = await webDriver.findElement(By.css(".Table"));

        // Wins, Draws, Losses, Points, Games Played, Goals For - Goals Against, Goal Differential
        const headers = await standings_table.findElements(By.xpath(".//th"));

        for (let ii in team_list) {
            let test_team = team_list[ii].toString();
            let xpath = By.xpath("//*[text()[contains(., '" + test_team + "')]]");
            let the_team = await standings_table.findElement(xpath);
            let team_name_el = await the_team.findElement(By.xpath("//*/parent::tr/td/.."));
            let values = await team_name_el.findElements(By.xpath(".//td"));

            let team_name = await the_team.getAttribute("innerHTML");
            team_name.replace(/&amp;/g,"&");

            for (let ii in headers) {
                let stupidJSWEThing = headers[ii];

                let head = await stupidJSWEThing.getAttribute("innerHTML");
                let stupidJSVal = values[ii];
                let value = await stupidJSVal.getAttribute("innerHTML");
                switch(head) {
                    case "W":
                        wins = parseInt(value);
                        break;
                    case "D":
                        draws = parseInt(value);
                        break;
                    case "L":
                        losses = parseInt(value);
                        break;
                    case "PTS":
                        points = parseInt(value);
                        break;
                    case "+/-":
                        let expected = value.split("-");
                        plus = parseInt(expected[0]);
                        minus = parseInt(expected[1]);
                        break;
                    case "GD":
                        goal_diff = parseInt(value);
                        break;
                    case "PL":
                        played = parseInt(value);
                        break;
                }
            }

            if (plus - minus === goal_diff) {
                goal_diff_matches = true;
            }
            if (3 * wins + draws === points) {
                points_match = true;
            }
            if(wins + draws + losses === played){
                played_match = true;
            }
            if(team_name.localeCompare(test_team)){
                teams_match = true;
            }
        }

    } catch (ex) {
        await closeBrowser();
    }
});

Then('the teams points are correct', function() {

    assert(points_match);
    assert(played_match);
    assert(teams_match);
    assert(goal_diff_matches);
});

Then('close the browser', function() {
    console.log("Closing the Browser");
    webDriver.close();
});
