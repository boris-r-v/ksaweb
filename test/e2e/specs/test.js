// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'Ksaweb app rendered': function test(browser) {
    const devServer = browser.globals.devServerURL;

    browser
      .url(devServer)
      .waitForElementVisible('body', 5000)
      .pause(2000)
      .assert.elementPresent('.webix_view')
      .verify.title('Тестовое окружение KSAWEB')
      .end();
  },
};
