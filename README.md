# 🌸 CozySchedule (코지 스케줄)

귀여운 3D 파스텔 톤 카드 디자인과 완벽한 공유 권한 제어를 제공하는 **다중 공유 스케줄러 웹앱**입니다.

## ✨ 주요 기능
- **다중 스케줄러 관리**: 직장용, 개인용, 동아리용 등 카테고리별 독립된 스케줄러 생성
- **아이디 기반 초대 & 팝업**: 친구/동료의 Username 검색 초대 및 '수락/거절' 모달 알림
- **선별적 일정 공유**: 공유 여부(`is_shared`) 체크박스를 통한 사생활 보호
- **반복 일정 지원**: 매주, 매월, 매년 반복 일정 자동 반영
- **반응형 3D 파스텔 UI**: PC 및 모바일 전용 하단 탭바 레이아웃 지원

## 🛠️ 테크 스택
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Date-fns
- **Backend / DB**: Supabase (Auth, PostgreSQL, Row Level Security)
- **Deployment**: Vercel

## 🚀 시작하기

### 환경 변수 설정 (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
