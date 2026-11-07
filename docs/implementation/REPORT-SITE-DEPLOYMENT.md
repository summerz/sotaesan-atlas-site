# 스파이크 결과 공유 사이트

2026-10-04 배포 작업 기록. 보고서·발표 자료·근거 파일과 실제 실행 가능한 3D 스파이크 앱을 별도 공개 저장소에서 배포한다.

- 저장소: https://github.com/summerz/sotaesan-atlas-site
- 공유 주소: https://sotaesan-atlas-test.summerz.net/
- 직접 테스트: https://sotaesan-atlas-test.summerz.net/tests/
- GitHub Pages 기본 주소: https://summerz.github.io/sotaesan-atlas-site/
- 로컬 배포 저장소: `/Users/summerz/Documents/sotaesan-atlas-site`
- 배포 설정: `main` 브랜치의 `/ (root)`, `.nojekyll` 사용

## 공개 범위

HTML 페이지에는 공통 비밀번호 입장 화면을 적용했다. 아래의 ‘검토용 입장 화면’에서 적용 범위와 한계를 설명한다.

상세 보고서를 HTML로 변환하고 발표용 HTML·PDF, 관련 문서 24개와 연결된 측정 JSON·스크린샷·비교 화면을 함께 배포한다. Markdown 원본도 내려받을 수 있다.

PlayCanvas + Ammo, Three.js + BVH, Three.js + Rapier를 직접 실행할 수 있다. 테스트 안내 페이지에서 기본 공간, Sunnyvale 원본, 구역 로딩, 시대 전환 장면을 선택한다. 이동·장소 설명·충돌 면 표시·비교 경로 재생·JSON 저장 기능은 기존 앱을 사용한다.

| 실행 앱 | 주소 |
|---|---|
| PlayCanvas + Ammo | https://sotaesan-atlas-test.summerz.net/tests/playcanvas/?scene=hall |
| Three.js + BVH | https://sotaesan-atlas-test.summerz.net/tests/three/?scene=hall&controller=bvh |
| Three.js + Rapier | https://sotaesan-atlas-test.summerz.net/tests/three/?scene=hall&controller=rapier |

두 앱의 진입 HTML은 `tests/three/`, `tests/playcanvas/`에 두고, 번들·WASM·공통 장면 자산은 루트의 `assets/`, `world/`에 둔다. 같은 자산은 한 번만 복사하며, 경로가 같은데 내용이 다르면 빌드를 중단한다. 개발 소스·작업 지침을 따로 게시하지 않으며, 문서의 개발 파일 링크는 일반 텍스트로 표시한다.

공유용 실행본은 보고서 작성 후 만든 빌드다. 여기서 새로 얻은 측정값은 보고서의 기존 표본과 구분한다. 기존 측정 원본과 수치는 유지한다. 배경 설명 등 문서 내용은 필요할 때 갱신한다.

## 검토용 입장 화면

비밀번호는 `sotaesan`이다. 첫 화면·보고서·발표 자료·근거 HTML·직접 테스트 안내·실행 앱 등 HTML 39개에 같은 입장 화면을 적용했다. 다른 페이지의 직접 주소로 들어가도 비밀번호를 입력해야 화면이 열린다. 로그인 전에는 실행 앱의 번들·worker·WASM·장면 자산을 요청하지 않는다.

입장 상태는 같은 브라우저에서 24시간 유지한다. 페이지 이동과 새 탭에서도 이어지며, 자료 메뉴의 ‘잠그기’를 누르면 열려 있는 다른 자료 탭도 함께 잠긴다. 입장 후에는 원래 열려던 주소로 돌아간다. 테스트 장면·컨트롤러를 지정하는 쿼리와 발표 자료의 슬라이드 번호도 유지한다.

