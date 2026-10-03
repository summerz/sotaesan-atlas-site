# 초기 로딩·시대 전환·메모리 비교

## 현재 결론

2026-10-02 Playwright MCP의 별도 headed Chromium에서 Three.js BVH·Rapier와 PlayCanvas Ammo를 직접 측정했다. Sunnyvale의 cold/warm 로딩은 각각 3회씩 총 18회, Knock Hall의 현재→과거→현재 전환은 구현별 왕복 20회씩 총 120회 완료했다.

현재 구현과 이 데스크톱에서는 **PlayCanvas의 장면 준비가 가장 빨랐다**. Three.js에 Rapier를 추가하면 BVH만 사용하는 경우보다 초기화·다운로드·관찰된 메모리 비용이 늘었다. 전환 후 큰 버퍼와 worker 수는 안정적이었지만 JS heap은 조금씩 증가했다. 후속 [10분 반복 조작 시험](STABILITY-COMPARISON.md)과 [iPhone 비교](MOBILE-COMPARISON.md)는 별도 릴리스에서 수행했다. GPU·실기기 메모리를 측정하지 않았으므로 총 메모리 순위나 누수 없음, 최종 엔진 선택을 확정하지 않는다.

보행 계산과 프레임 성능은 [보행 처리 비용 비교](PHYSICS-COST-COMPARISON.md)에 있다. 이번 로딩·전환 자료와 앞선 보행 통계를 하나의 실행으로 합산하지 않는다.

## 환경과 측정 범위

- Apple M4 Pro, Darwin 25.6.0, Chromium 154, 별도 Playwright 프로필.
- WebGL renderer: `ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Pro, Unspecified Version)`. SwiftShader가 아닌 하드웨어 GPU를 확인했다.
- 앱·탭 하나씩 실행, viewport 1200×863, 기기 DPR 2, 앱 렌더링 DPR 상한 1.5, 안티앨리어싱 끔. 표본 수집 시 화면이 보이고 포커스가 있었다.
- 성능 측정 릴리스: `local-4d5905679d2e-5135b39646a7`. 아래 버튼 수정 검증은 새 릴리스이며 성능 반복에 포함하지 않았다.
- 로딩은 Sunnyvale, 전환은 Knock Hall이다. Sunnyvale에는 과거 레이어가 없으므로 두 장면의 메모리 숫자를 직접 비교하지 않는다.
- 브라우저 시험을 종료했다. 사용자가 실행한 5173·5174 서버는 유지했다.

### 로딩 조건

Sunnyvale의 동일 SOG 3,999,361개, 58,072,500바이트와 충돌 GLB 337,680삼각형, 6,180,504바이트를 사용했다. 해시와 컨트롤러·엔진 설정은 각 원본의 위치 JSON에 보관했다.

각 구현에서 cold→warm 세 쌍을 실행했다. cold는 **브라우저 HTTP 캐시만** 지우며 OS 파일 캐시·DNS·GPU·브라우저 프로세스를 매회 초기화하지 않는다. warm은 HTTP 캐시를 유지한 재접속이다. 신규 기기의 첫 방문이나 원격 배포 속도를 재현한 값은 아니다.

요청 가로채기를 사용하지 않았다. CDP Network로 페이지와 dedicated worker의 HTTP `encodedDataLength`를 기록했다. Three.js SOG 요청은 worker에서 발생하므로 페이지의 Resource Timing만 보면 전송량이 빠진다. worker에 Network 계측을 연결할 때 시작을 잠시 멈췄다가 재개했으며, 이 계측 비용이 포함된다. worker 요청을 놓친 예비 한 쌍은 제외했다.

준비 시간은 navigation 이후 앱의 `firstSceneReady` 표시까지다. GPU가 첫 화면을 실제 표시한 시각은 아니다. 준비 후 3초 기다리고 GC를 요청한 뒤 페이지와 worker의 heap을 각각 읽었다. 실제 이용자의 자연스러운 GC 주기·최대 메모리와는 다르다.

## Sunnyvale 초기 로딩

