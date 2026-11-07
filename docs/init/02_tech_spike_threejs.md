# 십상 디지털 공간 프로젝트 — 기술 스파이크 B: Three.js

- 문서 상태: Draft v0.1
- 작성일: 2026-09-28
- 목적: Three.js 기반으로 Gaussian Splat + GLB 하이브리드 웹 월드의 기술 가능성 검증
- 비교 대상: `기술 스파이크 A — PlayCanvas Engine`
- 원칙: 실제 성지 촬영/3DGS 생성은 본 스파이크의 테스트 범위에서 제외한다.

---

## 1. 스파이크의 목적

이 스파이크는 PlayCanvas와 동일한 기능 범위를 **Three.js 중심의 독립 웹 애플리케이션**으로 구현했을 때의 장단점을 확인한다.

핵심 질문:

1. 기존 Gaussian Splat을 Three.js 공간 안에 안정적으로 배치할 수 있는가.
2. Splat과 GLB Mesh를 같은 Scene/Camera에서 자연스럽게 혼합할 수 있는가.
3. 이동·Collision·Hotspot 등 월드 기능을 무리 없이 구성할 수 있는가.
4. 모바일 브라우저에서도 현실적인 성능이 나오는가.
5. PlayCanvas보다 개발량은 얼마나 늘어나는가.
6. 그 대신 얻는 구조적 자유도와 서비스 독립성이 실제로 가치가 있는가.
7. 향후 프로젝트 전용 World Composer를 만들 수 있는 기반이 되는가.

---

## 2. 의도적으로 제외하는 범위

### 기술 스파이크에서 제외

- 현장 촬영
- 영상 → 프레임
- COLMAP / SfM
- 3DGS 학습
- 실제 역사 공간 복원
- 멀티유저
- 음성 대화
- 로그인/회원
- DB/CMS
- VR/XR 본격 구현
- 완성형 3D Editor

### 실제 프로젝트에서는 필요

```text
현장 촬영
  ↓
카메라 Pose / SfM
  ↓
3DGS 생성
  ↓
Splat cleanup
  ↓
웹용 파일 생성
  ↓
Three.js Runtime
```

촬영/3DGS 생성은 웹 런타임과 독립적인 제작 파이프라인으로 본다.

---

## 3. 테스트 자산

PlayCanvas 스파이크와 **가능한 한 동일한 자산**을 사용한다.

### Gaussian Splat

- PLY/SPZ/SOG 등 라이선스가 명확한 공개 샘플
- 가능하면 건물·지형·외부 공간이 포함된 장면
- 원본/출처/라이선스 기록

### GLB

동일한 테스트 GLB 1~3개 사용.

### Collision

가능하면 두 스파이크에서 동일한 `collision.glb`를 사용한다.

이를 통해 엔진 외 변수를 최소화한다.

---

## 4. 기본 기술 구성

### 권장 Baseline

```text
TypeScript
Vite
Three.js
Spark
GLTFLoader
world.json
간단한 Collision Layer
정적 웹 호스팅
```

### Gaussian Splat Renderer

첫 번째 비교 스파이크에서는 **Three.js + Spark**를 기준으로 한다.

이유:

- Three.js rendering pipeline과 직접 결합
- Splat + Mesh 혼합
- WebGL2 기반의 넓은 기기 대응
- 여러 Splat 지원
- PLY/SPZ/SPLAT/KSPLAT/SOG 등 다수 형식 지원
- 2026년 기준 LOD/대형 장면 스트리밍 기능 제공

Three.js 자체의 공식 `GaussianSplat` / `KHR_gaussian_splatting` 지원도 별도 실험 후보로 남겨둔다. 공식 구현은 WebGPURenderer 계열과 연결되므로 첫 비교에서는 브라우저/모바일 변수를 줄이기 위해 Spark를 우선한다.

---

## 5. 권장 코드 구조

```text
/src
  main.ts
  /engine
    createRenderer.ts
    createScene.ts
    loadSplat.ts
    loadGLTF.ts
    cameraController.ts
    collision.ts
    hotspot.ts
  /world
    schema.ts
    loader.ts
  /ui
    hotspotPanel.ts

/public
  /assets
    scene.spz
    historical-object.glb
    collision.glb
  /world
    world.json
```

목표는 Three.js API를 애플리케이션 전체에 흩뿌리지 않고, 월드 데이터와 renderer adapter를 분리하는 것이다.

---

## 6. 엔진 독립적인 world.json

PlayCanvas 스파이크와 동일한 schema를 사용한다.

