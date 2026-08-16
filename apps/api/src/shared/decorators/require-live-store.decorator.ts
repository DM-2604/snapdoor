import { SetMetadata } from '@nestjs/common';

export const REQUIRE_LIVE_STORE_KEY = 'require_live_store';
export const RequireLiveStore = () => SetMetadata(REQUIRE_LIVE_STORE_KEY, true);