이 기능은 브라우저에서 확인하는 간이 잠금이다. 서버 인증이나 파일 암호화가 아니며, 공개 저장소·HTML 원본·PDF·Markdown·JSON·이미지·모델 등 파일의 직접 주소는 계속 공개된다. 자료를 실제로 비공개로 보호하려면 서버나 호스팅 앞단에서 인증을 적용해야 한다. `robots.txt`와 HTML의 `noindex`는 검색 노출을 줄이기 위한 안내이며 접근 제한 기능이 아니다.

입장 화면과 처리 코드는 `scripts/report-site-access/`에 있다. 사이트 생성 시 `scripts/build-report-site.py`가 HTML에 공통 진입 처리를 넣는다. 앱의 소스·릴리스·성능 측정 결과는 바꾸지 않는다.

## 자료 갱신

개발 저장소에서 실행한다.

앱 코드를 바꾼 경우에만 실행 앱을 다시 빌드한다. 문서만 고칠 때는 사이트 생성 명령만 실행한다.

```sh
# 앱 코드를 변경한 경우
pnpm build:spikes
# 문서 수정 후 사이트 생성
uv run --with markdown python scripts/build-report-site.py
```

`build:spikes`는 두 앱을 같은 릴리스 식별자로 빌드한다. 사이트 생성 스크립트는 먼저 `pnpm release:verify`로 번들·자산 무결성을 확인한다. 생성 위치는 `output/report-site/`이다. 이 폴더의 내용을 배포 저장소의 루트에 반영하고 변경 사항을 검토한 뒤 커밋한다. `.git/`은 유지하고, 사용자 지정 도메인을 설정한 뒤에는 `CNAME` 파일도 유지한다.

배포 저장소에서 업로드한다.

```sh
gh-project git push origin main
```

GitHub Pages의 배포 완료 여부를 확인한 뒤 공유 주소에서 변경 내용을 확인한다.

## 사용자 지정 도메인

확정 도메인은 `sotaesan-atlas-test.summerz.net`이다. 사용자가 GoDaddy에 CNAME을 등록했고, DNS 조회에서도 대상이 `summerz.github.io`인 것을 확인했다.

현재 설정은 다음과 같다. 새 도메인을 연결할 때는 GitHub Pages의 Custom domain에 먼저 등록하고 DNS 레코드를 추가한다.

| 항목 | 값 |
|---|---|
| 유형 | CNAME |
| 이름 | `sotaesan-atlas-test` |
| 대상 | `summerz.github.io` |

GitHub Pages의 Custom domain과 저장소 루트의 `CNAME`에 도메인을 등록했다. 인증서 발급 완료와 HTTPS 접속을 확인했고 HTTPS 강제를 켰다. HTTP 주소는 HTTPS로 이동한다. 빌드 스크립트도 `CNAME`을 생성하므로 자료를 갱신해도 도메인 설정을 유지한다.

설정 순서와 CNAME 대상은 [GitHub 공식 문서](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)를 따른다.

## 확인 결과

### 공통 비밀번호 입장 화면 — 2026-10-05