각 값은 3회 중앙값이다. MB는 1,000,000바이트다.

| 항목 | Three.js BVH | Three.js Rapier | PlayCanvas Ammo |
| --- | ---: | ---: | ---: |
| cold 장면 준비 | 2,784.2 ms | 3,008.5 ms | 1,559.9 ms |
| warm 장면 준비 | 1,742.0 ms | 2,021.4 ms | 766.9 ms |
| cold 컨트롤러 생성 | 105.0 ms | 443.2 ms | 328.2 ms |
| warm 컨트롤러 생성 | 95.6 ms | 381.4 ms | 327.4 ms |
| cold HTTP 전송량 | 65.34 MB | 66.98 MB | 65.58 MB |
| warm HTTP 전송량 | 1,120 B | 1,299 B | 1,374 B |

warm에서도 preview 서버의 캐시 재검증 응답 헤더 등이 전송된다. 전송량은 HTTP 계측값이며 자산 파일 크기 합계나 압축된 상용 CDN의 예상 트래픽이 아니다. cold 준비 시간 범위는 BVH 2,600.6–2,888.4ms, Rapier 2,883.5–3,235.3ms, Ammo 1,497.2–1,569.5ms였다.

컨트롤러 생성 표시의 포함 범위도 다르다. Three.js Rapier는 BVH 생성과 Rapier import/WASM 준비를 포함한다. PlayCanvas는 자산 로드 후 물리 객체를 만들며 Ammo 모듈 초기화는 그 이전의 별도 구간이다. Ammo 모듈 초기화 중앙값은 cold 16.7ms, warm 17.2ms였다. `assetsLoaded` 표시의 위치도 앱마다 달라 이를 동일한 디코딩 완료 시각으로 간주하지 않는다. 컨트롤러 생성 숫자만으로 라이브러리의 초기화 순위를 정하지 않는다.

### 준비 후 메모리 관찰

warm 3회 중앙값, GC 이후다. CDP의 `usedSize`는 JS heap, `backingStorageSize`는 ArrayBuffer·WASM 등 backing storage로 따로 기록한다.

| 항목 | Three.js BVH | Three.js Rapier | PlayCanvas Ammo |
| --- | ---: | ---: | ---: |
| 메인 JS heap | 7.43 MB | 12.34 MB | 8.46 MB |
| 메인 backing storage | 269.19 MB | 279.71 MB | 79.40 MB |
| worker 수 | 3 | 3 | 1 |
| worker JS heap 합계 | 1.46 MB | 1.46 MB | 0.30 MB |
| worker별 backing storage | 각각 약 0.053 MB | 각각 약 0.053 MB | 84.19 MB |

동일한 Three.js 구현에서 Rapier 선택 시 메인 JS heap은 약 **4.91MB**, 메인 backing storage는 약 **10.52MB**, cold HTTP 전송량은 약 **1.65MB** 더 컸다. warm 장면 준비도 약 279ms 더 걸렸다. 현재 Rapier 경로는 가림 검사·충돌 면 표시용 BVH를 유지한다. 이 차이는 그 조합의 관찰값이며 Rapier 단독 라이브러리의 고유 비용은 아니다.

**페이지와 worker의 backing storage를 더해 물리 메모리 총량으로 표시하지 않는다.** 공유 버퍼가 중복 계측될 수 있으며 GPU 텍스처·VRAM·native 할당 전체를 측정하지 않았다. 따라서 PlayCanvas 메인 backing storage가 작다는 사실만으로 전체 RAM이나 VRAM도 더 작다고 결론 내리지 않는다. 일부 회차의 OS RSS는 원본에 참고로 남겼지만 브라우저 전체 프로세스·압축 메모리가 섞이고 표본 수도 달라 순위 판정에 사용하지 않았다.

시각 근거: [Sunnyvale 로딩 완료](measurements/2026-10-02/loading-playcanvas-ready.png).

## Knock Hall 반복 시대 전환

