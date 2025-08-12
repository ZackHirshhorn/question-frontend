import type { UITemplate } from '../types/template';

/**
 * UI ID generator used only on the client to provide stable identity for
 * React list keys and expansion state. These IDs are session-local and are
 * NOT persisted or sent to the server.
 */
export function genUiId() {
  return `ui_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Converts a server template payload (no UI IDs) into a UI shape augmented
 * with generated IDs so components can use stable keys and preserve open/close
 * state across rename or other non-destructive updates.
 */
export function withIds(server: any): UITemplate {
  return {
    name: server?.name,
    categories: (server?.categories || []).map((cat: any) => ({
      id: genUiId(),
      name: cat?.name,
      questions: cat?.questions || [],
      subCategories: (cat?.subCategories || []).map((sc: any) => ({
        id: genUiId(),
        name: sc?.name,
        questions: sc?.questions || [],
        topics: (sc?.topics || []).map((tp: any) => ({
          id: genUiId(),
          name: tp?.name,
          questions: tp?.questions || [],
        })),
      })),
    })),
  };
}

/**
 * Strips UI-only IDs from a UI template and returns an object matching the
 * server API contract. Always use this before calling update APIs.
 */
export function toServerShape(ui: UITemplate) {
  return {
    name: ui.name,
    categories: ui.categories.map((cat) => ({
      name: cat.name,
      questions: cat.questions || [],
      subCategories: (cat.subCategories || []).map((sc) => ({
        name: sc.name,
        questions: sc.questions || [],
        topics: (sc.topics || []).map((tp) => ({
          name: tp.name,
          questions: tp.questions || [],
        })),
      })),
    })),
  };
}
