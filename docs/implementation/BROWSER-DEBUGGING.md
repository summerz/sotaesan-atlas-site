# 브라우저 디버깅 방법

## 선택 원칙

특정 도구를 항상 쓰지 않는다. 2026-10-03 사용자 지시: 토큰·시간·디버깅 능력 등을 고려해 목적에 맞는 방법을 선택하고, 성공한 연결과 절차를 재사용한다. Chrome에 프로젝트 시험 탭을 직접 여는 것도 승인됐다.

먼저 확인할 사실을 정한다. 계산 오류는 코드 시험으로, 화면·입력·브라우저 문제는 브라우저로, iOS 호환성은 실기기로 확인한다. 아래 비용은 실측 토큰 수나 속도 순위가 아니라 작업 선택을 위한 비교다. 실제 비용은 도구 제공 여부·연결 상태·출력 크기에 따라 달라진다.

| 방법 | 적합한 작업 | 준비·토큰·시간의 주요 비용 | 능력과 한계 |
| --- | --- | --- | --- |
| 기존 단위 시험·CLI | 충돌 계산, 월드 JSON, 생성물 무결성 | 렌더링 없이 빠르게 반복 가능. 필요한 시험과 실패 부분만 출력 | 실제 화면·GPU·브라우저 입력은 검증하지 못함 |
| Chrome 플러그인 | 기존 탭, 실제 사용자 Chrome에서 나타나는 화면·DOM·콘솔 문제 | 최초 스킬·API 문서가 큼. 연결·문서·탭 핸들을 재사용하면 재준비를 줄임 | DOM 스냅샷, 스크린샷, UI 조작, 콘솔 조회. 지원 API 범위만 사용. 현재 API에 임의 CDP나 장시간 keydown을 가정하지 않음 |
| Playwright MCP | 독립 프로필의 기능 회귀, 반복 입력, 결과 수집 | 도구 호출·페이지 준비 비용. 긴 동작은 지원되는 코드 실행으로 묶음 | 기존 시험에서는 키 유지, 요청 가로채기, 페이지·worker 계측을 사용. 도구별 실제 지원 여부 확인 필요 |
| Playwright CLI | 같은 자동화의 재실행, 명령·스크립트로 남기는 시험 | 최초 실행·브라우저 설치 비용. 이미 준비된 스크립트는 반복에 유리 | 별도 브라우저. 기존 사용자 Chrome의 세션을 동일하게 재현하지는 않음 |
| iPhone Safari + USB bridge | WebKit, 기기별 자산 해독, 모바일 메모리 제약 | USB·신뢰·잠금·시험 탭·bridge 준비 비용이 큼 | 실기기 측정 가능. 기존 bridge의 합성 touch는 실제 손가락 사용성 검증과 구분 |
| Computer Use | 브라우저 밖의 네이티브 UI, 시각적으로만 접근할 수 있는 조작 | 화면 읽기·좌표 조작·재확인 비용. 반복 시험의 재현성이 낮아질 수 있음 | 해당 스킬의 지원 범위에서 사용. Chrome 플러그인의 사이트 접근 차단을 우회하는 용도로 사용하지 않음 |

사용자가 특정 브라우저를 지정하면 그 요청을 따른다. 도구를 변경할 때는 변경 이유와 검증 조건의 차이를 남긴다. 이전 시험 도구와 다르다는 이유만으로 새로운 시험을 거부하지 않는다.

## 효율적으로 확인하는 순서

