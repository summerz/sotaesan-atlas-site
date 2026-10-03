# iPhone 11 모바일 비교

## 확인된 결과

2026-10-02 USB로 연결한 실제 iPhone 11 Safari에서 Playwright MCP와 Web Inspector CDP bridge로 시험했다. 작은 공통 장면에서는 세 구현 모두 열렸고, 정지 상태 p95 프레임 간격은 PlayCanvas 52ms, Three.js BVH 65ms, Rapier 78ms였다. 이 조건에서 PlayCanvas의 프레임 간격이 더 짧았다. 모바일의 최종 엔진 선택을 확정하는 결과는 아니다.

이동 시험에서는 세 구현 모두 시험용 충돌 바닥 밖으로 나갔다. Three.js는 자동 낙하 복구가 작동했지만 PlayCanvas는 계속 떨어졌다. **PlayCanvas 이동 수치는 정상 보행 비교에서 제외한다.** Three.js의 이동 수치도 복구 횟수와 실제 경로가 달라 동등한 작업량의 비교로 사용하지 않는다.

큰 Sunnyvale 장면은 PlayCanvas에서 두 차례 준비 완료를 확인했다. Three.js BVH에서는 준비가 끝나지 않았다. 모바일에서 해결할 우선 과제는 대형 SOG 로딩 실패 처리와 바닥 밖 낙하 복구, 작은 화면의 조작 UI다.

## 시험 조건

| 항목 | 조건 |
| --- | --- |
| 기기 | 물리 iPhone 11, 기기 조회 iOS 27.0.1 / 24A446 |
| 브라우저 | Safari / WebKit, UA의 Safari 버전 27.0.1 |
| GPU | Apple GPU, WebGL 2.0 |
| 화면 | 세로 375×616 CSS px, 기기 DPR 2 |
| 앱 렌더링 | DPR 상한 1.5, drawing buffer 562×924 |
| 릴리스 | `local-4d5905679d2e-6df18be3ac38` |
| 공통 장면 | Knock Hall, 900,000 Gaussian SOG, 수동 프록시 충돌 24삼각형 |
| 실행 | 한 Safari 시험 탭에서 BVH → Rapier → PlayCanvas 순서 |
| 반복 | 구현마다 정지 30초×3회, 이동 30초×3회 |
| 입력 | canvas에 합성 DOM TouchEvent, 실제 손가락 입력 아님 |

Mac의 로컬 preview 서버를 iPhone IP `192.168.1.119`만 허용하는 임시 relay로 전달했다. 6173은 5173, 6174는 5174로 연결했다. Chrome 확장이나 사용자 Chrome은 사용하지 않았다.

모든 측정에서 `document.hidden=false`였고 숨김 프레임과 visibility 변경은 없었다. 그러나 `document.hasFocus()=false`가 계속 보고됐다. 포커스가 확보된 시험이라고 표현하지 않는다. 원격 디버거가 연결된 상태이며, 온도·배터리 상태·실행 순서·캐시는 통제하지 않았다. OS 버전은 기기 조회를 사용했다. UA의 `OS 18_7`과 bridge가 제공하는 가상 Chromium/V8 식별자는 실제 OS나 렌더러 버전으로 사용하지 않는다.

## 정지 상태 측정

각 구현의 30초 구간 3개에서 수집한 requestAnimationFrame 간격을 합쳐 계산했다. 구간별 p95의 평균이나 중앙값이 아니다. p95가 작을수록 긴 프레임 지연이 짧다. 앱 준비 표시는 GPU 첫 표시 완료 시간과 다르다.

| 구현 | 프레임 수 | 평균 간격 ms | p95 ms | p99 ms | 구간별 p95 ms |
| --- | ---: | ---: | ---: | ---: | --- |
| Three.js BVH | 1,509 | 59.53 | 65 | 68 | 67 / 65 / 64 |
| Three.js Rapier | 1,540 | 58.39 | 78 | 81 | 58 / 81 / 61 |
| PlayCanvas Ammo | 2,242 | 40.09 | 52 | 55 | 54 / 49 / 49 |

