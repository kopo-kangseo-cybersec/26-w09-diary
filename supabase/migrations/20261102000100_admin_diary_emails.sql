create or replace function public.get_admin_diaries()
returns table (
  id bigint,
  content text,
  emotion text,
  created_at timestamptz,
  user_id uuid,
  user_email text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_diary_admin() then
    raise insufficient_privilege using message = '관리자만 전체 일기를 볼 수 있습니다.';
  end if;

  return query
    select d.id, d.content, d.emotion, d.created_at, d.user_id, u.email::text
    from public.diaries as d
    left join auth.users as u on u.id = d.user_id
    order by d.created_at desc;
end;
$$;

revoke all on function public.get_admin_diaries() from public, anon;
grant execute on function public.get_admin_diaries() to authenticated;
