alter table public.enquiries
  add column if not exists bedrooms integer not null default 3;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'enquiries_bedrooms_check'
      and conrelid = 'public.enquiries'::regclass
  ) then
    alter table public.enquiries
      add constraint enquiries_bedrooms_check check (bedrooms between 1 and 3);
  end if;
end $$;