1. **남은 질문 하나를 정한다.** 예: “벤치 뒤에서 원래 바닥으로 돌아오는가”, “시대 전환 뒤 설명이 바뀌는가”. 비슷한 성능 수치를 얻기 위한 전체 재측정을 반복하지 않는다.
2. **기존 준비를 재사용한다.** 서버·릴리스·연결·탭·검증 스크립트를 확인한다. 세션이 살아 있으면 초기화와 전체 문서 읽기를 반복하지 않는다.
3. **판정에 필요한 상태만 읽는다.** 버튼·선택값은 DOM, 화질은 스크린샷, 실패는 좁힌 콘솔 로그를 사용한다. 매번 세 가지를 모두 수집하지 않는다. 기존 탭 목록에서는 프로젝트 탭만 후속 검사한다.
4. **반복 가능한 동작을 남긴다.** 긴 입력·반복 전환은 지원되는 자동화로 묶되 눌린 키와 계측 변경은 `finally`에서 복구한다. 재시도는 실패 원인을 확인한 뒤 수행한다.
5. **근거가 충분하면 종료한다.** 남은 구체적 위험이나 필수 검증이 없다면 다른 도구로 같은 성공을 반복 확인하지 않는다. 사용자가 보는 기존 탭과 다른 세션의 파일·프로세스는 정리 대상으로 삼지 않는다.

## Chrome 연결: 실제 제공 도구를 확인

`SKILL.md`가 존재하는 것과 실행 도구가 제공되는 것은 별개다. 현재 머신의 스킬:

```text
/Users/summerz/.codex/plugins/cache/openai-bundled/chrome/26.928.31416/skills/control-chrome/SKILL.md
```

플러그인 버전이 바뀌면 현재 Available skills의 경로를 사용한다. 스킬을 읽고 `mcp__node_repl__js`의 실제 제공 여부를 확인한다. `js_reset`이나 모듈 경로 추가 도구만 있는 것으로 실행 가능하다고 판단하지 않는다. 실행 도구가 없으면 Codex 쪽 플러그인 활성화와 새 세션의 도구 제공을 확인해야 하며 확장 재설치를 반복하지 않는다.

첫 연결의 예시이며 이미 존재하는 연결에 다시 실행하지 않는다. 코드 실행은 `mcp__node_repl__js`에서 한다.

```js
const { setupBrowserRuntime } = await import(
  '/Users/summerz/.codex/plugins/cache/openai-bundled/chrome/26.928.31416/scripts/browser-client.mjs'
);
const agent = await setupBrowserRuntime();
const chrome = await agent.browsers.get('chrome');
nodeRepl.write(await chrome.documentation());
```

`functions.exec`에서 위 초기 문서 호출을 감쌀 때는 스킬이 요구하는 첫 줄 `// @exec: {"max_output_tokens": 20000}`을 넣는다. 문서를 완전히 읽는다. 도구 출력이 명시적으로 잘린 경우에만 나머지를 나눠 읽는다.

```js
await chrome.nameSession('🔎 Atlas 로컬 앱 검사');
const userTabs = await chrome.user.openTabs();
// 실제 목록에서 선택한 프로젝트 탭 객체를 그대로 전달한다.
const appInfo = userTabs.find(t => t.url?.startsWith('http://127.0.0.1:5173/'));
const appTab = appInfo
  ? await chrome.user.claimTab(appInfo)
  : await chrome.tabs.new();
// 새 탭일 때만 승인된 프로젝트 URL로 goto한다.
if (!appInfo) await appTab.goto('http://127.0.0.1:5173/');
nodeRepl.write(await appTab.playwright.domSnapshot());
nodeRepl.write(await appTab.dev.logs({ levels: ['error'], limit: 10 }));
```

이후 같은 `chrome`과 `appTab`을 재사용한다. 이미 같은 URL인 탭에 불필요하게 `goto`하지 않는다. 탭만 닫혔으면 기존 Chrome 연결에서 다시 얻는다. Chrome 연결이 명시적으로 끊긴 경우에만 연결을 복구한다. Chrome의 `tab.playwright`는 별도 Playwright MCP와 API 범위가 같지 않다. 읽기 전용 DOM 평가에서 임의 앱 전역 상태·네트워크·CDP·주입을 지원한다고 가정하지 않는다.

## 실패를 구분하는 방법

