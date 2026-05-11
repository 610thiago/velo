import { test as base } from '@playwright/test'
import { createOrderLookupActions } from './actions/orderLockupActions'
import { createVehicleConfiguratorActions } from './actions/configuratorActions'

type App = {
  orderLockup: ReturnType<typeof createOrderLookupActions>
  vehicleConfigurator: ReturnType<typeof createVehicleConfiguratorActions>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      orderLockup: createOrderLookupActions(page),
      vehicleConfigurator: createVehicleConfiguratorActions(page),
    }
    await use(app)
  },
})

export { expect } from '@playwright/test'
