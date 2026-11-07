// The only page: the full-screen map with the cockpit for this device and orientation on top (§4.1, §4.2).
import { useReducer, useState } from 'react';

import { useUserLocationTracking } from '@/features/track-user-location';
import { useViewportLayout } from '@/shared/lib/browser';
import {
  type CameraPadding,
  INITIAL_MAP_STATUS,
  MapView,
  mergeMapStatus,
} from '@/widgets/map-view';

import { useEscapeShortcut } from '../model/use-escape-shortcut';
import { useReloadOnAuthFailure } from '../model/use-reload-on-auth-failure';
import { DesktopCockpit } from './desktop-cockpit';
import { LandscapeCockpit } from './landscape-cockpit';
import { PortraitCockpit } from './portrait-cockpit';

export type MapPageProps = { mapboxToken: string; isDevBuild: boolean };

const NO_CAMERA_PADDING: CameraPadding = { topPx: 0, bottomPx: 0 };

// Renders the map once, a vignette and the layout's cockpit; owns the location watch so rotation keeps it (§12).
export function MapPage({ mapboxToken, isDevBuild }: MapPageProps) {
  const [mapStatus, patchMapStatus] = useReducer(mergeMapStatus, INITIAL_MAP_STATUS);
  const [isRotateNoticeDismissed, setIsRotateNoticeDismissed] = useState(false);
  const [landscapePadding, setLandscapePadding] = useState(NO_CAMERA_PADDING);
  const layout = useViewportLayout();
  useEscapeShortcut();
  useUserLocationTracking();
  useReloadOnAuthFailure(mapStatus.isAuthFailed);
  return (
    <main className="relative h-dvh w-full overflow-hidden" aria-label="FireflyBC map">
      <MapView
        mapboxToken={mapboxToken}
        isDevBuild={isDevBuild}
        status={mapStatus}
        onStatusPatch={patchMapStatus}
        cameraPadding={layout === 'mobile-landscape' ? landscapePadding : NO_CAMERA_PADDING}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(0_0_0/0.35))]"
      />
      {layout === 'desktop' ? (
        <DesktopCockpit mapboxToken={mapboxToken} mapStatus={mapStatus} />
      ) : null}
      {layout === 'mobile-landscape' ? (
        <LandscapeCockpit
          mapboxToken={mapboxToken}
          mapStatus={mapStatus}
          onCameraPaddingChange={setLandscapePadding}
        />
      ) : null}
      {layout === 'mobile-portrait' ? (
        <PortraitCockpit
          mapboxToken={mapboxToken}
          mapStatus={mapStatus}
          isRotateNoticeShown={!isRotateNoticeDismissed}
          onDismissRotateNotice={() => {
            setIsRotateNoticeDismissed(true);
          }}
        />
      ) : null}
    </main>
  );
}
