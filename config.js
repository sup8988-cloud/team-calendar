// =============================================================
// 우리팀 일정 캘린더 - GitHub Pages 연결 설정
// 아래 2개 값만 Supabase 프로젝트 값으로 바꾸면 됩니다.
// Publishable Key는 브라우저용 키이며 RLS와 함께 사용합니다.
// 절대로 Secret Key / service_role key를 넣지 마세요.
// =============================================================
window.APP_CONFIG = {
  SUPABASE_URL: "https://blikmdfmycttbvnowsbo.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_aVJKgfI5BpQJVamGkGFYbw_F4Cbc7EF",

  APP_NAME: "우리팀 일정 캘린더",
  TEAM_NAME: "공유 일정",

  // 처음 5개 담당 계정을 만들 때만 true.
  // 팀장·인사·감찰·교육·안전 계정 등록을 마친 뒤 false로 바꾸세요.
  ALLOW_SIGN_UP: true,

  // Supabase 연결 전 UI를 시험해 보는 데모 버튼
  ENABLE_DEMO: true
};
