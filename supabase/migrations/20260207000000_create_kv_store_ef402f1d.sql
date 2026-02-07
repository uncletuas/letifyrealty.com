-- Creates the key-value store backing the Supabase edge function.
-- This table is required for profiles, messages, notifications, and requests.
create table if not exists public.kv_store_ef402f1d (
  key text primary key,
  value jsonb not null
);

-- Optional: keep table small by preventing accidental full-table scans.
create index if not exists kv_store_ef402f1d_key_prefix
  on public.kv_store_ef402f1d (key text_pattern_ops);