- HTML 39개에 공통 진입 처리를 적용했고, 내부 파일 링크 누락이 없었다. 로그인 화면은 데스크톱과 모바일 폭 390px에서 확인했다.
- 로컬에서 잘못된 비밀번호 거부, 올바른 비밀번호 입장, 새 탭의 입장 상태 공유, 여러 탭의 동시 잠금, 만료된 상태의 재입장 요구를 확인했다. 외부 주소로 돌아가도록 지정한 경우에는 사이트 첫 화면으로 이동했다.
- 직접 주소로 열었던 테스트 장면·컨트롤러 쿼리와 발표 자료의 `#3` 슬라이드 위치가 입장 후 유지됐다. 로그인 전에는 앱 자산 요청이 없었다.
- 로컬에서 PlayCanvas + Ammo, Three.js + BVH, Three.js + Rapier 모두 기본 공간 표시와 과거 레이어 전환을 확인했다. 앱 릴리스·번들·모델·PDF와 기존 측정 결과는 바꾸지 않았다.
- 배포 커밋 `f48b2f7`의 GitHub Pages 상태 `built`를 확인했다. 공유 주소에서도 잘못된 비밀번호 거부, 입장, 보고서 표시, 잠금, 테스트 직접 주소 복귀, Three.js + BVH의 기본 공간 표시와 과거 전환, 발표 자료 `3 / 13` 표시를 확인했다.
- 공개 주소의 첫 화면·로그인 HTML·공통 JS·robots·manifest·두 앱 HTML·보고서·발표 HTML·PDF 등 10개 파일이 HTTP 200을 반환하고 SHA-256이 로컬 파일과 일치했다. PDF 직접 주소가 비밀번호 없이 열리는 것도 확인했다. 이는 이 기능이 파일 접근을 제한하지 않는다는 근거다.
- 확인 원본: `output/playwright/site-access-local-verification.json`, `output/playwright/site-access-public-verification.json`, `output/playwright/site-access-public-files.json`, `output/playwright/site-access-login-mobile.png`, `output/playwright/site-access-public-login.png`, `output/playwright/site-access-public-home.png`.
- 이번 확인은 입장 화면과 배포 후 실행 확인이다. 새로운 성능 측정이나 iPhone 실기기 검증으로 사용하지 않는다.

### 프로젝트 배경 설명 추가 — 2026-10-05

- 첫 화면·직접 테스트 안내·상세 보고서·발표 자료·PDF에 대종사 십상 가상 공간의 목적, 사전 기술 시험을 준비한 이유, 플랫폼 의존성을 줄이려는 방향을 추가했다.
- Knock Community Hall과 Sunnyvale Heritage Park Museum은 웹에서 내려받은 시험용 샘플임을 설명하고 제작자·출처를 연결했다. 실제 촬영, 사진에서 스플랫 생성, 역사 복원은 이번 시험 범위에서 제외했음을 밝혔다.
- 발표 자료와 PDF 앞에 배경 설명 세 장을 추가해 총 13장으로 갱신했다.
- 기존 실행 앱의 릴리스는 그대로다. 측정 결과와 원본 수치도 유지했다.
- 로컬 데스크톱·모바일(390px) 첫 화면에서 가로 넘침 없이 표시됨을 확인했다. 생성된 HTML 39개의 내부 파일 링크에 누락이 없었다. 추가된 PDF 세 장의 글·표·하단 표시를 이미지로 확인했다.
- 배포 커밋 `7e89725`의 GitHub Pages 상태 `built`를 확인했다. 공개 주소의 첫 화면·테스트 안내·보고서 HTML/MD·발표 HTML·PDF·샘플 출처 문서 등 7개 파일이 HTTP 200을 반환하고 SHA-256이 로컬 파일과 일치했다.
- 공개 사이트의 새 첫 화면과 발표 자료 방향키 이동(`1 / 13` → `2 / 13`)을 확인했다. 시험 브라우저에 남은 이전 화면 캐시를 비운 뒤 첫 화면을 확인했다.
- 확인 원본: `output/playwright/site-context-public-verification.json`, `output/playwright/site-context-home-*.png`, `output/playwright/site-context-public-home.png`, `output/playwright/site-context-pdf-*.png`.

### 실행 앱 추가

