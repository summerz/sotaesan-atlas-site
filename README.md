# Sotaesan Atlas 스파이크 결과

공개 주소: https://sotaesan-atlas-test.summerz.net/

GitHub Pages 기본 주소: https://summerz.github.io/sotaesan-atlas-site/

보고서, 발표용 HTML/PDF, 측정 JSON과 화면 근거, 실제 실행 가능한 3D 스파이크 앱을 정적으로 배포합니다. PlayCanvas + Ammo, Three.js + BVH, Three.js + Rapier를 장면별로 비교할 수 있습니다.

원본 개발 저장소에서 `pnpm build:spikes` 후 `uv run --with markdown python scripts/build-report-site.py`로 생성합니다. 생성된 `output/report-site/`를 이 저장소의 루트에 반영하면 GitHub Pages가 배포합니다. GitHub Pages 설정은 `main` 브랜치의 `/ (root)`입니다. `.nojekyll` 파일을 유지합니다.

사용자 지정 도메인은 GitHub Pages 설정에 먼저 지정한 뒤 DNS에 CNAME을 등록합니다. CNAME의 대상은 `summerz.github.io`이며 저장소 이름이나 https://는 붙이지 않습니다. 루트 도메인은 A/AAAA 또는 ALIAS/ANAME 설정을 사용합니다.

측정 원본은 바꾸지 않았습니다. 문서의 Markdown 링크만 배포용 HTML로 연결했습니다. 개발 소스·작업 지침은 게시하지 않으며, 해당 참조는 일반 텍스트로 표시합니다. 실행 앱의 프로덕션 번들과 공통 자산은 포함합니다.

## 검토용 입장 화면

모든 HTML 페이지에 공통 비밀번호 입장 화면을 적용합니다. 같은 브라우저에서 24시간 유지하며 자료 메뉴의 잠그기로 해제할 수 있습니다. 페이지의 쿼리와 발표 자료의 슬라이드 위치는 입장 후 유지합니다.

브라우저에서만 확인하는 간이 잠금이며 서버 인증이 아닙니다. 공개 저장소, HTML 원본, PDF·Markdown·JSON·이미지·3D 자산의 직접 URL은 여전히 공개입니다. 실제 비공개 자료 보호가 필요하면 서버에서 접근을 제한하는 호스팅으로 옮겨야 합니다. robots.txt는 검색 노출을 줄이기 위한 안내이며 접근 제어가 아닙니다.
