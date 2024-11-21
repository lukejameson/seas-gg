create table
  public.weekly_tides (
    id uuid not null,
    startofweekdate date not null,
    endofweekdate date not null,
    data jsonb not null,
    constraint weekly_tides_pkey primary key (id),
    constraint weekly_tides_endofweekdate_key unique (endofweekdate),
    constraint weekly_tides_startofweekdate_key unique (startofweekdate),
    constraint date_matches check (
      (
        startofweekdate = ((data ->> 'startOfWeekDate'::text))::date
      )
    )
  ) tablespace pg_default;

create index if not exists idx_weekly_tides_start_date on public.weekly_tides using btree (startofweekdate) tablespace pg_default;

create index if not exists idx_weekly_tides_end_date on public.weekly_tides using btree (endofweekdate) tablespace pg_default;

create index if not exists idx_weekly_tides on public.weekly_tides using gin (((data -> 'tides'::text))) tablespace pg_default;