현재 900,000개 SOG 11,543,748바이트와 과거 시험용 701,370개 SOG 8,993,099바이트를 사용했다. 과거는 역사 복원이 아닌 전환 시험용 예시이며 충돌 메시는 단순한 24삼각형 프록시다. Sunnyvale의 복잡한 충돌 메시 교체 비용을 대신하는 시험은 아니다.

구현별 한 연속 실행에서 왕복 20회, 즉 40회 전환했다. 0·1·5·10·20회 왕복 후 현재 레이어에서 3초 안정화와 GC 이후 값을 기록했다. HTTP 캐시는 유지했다. 각 실행은 약 25–38초이며, 10분 탐색이나 여러 독립 실행의 반복 시험이 아니다.

### GC 후 메인 JS heap

단위 MB. 각 구현의 한 실행을 순서대로 관찰한 값이다.

| 완료 왕복 | Three.js BVH | Three.js Rapier | PlayCanvas Ammo |
| --- | ---: | ---: | ---: |
| 0 | 7.379 | 13.142 | 9.394 |
| 1 | 8.334 | 13.447 | 9.939 |
| 5 | 9.130 | 14.173 | 10.910 |
| 10 | 9.388 | 14.440 | 11.152 |
| 20 | 9.476 | 14.550 | 11.271 |

메인 backing storage는 BVH 약 25.38MB, Rapier 약 29.72MB, Ammo 약 18.00MB로 유지됐다. worker 수는 3·3·1로 유지됐으며 worker backing storage도 Three.js는 각각 약 0.053MB, PlayCanvas는 약 19.05MB로 안정적이었다. 120회 전환 중 앱 진단 오류는 없었다.

JS heap은 초기 증가 후 증가 폭이 작아졌지만 10→20회에서도 각각 약 88·110·119KB 늘었다. 앱 진단의 `frameMs` 배열은 계속 늘어나고 엔진 캐시 준비도 영향을 준다. 실행 시간·누적 프레임 수가 다르므로 구현별 heap 증가를 그대로 누수율로 비교하지 않는다. heap 객체 차이 분석이 없으므로 증가 원인이나 누수 유무는 확정하지 않았다. 큰 자산 버퍼·worker가 전환마다 누적되는 징후는 이번 짧은 관찰에서는 없었다.

### 전환 시간 관찰

단위 ms. Playwright 클릭 요청 전부터 앱 `switchDone` 표시까지이며 클릭 전달 비용을 포함한다. 첫 표시 프레임은 측정하지 않았다. 첫 전환은 이미 warm 캐시인 한 번의 관찰이고, 반복 값은 2–20번째 왕복의 방향별 19회 중앙값이다.

| 전환 | Three.js BVH | Three.js Rapier | PlayCanvas Ammo |
| --- | ---: | ---: | ---: |
| 첫 과거 보기 | 189.0 | 171.6 | 290.8 |
| 첫 현재 복귀 | 194.6 | 193.6 | 129.5 |
| 반복 과거 보기 | 166.3 | 166.6 | 99.1 |
| 반복 현재 복귀 | 194.0 | 192.7 | 114.3 |

이번 시험에서는 반복 전환의 관찰 시간이 PlayCanvas에서 짧았다. 한 실행·단순 충돌 메시·warm 캐시 조건이며 실제 과거 건물 자산이나 첫 cold 전환의 성능 순위를 확정하는 자료는 아니다.

## 발견한 버튼 오류와 수정

시대 전환이 끝나도 ‘충돌 면 보기’와 ‘위치 JSON 저장’이 비활성 상태로 남았다. 두 앱이 전환 완료 시 시대 버튼만 복구하고 공통 UI의 전환 상태를 해제하지 않았기 때문이다.

두 앱에서 사용 가능한 레이어가 복구되면 `setSwitching(false)`를 호출하고 비교 경로 버튼의 가능 여부도 다시 적용했다. 공통 UI는 전환 완료 시 장면 설명을 지우지 않도록 수정했다. 이동·물리 계산은 변경하지 않았다.

