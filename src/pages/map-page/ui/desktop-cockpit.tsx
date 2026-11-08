// Desktop and tablet cockpit: brand and location alert left, search top centre, fires right, nav lower left (§4.1).
import { FirePanel } from '@/widgets/fire-panel';
import { FirePopup } from '@/widgets/fire-popup';
import { FlightHud, NavCluster, OfflineBanner, PwaControls } from '@/widgets/hud';
import { Joystick } from '@/widgets/joystick';
import { LocationAlert, LocationAlertsButton } from '@/widgets/location-alert';
import type { MapStatus } from '@/widgets/map-view';
import { RouteBanner } from '@/widgets/route-banner';
import { SearchBar } from '@/widgets/search-bar';

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
      <div className="flex justify-center">
        <div className="pointer-events-auto">
          <OfflineBanner />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 sm:flex-row">
        <div className="pointer-events-auto max-h-full min-h-0 w-full overflow-y-auto empty:hidden sm:w-80 sm:self-start">
          <LocationAlert />
        </div>
        <div className="pointer-events-auto flex max-h-full min-h-0 w-full flex-1 flex-col items-end gap-2 sm:ml-auto sm:w-80 sm:flex-none">
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
