# 공간 분할과 현재·과거 전환의 결합

2026-10-03. 릴리스 `local-4d5905679d2e-a07c1f72c5f1`의 로컬 프로덕션 빌드에서 검증했다. Playwright MCP의 headed Chromium으로 앱을 하나씩 열고 조작했으며 종료 후 브라우저를 닫았다. 이번 시험은 기능과 실패 복구 확인이며 FPS 순위 측정이 아니다.

## 구현 범위

`stream-era` 장면은 같은 다섯 구역에 현재·과거의 정밀 SOG와 저해상도 SOG를 각각 연결한다. 먼 구역은 저해상도로 유지하고 가까운 구역만 정밀 자산으로 교체한다. 시대를 바꾸면 해당 시대의 구역 자산·벽 충돌·핫스팟·설명을 함께 바꾼다.

전환 순서는 입력 차단과 패널 닫기 → 이전 구역 요청의 완료·정리 → 이전 자산 해제 → 대상 시대 준비 → 충돌과 위치 적용 → 입력 복귀다. 실패하면 이전 시대를 다시 준비하고 같은 위치로 복구한다. 새 벽에 겹치는 위치는 기존 안전 위치 정책을 사용한다. 두 시대를 동시에 표시하는 공간 크로스페이드는 구현하지 않았다.

| 자산 | 현재 | 과거 |
| --- | ---: | ---: |
| 정밀 점 수, 다섯 파일 합계 | 900,000 | 701,370 |
| 저해상도 점 수, 다섯 파일 합계 | 90,001 | 70,138 |
| 시작점에서 상주하는 점 수 | 391,703 | 371,840 |
| 시작점에서 표시하는 점 수 | 361,532 | 341,669 |

정밀 구역은 최대 3개·750,000점, 저해상도 포함 예약 예산은 850,000점이다. 저해상도 자산은 해당 시대의 다섯 구역 전체를 유지한다. 표시에서 숨긴 저해상도 점도 상주 합계에는 포함한다. 논리 구역은 5개, 두 시대와 두 해상도를 합친 SOG 객체는 20개다.

과거 자산은 기존 건물 일부를 제거한 **설명용 시험 자산**이다. 역사 복원 자료가 아니다. 생성 경로는 [`make-spatial-era.py`](../../scripts/make-spatial-era.py), 생성 결과·출처 해시는 [`spatial-historical.json`](../../shared/source/spatial-historical.json), 장면 데이터는 [`stream-era.json`](../../shared/public/world/stream-era.json)에 있다.

## 검증 결과

| 확인 항목 | Three.js BVH | Three.js Rapier | PlayCanvas Ammo |
| --- | --- | --- | --- |
| 시작 준비, 구역 이동·복귀, 예산 준수 | 통과 | 통과 | 통과 |
| 시대별 벽 정지, 이전 벽 충돌 제거 | 통과 | 통과 | 통과 |
| 시대별 핫스팟·설명 교체, 열린 패널 정리 | 통과 | 통과 | 통과 |
| 반복 전환, 종료된 구역 자원 정리 | 통과 | 통과 | 통과 |
| 충돌 면 표시 중 전환 후 촬영 장면 복귀 | 통과 | 통과 | 통과 |
| 이전 시대의 늦은 요청 결과 폐기 | 통과 | 통과 | 통과 |
| 대상 저해상도·정밀 자산 실패 후 복구·재시도 | 통과 | 통과 | 통과 |

정상 경로는 실제 W/D/R 키 입력과 버튼으로 실행했다. 현재 벽은 발 Z 약 -6.60 m, 과거 벽은 약 -9.60 m에서 이동을 막았다. Rapier는 접촉 여유 때문에 각각 약 -6.59/-9.59 m다. X 17 m 이상으로 이동한 뒤에도 시대별 구역 소유권과 설명 조건이 맞았다. 정상 경로마다 전환 6회, SOG 요청 54회였으며 전체 장면 SOG 요청은 없었다.

이전 시대의 `hall-chunk-2.sog` 응답을 보류하고 전환했다. 정리 단계에서 W 입력을 주어도 위치가 고정됐고, 이전 요청의 완료·폐기 전에는 과거 SOG 요청을 시작하지 않았다. 종료된 스트리머는 상주 점·구역·진행 요청이 모두 0이었다.

`past-far-0.sog`와 `past-chunk-0.sog`에 각각 HTTP 503을 주었다. 이전 시대의 위치·충돌·핫스팟을 복구했고 전환 성공 횟수를 올리지 않았다. 이전 설명을 다시 열 수 있었으며 장애를 제거한 뒤 재시도가 성공했다. 이 시험의 응답 지연과 오류는 의도적으로 주입했으므로 cold/warm 로딩 시간으로 사용하지 않는다.