성능 원본의 전환 이후 위치 JSON은 이 오류 때문에 `null`이다. 초기 표본의 자산·릴리스 정보, 앱 진단·전환 완료 표시와 현재/과거 버튼 상태를 기록했다. 수정 후 기록을 원래 성능 표본에 끼워 넣지 않았다.

`pnpm check`의 스크립트 테스트 10개·공용 테스트 11개·Three.js 테스트 17개, 타입 검사·자산 해시·두 앱 빌드 검사를 통과했다. 새 릴리스 `local-4d5905679d2e-6df18be3ac38`를 Playwright로 열어 세 구현 모두 현재→과거→현재 후 위치 JSON 저장과 충돌 면 표시/복귀를 확인했다. 앱 진단 오류는 없었고 일부 최초 로드의 favicon 404는 있었다.

검증 원본: [era-ui-verification.json](measurements/2026-10-02/era-ui-verification.json), [수정 후 현재 장면](measurements/2026-10-02/era-ui-fixed.png).

## 근거와 재실행

- [loading-browser.json](measurements/2026-10-02/loading-browser.json): 18회 로딩·페이지/worker 네트워크·GC 전후 메모리·환경·위치 JSON·요약.
- [era-memory-browser.json](measurements/2026-10-02/era-memory-browser.json): 15개 메모리 표본·120개 전환 시간·worker와 앱 상태. 원본 summary의 방향 혼합 `median`은 정렬한 40개 중 상위 중앙값이며, 본문은 방향별 19개 중앙값을 별도로 계산했다.
- [playwright-loading.mjs](measurements/2026-10-02/playwright-loading.mjs)의 `measureLoading(page, {url, repeat})`와 [playwright-era-memory.mjs](measurements/2026-10-02/playwright-era-memory.mjs)의 `measureEra(page, {roundTrips, completedBefore})`는 MCP `browser_run_code_unsafe`에서 사용하는 콜백 본문이다. CLI 브라우저 실행기가 아니다.

`pnpm check`와 `./dev.sh --preview both` 후 별도 headed 브라우저에서 한 앱씩 연다. 로딩 URL은 `http://127.0.0.1:5173/?scene=sunnyvale&controller=bvh`, 같은 주소의 `controller=rapier`, `http://127.0.0.1:5174/?scene=sunnyvale`다. 전환은 `scene=sunnyvale`을 빼고 Knock Hall에서 실행한다. GPU·단일 탭·새 릴리스·포커스를 먼저 확인한다. 절차는 [AGENTS.md](../../AGENTS.md)에 있다.

## 남은 판단 자료

1. Knock Hall의 10분 반복 이동·패널·전환 시험은 세 구현 모두 완료했다: [안정성 비교](STABILITY-COMPARISON.md). Sunnyvale의 추락·복귀와 백그라운드/탭 복귀, context loss 후 복구는 별도 확인한다. heap 증가 원인이 필요하면 진단 배열을 구분해 객체 차이를 조사한다.
2. iPhone의 정지·합성 이동 프레임 측정은 완료했다. 이동은 바닥 이탈과 서로 다른 복구 경로 때문에 동등한 보행 비교로 사용하지 않는다. 실제 손가락 조작·회전, 모바일 메모리와 Android·실제 배포 네트워크를 추가 확인한다. Three.js BVH 구성의 iPhone Sunnyvale 로딩 실패를 해결해야 한다. Rapier 구성의 대형 장면은 별도로 측정하지 않았다. Mac 결과로 모바일 여력을 예측하지 않는다.
3. 동일한 계단·경사·낙하 정책과 상호작용을 구현·변경하는 작업량을 비교한다. 에디터 저작과 배포 의존성·비용도 선택 근거에 포함한다.

현 단계에서는 이동감이 비슷한 상황에서 PlayCanvas의 로딩 이점이 확인됐다. Rapier는 자동 턱 오르기 등 보행 정책을 제공하지만 현재 BVH와 함께 유지하는 비용이 있다. 이 결과와 아직 남은 실기기·운영·변경 작업 자료를 합쳐 최종 엔진을 선택한다.