Rapier의 두 번째 정지 구간은 다른 두 구간보다 느렸다. 순서 교대·온도 통제가 없는 세 반복으로 이 차이를 물리 엔진만의 영향이라고 단정할 수 없다.

### 정지 상태 처리 시간

각 구간의 `walkingTimings.totalMs` 증가분을 실제 측정 경과 초로 나눴다. 호출당 시간은 같은 증가분을 호출 수로 나눴다.

| 구현 | 계측 경과 ms / 실제 1초 | 호출당 평균 ms | 포함 범위 |
| --- | ---: | ---: | --- |
| Three.js BVH | 52.14 | 3.10 | 앱 보행 step |
| Three.js Rapier | 124.58 | 7.27 | 앱 보행 step 및 연결된 Rapier 처리 |
| PlayCanvas Ammo | 61.13 | 2.45 | PlayCanvas rigidbody system step |

이는 계측 함수 안에서 흐른 시간이며 **프로세스 CPU 사용률·배터리 소모·물리 엔진만의 비용이 아니다**. PlayCanvas는 전체 rigidbody system, Three.js는 앱 보행 step을 계측하므로 포함 범위가 다르다. Safari 시간 표본은 원본에서 1ms 단위로 나타나 작은 호출의 오차도 고려해야 한다.

## 이동 시험에서 발견한 문제

매번 시작점으로 복귀하고 1.5초 대기한 뒤, 전진·오른쪽·후진·왼쪽을 각 7.5초씩 입력했다. 동일한 입력 순서가 동일한 이동 경로를 보장하지 않는다. 이 장면의 프록시 바닥은 촬영 장면 전체를 덮지 않는다.

| 구현 | 원본 이동 p95 ms | 관찰 | 성능 비교 판정 |
| --- | ---: | --- | --- |
| Three.js BVH | 60 | 전체 시험 종료 시 자동 복구 누적 4회 | 경로·복구가 달라 동등 비교에 사용하지 않음 |
| Three.js Rapier | 62 | 전체 시험 종료 시 자동 복구 누적 15회 | 경로·복구가 달라 동등 비교에 사용하지 않음 |
| PlayCanvas Ammo | 43 | 각 30초 종료 발 높이 약 −1,075 / −1,024 / −1,007m | 정상 이동 비교에서 제외 |

PlayCanvas는 후진 구간부터 바닥 밖으로 떨어졌고 마지막 구간까지 낙하했다. 카메라도 장면에서 멀어지므로 렌더링과 접촉 작업량이 줄어들 수 있다. 따라서 43ms를 PlayCanvas 정상 이동 성능으로 인용하면 안 된다. 시작점 버튼으로는 복귀했다. 이 측정 릴리스에는 수동 복귀만 있었고 자동 낙하 복구는 없었다. 이후 수정은 아래 기능 검증에 기록했다.

측정 구간에서 세 구현 모두 수집된 페이지 예외·unhandled rejection·WebGL context loss는 없었다. 이는 이동이 정상이라는 뜻이 아니다. 좌표를 확인해야 위의 실패를 찾을 수 있었다.

후속 이동 비교는 바닥 안의 짧은 왕복이나 고정 외벽 밀기로 제한하고, 접촉·좌표·복구 횟수를 검증한 뒤 수행한다. 자동 낙하 복구를 추가한 릴리스의 모바일 성능은 다시 측정해야 하며 기존 표본에 합치지 않는다.

## 큰 장면: Sunnyvale

3,999,361 Gaussian SOG, 충돌 메시 337,680삼각형 장면을 별도로 열었다. 아래 관찰은 캐시를 초기화한 cold/warm 로딩 비교가 아니다.

