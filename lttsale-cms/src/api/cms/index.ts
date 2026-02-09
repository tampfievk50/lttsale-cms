import { categoriesClient } from './categories'
import { buildingsClient } from './buildings'
import { apartmentsClient } from './apartments'
import { productsClient } from './products'
import { customersClient } from './customers'
import { ordersClient } from './orders'
import { analyticsClient } from './analytics'

export const cmsApi = {
  categories: categoriesClient,
  buildings: buildingsClient,
  apartments: apartmentsClient,
  products: productsClient,
  customers: customersClient,
  orders: ordersClient,
  analytics: analyticsClient,
}
