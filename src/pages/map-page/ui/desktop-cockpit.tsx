// The desktop and tablet cockpit: brand top left, search top centre, fires right, nav lower left (§4.1).
import { FirePanel } from '@/widgets/fire-panel';
import { FirePopup } from '@/widgets/fire-popup';
import { FlightHud, NavCluster, PwaControls } from '@/widgets/hud';
import { Joystick } from '@/widgets/joystick';
import { LocationAlertsButton } from '@/widgets/location-alert';
import type { MapStatus } from '@/widgets/map-view';
import { RouteBanner } from '@/widgets/route-banner';
import { SearchBar } from '@/widgets/search-bar';

import { CockpitBanners } from './cockpit-banners';

export type DesktopCockpitProps = { mapboxToken: string; mapStatus: MapStatus };

// Renders the widgets in a click-through overlay that reflows on narrow windows.
export function DesktopCockpit({ mapboxToken, mapStatus }: DesktopCockpitProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-2 p-2 sm:p-4">
      <div className="flex flex-wrap items-start gap-2">
        <div className="pointer-events-auto order-2 sm:order-1">
          <FlightHud
            isReducedDetail={mapStatus.isReducedDetail}
            isTileStalled={mapStatus.isTileStalled}
          />
        </div>
        <div className="pointer-events-auto order-1 flex w-full justify-center sm:order-2 sm:w-auto sm:flex-1">
          <SearchBar mapboxToken={mapboxToken} />
        </div>
        <div className="pointer-events-auto order-3 ml-auto flex justify-end gap-2 sm:w-80">
          <LocationAlertsButton />
          <PwaControls />
        </div>
      </div>
      <CockpitBanners />
      <div className="flex min-h-0 flex-1 justify-end">
        <div className="pointer-events-auto flex max-h-full w-full flex-col items-end gap-2 sm:w-80">
          <FirePanel />
          <FirePopup />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="pointer-events-auto sm:mb-5">
          <NavCluster mapboxToken={mapboxToken} />
        </div>
        <div className="pointer-events-auto flex flex-1 justify-center">
          <RouteBanner />
        </div>
        <div className="hidden sm:block sm:w-80" />
      </div>
      <div className="pointer-events-auto w-full">
        <Joystick />
      </div>
    </div>
  );
}