- **PlayCanvas:** 두 번 준비 완료. 앱 `firstSceneReady` 표시는 각각 약 14.97초와 19.11초였다. 두 번째 로딩에서는 `worldLoaded=250ms`, `assetsLoaded=4,224ms`였다. 첫 실행의 탐색용 프레임 기록에는 약 1.57초 지연도 있으므로 준비 성공만으로 부드러운 탐색을 보장하지 않는다.
- **Three.js BVH + Spark:** 반복 관찰 중 준비 완료에 도달하지 않았다. worker 진단에서 입력 58,072,500바이트 로드와 일반적인 `Script error.`를 확인했지만 decode 결과는 없었다. 관찰 사이 `timeOrigin`이 바뀐 경우도 있었다. WebContent 재시작·메모리 부족 등 구체적 원인은 확인하지 못했다.
- **Three.js Rapier + Sunnyvale:** 별도 대형 장면 실행은 측정하지 않았다. BVH 실패는 보행 컨트롤러 준비 전 자산 로딩 단계에서 관찰됐다. 공유 로더 문제일 가능성이 있지만 Rapier의 실측 실패로 표현하지 않는다.

진단 로딩에만 `probe=worker`를 주입했다. 작은 장면 성능 측정에는 이를 사용하지 않았다. Spark worker의 실패가 로딩 대기를 끝내지 못하는 경로에 앱의 시간 제한과 새 페이지 재시도를 추가했다. 아래 기능 검증은 실패 대응을 확인한 것이며 iPhone 대형 장면의 디코딩 원인과 자산 처리 전략은 추가 조사가 필요하다. 메모리 부족을 확정 원인으로 기록하지 않는다.

## 수정 후 기능 검증

릴리스 `local-4d5905679d2e-882e63d01db8`에서 두 가지 실패 대응을 추가했다. 별도 headed Chromium과 Playwright MCP로 검증했으며 GPU는 Apple M4 Pro의 ANGLE Metal이었다. **데스크톱 기능 검증이며 iPhone 성능 재측정이 아니다.**

### Three.js 로딩 오류와 재시도

- SOG 초기화에 자산별 90초 제한을 적용했다. SDK가 오류를 반환하면 자산 이름과 원인을 표시하고, 응답이 끝나지 않으면 시간 초과 화면을 표시한다.
- 실패한 자산을 정리하고 시간 초과 뒤 늦게 완료되는 자산도 정리한다. 재시도는 페이지를 새로 불러와 응답이 멈춘 Spark worker pool을 새로 만든다.
- 브라우저에서 SOG 요청을 404로 응답시켜 오류 표시와 재시도 성공을 확인했다.
- 첫 `loadPackedSplats` worker 메시지를 의도적으로 전달하지 않아 미완료 초기화를 재현했다. 이 기능 시험에서만 90초 타이머를 1초로 줄였다. 시간 초과 안내 후 재시도에서 `timeOrigin`이 바뀌고 작은 장면이 준비됐으며 앱 진단 오류는 없었다.

시간 제한은 대기를 끝내는 장치다. SDK 디코더를 고치거나 즉시 worker 작업을 취소하는 기능은 아니다. iPhone에서 Sunnyvale 로딩이 성공하는지는 아직 확인하지 않았다.

### PlayCanvas 낙하 복구

- 발 위치가 시작점보다 10m 아래로 내려가거나 좌표가 유효하지 않으면 시작점으로 복귀한다. 속도·시선·입력 상태를 초기화하고 자동 복구 횟수를 센다. 비교 경로 재생 중에는 적용하지 않는다.
- 위치 JSON과 개발용 물리 진단에 복구 횟수를 기록하고 위치 JSON에 복구 기준도 포함한다.
- 작은 장면에서 실제 `KeyS` 입력을 16초 유지해 바닥 밖으로 이동했다. 자동 복구 1회 후 발 위치가 시작점 `[3, 0.35, -4]`로 돌아왔고 수직 속도는 거의 0이었다. 이어 새 `KeyW` 입력 1초로 다시 이동할 수 있었다.

이는 시험 장면 밖으로 떨어질 때의 안전장치다. 충돌 바닥의 빈 부분이나 계단을 보완하지 않으며, 시작점보다 10m 낮은 정상 지형에서도 복귀할 수 있다. PlayCanvas는 시작점으로, 기존 BVH·Rapier는 마지막 안전 위치로 복귀하므로 복구 경로를 동일하게 취급하지 않는다.

