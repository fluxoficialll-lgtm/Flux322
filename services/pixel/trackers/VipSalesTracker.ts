
import { pixelOrchestrator } from '../PixelOrchestrator';
import { Group } from '../../../types';
import { authService } from '../../authService';

/**
 * VipSalesTracker: Orquestra o rastreio específico da página de vendas VIP.
 */
export const vipSalesTracker = {
  
  /**
   * Verifica se o usuário atual é o dono do grupo para bloquear o tracking.
   */
  isOwner(group: Group): boolean {
    const user = authService.getCurrentUser();
    if (!user) return false;
    return group.creatorId === user.id || group.creatorEmail === user.email;
  },

  /**
   * Rastreia entrada na Landing Page (ViewContent)
   */
  trackLanding: (group: Group) => {
    if (vipSalesTracker.isOwner(group)) return;

    pixelOrchestrator.init({
      metaId: group.pixelId,
      pixelToken: group.pixelToken
    });

    pixelOrchestrator.track('ViewContent', {
      content_name: group.name,
      content_ids: [group.id],
      content_type: 'product_group',
      value: parseFloat(group.price || '0'),
      currency: group.currency || 'BRL'
    });
  },

  /**
   * Rastreia captura de e-mail (Lead)
   */
  trackLead: (group: Group, email: string) => {
    if (vipSalesTracker.isOwner(group)) return;

    pixelOrchestrator.track('Lead', {
      content_name: group.name,
      content_ids: [group.id],
      content_type: 'product_group'
    }, { email });
  },

  /**
   * Rastreia intenção de compra
   */
  trackCheckoutIntent: (group: Group) => {
    if (vipSalesTracker.isOwner(group)) return;

    pixelOrchestrator.track('InitiateCheckout', {
      content_name: group.name,
      content_ids: [group.id],
      value: parseFloat(group.price || '0'),
      currency: group.currency || 'BRL'
    });
  },

  trackAddPaymentInfo: (group: Group, method: string, conversion?: any) => {
    if (vipSalesTracker.isOwner(group)) return;
    pixelOrchestrator.track('AddPaymentInfo', {
      content_name: group.name,
      content_ids: [group.id],
      value: conversion?.amount || parseFloat(group.price || '0'),
      currency: conversion?.currency || group.currency || 'BRL',
      payment_method: method
    });
  },

  trackTimeStay60s: (group: Group) => {
    if (vipSalesTracker.isOwner(group)) return;
    pixelOrchestrator.track('TimeStay60s', {
      content_name: group.name,
      content_ids: [group.id],
      content_type: 'product_group'
    });
  }
};