```json
{
  "schemaVersion": 1,
  "id": "spike-sample-world",
  "title": "Gaussian Splat Technical Spike",
  "objects": [
    {
      "id": "present-world",
      "type": "splat",
      "src": "/assets/scene.spz",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    },
    {
      "id": "historical-object",
      "type": "gltf",
      "src": "/assets/historical-object.glb",
      "position": [5, 0, -4],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    },
    {
      "id": "info-01",
      "type": "hotspot",
      "position": [2, 1.5, -2],
      "contentId": "sample-info"
    }
  ],
  "spawn": {
    "position": [0, 1.7, 3],
    "rotation": [0, 180, 0]
  }
}
```

렌더러 구조:

```text
world.json
   ↓
Three.js World Adapter
   ↓
THREE.Scene
├─ SparkRenderer
├─ SplatMesh
├─ GLTF
├─ Collision
└─ Hotspot anchors
```

---

## 7. 구현 단계

### Spike B-1 — Splat 표시

목표:

- Three.js Scene
- SparkRenderer
- SplatMesh
- Camera
- resize
- FPS
- loading state

개념 코드:

```ts
const renderer = new THREE.WebGLRenderer({ antialias: false });
const scene = new THREE.Scene();

const spark = new SparkRenderer({ renderer });
scene.add(spark);

const splat = new SplatMesh({
  url: "/assets/scene.spz"
});

scene.add(splat);
```

완료 조건:

- Desktop 정상
- iPhone/Android 정상
- 치명적 rendering artifact 없음

---

### Spike B-2 — GLB 혼합

```ts
const gltf = await gltfLoader.loadAsync(
  "/assets/historical-object.glb"
);

scene.add(gltf.scene);
```

검증:

- Splat과 Mesh의 depth
- GLB shadow/light
- 투명 재질 문제
- 위치/회전/Scale
- 여러 Mesh 추가 시 성능
- Splat과 GLB의 색/조명 이질감

---

### Spike B-3 — 1인칭 이동

초기 기능:

- WASD
- mouse look
- touch controller
- gravity
- spawn

직접적인 게임 프레임워크를 만들지 말고 최소 기능부터 시작한다.

---

### Spike B-4 — Collision

Splat을 Collision Geometry로 사용하지 않는다.

```text
Visual Layer
├ Splat
└ GLB

Physics / Collision Layer
└ collision.glb
```

첫 구현 후보:

1. `THREE.Raycaster` + 간단한 바닥/벽 판정
2. `three-mesh-bvh` 기반 collision
3. 필요성이 확인되면 Rapier로 확장

스파이크 초기에는 복잡한 rigid body 물리가 필요하지 않다.

검증 목표:

- 바닥 유지
- 벽 통과 방지
- 경사/계단
- Collision Mesh 규모가 성능에 미치는 영향

---

### Spike B-5 — Hotspot

구현 방식:

```text
world.json hotspot
      ↓
THREE.Object3D anchor
      ↓
distance / raycast
      ↓
HTML UI
```

Hotspot UI는 3D Canvas 안에 모두 넣기보다 일반 HTML/React UI와 조합하는 방향을 우선한다.

최소 기능:

- 접근 거리
- click/tap
- 제목
- 텍스트
- 이미지
- 닫기

---

### Spike B-6 — 현재/과거 레이어 개념

첫 단계에서는 런타임 Splat editing을 최소화한다.

```text
current splat
↔
historical-base splat + historical GLB
```

테스트:

- 버튼으로 레이어 전환
- GLB fade
- Splat visible 전환
- 카메라 위치 유지
- 전환 시 성능/메모리

향후에는 Spark shader/modifier를 이용한 공간 마스킹 가능성을 별도 검토한다.

---

### Spike B-7 — Self-host

Three.js 앱은 처음부터 독자 호스팅을 전제로 한다.

```text
Vite build
   ↓
static files
   ↓
Cloudflare Pages / GitHub Pages / Nginx
   ↓
Splat & GLB on Object Storage/CDN
```

검증:

- asset CORS
- caching
- CDN
- 모바일 네트워크
- HTTPS

---

## 8. 자체 Editor는 만들지 않는다

이번 기술 스파이크에서 PlayCanvas Editor에 대응하는 편집기를 만들지 않는다.

초기 배치는:

- world.json 직접 수정
- 개발자용 임시 Transform GUI
- 필요 시 lil-gui 등의 간단한 도구

정도로 제한한다.

### 향후 필요한 경우

프로젝트 전용 World Composer는 다음 정도부터 시작할 수 있다.

```text
Scene Tree
Viewport
TransformControls
Inspector
Asset add
Hotspot add
Save world.json
```

PlayCanvas Editor를 복제하지 않는다.

---

## 9. Three.js가 얻는 장점

### 독립성

- 일반 npm 프로젝트
- 특정 제작 SaaS에 대한 필수 종속 없음
- 런타임 코드 전체 통제

### Web UI 결합

React/Next.js 등의 일반 웹 애플리케이션 구조와 자연스럽게 결합하기 쉽다.

