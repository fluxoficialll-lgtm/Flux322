
import { PixelEventName } from '../../../types/pixel.types';

/**
 * Eventos que devem ocorrer apenas UMA vez por contexto (usuário/produto)
 */
export const SINGLETON_EVENTS: PixelEventName[] = [
  'Lead',
  'CompleteRegistration',
  'Purchase',
  'InitiateCheckout',
  'AddPaymentInfo',
  'ViewContent'
];

/**
 * Roteamento Exclusivo: Garante que NENHUM evento seja duplicado entre canais.
 */
const BROWSER_ROUTING: PixelEventName[] = [
  'PageView',
  'ViewContent',
  'TimeStay30s',
  'TimeStay60s',
  'GalleryInteraction',
  'GalleryZoom'
];

const CAPI_ROUTING: PixelEventName[] = [
  'Lead',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase'
];

export const pixelPolicy = {
  isSingleton: (eventName: string): boolean => {
    return SINGLETON_EVENTS.includes(eventName as PixelEventName);
  },

  shouldRouteToBrowser: (eventName: string): boolean => {
    return BROWSER_ROUTING.includes(eventName as PixelEventName);
  },

  shouldRouteToCapi: (eventName: string): boolean => {
    return CAPI_ROUTING.includes(eventName as PixelEventName);
  },

  /**
   * Define se o evento precisa de contexto de produto (ID do Grupo) para a trava de singleton.
   */
  requiresContentContext: (eventName: string): boolean => {
    return ['Lead', 'ViewContent', 'InitiateCheckout', 'Purchase', 'AddPaymentInfo'].includes(eventName);
  }
};