| 실패 종류 | 다음 조치 |
| --- | --- |
| 스킬 파일 또는 실행 도구 없음 | 어떤 항목이 없는지 보고. 플러그인 활성화·새 세션 도구 제공 확인 |
| Chrome 선택·발견 실패 | `agent.documentation.get('bootstrap-troubleshooting')` |
| 확장·native host 통신 실패 | `agent.documentation.get('chrome-troubleshooting')`의 절차. 현재 브라우저 family 사용. native host를 직접 설치·수리하지 않음 |
| 탭 목록 성공, 프로젝트 탭 없음 | 연결 성공으로 기록. 기존 탭을 요청하거나 승인된 새 시험 탭을 엶 |
| 사이트 접근 권한 차단 | 차단 URL·동작을 기록하고 사용자에게 설정 변경 요청. 도구가 우회를 금지하면 다른 호스트·포트·브라우저·원시 명령으로 같은 작업을 시도하지 않음 |
| 앱 로딩·렌더링 오류 | 접근 성공과 앱 실패를 구분. 화면·오류·릴리스·장면·컨트롤러를 기록 |

일반적인 도구 선택은 유연하게 하되 반환된 명시적 보안 차단은 지킨다. 연결 고장 때문에 지원되는 대안을 선택하는 것과, 차단된 동작을 다른 경로로 실행하는 것은 구분한다.

## 기능 검증과 성능 측정

Chrome 사용자 탭은 환경 문제 재현에 유용하다. 열린 다른 탭·확장·백그라운드 작업의 영향이 있어 그 결과를 별도 프로필의 성능 표본과 합치지 않는다. 기존 사용자 탭을 닫아 성능 환경을 만들지 않는다.

엔진 성능 비교는 가능한 한 같은 릴리스·장면·입력·viewport·DPR로 한 앱씩 진행한다. headed 여부뿐 아니라 실제 GPU renderer를 확인한다. SwiftShader 같은 소프트웨어 렌더링을 기기의 GPU 성능으로 판정하지 않는다. 전체 프레임 시간과 물리 함수 CPU 시간은 별도로 기록한다. cold/warm 정의, 요청 가로채기, worker 일시 정지, GC, 계측 주입이 있으면 함께 남긴다. 세부 절차는 [프로젝트 지침](../../AGENTS.md)의 Playwright·로딩·실기기 항목을 따른다.

## 2026-10-03 Chrome 연결 확인 기록

- Available skill과 실제 `mcp__node_repl__js` 모두 확인.
- 위 절대 경로 import, `setupBrowserRuntime()`, `agent.browsers.get('chrome')`, 전체 문서 읽기 성공.
- `chrome.user.openTabs()` 성공. 기존 Chrome의 탭 목록을 읽을 수 있었으며 이때 5173·5174 프로젝트 탭은 없었음. 따라서 확장 통신 실패로 판단하지 않음.
- 두 로컬 서버의 LISTEN 상태 확인. 사용자 승인 후 새 시험 탭에서 `http://127.0.0.1:5173/?scene=sunnyvale-era&controller=bvh` 열기 시도.
- Chrome 도구가 **저장된 사용자 사이트 권한에 의한 접근 차단**을 반환. 앱 DOM·스크린샷·콘솔·입력 검증은 실행하지 못함. 5174 접근은 아직 시도하지 않음.
- `chrome-troubleshooting`을 읽음. 통신은 이미 성공했으므로 확장 재설치·프로필 변경·native host 수리는 수행하지 않음. 다른 경로로 차단된 접근을 재시도하지 않음.
- 사용자에게 사이트 차단 설정 변경을 요청함. 변경 확인 후 기존 연결에서 앱을 열고 DOM·콘솔 확인, 필요한 조작과 화면 검증을 이어갈 예정.

이 기록은 Chrome 연결 검증 결과다. 앞서 별도 Playwright로 완료한 [현관 바닥 보정 검증](PORCH-WALKMESH-REPAIR.md)을 Chrome에서도 통과했다고 해석하지 않는다.

### 같은 날 재시도 — 접근 성공