예:

```text
웹 서비스
├─ 일반 콘텐츠 페이지
├─ 십상 탐색
├─ 자료 아카이브
├─ 사용자 UI
└─ Three.js 3D Experience
```

3D가 서비스의 일부일 경우 이 구조는 중요한 장점이 될 수 있다.

### 전용 제작도구 가능성

필요한 기능만 가진 십상 전용 World Composer를 장기적으로 개발하기 좋다.

---

## 10. Three.js의 비용

PlayCanvas에 기본 포함되거나 생태계가 통합해주는 기능을 직접 조합해야 할 수 있다.

예:

- asset pipeline
- collision/physics
- 1인칭 controller
- editor
- scene authoring
- audio zone tooling
- debug tooling
- publishing tooling
- runtime diagnostics

따라서 단순히 코드 줄 수보다 **통합과 제품 완성도 비용**을 측정해야 한다.

---

## 11. 비교 측정 항목

PlayCanvas와 같은 양식으로 기록한다.

| 항목 | Desktop | iPhone | Android |
|---|---:|---:|---:|
| 최초 화면 표시 시간 |  |  |  |
| 전체 초기 다운로드 |  |  |  |
| 평균 FPS |  |  |  |
| 최저 FPS |  |  |  |
| GPU/메모리 이상 여부 |  |  |  |
| Splat+GLB depth |  |  |  |
| 1인칭 이동 |  |  |  |
| Collision 안정성 |  |  |  |
| Hotspot UX |  |  |  |
| 개발 난이도 |  |  |  |

추가로 Three.js Track에서는 반드시 다음을 기록한다.

- 자체 구현 코드량
- 라이브러리 수
- 구현 중 발생한 브라우저별 예외
- 장면 authoring에 든 시간
- 기능 하나를 추가하는 데 걸리는 반복 비용

---

## 12. 성공 기준

1. Splat + GLB 혼합이 정상적
2. 모바일 포함 실행 가능
3. 최소 이동/Collision 구현 가능
4. 일반 웹 UI와 Hotspot 결합이 자연스러움
5. 정적 독자 호스팅 문제 없음
6. world.json 기반 Scene 생성 가능
7. PlayCanvas보다 개발량이 늘더라도 감당 가능한 수준
8. 서비스 UI·CMS·콘텐츠와의 통합 자유도가 실제 이점으로 확인됨

---

## 13. 주요 위험

### 라이브러리 조합 비용

Three.js 자체는 renderer library 성격이 강하므로 여러 라이브러리를 조합하게 된다.

대응:

- 의존성을 최소화
- adapter를 둬 핵심 서비스 코드와 분리

### Splat Renderer 변화

Gaussian Splat 웹 생태계가 빠르게 발전하고 있다.

대응:

```text
world.json
   ↓
Splat Adapter
   ├ Spark
   └ Three.js native GaussianSplat
```

처럼 추상화한다.

### 자체 Editor 욕심

기술 검증 단계에서 편집기 개발로 빠질 가능성이 높다.

대응:

> 런타임 검증 → 실제 제작 방식 확인 → 필요한 기능만 Editor화

순서를 지킨다.

---

## 14. 실제 프로젝트 단계에서 추가될 제작 파이프라인

```text
현장 촬영
↓
3DGS 생성
↓
Splat 편집
↓
PLY master
↓
SPZ/SOG 등 runtime format
↓
Collision
↓
world.json
↓
Three.js Runtime
```

촬영·학습은 별도 전문 워크플로로 관리한다.

---

## 15. 스파이크 결과물

```text
/threejs-spike
  /src
  /public/assets
  /public/world/world.json
  README.md
  PERFORMANCE.md
  ASSET-LICENSES.md
```

그리고 독자 호스팅 URL.

---

## 16. 판단 기준

### Continue

- 충분한 성능
- 코드 구조 단순
- Web UI와의 통합성이 높은 가치 제공
- 운영/개발팀이 직접 관리 가능한 복잡도

### Compare

- 기능은 가능하지만 PlayCanvas보다 제작비가 눈에 띄게 큼
- 자체 Editor 없이는 반복 제작이 불편함

### Stop

- 모바일 성능 또는 renderer 안정성 문제
- 여러 라이브러리 통합 비용이 과도
- Scene 제작/운영이 지나치게 개발자 의존적

---

## 17. 참고 자료

- Three.js: https://threejs.org/
- Three.js GaussianSplat: https://threejs.org/docs/pages/GaussianSplat.html
- Three.js GLTF Gaussian Splat extension: https://threejs.org/docs/pages/GLTFGaussianSplatLoaderExtension.html
- Spark: https://github.com/sparkjsdev/spark
- Spark Renderer docs: https://github.com/sparkjsdev/spark/blob/main/docs/docs/spark-renderer.md
