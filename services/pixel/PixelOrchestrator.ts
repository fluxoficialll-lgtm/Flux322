
import { PixelEventData, PixelUserData, PixelConfig } from '../../types/pixel.types';
import { metaBrowserService } from './MetaBrowserService';
import { metaCapiService } from './MetaCapiService';
import { generateDeterministicEventId } from './logic/DeterministicId';
import { eventGuard } from './logic/EventGuard';
import { pixelPayloadBuilder } from './logic/PixelPayloadBuilder';
import { pixelPolicy } from './logic/PixelPolicy';

class PixelOrchestrator {
  private config: PixelConfig = {};

  init(config: PixelConfig) {
    this.config = config;
    if (config.metaId) {
      metaBrowserService.init(config.metaId);
    }
  }

  async track(eventName: string, data: PixelEventData = {}, userData: PixelUserData = {}) {
    const activePixelId = this.config.metaId;
    if (!activePixelId) return;

    const contentId = data.content_ids?.[0] || 'global';

    // 1. BLINDAGEM DE DISPARO ÚNICO (Singleton)
    if (!eventGuard.canTrack(eventName, activePixelId, contentId)) {
      return;
    }

    const enrichedUser = await pixelPayloadBuilder.buildUserData(userData);
    const enrichedEventData = pixelPayloadBuilder.buildEventData(eventName, data);

    const eventId = await generateDeterministicEventId(
      eventName, 
      enrichedUser.email || enrichedUser.fbp || 'anon', 
      contentId
    );

    const finalData = { ...enrichedEventData, event_id: eventId };

    // 2. ROTEAMENTO EXCLUSIVO (Canal Browser OU Canal CAPI)
    if (pixelPolicy.shouldRouteToBrowser(eventName)) {
      await metaBrowserService.track(eventName, finalData, enrichedUser);
      console.debug(`🌐 [Pixel] Evento ${eventName} enviado via Browser.`);
    } 
    else if (pixelPolicy.shouldRouteToCapi(eventName) && this.config.pixelToken) {
      await metaCapiService.track(activePixelId, this.config.pixelToken, eventName, eventId, finalData, enrichedUser);
      console.debug(`🚀 [Pixel] Evento ${eventName} enviado via CAPI.`);
    }

    // 3. REGISTRO DA TRAVA
    eventGuard.markAsTracked(eventName, activePixelId, contentId);
  }
}

export const pixelOrchestrator = new PixelOrchestrator();
