-- Admin-published content becomes visible in the app.
-- The admin panel (admin-content, service role) writes featured_verses and
-- devotionals; until now nothing in the app could read them (RLS on, no policy).
-- Members may read only what is switched on / published; drafts stay private.

drop policy if exists "read_active_verses" on public.featured_verses;
create policy "read_active_verses" on public.featured_verses
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists "read_published_devotionals" on public.devotionals;
create policy "read_published_devotionals" on public.devotionals
  for select to anon, authenticated
  using (is_published = true and (publish_date is null or publish_date <= (now() at time zone 'utc')::date + 1));

create index if not exists featured_verses_active_date on public.featured_verses (is_active, display_date);
create index if not exists devotionals_published_date on public.devotionals (is_published, publish_date);