- 사용자의 브라우저 열기 요청에 따라 위와 동일한 URL을 재시도했다. `getForUrl`이 Chrome 확장 연결을 선택했고, 새 탭의 탐색·DOM 조회·스크린샷이 모두 성공했다. 이번 접근에는 사이트 권한 차단이 반환되지 않았다.
- Three.js의 Sunnyvale 구역·시대·설명 결합 시험과 기존 BVH 선택을 확인했다. 화면에 434,093점 표시, 총 448,028점 상주, 로딩 대기 없음이 표시됐다. 조회한 최근 warning/error 로그는 비어 있었다.
- 화면: [접근 확인 캡처](../../output/playwright/sunnyvale-access-2026-10-03.png). 요청한 페이지는 열린 상태로 유지했다.
- 이번 확인은 URL 접근과 시작 화면 로딩에 한정한다. 5174 앱 접근, 벽 비침 재현·원인 판별, 이동 및 성능 측정은 수행하지 않았다.

### 이어서 수행한 벽 비침 조사

- 기존 Chrome 연결·요청 탭은 유지했다. 반복 카메라와 SOG 응답 대조에는 별도 Playwright MCP를 선택했다. 두 도구 모두 필요한 스킬·실행 도구 제공 여부를 확인했다. 이번 5173·5174 접근에는 사이트 차단이 반환되지 않았다.
- 별도 브라우저의 한 탭에서 앱을 하나씩 열어 7조건×2엔진, 총 14회 촬영했다. viewport 1280×800 / DPR 1, 가시성 visible, 포커스 true, 실제 GPU renderer Apple M4 Pro를 확인했다. 각 캡처의 페이지 오류 및 warning/error 콘솔 기록은 모두 비어 있다.
- world 응답의 spawn·benchmarkRoute로 카메라를 고정했다. 원본, RGBA 재인코딩, 고차 SH 제거, 세 가지 중심 X 제외 조건은 SOG 응답만 선택했다. 불투명 표식 조건은 원본 SOG를 유지하고 world 응답의 objects에만 기존 reference cube를 추가했다. 원본 world·자산·앱 소스를 변경하지 않았다.
- 공개된 atlasInspection 상태와 active 경로를 읽어 pose·빌드·자산·환경을 저장했다. 화면 14개, 시험 자산 해시, ROI 영상 차이, 픽셀 충돌 광선을 [보존 폴더](measurements/2026-10-03/wall-audit/visual-probes/)에 남겼다. 위치 JSON 저장의 다운로드 경로는 이번 작업에서 사용하지 않았다.
- 벽 뒤 표식이 두 엔진 모두에서 비쳤다. 넓은 SOG 점 제외는 벽 표현도 바꿔 제품 수정으로 채택하지 않았다. 원래 위치 JSON이 없어 당시 빨간 박스의 정확한 재현과 실제 가구 존재는 판정하지 않았다. 자세한 범위와 남은 보완은 [벽 비침 조사](SUNNYVALE-WALL-AUDIT.md)에 있다.
- 이번 실행은 시각 원인 분리다. 요청 가로채기·고정 경로 준비 구간이 있어 로딩·이동·성능 표본으로 합치지 않는다.
- 비교 HTML도 같은 시험 탭에서 임시 응답으로 열어 2엔진×6선택의 이미지 로딩·캡션 변경을 확인했다. 추가 페이지 오류는 없었다. 시험 응답 가로채기를 해제하고 페이지를 닫았다. 탭 조회 때 만들어진 about:blank도 닫았고, 프로젝트 시험 탭은 남기지 않았다. 사용자가 요청한 Chrome의 sunnyvale-era 탭은 열린 상태로 유지했다.

### 국소 불투명 벽 면 시안

