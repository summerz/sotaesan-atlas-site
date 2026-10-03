# 10분 반복 조작 안정성 비교

## 결과

2026-10-02 별도 headed Chromium에서 Three.js BVH·Rapier와 PlayCanvas Ammo를 한 앱씩 시험했다. 구현별 약 10분의 측정 구간 동안 WASD 이동, 설명 패널, 현재/과거 전환, 충돌 면 표시를 반복했다. **세 구현 모두 이 시나리오에서 앱 예외나 WebGL context loss가 관찰되지 않았다.**

| 구현 | 측정 시간 | 프레임 간격 p95 | p99 | 최댓값 |
| --- | ---: | ---: | ---: | ---: |
| Three.js BVH | 599.94초 | 17.4 ms | 17.6 ms | 50.2 ms |
| Three.js Rapier | 599.90초 | 17.4 ms | 17.6 ms | 17.8 ms |
| PlayCanvas Ammo | 599.93초 | 17.4 ms | 17.7 ms | 33.7 ms |

p95·p99는 각 구현의 20개 측정 구간에서 얻은 전체 rAF 간격을 합쳐 계산했다. 모두 약 60 FPS 부근이며 이 시험만으로 처리 여력이나 최종 엔진의 우열을 정할 수 없다. 최댓값은 단일 프레임의 관찰값이며 반복 측정에 의한 대표값이 아니다.

## 조건과 실제 조작

- 릴리스: `local-4d5905679d2e-6df18be3ac38`. 앞선 로딩·짧은 전환 시험의 릴리스와 구분한다.
- Playwright MCP, Chromium 154, Apple M4 Pro. WebGL renderer는 `ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Pro, Unspecified Version)`.
- viewport 1200×863 CSS px, 기기 DPR 2, 앱 렌더링 DPR 1.5. 한 앱·한 탭이며 측정 중 숨김/포커스 상실 프레임은 0이었다.
- Knock Hall: 현재 SOG 900,000개, 과거 SOG 701,370개, 충돌 메시 24삼각형. Sunnyvale의 337,680삼각형 충돌 시험과 합산하지 않는다.
- 구현마다 30초 측정 구간 20회. 각 구간에서 시작점 복귀, 설명 패널 열기/닫기, W·D·S·A 각각 2.5초 유지, 현재→과거→현재 전환을 수행했다. 5회마다 충돌 면 표시/복귀도 확인했다.
- 구현마다 이동 입력 80회(총 200초), 패널 왕복 20회, 시대 전환 40회, 충돌 면 표시 왕복 4회. 위치 JSON으로 이동 전후 좌표와 전환 후 상태를 기록했다.
- GC와 페이지/worker 메모리 조회는 프레임 측정 구간 밖에서 수행했다. 시작과 4·8·12·16·20회 후 표본을 남겼다.
- BVH→Rapier→Ammo 순서로 각 1회 실행했다. 캐시를 초기화하지 않았으므로 cold 로딩 비교가 아니다.

전체 경과 시간은 BVH 622.62초, Rapier 622.82초, Ammo 699.21초다. 조작·GC·도구 호출 간 간격이 포함되며 Ammo에는 도구 호출 사이의 추가 대기가 있었다. 위 프레임 통계는 실제 측정한 약 600초만 사용했다. 전체 경과 시간으로 엔진 속도를 비교하지 않는다.

## 오류와 메모리

세 구현의 `error`·`unhandledrejection`·앱 진단 오류·`webglcontextlost`·`webglcontextrestored` 기록은 비어 있었다. PlayCanvas 최초 로드의 콘솔에는 `favicon.ico` 404가 있었다. 앱 실패와 구분하며 콘솔 오류가 전혀 없었다고 표현하지 않는다.

| 구현 | 메인 JS heap: 시작 → 마지막 | 메인 backing storage: 시작 → 마지막 | 조회한 worker 수 |
| --- | ---: | ---: | ---: |
| Three.js BVH | 8.28 → 9.82 MiB | 24.2045 → 24.2049 MiB | 3 → 3 |
| Three.js Rapier | 12.78 → 10.47 MiB | 28.3405 → 28.3407 MiB | 3 → 3 |
| PlayCanvas Ammo | 9.21 → 11.41 MiB | 17.1422 → 17.1809 MiB | 1 → 1 |

값은 GC 이후 CDP `Runtime.getHeapUsage`다. Rapier heap은 4회 후 13.80 MiB에서 8회 후 10.08 MiB로 낮아졌고 이후 소폭 증가했다. 내려간 원인은 확정하지 않았다. Three.js worker heap은 개별 약 0.44–0.53 MiB 범위였다. Ammo의 worker는 약 0.29 MiB와 backing storage 18.17 MiB를 유지했지만 처음과 마지막 worker URL은 달랐다. 같은 worker 인스턴스가 계속 유지됐다는 뜻은 아니다.

메인 backing storage는 큰 증가가 없었으나 BVH·Ammo의 JS heap은 늘었다. 앱의 누적 `frameMs` 배열과 측정 기록도 실행 중 쌓인다. 이 영향과 자산 캐시·기타 객체를 분리하지 않았으므로 증가분을 모두 누수 또는 모두 정상이라고 단정하지 않는다. 공유 버퍼의 중복 계측 가능성이 있어 페이지와 worker의 backing storage를 합쳐 물리 RAM으로 표시하지 않는다. GPU/VRAM은 측정하지 않았다.

## 아직 확인하지 않은 범위

이 결과는 단순 충돌 장면에서 반복 조작을 유지한 시험이다. Sunnyvale의 계단·벤치·급경사·낙하/복귀, 앱을 백그라운드로 보냈다가 돌아오는 동작, 모바일 장시간 유지, 실제 과거 건물 자산은 별도 확인이 필요하다. 한 실행에서 context loss가 발생하지 않았다는 결과가 context loss 후 복구를 검증한 것은 아니다.

데스크톱에서 로딩·보행 비용·반복 조작 자료는 확보했다. 후속 [iPhone 11 Safari 비교](MOBILE-COMPARISON.md)에서 정지·합성 터치 이동의 프레임 간격과 처리 시간을 측정했다. 실제 손가락 조작·화면 회전과 모바일 10분 유지 시험은 남아 있다. Android 결과가 없으므로 iPhone 결과를 전체 모바일에 일반화하지 않는다.

## 근거와 재실행

- [전체 원본과 요약](measurements/2026-10-02/stability-browser.json): 각 구간의 프레임 간격, 위치 JSON, 실제 조작, 오류, GC 전후 메모리.
- [MCP 콜백](measurements/2026-10-02/playwright-stability.mjs): `prepare(page)` 후 `chunk(page, {cycle, durationMs: 30000})`를 20회 호출한다. 단독 CLI 실행기가 아니다.
- 종료 화면: [BVH](measurements/2026-10-02/three-bvh-final.png), [Rapier](measurements/2026-10-02/three-rapier-final.png), [Ammo](measurements/2026-10-02/playcanvas-ammo-final.png).
- 함께 읽을 자료: [보행 처리 비용](PHYSICS-COST-COMPARISON.md), [초기 로딩·전환·메모리](LOADING-MEMORY-COMPARISON.md).

`./dev.sh --preview both`로 서버를 준비하고 별도 headed 브라우저에서 `http://127.0.0.1:5173/?controller=bvh`, `http://127.0.0.1:5173/?controller=rapier`, `http://127.0.0.1:5174/`를 한 번에 하나씩 연다. 준비 표시·릴리스·GPU·탭 수·가시성을 확인하고 실행한다. 테스트 브라우저는 종료했다. 사용자 개발 서버는 유지했다.
