# Sotaesan Atlas 스파이크 결과

공개 주소: https://sotaesan-atlas-test.summerz.net/

GitHub Pages 기본 주소: https://summerz.github.io/sotaesan-atlas-site/

보고서, 발표용 HTML/PDF, 측정 JSON과 화면 근거, 실제 실행 가능한 3D 스파이크 앱을 정적으로 배포합니다. PlayCanvas + Ammo, Three.js + BVH, Three.js + Rapier를 장면별로 비교할 수 있습니다.

원본 개발 저장소에서 `pnpm build:spikes` 후 `uv run --with markdown python scripts/build-report-site.py`로 생성합니다. 생성된 `output/report-site/`를 이 저장소의 루트에 반영하면 GitHub Pages가 배포합니다. GitHub Pages 설정은 `main` 브랜치의 `/ (root)`입니다. `.nojekyll` 파일을 유지합니다.

사용자 지정 도메인은 GitHub Pages 설정에 먼저 지정한 뒤 DNS에 CNAME을 등록합니다. CNAME의 대상은 `summerz.github.io`이며 저장소 이름이나 https://는 붙이지 않습니다. 루트 도메인은 A/AAAA 또는 ALIAS/ANAME 설정을 사용합니다.

측정 원본은 바꾸지 않았습니다. 문서의 Markdown 링크만 배포용 HTML로 연결했습니다. 개발 소스·작업 지침은 게시하지 않으며, 해당 참조는 일반 텍스트로 표시합니다. 실행 앱의 프로덕션 번들과 공통 자산은 포함합니다.
