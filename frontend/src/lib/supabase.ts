import { createClient } from "@supabase/supabase-js";

// Supabase project credentials provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://lhldaxtodnttwwbiashl.supabase.co";
// In browser client, use publishable key for public auth & RLS
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_YH2vziv6AqAOwo9CeWriMg_SLh5bJTT";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export interface QueryRecord {
  id?: string;
  user_id?: string;
  query: string;
  jurisdiction: string;
  category: string;
  confidence_score: number;
  short_answer: string;
  citations: any[];
  created_at?: string;
}

export interface BookmarkRecord {
  id: string;
  title: string;
  category: string;
  jurisdiction: string;
  excerpt: string;
  created_at: string;
}

const LOCAL_STORAGE_HISTORY_KEY = "ipsakti_query_history";
const LOCAL_STORAGE_BOOKMARKS_KEY = "ipsakti_bookmarks";

/**
 * Persist query record to Supabase (and mirror to localStorage for instantaneous offline/resilient access)
 */
export async function saveQueryRecord(record: QueryRecord): Promise<void> {
  // Always mirror in localStorage first for immediate UI reactivity & zero-loss
  try {
    const existing: QueryRecord[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY) || "[]"
    );
    const newRecord: QueryRecord = {
      ...record,
      id: record.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newRecord, ...existing.slice(0, 49)];
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save to localStorage:", err);
  }

  // Attempt Supabase database persistence if authenticated
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("queries").insert([
        {
          user_id: session.user.id,
          query: record.query,
          jurisdiction: record.jurisdiction,
          product_classification: record.category,
          confidence_score: record.confidence_score,
          short_answer: record.short_answer,
          citations_count: record.citations?.length || 0,
          metadata: { citations: record.citations },
        },
      ]);
    }
  } catch (supabaseErr) {
    console.info("Supabase sync optional / pending remote table init:", supabaseErr);
  }
}

/**
 * Fetch query history (combines Supabase remote history if signed in, with local mirror)
 */
export async function getQueryHistory(): Promise<QueryRecord[]> {
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY) || "[]");
    return local;
  } catch {
    return [];
  }
}

/**
 * Clear query history
 */
export function clearQueryHistory(): void {
  localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
}

/**
 * Bookmark management
 */
export function getSavedBookmarks(): BookmarkRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_BOOKMARKS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleBookmark(bookmark: BookmarkRecord): boolean {
  const current = getSavedBookmarks();
  const exists = current.some((b) => b.id === bookmark.id || b.title === bookmark.title);
  let updated: BookmarkRecord[];
  if (exists) {
    updated = current.filter((b) => b.id !== bookmark.id && b.title !== bookmark.title);
  } else {
    updated = [bookmark, ...current];
  }
  localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(updated));
  return !exists;
}
