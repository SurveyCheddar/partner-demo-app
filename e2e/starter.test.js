describe('Example', () => {
  beforeAll(async () => {
    console.log("LAUNCHING APP")
    await device.launchApp();
    console.log("LAUNCHED APP")
  });

  beforeEach(async () => {
    console.log("RELOADING REACT NATIVE")
    await device.reloadReactNative();
    console.log("RELOADED REACT NATIVE")
  });

  // it('should have welcome screen', async () => {
  //   await expect(element(by.id('welcome'))).toBeVisible();
  // });

  // it('should show hello screen after tap', async () => {
  //   await element(by.id('hello_button')).tap();
  //   await expect(element(by.text('Hello!!!'))).toBeVisible();
  // });

  // it('should show world screen after tap', async () => {
  //   await element(by.id('world_button')).tap();
  //   await expect(element(by.text('World!!!'))).toBeVisible();
  // });

  it('take a screenshot', async () => {
    await device.takeScreenshot('main-screen');
  });
});
