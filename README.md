# 우리팀 일정 캘린더

팀장·인사·감찰·교육·안전 5개 담당이 하나의 팀 캘린더를 함께 작성하고 확인하는 GitHub Pages + Supabase PWA입니다.

## 담당 색상
- 팀장: Red `#E5484D`
- 인사: Blue `#246BFD`
- 감찰: Green `#22A06B`
- 교육: Orange `#F59E0B`
- 안전: Purple `#7C3AED`

## 동작 구조
- **GitHub Pages**: HTML/CSS/JavaScript 앱 화면 배포
- **Supabase Auth**: 담당별 로그인
- **Supabase Postgres**: 공동 일정 저장
- **Supabase Realtime**: 일정 추가·수정·삭제 실시간 반영
- **PWA**: Android/iPhone 홈 화면에 앱처럼 설치

## 처음 설치
자세한 순서는 `GITHUB_설치순서_요약.md`를 그대로 따라가세요.

## 중요 보안
`config.js`에는 Project URL과 **Publishable key**만 넣습니다. Secret key / service_role은 브라우저나 GitHub에 절대 넣지 않습니다. 데이터 테이블은 `supabase-setup.sql`의 RLS 정책으로 로그인 사용자에게만 열립니다.

## 일정 권한
현재 설정은 로그인한 5개 담당이 팀 일정 전체를 조회·추가·수정·삭제할 수 있습니다. 즉, 누가 만든 일정이든 팀 전체가 공동 관리합니다.

## 배포 후 수정
파일을 수정하여 GitHub `main` 브랜치에 다시 올리면 GitHub Pages가 갱신됩니다. 서비스워커 캐시 버전은 `sw.js`의 `CACHE_NAME`을 올리면 새 파일 반영이 더 확실합니다.