최종 정상·실패 시험 모두 처리되지 않은 페이지 오류는 0개다. PlayCanvas의 실패 시험에는 주입한 503에 따른 네트워크·로더 오류 로그가 남는다. 정상 전환 3회의 PlayCanvas 등록 자산 수는 `[50, 50, 50]`으로 유지됐다. 이 값과 스트리머 정리 기록은 실제 RAM·GPU 메모리 해제 또는 장시간 누수 없음의 증명이 아니다.

## 발견해 수정한 문제

PlayCanvas 2.22.6의 unified GSplat 경로에서 전환 실패 후 자산을 즉시 파괴하면 이전 프레임의 placement 참조가 남아 `hasCenters`를 읽는 TypeError가 반복됐다. 앱에서 먼저 객체를 숨기고 렌더가 참조를 정리한 뒤 `postrender`에 객체·자산을 해제하도록 수정했다. 시대 교체는 이 정리까지 기다린다. 수정 후 같은 지연·실패 시험을 다시 실행해 페이지 오류 0개를 확인했다.

공통 스트리머에는 종료 후 진행 요청까지 기다리는 경로를 추가했다. 늦게 성공한 결과는 새 시대에 붙이지 않고 해제한다. PlayCanvas 로더의 늦은 콜백에도 중복 해제 방지를 적용했다.

## 근거

- 정상 경로: [BVH JSON](measurements/2026-10-03/stream-era-three.json), [Rapier JSON](measurements/2026-10-03/stream-era-three-rapier.json), [Ammo JSON](measurements/2026-10-03/stream-era-playcanvas.json), [실행 코드](measurements/2026-10-03/stream-era-driver.js).
- 지연·실패·복구: [BVH JSON](measurements/2026-10-03/stream-era-failure-three.json), [Rapier JSON](measurements/2026-10-03/stream-era-failure-three-rapier.json), [Ammo JSON](measurements/2026-10-03/stream-era-failure-playcanvas.json), [실행 코드](measurements/2026-10-03/stream-era-failure-driver.js).
- 화면: [Three.js 과거 설명](measurements/2026-10-03/stream-era-three-historical-panel.png), [PlayCanvas 과거 설명](measurements/2026-10-03/stream-era-playcanvas-historical-panel.png), [PlayCanvas 먼 구역 현재](measurements/2026-10-03/stream-era-playcanvas-far-current.png), [실패 후 이전 장면 복구](measurements/2026-10-03/stream-era-three-past-far-0.sog-rollback.png).
- 후속 실기기: [iPhone 분할·시대 전환 결과](MOBILE-STREAMING-ERA.md). 세 구성의 구역 왕복·시대별 충돌·설명·합성 터치 회전을 확인했다.

`pnpm check`는 자산 30개의 크기·해시, 자동 검사 61개, 타입 검사와 두 앱 빌드·배포 목록 검증을 통과했다. 추가 검사는 시대별 구역 참조·해상도 짝·좌표·예산 검증과 종료 후 정밀·저해상도 결과 정리를 포함한다.

## 제한과 다음 확인

- 충돌은 작은 공통 바닥과 시대별 시험 벽을 미리 준비한다. 복잡한 충돌 메시의 구역별 로딩과 시대별 지형 교체는 미검증이다.
- 한 시대를 정리한 뒤 다음 시대를 준비하므로 대기 시간이 생긴다. 다운로드·해독의 물리적 취소와 순간 최대 RAM·GPU 메모리는 확인하지 않았다.
- 저해상도 전체 상주 비용은 큰 장소에서 다시 판단해야 한다. 정밀 교체의 선명도 변화, 촬영 누락과 검은 배경도 남아 있다.
- iPhone 분할 장면의 준비·이동·시대 교체와 합성 터치 회전은 통과했다. 물리적 손가락 사용성·모바일 메모리·장시간 유지는 남아 있다. 다음은 실제 장소 한 구역의 시각·충돌 분할과 제작 작업량 확인이다. 현재 결과로 엔진을 확정하지 않는다.

## 직접 확인

`./dev.sh --preview both` 실행 후 장면 메뉴의 `구역별 현재·과거 · 결합 시험`을 선택한다. 시작점에서 설명을 연 뒤 시대를 바꾸고, D/A로 구역을 왕복하며 같은 조작을 반복한다. 벽 충돌은 W, 시작점 복귀는 R로 확인한다.

- [Three.js BVH](http://127.0.0.1:5173/?scene=stream-era&controller=bvh)
- [Three.js Rapier](http://127.0.0.1:5173/?scene=stream-era&controller=rapier)
- [PlayCanvas](http://127.0.0.1:5174/?scene=stream-era)
