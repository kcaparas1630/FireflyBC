// Phone banner stack at the top of the flight area: offline notice centred, location alert on the left (§4.2, §12).
import { OfflineBanner } from '@/widgets/hud';
import { LocationAlert } from '@/widgets/location-alert';

export type CockpitBannersProps = { isCompact?: boolean };

// Renders both banners; empty it takes no space, and when too tall it scrolls so the controls stay on screen.
export function CockpitBanners({ isCompact = false }: CockpitBannersProps) {
  return (
    <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
      <div className="pointer-events-auto self-center empty:hidden">
        <OfflineBanner />
      </div>
      <div className="pointer-events-auto w-full max-w-sm self-start empty:hidden">
        <LocationAlert isCompact={isCompact} />
      </div>
    </div>
  );
}