- 공유용 앱 릴리스: `local-4d5905679d2e-0c66ba92a733` (두 엔진 동일).
- 내부 링크 580개에서 누락 없음. 앱과 보고서를 합친 정적 배포 파일은 약 336 MB다.
- 로컬 브라우저에서 세 조합 모두 기본 공간 로딩, WASD 이동에 따른 좌표 변화, 과거 전환, 장소 설명, 충돌 면 표시, 위치 JSON 다운로드를 확인했다. JSON의 릴리스·컨트롤러·전환 상태도 확인했다.
- PlayCanvas와 Three.js + BVH에서 Sunnyvale 원본 장면의 표시를 확인했다 (SOG 3,999,361개, 충돌 메시 337,692삼각형).
- 앱 추가 배포 커밋 `86b43f5`의 GitHub Pages 상태 `built`를 확인했다.
- 공개 주소의 앱 진입 HTML·릴리스 JSON·엔진 번들·Rapier 번들·Ammo WASM·기본/Sunnyvale SOG·world JSON 등 14개 파일이 HTTP 200을 반환하고 SHA-256이 로컬 배포 파일과 일치했다.
- 공개 주소에서도 세 조합 모두 기본 공간 로딩, WASD 이동에 따른 좌표 변화, 과거 전환, 장소 설명, 충돌 면 표시, 위치 JSON 다운로드를 확인했다. 각 결과 JSON의 릴리스·컨트롤러·전환 상태를 확인했다.
- 공개 사이트의 PlayCanvas에서 비교 경로 재생을 끝까지 실행하고 결과 JSON을 내려받았다. 준비 10초, 경로 60초, 결과 상태 `completed`를 확인했다. 이 결과는 다운로드 기능 확인용으로 보존하며 기존 성능 비교에는 합치지 않는다 (`output/playwright/site-public-playcanvas-route.json`).
- 확인 원본: `output/playwright/spike-site-functional-verification.json`, `output/playwright/spike-site-public-assets.json`, `output/playwright/site-local-*-location.json`, `output/playwright/site-local-*.png`, `output/playwright/site-public-*-location.json`, `output/playwright/site-public-*.png`.
- 이번 확인은 배포 후 실행 기능 확인이며, 기존 성능 측정의 재실행이나 iPhone 실기기 검증은 아니다.

### 보고서 최초 배포

- 로컬 배포 파일의 내부 링크 515개에서 누락 없음.
- 로컬 브라우저에서 첫 화면·상세 보고서·발표 자료 표시 확인.
- 발표 자료의 방향키 이동 확인 (`1 / 10` → `2 / 10`).
- 최종 GitHub Pages 배포 상태 `built` 확인 (배포 커밋 `9845cdb`).
- 공개 주소의 첫 화면·상세 보고서·발표 HTML·PDF·측정 JSON·스크린샷·측정 파일 목록 총 7개가 HTTP 200을 반환하고, SHA-256이 로컬 배포 파일과 일치함.
- 새 도메인의 브라우저 접속과 발표 자료 방향키 이동 확인.
- 확인 원본: `output/playwright/report-site-public-verification.json`.


### 캐릭터·NPC·안내문·소규모 다중 접속 — 2026-11-07

- 정적 사이트 배포 커밋 `b01870f`의 Pages `built`를 확인했다. 첫 화면에 현재 체험을 우선 배치하고 기존 기술 보고서는 접힌 영역에 보존했다.
- 두 엔진 앱 릴리스는 `local-c5b967dd2a7e-b40cc94f8b03`이며 `pnpm release:verify`를 통과했다. 공개 첫 화면·입장 화면·PlayCanvas HTML·릴리스·JS·CSS·아바타·world JSON 8개가 HTTP 200이고 로컬 SHA-256과 일치했다.
- 공개 사이트에서 독립된 두 headed Chromium 컨텍스트의 입장·WSS 접속, 서로 다른 방문자 ID와 상대 한 명씩 표시, 달리기·합장 전달을 확인했다. 이 실행의 pageerror·console error는 없었다. 성능·4기기·iPhone 검증은 아니다.
- `atlas-ws.summerz.net`에 기존 VPS의 별도 Docker 중계 서버를 배포했다. 127.0.0.1:8791, 메모리 256MiB·CPU 0.5개 상한, 전용 Caddy 설정을 사용한다. HTTPS health와 정상 입장·잘못된 비밀번호·Origin 거부를 확인했다. 기존 Caddy 활성 상태와 Timepedia 실제 health 응답도 정상이다.
- [4회차 결과와 보존 원본](../character-spike/RESULTS-04-MULTIPLAYER.md), [서버 운영·철회 방법](../../apps/atlas-realtime/README.md)을 따른다. 검증 기록 추가는 문서·이미지만 갱신하며 앱 릴리스를 바꾸지 않는다.

