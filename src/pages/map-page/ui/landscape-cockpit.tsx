// Phone landscape cockpit: brand, search and fires on top; one bottom bar of sticks and instruments (§4.2).
import { useState } from 'react';

import { selectSelectedFireNumber } from '@/entities/fire';
import { useAppSelector } from '@/shared/lib/redux';
import { cn } from '@/shared/ui';
import { FirePanel } from '@/widgets/fire-panel';
import { FirePopup } from '@/widgets/fire-popup';
import { FlightHud, NavCluster, PwaControls } from '@/widgets/hud';
import { Joystick } from '@/widgets/joystick';
import { LocationAlertsButton } from '@/widgets/location-alert';
import type { CameraPadding, MapStatus } from '@/widgets/map-view';
import { RouteBanner } from '@/widgets/route-banner';
import { SearchBar } from '@/widgets/search-bar';

import { useFlightAreaPadding } from '../model/use-flight-area-padding';
import { CockpitBanners } from './cockpit-banners';

export type LandscapeCockpitProps = {
  mapboxToken: string;
  mapStatus: MapStatus;
  onCameraPaddingChange: (padding: CameraPadding) => void;
};

// Renders a grid whose fire column is full height only while the list or a fire is open, else just its header.
export function LandscapeCockpit(props: LandscapeCockpitProps) {
  const { mapboxToken, mapStatus, onCameraPaddingChange } = props;
  const [isFirePanelOpen, setIsFirePanelOpen] = useState(false);
  const { overlayRef, topRowRef, bottomBarRef } = useFlightAreaPadding(onCameraPaddingChange);
  const isFireSelected = useAppSelector(selectSelectedFireNumber) !== null;
  const isFireColumnTall = isFirePanelOpen || isFireSelected;
  return (
    <div
      ref={overlayRef}
      className="pointer-events-none absolute inset-0 z-10 grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)] gap-2 pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(0.5rem,env(safe-area-inset-right))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))]"
    >
      <div ref={topRowRef} className="col-[1/2] row-[1/2] flex items-start gap-2">
        <div className="pointer-events-auto shrink-0">
          <FlightHud
            isCompact
            isReducedDetail={mapStatus.isReducedDetail}
            isTileStalled={mapStatus.isTileStalled}
          />
        </div>
        <div className="pointer-events-auto flex min-w-0 flex-1 justify-center">
          <SearchBar mapboxToken={mapboxToken} />
        </div>
        <div className="pointer-events-auto flex shrink-0 gap-2">
          <LocationAlertsButton isCompact />
          <PwaControls isCompact />
        </div>
      </div>
      <div
        className={cn(
          'pointer-events-auto col-[2/3] flex min-h-0 flex-col gap-2',
          isFireColumnTall ? 'row-[1/3] w-64' : 'row-[1/2]',
        )}
      >
        <FirePanel isCompact isOpenByDefault={false} onOpenChange={setIsFirePanelOpen} />
        <FirePopup isCompact />
      </div>
      <div
        className={cn(
          'row-[2/3] flex min-h-0 flex-col gap-2',
          isFireColumnTall ? 'col-[1/2]' : 'col-[1/3]',
        )}
      >
        <CockpitBanners isCompact />
        <div className="flex min-h-0 flex-1 items-end justify-center">
          <div className="pointer-events-auto min-w-0">
            <RouteBanner />
          </div>
        </div>
        <Joystick isCompact>
          <div ref={bottomBarRef} className="w-full min-w-0">
            <NavCluster mapboxToken={mapboxToken} variant="compact" />
          </div>
        </Joystick>
      </div>
    </div>
  );
}
