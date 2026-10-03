# iPhone에서 공간 분할과 시대 전환 확인

2026-10-03. `stream-era` 장면의 Three.js BVH·Three.js Rapier·PlayCanvas Ammo 구성을 iPhone 11 Safari에서 하나씩 실행했다. 세 구성 모두 기능 시험을 통과했다. 릴리스는 `local-4d5905679d2e-a07c1f72c5f1`이다.

## 시험 조건과 방법

- 기기: iPhone 11, iOS 27.0.1 (24A446), Safari 27.0.1, Apple GPU. OS 정보는 [기기 기록](measurements/2026-10-02/ios-browser.json)에 있다. UA의 `CPU iPhone OS 18_7`은 호환성 문자열이며 실제 OS 버전으로 사용하지 않았다.
- 화면: 375 × 616 CSS px, 앱 렌더링 DPR 1.5. 로컬 프로덕션 빌드와 기존 Safari 캐시를 사용했다. 첫 다운로드 시간이나 FPS 순위를 비교하는 시험이 아니다.
- 연결: USB Web Inspector → `pymobiledevice3` CDP 브리지 → Playwright MCP. iPhone IP만 허용하는 LAN 릴레이로 6173/6174를 앱의 5173/5174에 연결했다.
- 사용자가 승인한 프로젝트 Safari 탭 하나만 조작했다. Playwright의 별도 Chromium은 CDP 접속용이며 실제 렌더링과 상태 읽기는 iPhone Safari에서 수행했다. Chrome 확장은 사용하지 않았다.
- 입력: 캔버스에 합성 `TouchEvent`를 보내 이동·회전을 실행하고, 표시 가능한 버튼을 DOM `.click()`으로 열었다. 물리적 손가락 터치의 좌표 판정·스크롤·조작감 검증은 아니다.
- 본 시험은 구성당 약 28초, 보완 시험은 약 8~10초다. 오류 계측은 페이지 로딩 후 시험 시작 시점부터다. 장시간 안정성은 확인하지 않았다.

## 기능 결과

| 항목 | Three.js BVH | Three.js Rapier | PlayCanvas Ammo |
| --- | --- | --- | --- |
| 저해상도 준비, 정밀 구역 로딩 | 통과 | 통과 | 통과 |
| 시작 구역 → 먼 구역 → 시작 구역 왕복 | 통과 | 통과 | 통과 |
| 현재·과거 벽 교체, 이전 벽 충돌 제거 | 통과 | 통과 | 통과 |
| 시대 전환 6회, 이전 스트리머 논리 상태 정리 | 통과 | 통과 | 통과 |
| 시작점 시대별 설명, 과거 설명 이미지 로딩 | 통과 | 통과 | 통과 |
| 먼 구역 현재·과거 설명과 이미지 로딩 | 통과 | 통과 | 통과 |
| 합성 터치로 시선 회전 | 통과 | 통과 | 통과 |

본 시험은 구성마다 13개 상태를 기록했다. 정밀 구역은 `hall-chunk-0/1`에서 `hall-chunk-3/4`로 바뀌고, 돌아오면 다시 `hall-chunk-0/1`이 준비됐다. 매 상태에서 다섯 논리 구역이 정밀 또는 저해상도 표현으로 포함되고, 동일 구역의 두 표현이 동시에 표시되지 않는지 검사했다.

| 벽 앞 발 Z (m) | BVH | Rapier | Ammo |
| --- | ---: | ---: | ---: |
| 현재 | -6.600 | -6.590 | -6.600 |
| 과거 | -9.600 | -9.590 | -9.600 |

Rapier의 약 1 cm 차이는 접촉 여유를 포함한 결과다. 이 장면의 충돌은 공통 바닥과 시대별 시험 벽이다. 실제 건물의 계단·경사나 복잡한 구역별 충돌을 검증한 결과로 확대하지 않는다.

## 선택 로딩과 자원 기록

아래 점 수는 세 구성에서 같았다. 상주 수에는 표시에서 숨긴 저해상도 표현도 포함한다.

| 위치·시대 | 논리적 상주 점 수 | 표시 점 수 |
| --- | ---: | ---: |
| 시작점, 현재 | 391,703 | 361,532 |
| 시작점, 과거 | 371,840 | 341,669 |
| 먼 구역, 현재 | 420,320 | 387,288 |

관측된 스트리머의 최대 예약량은 정밀 499,714점, 저해상도 포함 589,715점, 정밀 구역 2개였다. 설정 한도인 정밀 750,000점·전체 850,000점·정밀 구역 3개 이내다. 마지막 현재 시대 스트리머는 왕복 중 `loads=5`, `unloads=3`을 기록했다.

