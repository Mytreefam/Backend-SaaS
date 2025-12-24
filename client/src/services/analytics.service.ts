import { Capacitor } from '@capacitor/core';

/**
 * Servicio de Analytics para tracking de eventos
 * Integración con Firebase Analytics (o cualquier otro proveedor)
 */

interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
}

class AnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;

  /**
   * Inicializar Analytics
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // TODO: Inicializar Firebase Analytics
      // await FirebaseAnalytics.initializeFirebase({...});
      
      this.isInitialized = true;
      console.log('[Analytics] Inicializado correctamente');
    } catch (error) {
      console.error('[Analytics] Error inicializando:', error);
    }
  }

  /**
   * Establecer el ID del usuario
   */
  async setUserId(userId: string) {
    this.userId = userId;

    if (!this.isInitialized) return;

    try {
      // TODO: Implementar con Firebase Analytics
      // await FirebaseAnalytics.setUserId({ userId });
      console.log('[Analytics] User ID establecido:', userId);
    } catch (error) {
      console.error('[Analytics] Error estableciendo user ID:', error);
    }
  }

  /**
   * Establecer propiedades del usuario
   */
  async setUserProperties(properties: Record<string, any>) {
    if (!this.isInitialized) return;

    try {
      // TODO: Implementar con Firebase Analytics
      // await FirebaseAnalytics.setUserProperty({ name, value });
      console.log('[Analytics] Propiedades de usuario:', properties);
    } catch (error) {
      console.error('[Analytics] Error estableciendo propiedades:', error);
    }
  }

  /**
   * Trackear evento
   */
  async logEvent(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      console.warn('[Analytics] No inicializado, evento no trackeado:', event);
      return;
    }

    try {
      // TODO: Implementar con Firebase Analytics
      // await FirebaseAnalytics.logEvent({ name: event.name, params: event.params });
      console.log('[Analytics] Evento trackeado:', event);
    } catch (error) {
      console.error('[Analytics] Error trackeando evento:', error);
    }
  }

  /**
   * Eventos predefinidos comunes
   */

  // Navegación
  async logScreenView(screenName: string, screenClass?: string) {
    await this.logEvent({
      name: 'screen_view',
      params: {
        screen_name: screenName,
        screen_class: screenClass || screenName,
      },
    });
  }

  // Autenticación
  async logLogin(method: string) {
    await this.logEvent({
      name: 'login',
      params: { method },
    });
  }

  async logSignUp(method: string) {
    await this.logEvent({
      name: 'sign_up',
      params: { method },
    });
  }

  // Comercio
  async logPurchase(transactionId: string, value: number, currency: string = 'EUR') {
    await this.logEvent({
      name: 'purchase',
      params: {
        transaction_id: transactionId,
        value,
        currency,
      },
    });
  }

  async logAddToCart(itemId: string, itemName: string, price: number) {
    await this.logEvent({
      name: 'add_to_cart',
      params: {
        item_id: itemId,
        item_name: itemName,
        price,
      },
    });
  }

  async logViewItem(itemId: string, itemName: string, category?: string) {
    await this.logEvent({
      name: 'view_item',
      params: {
        item_id: itemId,
        item_name: itemName,
        item_category: category,
      },
    });
  }

  // Compartir
  async logShare(contentType: string, itemId: string) {
    await this.logEvent({
      name: 'share',
      params: {
        content_type: contentType,
        item_id: itemId,
      },
    });
  }

  // Búsqueda
  async logSearch(searchTerm: string) {
    await this.logEvent({
      name: 'search',
      params: {
        search_term: searchTerm,
      },
    });
  }

  // Acciones de usuario
  async logButtonClick(buttonName: string, location: string) {
    await this.logEvent({
      name: 'button_click',
      params: {
        button_name: buttonName,
        location,
      },
    });
  }

  async logFeatureUsed(featureName: string, context?: string) {
    await this.logEvent({
      name: 'feature_used',
      params: {
        feature_name: featureName,
        context,
      },
    });
  }

  // Errores
  async logError(errorType: string, errorMessage: string, location: string) {
    await this.logEvent({
      name: 'error_occurred',
      params: {
        error_type: errorType,
        error_message: errorMessage,
        location,
      },
    });
  }

  // Performance
  async logPerformance(metric: string, value: number) {
    await this.logEvent({
      name: 'performance_metric',
      params: {
        metric_name: metric,
        value,
      },
    });
  }

  // Offline
  async logOfflineEvent(action: string) {
    await this.logEvent({
      name: 'offline_action',
      params: {
        action,
      },
    });
  }
}

// Singleton
export const analytics = new AnalyticsService();

// Hook para usar en componentes React
export const useAnalytics = () => {
  return {
    logScreenView: analytics.logScreenView.bind(analytics),
    logLogin: analytics.logLogin.bind(analytics),
    logSignUp: analytics.logSignUp.bind(analytics),
    logPurchase: analytics.logPurchase.bind(analytics),
    logAddToCart: analytics.logAddToCart.bind(analytics),
    logViewItem: analytics.logViewItem.bind(analytics),
    logShare: analytics.logShare.bind(analytics),
    logSearch: analytics.logSearch.bind(analytics),
    logButtonClick: analytics.logButtonClick.bind(analytics),
    logFeatureUsed: analytics.logFeatureUsed.bind(analytics),
    logError: analytics.logError.bind(analytics),
    logPerformance: analytics.logPerformance.bind(analytics),
    logOfflineEvent: analytics.logOfflineEvent.bind(analytics),
  };
};
