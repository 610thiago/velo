// playwright/suporte/fixtures.ts
import { test as base } from '@playwright/test';
import { createOrderLookupActions } from './actions/orderLookupActions';
import { createVehicleConfiguratorActions } from './actions/configuratorActions';
import { createCheckoutActions } from './actions/checkoutActions';
import { mockCreditAnalysis } from './mock.api';

import { mockCreditAnalysis } from './mock.api'

type App = {
  orderLookup: ReturnType<typeof createOrderLookupActions>;
  configurator: ReturnType<typeof createVehicleConfiguratorActions>;
  checkout: ReturnType<typeof createCheckoutActions>;
  mock: {
    creditanalysis: (score: number) => Promise<void>;
  }
};

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      orderLookup: createOrderLookupActions(page),
      configurator: createVehicleConfiguratorActions(page),
      checkout: createCheckoutActions(page),
      mock: {
        creditanalysis: async (score: number) => await mockCreditAnalysis(page, score),
      },
    };
    await use(app);
  },
});

export { expect } from '@playwright/test';
