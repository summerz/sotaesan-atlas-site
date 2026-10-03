# 국소 벽 보정 시안의 근거

[비교 화면](index.html)은 엔진·시점·표식 표시를 전환하는 정적 HTML이다. 해당 폴더를 함께 보존하면 서버 없이 열 수 있다. 원본 장면에는 적용하지 않은 진단용 시안이다.

## 촬영 범위

- Three.js / PlayCanvas × 기준·좌우 50cm·앞쪽 40cm × 원본·원본+표식·보정·보정+표식 = 32장.
- `captures.json`에 회차별 전체 앱 상태, UTC 시각, 카메라, 릴리스·자산 해시, GPU, 탭 수, 오류를 보존했다. `file`은 촬영 당시 임시 경로이며 동일 basename의 PNG를 이 폴더에 복사했다.
- `local-4d5905679d2e-8887379fa947`, Apple M4 Pro / ANGLE Metal, headed Chrome, 1280×800, DPR 1, visible·focused, 시험 탭 하나. 모든 회차의 페이지 오류·console warning/error·실패 요청은 비어 있다.
- 실제 키 이동 없이 world 응답의 spawn·benchmarkRoute로 eye를 고정했다. 비교 경로 재생 후 1.8초 안정화하고 UI를 숨겨 촬영했다. 로딩·메모리·보행 성능 측정이 아니다. 덤프 안의 `walkingTimings`도 이 목적으로 해석하지 않는다.
- manifest·world·보정 GLB 응답만 시험 브라우저에서 가로챘다. 원본 SOG·충돌 GLB·앱 소스·기본 world 파일은 이 시험으로 변경하지 않았다. 핸들러는 `finally`에서 제거한다.

## 시안 제작

`wall-calibrated-probe.glb`는 X −15.69m, Y 0.67–1.48m, Z −11.28–−9.42m의 사각형(2삼각형)이다. 512×512 RGB 텍스처를 포함한 51,944바이트, SHA-256 `466dd67f7292b8cefd3970cbd03589083bdc2055fda9b212778a6e077b8f49bf`다. PBR baseColor는 검정, emissive texture를 사용하며 양면 불투명 재질이다. 충돌 면은 추가하지 않았다.

기준 Three.js 시점에서 원본 영상 `wall-texture-reference.png`, 더 큰 교정 면의 검정 `wall-cal-black.png`과 중간 회색 `wall-cal-mid.png`를 사용했다. sRGB를 선형화하고 두 교정 영상의 차이로 면의 기여를 추정했다. 각 높이의 좌우 벽 색 중앙값을 보간하고 가장자리에서 원본 색과 혼합해 emissive texture를 계산했다. 마지막에는 바닥과 검은 경계가 보이던 영역을 제외하도록 면을 줄였다. 자세한 좌표·배합은 생성 스크립트가 기록한다.

이는 주변 벽 색으로 추정한 **시각 보정**이다. 촬영 당시 실제 벽 무늬를 복원했다는 근거는 없다. 기준 시점으로 교정한 색이므로 모든 각도에서의 일치를 보장하지 않는다. 무늬가 부드러워지는 부분도 남는다. 창문 영역은 면의 범위 밖에 있다.

## 가림 수치

`image-differences.json`은 동일 시안에서 표식 유무에 따른 RGB8 차이를 비교한다. 표식 8개 꼭짓점을 각 카메라로 투영한 bbox에 2픽셀 여유를 둔 ROI이며 좌표는 `[x0,y0,x1,y1]`, 끝은 제외한다. 각 엔진의 원본끼리, 보정끼리 비교한다. 화질·물리 불투명도 점수는 아니다.

모든 8개 엔진/시점 조합에서 보정의 표식 유무 차이는 평균·최대·3단계 초과 변화 픽셀 모두 0이다. 원본 평균 절대 차이는 31.190–38.916으로 표식이 보인다. 이 결론은 해당 ROI와 네 고정 시점에 한정된다.

## 재현

저장소 루트에서 Python 3.12.12, NumPy 2.5.3, Pillow 12.3.0으로 실행했다.

```sh
uv run --with numpy==2.5.3 --with pillow==12.3.0 python docs/implementation/measurements/2026-10-03/wall-audit/repair-probes/make-calibrated-wall-probe.py docs/implementation/measurements/2026-10-03/wall-audit/repair-probes output/playwright/wall-probe-rebuild
shasum -a 256 output/playwright/wall-probe-rebuild/wall-calibrated-probe.glb
uv run --with numpy==2.5.3 --with pillow==12.3.0 python docs/implementation/measurements/2026-10-03/wall-audit/repair-probes/verify-image-differences.py
```

재생성 GLB의 SHA-256은 위 보존 파일과 일치했다. 다시 촬영하려면 보존 GLB를 `output/playwright/wall-calibrated-probe.glb`에 복사하고 기존 headed Playwright MCP의 단일 탭에서 `browser_run_code_unsafe({filename: "scripts/capture-wall-repair-probes.playwright.js"})`를 실행한다. 5173·5174의 동일 릴리스가 준비되어야 한다. 스크립트 사본을 이 폴더에도 보존했다. 반환 상태 JSON을 저장하고 시험 브라우저를 닫는다.

정식 적용 전에는 실제 보행과 시선 회전, 거리 변화, 시대·스트리밍 전환, 필요한 iPhone 실기기 검증을 추가해야 한다. 원래 제보의 카메라 JSON과 빨간 박스도 아직 없다.
