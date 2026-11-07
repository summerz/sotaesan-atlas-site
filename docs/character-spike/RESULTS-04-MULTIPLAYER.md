# 4회차: 함께 공간에 들어오기

- 작성일: 2026-11-07
- 범위: 소규모 다중 접속 기능 구현과 배포 확인. 성능 비교·장시간 부하·iPhone 실기기 시험은 아니다.

## 구현과 이용 방법

[공유 사이트](https://sotaesan-atlas-test.summerz.net/)의 ‘입장하기 N/8’에서 현재 입장 인원을 보고 들어간다. 입장하면 다른 방문자와 자동으로 연결된다. 패널의 별도 비밀번호·함께 입장·혼자 탐색 조작은 제거했다. 정원 8명 또는 서버 확인 실패 시 입장 버튼을 비활성화한다. 첫 화면을 보는 사람은 N에 포함하지 않는다. **현재 공개 화면과 서버 모두 최대 8명·자동 입장 방식이다.** Pages 게시 실패 뒤 4명 버전을 잠시 복원했으나, 문서 → 자동 입장 → 인원 표시 순서의 분리 배포가 모두 성공했고 실제 공개 주소에서 재검증했다. [단계별 배포 기록](../implementation/REPORT-SITE-DEPLOYMENT.md)과 아래 최종 공개 검증을 따른다.

방문자는 임시 번호와 색 테두리 이름표로 구분한다. 위치·방향·대기·걷기·달리기·합장을 초당 10회 공유하고 수신 화면에서 위치와 방향을 보간한다. 기존 아바타 모델과 합장 자세를 재사용한다. 다른 방문자는 충돌체가 없는 시각적 인물이다.

NPC와 안내문 전달·소지는 각 방문자에게 독립적이다. 누군가 안내문을 받아도 다른 이용자의 안내문은 소진되지 않는다. 공유 NPC 차례·계정·채팅·영구 저장은 구현하지 않았다. 새로 입장하면 새 임시 ID가 생기며 번호는 재사용된다.

## 서버와 장애 처리

정적 앱은 GitHub Pages에 유지하고 `wss://atlas-ws.summerz.net/ws`로 접속한다. 기존 VPS에 별도 컨테이너 `sotaesan-atlas-realtime`을 추가했다. 호스트의 `127.0.0.1:8791`만 바인딩하고 전용 Caddy 설정으로 HTTPS/WSS를 제공한다. 기존 앱의 설정은 변경하지 않았다.

- 최초 이미지: `sotaesan-atlas-realtime:2026-11-07`, linux/amd64. 8명·자동 입장 변경 이미지는 `sotaesan-atlas-realtime:2026-11-07-entry-eight`.
- 상한: 메모리 256MiB, CPU 0.5개, 프로세스 64개, 읽기 전용 파일 시스템. 초기 운영 상한이며 부하 시험으로 정한 필요 용량은 아니다.
- 설치 직후 상태: healthy, 재시작 0회. 유휴 단발 표본 약 27.46MiB / CPU 0.57%. 4명 부하·장시간 안정성을 증명하지 않는다.
- 서버 비밀번호 재검증, 허용 Origin, 메시지 크기·빈도·접속 수 제한을 적용했다. 검토용 공통 비밀번호는 공개 문서에도 있으므로 개인 인증·비공개 서비스가 아니다.
- 좌표 이력을 파일이나 DB에 저장하지 않는다. 클라이언트가 보내는 좌표의 물리적 타당성을 서버가 판정하지 않는다.
- 연결이 끊기면 원격 인물을 지우고 단독 이동을 유지한다. 공개 검토 키로 자동 재접속한다. 정상 탭 닫기·페이지 이동은 즉시 해제하며 갑작스러운 단절은 최대 약 40초 감지 지연이 있다.

구성·제한·철회 방법은 [중계 서버 설명](../../apps/atlas-realtime/README.md)을 따른다.

## 확인한 것과 원본

`pnpm check`가 통과했다. 중계 서버 5개 시험은 입장·늦은 입장·이동·퇴장·재입장, 잘못된 비밀번호, 정원 초과, 유효하지 않은 값·중복 순번·과대 메시지, 허용하지 않은 Origin을 검사한다. 기존 PlayCanvas 27개 회귀 시험도 포함된다.

별도 headed Chromium의 독립된 두 컨텍스트에서 다음을 확인했다. 사용자 브라우저와 기존 시험 세션은 조작하지 않았다.

1. 서로 다른 ID를 받고 상대 아바타 한 명씩 표시한다.
2. 실제 Shift+S 입력의 달리기와 정지, 합장 손 모음·허리 숙임이 상대에게 전달된다. 정지 후 보간 좌표가 송신 위치의 0.2 장면 단위 이내로 수렴한다.
3. 한쪽이 안내문을 받아도 다른 쪽의 소지는 변하지 않는다.
4. 퇴장하면 상대 인물이 사라지고 재입장 시 중복 없이 새 ID 하나만 표시된다.
5. 서버 중지 중에도 실제 A 키 입력으로 단독 이동한다. 서버를 다시 켜면 두 컨텍스트가 자동 재입장하고 각각 원격 인물 한 명만 표시한다.
6. 390×844 화면에서 열린 패널이 화면 안에 들어가고 가로 넘침이 없다. 닫으면 안내·조작 핸들 하나만 남는다. 모바일 크기 에뮬레이션이며 iPhone 실기기 판정이 아니다.

로컬 개발 콘솔의 favicon 404와 의도적인 서버 중지 때의 WebSocket 연결 실패를 구분했다. 별도 Docker 이미지도 상한·읽기 전용 조건에서 건강 상태를 확인했다. 공개 도메인에서는 HTTPS health 200, WSS 정상 비밀번호 입장, 잘못된 비밀번호 거부, 잘못된 Origin 403을 확인했다. 공개 앱의 최종 검증 결과는 아래 배포 기록을 따른다.

- [두 방문자·상호작용 JSON](../implementation/measurements/atlas-multiplayer-local.json)
- [중단·이동·자동 재접속 JSON](../implementation/measurements/atlas-multiplayer-reconnect.json)
- [공개 WSS 검사 JSON](../implementation/measurements/atlas-multiplayer-public-relay.json)
- [두 방문자 화면](../implementation/measurements/atlas-multiplayer-two-visitors.png)
- [390px 패널 화면](../implementation/measurements/atlas-multiplayer-mobile-panel.png)

## 공개 배포 검증 — 2026-11-07

공유 사이트의 첫 화면은 현재 체험·네 단계 이용 순서를 먼저 보여주며, 기존 기술 비교 자료는 접힌 영역에 보존한다. 정적 사이트 배포 커밋 `b01870f`의 Pages `built`와 앱 릴리스 `local-c5b967dd2a7e-b40cc94f8b03`을 확인했다. 첫 화면·입장 화면·앱 HTML·릴리스 JSON·JS·CSS·아바타 GLB·world JSON 총 8개 공개 파일의 HTTP 200과 로컬 SHA-256 일치를 확인했다.

공개 주소에서 독립된 두 Chromium 컨텍스트가 입장 화면과 현재 테스트 링크를 거쳐 WSS에 접속했다. 서로 다른 ID·각각 원격 인물 한 명·정원 표시 2명, 실제 Shift+S 달리기와 안내문 수령 전 합장의 손 모음·허리 숙임 전달을 확인했다. 이 실행에서 pageerror·console error는 없었다. 위 중단·재접속 검사는 로컬 서버에서 수행했으며 공개 VPS를 중단하지 않았다.

- [공개 앱 기능 JSON](../implementation/measurements/atlas-multiplayer-public.json)
- [공개 파일 해시 검사 JSON](../implementation/measurements/atlas-multiplayer-public-files.json)
- [공개 두 방문자 화면](../implementation/measurements/atlas-multiplayer-public-two-visitors.png)

## 남은 범위

서로 다른 실제 기기·외부 네트워크의 지연, 실제 8명 동시 사용, 장시간 접속, iPhone 사용성은 아직 판정하지 않았다. 이번 확인은 독립된 두 브라우저 컨텍스트의 기능 시험이다. 서버의 정원 8명은 구현한 제한이며 8기기 실사용·성능 검증 결과가 아니다.

## 인원 표시·자동 입장 변경 검증 — 2026-11-07

릴리스 `local-c5b967dd2a7e-d337d929072b`는 정원 8명, 첫 화면의 실시간 `입장하기 N/8`, 자동 접속과 상태 전용 패널을 제공한다. 서버 SSE 구독자는 입장 인원에 포함하지 않는다. 정상 종료·페이지 이동은 연결 종료를 받아 즉시 반영하며, 갑작스러운 통신 단절은 마지막 상태 수신 후 약 30–40초의 감지 지연이 있을 수 있다. 확인 실패 또는 25초 이상 인원 갱신이 없으면 버튼을 잠근다. 만석 직전 동시 클릭도 서버가 초과 입장을 거부하고 앱에 돌아가기 링크를 표시한다.

`pnpm check` 전체 검사와 릴레이 7개 검사를 통과했다. headed Chromium의 두 독립 앱 컨텍스트에서 자동 접속·원격 인물·수동 입장 입력 0개, 페이지 이동 시 자리 반환과 뒤로 가기 재입장을 확인했다. 정상 탭 종료 후 인원 감소는 로컬 단발 표본 33ms였으며 지연 보장 수치가 아니다. 별도 합성 WebSocket 8개로 만석 버튼 비활성화·아홉 번째 거부·퇴장 후 재활성화를 확인했다. 로컬 생성 사이트 시험에는 시험 브라우저에서만 공개 WSS 주소를 로컬 서버로 바꾸었다. 마지막 서버 종료 방어와 첫 화면 bfcache 재연결 보완 전의 브라우저 표본이며, 이 보완 후 릴레이 검사·타입 검사·양 엔진 빌드도 통과했다.

- [로컬 기능 원본](../implementation/measurements/atlas-entry-eight-local.json)
- [두 방문자 화면](../implementation/measurements/atlas-entry-eight-two-visitors.png)
- [8명 만석 버튼](../implementation/measurements/atlas-entry-eight-full.png)

8개 합성 연결은 정원·입퇴장 처리 검사이며 8대 기기의 렌더링 성능이나 실사용 부하 시험을 대신하지 않는다.

공개 중계 서버는 `2026-11-07-entry-eight` 이미지로 교체했고 healthy·재시작 0회를 확인했다. 공개 `/health`는 정원 8명, `/presence`는 허용 Origin에 실시간 인원과 정확한 CORS 응답을 반환한다. 기존 Timepedia health도 정상이다. [공개 서버 확인 원본](../implementation/measurements/atlas-entry-eight-public-relay.json)을 보존했다.

최종 빌드와 실제 공개 중계 서버의 연결도 별도로 검사했다. 시험 브라우저의 공개 사이트 정적 파일 요청만 로컬 생성 파일로 대체하고, SSE·WSS는 실제 `atlas-ws.summerz.net`에 연결했다. 두 독립 컨텍스트의 자동 입장·상대 인물 표시·인원 2명·수동 입력란 0개·정상 종료 후 감소·첫 화면 이동 후 자리 해제를 확인했다. 정상 종료 후 인원 감소 58ms는 이 실행 한 번의 관찰값이며 보장 지연이 아니다. pageerror·console error는 없었다. 정적 파일을 대체했으므로 **공개 사이트 배포 완료 검증이 아니다**. [공개 중계 서버 통합 원본](../implementation/measurements/atlas-entry-eight-public-relay-integration.json), [두 방문자 화면](../implementation/measurements/atlas-entry-eight-public-relay-integration.png)을 보존했다.

## 최종 공개 검증 — 단계별 재배포 후

Pages 커밋 `0918416`과 공개 중계 서버의 8명 이미지를 사용했다. 요청 가로채기·정적 파일 대체 없이 실제 공개 Pages·SSE·WSS를 검사했다. 앱 릴리스는 위와 같은 `local-c5b967dd2a7e-d337d929072b`다.

- 독립된 두 headed Chromium 앱 컨텍스트가 첫 화면 버튼으로 자동 입장했다. 첫 화면 인원은 0→1→2로 바뀌고, 서로 다른 ID·상대 인물·걷기 전달·수동 네트워크 입력 0개를 확인했다. 정상 탭 종료 후 1명, 첫 화면 이동 후 0명으로 돌아왔다. 이번 정상 종료 관찰값은 73ms이며 보장 지연이 아니다. pageerror·console error는 없었다. [공개 기능 원본](../implementation/measurements/atlas-entry-eight-public.json), [두 방문자 화면](../implementation/measurements/atlas-entry-eight-public-two-visitors.png).
- 별도 프로토콜 클라이언트 9개를 공개 WSS에 동시에 연결했다. 8개만 입장하고 1개는 `full`로 거부됐다. 실제 첫 화면의 `입장하기 8/8` 버튼 비활성화와, 한 연결 정상 종료 후 `7/8`·재활성화를 확인했다. 감소 관찰값은 57ms다. 8대 실제 기기의 렌더링 시험은 아니다. [정원 검사 원본](../implementation/measurements/atlas-entry-eight-public-capacity.json), [만석 화면](../implementation/measurements/atlas-entry-eight-public-full.png).
- 첫 화면·인원 스크립트·공통 입장 스크립트·PlayCanvas HTML·릴리스·world·앱 JS·CSS 8개 파일의 HTTP 200 및 배포 파일과의 SHA-256 일치를 확인했다. [파일 검사 원본](../implementation/measurements/atlas-entry-eight-public-files.json).

시험 접속은 모두 종료했다. 공개 서버는 healthy·재시작 0회·정원 8명·입장 인원 0명을 확인했다. 이전 실패 원인은 확정하지 않았다. 같은 문서 묶음과 인원 표시 코드의 이번 게시 성공은 그 코드가 항상 게시를 실패시킨다는 설명을 뒷받침하지 않는다.