- 원인 조사 다음 단계로 작은 렌더링 면을 시험했다. 반복 카메라·진단 자산 응답 제어에는 별도 headed Playwright MCP의 한 탭을 재사용했다. 기존 사용자 Chrome 탭은 조작하지 않았다.
- 두 엔진 × 네 고정 시점 × 원본·원본+표식·보정·보정+표식으로 총 32장이다. Apple M4 Pro / ANGLE Metal, viewport 1280×800 / DPR 1, visible·focused를 회차마다 기록했다. 모든 장면 캡처에서 페이지 오류·console warning/error·실패 요청이 없었다.
- 시안 GLB·manifest·world 응답만 일시 변경했다. 원본 SOG와 충돌 자산 해시는 유지했다. 카메라 위치를 직접 지정한 시각 시험이므로 실제 보행이나 로딩·메모리·성능 측정으로 해석하지 않는다. 응답 가로채기는 `finally`에서 제거했다.
- 작은 불투명 면은 8개 엔진/시점 조합 모두에서 벽 뒤 표식을 가렸다. 벽 무늬가 부드러워지는 한계와 기준 시점 색 교정 의존성이 남아 정식 자산에는 반영하지 않았다. GLB·생성 스크립트·교정 영상·32캡처·전체 상태·영상 차이를 [보존 폴더](measurements/2026-10-03/wall-audit/repair-probes/)에 남겼다.
- [비교 HTML](measurements/2026-10-03/wall-audit/repair-probes/index.html)의 2엔진×4시점×표식 유무 16개 선택을 검증했다. 각 이미지 로딩 뒤 다음 조작을 하는 검증에서 페이지 오류·실패 요청은 없었다. 첫 빠른 선택 실행의 이미지 요청 취소 1건은 장면 오류와 구분했다.
- 시험 브라우저의 응답 가로채기를 해제하고 페이지를 닫았다. 탭 목록 조회로 생성된 about:blank도 닫아 최종 `No open tabs`를 확인했다. 사용자 Chrome의 기존 sunnyvale-era 탭은 유지했다.

### 2026-10-04 실제 보행·시대·근접 범위

- 별도 headed Playwright MCP의 한 탭으로 5173·5174 원래 URL을 사용했다. 반복 입력·상태 조회·진단 응답 제어가 필요해 선택했다. 기존 사용자 Chrome 탭은 조작하지 않았다. Apple M4 Pro / ANGLE Metal, 1280×800 / DPR 1, visible·focused를 기록했다.
- 실제 키보드 좌우·접근·접촉·후퇴 네 회차, 시대 전환·합성 시선·인접 구역 로드 네 회차, 같은 근접 좌표의 표식 전후 여덟 회차를 수행했다. 근접 표식은 보정 면 위쪽을 통과해 계속 보인다. 구역 해제 거리는 장애물 때문에 도달하지 못해 미검증이다. 보정 경계·색·무늬도 품질 조건으로 남겼다.
- native pointer-lock 시선은 Three.js의 큰 비제어 회전과 PlayCanvas WrongDocumentError/상대 이동 제어 불안정으로 비교 판정에서 제외했다. 합성 TouchEvent 시선은 실제 앱 입력 경로 확인이며 실제 마우스·손가락 통과 판정이 아니다. 시대 준비 문구에 의존한 첫 대기 타임아웃은 상태 기반 준비 조건으로 수정해 네 회차 모두 재실행했다.
- 성공한 시대·근접 재현은 페이지 오류·console warning/error·실패 요청이 없었다. 보행 JSON에는 뒤이은 pointer-lock 실패도 그대로 보존했다. world·manifest·시안 GLB 응답만 일시 변경했고 finally에서 해제했다. 앱 소스·기본 자산은 변경하지 않았으며 성능 결과에 합치지 않는다.
- 화면 76개·입력별 상태·제외 사유·근접 투영·영상 차이·파일 해시를 [보존 폴더](measurements/2026-10-04/wall-audit/walking-probes/README.md)에 저장했다. 비교 HTML을 file: URL로 열 때 Playwright가 명시적인 프로토콜 차단을 반환했다. 다른 호스트·경로·도구로 재시도하지 않았고 HTML은 정적 데이터·이미지·링크 검증만 수행했다. 이전 회차의 비교 HTML 조작 성공과 구분한다.
- 시험 페이지를 닫고 조회로 생성된 about:blank도 닫았다. 사용자 Chrome 탭과 기존 개발 서버는 유지했다.
