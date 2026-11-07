// Phone portrait cockpit: every widget collapsed, with the rotate notice at the centre until dismissed (§4.2).
import { FirePanel } from '@/widgets/fire-panel';
import { FirePopup } from '@/widgets/fire-popup';
import { FlightHud, NavCluster, PwaControls } from '@/widgets/hud';
import { Joystick } from '@/widgets/joystick';
import { LocationAlertsButton } from '@/widgets/location-alert';
import type { MapStatus } from '@/widgets/map-view';
import { RouteBanner } from '@/widgets/route-banner';
import { SearchBar } from '@/widgets/search-bar';

import { CockpitBanners } from './cockpit-banners';
import { RotateDeviceNotice } from './rotate-device-notice';

export type PortraitCockpitProps = {
  mapboxToken: string;
  mapStatus: MapStatus;
  isRotateNoticeShown: boolean;
  onDismissRotateNotice: () => void;
};

// Renders the collapsed widgets in a click-through overlay and the notice above them.
export function PortraitCockpit({
  mapboxToken,
  mapStatus,
  isRotateNoticeShown,
  onDismissRotateNotice,
}: PortraitCockpitProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-2 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-start gap-2">
        <div className="pointer-events-auto shrink-0">
          <FlightHud
            isCompact
            isReducedDetail={mapStatus.isReducedDetail}
            isTileStalled={mapStatus.isTileStalled}
          />
        </div>
        <div className="flex min-w-0 flex-1 justify-end gap-2">
          <div className="pointer-events-auto flex min-w-0 flex-1 justify-end">
            <SearchBar mapboxToken={mapboxToken} isCollapsible />
          </div>
          <div className="pointer-events-auto flex shrink-0 gap-2">
            <LocationAlertsButton isCompact />
            <PwaControls isCompact />
          </div>
        </div>
      </div>
      <CockpitBanners isCompact />
      <div className="flex min-h-0 flex-1 flex-col items-end">
        <div className="pointer-events-auto flex max-h-full min-h-0 w-full max-w-xs flex-col gap-2">
          <FirePanel isCompact isOpenByDefault={false} />
          <FirePopup isCompact />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <div className="pointer-events-auto shrink-0">
          <NavCluster mapboxToken={mapboxToken} variant="compass" />
        </div>
        <div className="pointer-events-auto flex min-w-0 flex-1 justify-center">
          <RouteBanner />
        </div>
      </div>
      <Joystick />
      {isRotateNoticeShown ? (
        <div className="absolute inset-0 grid place-items-center p-4">
          <div className="pointer-events-auto">
            <RotateDeviceNotice onDismiss={onDismissRotateNotice} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
