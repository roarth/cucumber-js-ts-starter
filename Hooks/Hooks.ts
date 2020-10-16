import {After, AfterAll, Before, BeforeAll, Status} from 'cucumber';
import {loadConfig} from "../Shared";
import {getWorld} from "../Runtime";

BeforeAll(async function () {
  await loadConfig();
});

Before({ tags: '@ignore' }, async () => {
  return 'skipped';
});

Before(async function (scenario) {
  await this.initDriver(scenario);
});

AfterAll(async function () {});

After(async function (scenario) {

  const world = getWorld();

  if(scenario.result.status === Status.FAILED) {
    await world.takeScreenshot();
  }

  await this.destroyDriver();
});
