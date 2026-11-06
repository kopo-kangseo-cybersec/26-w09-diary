import { supabase } from '../lib/supabase';

// 목록 조회
export const fetchDiaries = async () => {
  const { data, error } = await supabase
    .from('diaries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// 일기 추가
export const createDiary = async ({ content, emotion }) => {
  const { data, error } = await supabase
    .from('diaries')
    .insert([{ content, emotion }])
    .select();

  if (error) throw error;
  return data;
};

// 일기 삭제
export const deleteDiary = async (id) => {
  const { error } = await supabase
    .from('diaries')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