### 8명 인원 표시·자동 입장 변경 — 2026-11-07

- 배포 저장소 커밋은 `60f91580eb32e0cd50aac66b32d5d1e6826b2db2`, 앱 릴리스는 `local-c5b967dd2a7e-d337d929072b`다. `입장하기 N/8`, 만석 버튼 비활성화, 자동 접속, 상태 전용 패널을 구현했다. 정상 종료는 즉시 반영하고 갑작스러운 통신 단절은 최대 약 40초 감지 지연이 있다.
- 공개 중계 서버는 `sotaesan-atlas-realtime:2026-11-07-entry-eight`로 교체 완료했다. 실제 공개 SSE·WSS와 새 빌드의 두 방문자 연결·인원 증감을 확인했다. 이 검사에서 정적 파일은 시험 브라우저에 로컬 파일을 제공했으므로 Pages 배포 완료 검사가 아니다. [범위와 원본](../character-spike/RESULTS-04-MULTIPLAYER.md#인원-표시자동-입장-변경-검증--2026-11-07)을 따른다.
- **정적 화면 공개 반영은 미완료다.** [최초 배포 실행](https://github.com/summerz/sotaesan-atlas-site/actions/runs/42367046438)은 빌드·약 381 MB 아티팩트 업로드 후 `syncing_files`에서 약 10분 동안 진행하지 못하고 실패했다. 직전 문서 갱신 실행 `42365191489`도 같은 단계에서 실패했다. 같은 날 앞선 성공 실행 `42364757544`는 약 375 MB 아티팩트를 올리고 약 14초에 배포되어, 파일 크기만으로 이번 실패를 설명할 근거는 없다.
- 실패 작업 재실행은 API에서 `queued`로 보이면서 취소 요청에는 이미 완료된 실행이라는 응답을 반환했다. 이후 Pages 전체 빌드를 한 번 요청했다. [전체 재배포 실행](https://github.com/summerz/sotaesan-atlas-site/actions/runs/42368072307)은 11:24:47 UTC 시작했고, 빌드·업로드 성공 후 이번에는 `finished_file_sync` 상태에서 완료되지 못하고 11:35:33 UTC 시간 초과로 실패했다. 앞선 `syncing_files` 정체와 상태값이 다르므로 완전히 같은 내부 원인이라고 확정하지 않는다. 공개 `site-presence.js`는 계속 HTTP 404였으며 공개 정적 파일의 최종 검사는 수행할 수 없었다. 마지막 로그는 `output/playwright/atlas-entry-eight-pages-final-failure.log`에 보존했다. 추가 재시도는 하지 않았다.
- [2026-11-06의 GitHub 사용자 보고](https://github.com/orgs/community/discussions/212290)에도 `syncing_files` 시간 초과와 재실행 상태·취소 응답 불일치가 함께 기록되어 있다. GitHub Status의 Pages 표시는 정상이며, 외부 보고만으로 공식 장애나 정확한 원인을 확정하지 않는다. 기존 공개 첫 화면은 유지된다.

### 사용자 요청에 따른 1회 재시도 — 2026-11-07

- 호스팅 이전 없이 한 번만 다시 시도하라는 요청에 따라 같은 커밋 `60f9158`로 Pages 전체 빌드를 1회 요청했다. 소스·배포 파일·도메인·호스팅 설정은 변경하지 않았다.
- [재시도 실행 `42369394440`](https://github.com/summerz/sotaesan-atlas-site/actions/runs/42369394440)은 11:43:46 UTC 시작했다. 빌드·아티팩트 업로드는 성공했지만 배포 상태 API가 빈 상태값을 반환했고, 11:54:46 UTC `Timeout reached, aborting!`으로 실패했다. 이전 실행의 `syncing_files` 또는 `finished_file_sync` 상태와 같다고 단정하지 않는다.
- 공개 `site-presence.js`는 마지막 확인에서도 HTTP 404였다. 새 화면은 공개되지 않았고 이전 공개 화면이 유지된다. 따라서 새 공개 화면의 두 방문자 브라우저 검증은 수행하지 않았다. 앞선 로컬·공개 중계 서버 통합 검사와 구분한다.
- 실패 로그는 `output/playwright/atlas-entry-eight-pages-once-retry-failure.log`에 보존했다. 자체 시험 브라우저를 닫았고, 추가 재시도나 호스팅 이전은 하지 않았다.

### 사용자 요청으로 마지막 성공 버전 재배포 — 2026-11-07

- 사용자가 이전 버전의 재배포를 요청했다. 배포 저장소의 `b01870f41a113749a7efe68bf52a48b0cb4c6771`과 **전체 Git 트리가 동일한** 복원 커밋 `dd932dfeca810eea3083f1080afd5a4809a5e95c`을 main에 추가했다. reset·강제 push는 하지 않았다. 8명 변경 커밋 `60f9158`은 이력과 로컬 `backup/entry-eight-before-rollback-20261107` 브랜치에 보존했고, 개발 저장소의 구현 파일은 되돌리지 않았다.
- Pages 실행 [42370756198](https://github.com/summerz/sotaesan-atlas-site/actions/runs/42370756198)은 build·deploy 모두 성공했다. 게시 단계는 UTC 12:03:36–12:03:51(약 15초), Pages builds API는 복원 커밋에 대해 `built`를 반환했다. 도메인·호스팅은 변경하지 않았다. 로그와 실행 정보는 `output/playwright/atlas-rollback-pages-success.log`, `output/playwright/atlas-rollback-pages-run.json`이다.
- 구버전 클라이언트는 최대 4명의 world 메시지만 수용한다. 따라서 접속 인원 0명을 확인하고 공개 중계 서버도 기존 이미지 `sotaesan-atlas-realtime:2026-11-07`로 복구했다. 현재 정원은 **4명, 패널에서 수동 함께 입장**이다. health 정상, 재시작 0회다. 8명 이미지는 보존했고, 변경 직전 Compose는 VPS의 `compose.entry-eight-before-rollback-20261107.yaml`에 보존했다. 비밀번호·Caddy·다른 서비스 설정은 바꾸지 않았다.
- 첫 화면·입장 화면·공통 JS·PlayCanvas HTML·릴리스·world JSON·앱 JS·CSS 8개가 HTTP 200이며 복원 배포 파일과 SHA-256이 일치했다. 공개 릴리스는 `local-c5b967dd2a7e-b40cc94f8b03`이다. [파일 확인 원본](measurements/atlas-rollback-public-files.json).
- 요청 가로채기 없이 실제 공개 Pages·WSS를 사용한 독립된 두 headed Chromium 컨텍스트에서 수동 입장, 서로 다른 ID와 상대 표시, 원격 걷기, 정상 종료 후 상대 제거를 확인했다. 이번 종료 관찰은 91ms였으며 일반적인 지연 상한을 뜻하지 않는다. 앱 검사 중 pageerror·console error는 없었다. 최초 로그인 화면의 favicon 404는 별도이며, 성능·4기기·iPhone 판정은 아니다. [검사 JSON](measurements/atlas-rollback-public.json), [화면](measurements/atlas-rollback-public-two-visitors.png). 시험 컨텍스트·브라우저를 닫고 공개 health의 visitors 0을 확인했다.
- **원인 판단의 한계:** 이전 파일 묶음의 게시 성공은 GitHub Pages 전체 장애라는 설명을 약화하지만, 일시적인 서비스 문제나 특정 배포 묶음에서 발생하는 Pages 문제를 배제하지 않는다. 인원 조회 코드가 없던 문서·스크린샷 추가 커밋 `f220bdd`도 먼저 실패했으므로, 인원 표시 기능 자체를 원인으로 지목할 근거는 없다. 용량 초과나 특정 파일 문제도 아직 확정하지 않았다. 추가 배포는 실행하지 않았다.

### 단계별 재배포로 8명 자동 입장 공개 완료 — 2026-11-07

사용자가 원하는 형태까지 단계별로 진행하도록 요청했다. 기존 GitHub Pages·도메인을 유지하고 기능을 분리해 아래 순서로 배포했다. 각 실행의 build·deploy 성공을 확인한 뒤 다음 단계로 진행했다.

| 단계 | 배포 커밋 | Pages 실행 | 확인 결과 |
| --- | --- | --- | --- |
| 문서·스크린샷만 복원 | `c8890dc` | [42371210644](https://github.com/summerz/sotaesan-atlas-site/actions/runs/42371210644) | 과거 실패한 `f220bdd`와 동일한 전체 Git 트리. 게시 성공 |
| 인원 표시 없이 8명 자동 입장 | `8164f07` | [42371449801](https://github.com/summerz/sotaesan-atlas-site/actions/runs/42371449801) | 게시 성공. VPS 8명 이미지 전환 후 실제 두 브라우저 자동 입장·상대 표시·걷기 전달·수동 입력 0개 확인 |
| 실시간 `입장하기 N/8` | `0918416` | [42371563081](https://github.com/summerz/sotaesan-atlas-site/actions/runs/42371563081) | 게시 성공. 공개 SSE·WSS와 실제 Pages를 함께 검증 |

2단계는 보존한 `60f9158`의 검증된 앱 파일·릴리스를 사용하되 첫 화면의 인원 스크립트만 제외했고, 3단계에서 보존한 첫 화면과 `site-presence.js`를 그대로 복원했다. 앱을 임의 축소하거나 자산을 재인코딩하지 않았다. 서버 전환 직전 visitors 0을 확인했다. 공개 컨테이너는 `sotaesan-atlas-realtime:2026-11-07-entry-eight`, healthy·재시작 0회다. 기존 4명 이미지와 복원 커밋은 보존했다.

실제 공개 주소에서 두 독립 headed Chromium 컨텍스트가 버튼으로 자동 입장했다. 상호 ID·원격 인물·걷기·수동 네트워크 입력 0개, 인원 0→1→2, 정상 탭 종료 후 감소(이번 관찰 73ms), 첫 화면 이동 후 자리 반환을 확인했다. pageerror·console error는 없었다. 별도 9개 동시 프로토콜 연결은 8개 허용·1개 `full` 거부, 만석 버튼 비활성화, 퇴장 후 7/8·재활성화를 확인했다(이번 관찰 57ms). 첫 화면 포함 공개 파일 8개는 HTTP 200·배포 파일과 SHA-256이 일치했다. 요청 가로채기나 정적 파일 대체는 없었다. 8대 실기기·성능·장시간 부하 시험으로 표현하지 않는다.

- [자동 입장 단계 원본](measurements/atlas-stage-auto-public.json)
- [최종 공개 기능 원본](measurements/atlas-entry-eight-public.json) · [두 방문자 화면](measurements/atlas-entry-eight-public-two-visitors.png)
- [정원 검사 원본](measurements/atlas-entry-eight-public-capacity.json) · [만석 화면](measurements/atlas-entry-eight-public-full.png)
- [공개 파일 일치 원본](measurements/atlas-entry-eight-public-files.json)

같은 문서 트리와 같은 인원 표시 코드가 이번에는 게시됐다. 따라서 파일 크기나 인원 표시 기능을 과거 실패의 확정 원인으로 지목하지 않는다. 재배포 시점과 변경 묶음을 함께 바꿨으므로 일시적인 Pages 문제인지, 분리 게시가 영향을 줬는지도 확정할 수 없다. 단계별 실행 정보는 `output/playwright/atlas-staged-{docs,auto,presence}-pages.json`에 보존했다.