`pnpm check`에서 테스트 43개, 자산 검증, 타입 검사와 두 앱 빌드가 통과했다. 브라우저 기능 검증 근거: [원본 JSON](measurements/2026-10-02/fix-browser.json), [Three.js 시간 초과 화면](measurements/2026-10-02/fix-three-timeout.png), [PlayCanvas 복구 후 이동 화면](measurements/2026-10-02/fix-playcanvas-recovery.png).

## 모바일 화면과 남은 확인

대형 장면의 후속 대조 시험에서는 Sunnyvale의 점 수를 유지하고 고차 SH만 제거한 버전이 47.320초에 준비됐다. 90만 점 축소본도 성공했다. 원본 호환성 문제는 아직 해결되지 않았으며, 위 원본 실패 기록을 대조군 성공으로 대체하지 않는다. [해독 대조 시험](MOBILE-DECODER-CONTROLS.md).

종료 스크린샷에서 데스크톱용 안내 패널이 세로 화면의 큰 부분을 덮는다. PlayCanvas 작은 장면 패널 높이는 약 441px로 616px 화면의 약 72%다. Three.js는 추가 컨트롤러 선택 때문에 더 길다. 안내 문구도 WASD 중심이다. 모바일에서는 도움말·진단을 접고 터치 조작 안내를 제공할 필요가 있다.

overlay 자체는 `pointer-events:none`이며 버튼·select만 입력을 받는다. 시험 터치 시작 좌표의 hit-test는 canvas였다. 따라서 패널이 시야를 덮는 문제와 터치 입력을 막는 문제를 혼동하지 않는다.

아직 확인하지 않은 항목:

- 실제 손가락으로 이동·시선·버튼 조작, 가로/세로 회전과 스크롤 간섭.
- 모바일 장시간 탐색·백그라운드 복귀, 기기 메모리·GPU 메모리·발열·배터리.
- Android 실기기, 비공개 HTTPS 환경.
- 대형 장면에서 동일 접촉·동일 경로의 세 구성 보행 비용.

## 재현과 근거

- [세 구성 원본 JSON](measurements/2026-10-02/ios-browser.json): 좌표, 자산 해시, 설정, 반복별 프레임 간격과 보행 계측.
- [로딩 관찰](measurements/2026-10-02/ios-loading-observations.json): 실패 및 PlayCanvas 대형 장면 초기 기록.
- [집계 스크립트](measurements/2026-10-02/ios-summarize.mjs): `node docs/implementation/measurements/2026-10-02/ios-summarize.mjs`.
- [페이지 측정 함수](measurements/2026-10-02/ios-measurement.js), [MCP CDP 연결 helper](measurements/2026-10-02/ios-playwright.mjs), [IP 제한 relay](measurements/2026-10-02/ios-lan-relay.py).
- 종료 화면: [BVH](measurements/2026-10-02/ios-three-bvh.png), [Rapier](measurements/2026-10-02/ios-three-rapier.png), [Ammo](measurements/2026-10-02/ios-playcanvas.png), [PlayCanvas Sunnyvale](measurements/2026-10-02/ios-playcanvas-sunnyvale.png).

bridge는 임시 환경의 pymobiledevice3 11.20.2로 실행했다. 승인된 프로젝트 시험 탭만 대상으로 `Runtime.evaluate`와 `Page.captureScreenshot`을 사용했다. isolated world의 `page.evaluate`는 이 bridge에서 실패했다. 작은 장면을 열고 측정 함수 실행 후 진행 상태를 폴링하며, 탐색 전 원본을 저장한다. 입력 생성자는 실제 손가락을 대신하지 않는다. 시험 종료 후 자신이 만든 relay·bridge를 종료하고 임시 설치 환경·캐시와 보관 완료한 중복 출력 파일을 제거했다. 5173·5174 preview 서버는 유지했다.
