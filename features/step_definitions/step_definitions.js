// Test for

const {Given, When, Then, setDefaultTimeout} = require('@cucumber/cucumber');
setDefaultTimeout(30 * 1000);
const assert = require('assert');
let { webDriver, Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
// const firefox = require('selenium-webdriver/firefox');
// const firefoxdriver = require('geckodriver');

let points_match = false;
let teams_match = false;
let played_match = false;
let goal_diff_matches = false;

async function closeBrowser(ex){
    console.log(ex);
    // await webDriver.quit();
}

Given(/^User goes to https:\/\/fotmob\.com$/, async function () {
    webDriver = new Builder().forBrowser("chrome").build();
    try {
        // Go to the fotmob.com website

        await webDriver.get("https://fotmob.com");
        await webDriver.manage().window().maximize();
        const title = await webDriver.wait(until.elementLocated(By.xpath("/html/head/title")));

        // // Handle the login as google popup by simply closing it.
        // try {
        //     let google_xpath = By.xpath("//*[@id='credential_picker_container']");
        //     let google_id = webDriver.findElement(google_xpath);
        //     let google_iframe = google_id.findElement(By.css("iframe[title='Sign in with Google Dialog']"));
        //     let googleFrame = webDriver.switchTo().frame(google_iframe);
        //     let google_x = webDriver.findElement(By.xpath("/html/body/div/div/div/div/div/following-sibling::div")).click();
        //     // Switch to the fotmob main frame
        //     let parentFrame = webDriver.switchTo().parentFrame();
        //
        // } catch (ex) {
        //     console.log("No frame found")
        // }

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
        await webDriver.executeScript("arguments[0].click()", linkElement);
        webDriver.wait(function(){
            return webDriver.executeScript('return document.readyState').then(function(readyState) {
                console.log("ReadyState === complete");
                return readyState === "complete";
        });});

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

            let n_headers = headers.length;
//                if (n_headers != values.size()) {
//                    // Throw I guess
//                }

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
                        let temp = value;
                        let expected = temp.split("-");
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
