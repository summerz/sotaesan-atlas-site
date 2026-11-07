# 4회차: 함께 공간에 들어오기

- 작성일: 2026-11-07
- 범위: 소규모 다중 접속 기능 구현과 배포 확인. 성능 비교·장시간 부하·iPhone 실기기 시험은 아니다.

## 구현과 이용 방법

[공유 사이트](https://sotaesan-atlas-test.summerz.net/)에서 현재 테스트에 입장한다. 기본은 혼자 탐색이다. ‘안내·조작’을 열고 사이트 입장 때와 같은 검토용 비밀번호로 ‘함께 입장’을 누른다. 다른 브라우저나 기기도 같은 방법으로 입장하면 최대 4명까지 함께 표시된다. ‘혼자 탐색’으로 나올 수 있다.

방문자는 임시 번호와 색 테두리 이름표로 구분한다. 위치·방향·대기·걷기·달리기·합장을 초당 10회 공유하고 수신 화면에서 위치와 방향을 보간한다. 기존 아바타 모델과 합장 자세를 재사용한다. 다른 방문자는 충돌체가 없는 시각적 인물이다.

NPC와 안내문 전달·소지는 각 방문자에게 독립적이다. 누군가 안내문을 받아도 다른 이용자의 안내문은 소진되지 않는다. 공유 NPC 차례·계정·채팅·영구 저장은 구현하지 않았다. 새로 입장하면 새 임시 ID가 생기며 번호는 재사용된다.

## 서버와 장애 처리

정적 앱은 GitHub Pages에 유지하고 `wss://atlas-ws.summerz.net/ws`로 접속한다. 기존 VPS에 별도 컨테이너 `sotaesan-atlas-realtime`을 추가했다. 호스트의 `127.0.0.1:8791`만 바인딩하고 전용 Caddy 설정으로 HTTPS/WSS를 제공한다. 기존 앱의 설정은 변경하지 않았다.

- 이미지: `sotaesan-atlas-realtime:2026-11-07`, linux/amd64.
- 상한: 메모리 256MiB, CPU 0.5개, 프로세스 64개, 읽기 전용 파일 시스템. 초기 운영 상한이며 부하 시험으로 정한 필요 용량은 아니다.
- 설치 직후 상태: healthy, 재시작 0회. 유휴 단발 표본 약 27.46MiB / CPU 0.57%. 4명 부하·장시간 안정성을 증명하지 않는다.
- 서버 비밀번호 재검증, 허용 Origin, 메시지 크기·빈도·접속 수 제한을 적용했다. 검토용 공통 비밀번호는 공개 문서에도 있으므로 개인 인증·비공개 서비스가 아니다.
- 좌표 이력을 파일이나 DB에 저장하지 않는다. 클라이언트가 보내는 좌표의 물리적 타당성을 서버가 판정하지 않는다.
- 연결이 끊기면 원격 인물을 지우고 단독 이동을 유지한다. 페이지 메모리의 비밀번호로 지연 재접속하며, 나가거나 페이지를 닫으면 비밀번호를 버린다.

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

서로 다른 실제 기기·외부 네트워크의 지연, 실제 4명 동시 사용, 장시간 접속, iPhone 사용성은 아직 판정하지 않았다. 이번 확인은 독립된 두 브라우저 컨텍스트의 기능 시험이다. 서버의 정원 4명은 구현한 제한이며 4명 실사용 검증 결과가 아니다.