시대 전환으로 종료된 스트리머는 `closed=true`, 상주 구역·점 수·진행 요청 0이었다. PlayCanvas 등록 자산 수는 시작·먼 구역·복귀의 세 확인 시점에 모두 50이었다. 본 시험의 계측 구간에서 세 구성 모두 런타임 오류·WebGL 컨텍스트 이벤트·화면 숨김 이벤트·낙하 복구 0, `blockedMs=0`을 기록했다.

이 값들은 앱의 논리 상태다. 실제 RAM·GPU 메모리 해제량, 순간 최대 메모리, 장시간 누수 없음의 증명이 아니다. `requestedBytes`도 자산 크기의 누적 카운터이며 캐시를 반영한 실제 네트워크 전송량이 아니다. 이번 모바일 시험에는 전체 SOG 요청 여부를 판단할 별도 네트워크 요청 로그를 수집하지 않았다.

## 시험 코드에서 보완한 부분

첫 시도는 없는 버튼 이름 `먼 현재 구역`을 사용했다. 두 번째 시도에서는 X 약 17 m에서 콘텐츠 데이터의 표시 조건을 만족해도 버튼이 화면에 나타나지 않았다. 이 둘은 앱 장애로 분류하지 않았다. [첫 이름 오류](measurements/2026-10-03/ios-stream-era-bvh-harness-error.json)와 [표시 조건 오류](measurements/2026-10-03/ios-stream-era-bvh-harness-visibility.json)를 보존했다.

본 시험에서는 먼 구역 콘텐츠의 소유권·시대 조건을 확인하고, 별도 보완 시험에서 X > 18 m의 버튼 앞까지 이동했다. 세 구성 모두 보이는 현재·과거 버튼으로 패널을 열고 이미지의 `complete`와 `naturalWidth > 0`을 확인했다. 이어 합성 오른쪽 터치로 회전값이 바뀌는지 검사하고 시작점으로 복귀했다.

## 증거와 재실행

| 구성 | 본 시험 JSON | 보완 시험 JSON | 본 시험 종료 화면 |
| --- | --- | --- | --- |
| Three.js BVH | [기록](measurements/2026-10-03/ios-stream-era-three.json) | [기록](measurements/2026-10-03/ios-stream-era-interaction-three.json) | [화면](measurements/2026-10-03/ios-stream-era-three.png) |
| Three.js Rapier | [기록](measurements/2026-10-03/ios-stream-era-three-rapier.json) | [기록](measurements/2026-10-03/ios-stream-era-interaction-three-rapier.json) | [화면](measurements/2026-10-03/ios-stream-era-three-rapier.png) |
| PlayCanvas Ammo | [기록](measurements/2026-10-03/ios-stream-era-playcanvas.json) | [기록](measurements/2026-10-03/ios-stream-era-interaction-playcanvas.json) | [화면](measurements/2026-10-03/ios-stream-era-playcanvas.png) |

[본 시험 함수](measurements/2026-10-03/ios-stream-era-probe.js), [보완 시험 함수](measurements/2026-10-03/ios-stream-era-interaction-probe.js), [CDP 상태 조회 콜백](measurements/2026-10-03/ios-stream-era-cdp-callback.js)을 보관한다. 브리지와 릴레이를 시작하고 승인한 Safari 탭에서 `scene=stream-era`를 연다. 해당 함수 소스를 `Runtime.evaluate`로 주입·호출한 뒤 `window.__atlasStreamEra` 또는 `window.__atlasStreamInteraction`을 읽는다. 보완 시험은 현재 시대에서 시작한다. 주소가 바뀌면 콜백의 허용 origin도 갱신해야 한다.

## 제한과 다음 작업

- 세로 화면의 진단 패널이 장면 대부분을 가린다. 실제 손가락 사용성 확인 전에 패널 접기와 이동 영역 확보가 필요하다.
- 작은 SH0 분할 시험의 성공은 400만 점 SH3 Sunnyvale 원본의 Three.js 해독 미완료 문제를 해결했다는 뜻이 아니다. [해독 대조 시험](MOBILE-DECODER-CONTROLS.md)의 위험은 유지한다.
- 지연 요청·HTTP 503·입력 차단·실패 복구는 [데스크톱 결합 시험](STREAMING-ERA.md)에서 확인했다. 이번 iPhone에는 장애를 주입하지 않았다.
- 물리적 손가락 조작, 장시간 유지, 실제 모바일 메모리, Android, 비공개 HTTPS 배포, 복잡한 충돌 메시의 구역별 로딩은 미검증이다.

다음 핵심 작업은 실제 장소 자료 한 구역에 **시각 자산과 충돌 메시의 분할·필요 로딩**을 함께 적용하고, 경계 이동·시대 교체·제작 및 수정 작업량을 확인하는 것이다. 현재 결과로 엔진 선택이나 전체 프로젝트 비용을 확정하지 않는다.
