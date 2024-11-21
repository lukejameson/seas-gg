-- Active: 1732198537440@@158.220.85.48@5433@seas_gg
create table
  public.daily_tides (
    id uuid not null,
    date date not null,
    data jsonb not null,
    constraint daily_tides_pkey primary key (id),
    constraint daily_tides_date_key unique (date),
    constraint date_matches check ((date = ((data ->> 'date'::text))::date))
  ) tablespace pg_default;

create index if not exists idx_daily_tides_date on public.daily_tides using btree (date) tablespace pg_default;

create index if not exists idx_basic_tides on public.daily_tides using gin (((data -> 'basicTides'::text))) tablespace pg_default;