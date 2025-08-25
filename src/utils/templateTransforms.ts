import type { UITemplate } from '../types/template';

// Server template as returned by API: questions are arrays of string IDs
type ServerTopic = { name?: string; questions?: string[] };
type ServerSubCategory = { name?: string; questions?: string[]; topics?: ServerTopic[] };
type ServerCategory = { name?: string; questions?: string[]; subCategories?: ServerSubCategory[] };
type ServerTemplate = { name?: string; categories?: ServerCategory[] };

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
export function withIds(server: ServerTemplate): UITemplate {
  return {
    name: server?.name || '',
    categories: (server?.categories || []).map((cat) => ({
      id: genUiId(),
      name: cat?.name || '',
      questions: Array.isArray(cat?.questions) ? cat!.questions! : [],
      subCategories: (cat?.subCategories || []).map((sc) => ({
        id: genUiId(),
        name: sc?.name || '',
        questions: Array.isArray(sc?.questions) ? sc!.questions! : [],
        topics: (sc?.topics || []).map((tp) => ({
          id: genUiId(),
          name: tp?.name || '',
          questions: Array.isArray(tp?.questions) ? tp!.questions! : [],
        })),
      })),
    })),
  };
}
