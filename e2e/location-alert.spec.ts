// Location alerts smoke: the tier for the nearest fixture fire, following the user as they move, and denial (§12).
import { expect, test } from '@playwright/test';

import { registerFixtureRoutes } from './support/register-fixture-routes';

const NEAR_FIRE = { longitude: -123.85, latitude: 48.65 };
const TWENTY_KM_NORTH = { longitude: -123.88, latitude: 48.8 };

test('shows the nearest active fire, its distance and tier, and follows the user as they move', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation(NEAR_FIRE);
  await registerFixtureRoutes(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/Fires: 22/)).toBeVisible();

  await page.getByRole('button', { name: 'Location alerts' }).click();
  const urgent = page.getByRole('alert', { name: 'Location alert' });
  await expect(urgent).toContainText('Ready to leave');
  await expect(urgent).toContainText('V62369, 4.2 km from you');
  await expect(urgent).toContainText('Not an evacuation order');

  await context.setGeolocation(TWENTY_KM_NORTH);
  const watchful = page.getByRole('status', { name: 'Location alert' });
  await expect(watchful).toContainText('Prepare');
  await expect(watchful).toContainText('20.3 km from you');
});

test('explains that alerts need location when it is denied, and keeps the app working', async ({
  page,
}) => {
  await registerFixtureRoutes(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/Fires: 22/)).toBeVisible();

  await page.getByRole('button', { name: 'Location alerts' }).click();
  await expect(page.getByText(/Location alerts need your location/)).toBeVisible();
  await expect(page.getByRole('alert', { name: 'Location alert' })).toHaveCount(0);
  await expect(page.getByText('Ready', { exact: true })).toBeVisible();
});
