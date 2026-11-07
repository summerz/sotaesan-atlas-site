# 십상 디지털 공간 프로젝트 — 기술 스파이크 A: PlayCanvas Engine

- 문서 상태: Draft v0.1
- 작성일: 2026-09-28
- 목적: Gaussian Splat 기반 웹 공간의 기술 가능성 검증
- 비교 대상: `기술 스파이크 B — Three.js`
- 원칙: 실제 성지 촬영/3DGS 생성은 본 스파이크의 테스트 범위에서 제외하되, 실제 프로젝트의 제작 파이프라인에는 포함한다.

---

## 1. 스파이크의 목적

이 스파이크는 원불교 대종사 십상 및 관련 성지를 디지털 공간에서 경험하게 하는 서비스의 **런타임 기술 가능성**을 검증한다.

현 단계에서 검증하려는 것은 다음과 같다.

1. 기존 Gaussian Splat 파일을 웹에서 안정적으로 표시할 수 있는가.
2. Splat과 GLB 메시를 하나의 가상 공간에 함께 배치할 수 있는가.
3. 사용자가 공간을 걷거나 둘러볼 수 있는가.
4. 보이지 않는 Collision Mesh를 이용해 바닥·벽 등의 이동 제약을 구현할 수 있는가.
5. 특정 위치에 역사·교법·성지 정보 등을 담는 Hotspot을 배치할 수 있는가.
6. 데스크톱과 모바일 브라우저에서 서비스 가능한 성능이 나오는가.
7. PlayCanvas의 클라우드 호스팅에 의존하지 않고 독자 호스팅할 수 있는가.
8. 장기적으로 엔진을 교체해도 핵심 자산과 월드 데이터가 남도록 구성할 수 있는가.

본 스파이크의 핵심 질문은 "PlayCanvas가 좋은 엔진인가?"가 아니라 다음이다.

> Gaussian Splat을 실제 공간의 시각 레이어로 사용하고, 그 위에 GLB·Collision·Hotspot 등의 논리 레이어를 결합한 웹 공간을 현실적인 개발 비용으로 만들 수 있는가?

---

## 2. 의도적으로 제외하는 범위

### 기술 스파이크에서 제외

- 현장 촬영
- 영상 프레임 추출
- 카메라 Pose 추정
- COLMAP / SfM 처리
- 3D Gaussian Splat 학습
- 실제 성지의 정밀 3D 복원
- 로그인/회원
- 데이터베이스
- CMS
- 멀티유저
- 음성 대화
- 아바타
- WebXR/VR의 본격 구현
- 운영용 월드 에디터 개발

### 실제 프로젝트에서는 필요

실제 성지를 제작할 때에는 별도의 제작 파이프라인이 필요하다.

```text
현장 촬영
  ↓
촬영 데이터 정리
  ↓
카메라 Pose / SfM
  ↓
3D Gaussian Splat 생성
  ↓
Splat 정리·편집
  ↓
웹용 압축/LOD 변환
  ↓
서비스 월드에 배치
```

촬영과 3DGS 생성은 웹 서비스 런타임 개발과 성격이 다르므로, 실제 프로젝트에서는 별도 담당자 또는 별도 제작 워크플로로 분리하는 것을 기본 전제로 한다.

---

## 3. 테스트 자산 원칙

기술 검증을 위해 성지를 직접 촬영할 필요는 없다.

### Splat

- PlayCanvas/SuperSplat 또는 다른 프로젝트가 테스트용으로 공개한 샘플 사용
- 또는 라이선스가 명확한 PLY/SPZ/SOG 샘플 사용
- 가능하면 실내가 아닌 **지형·건물·외부 공간이 포함된 장면**을 우선 선택
- 원본/라이선스 정보를 `assets/README.md`에 기록

### GLB

Splat 위에 합성할 테스트용 GLB 1~3개를 준비한다.

예:

- 작은 건물
- 담장 또는 구조물
- 안내 오브젝트

GLB는 역사 복원 모델일 필요가 없다. 이번 단계에서는 **Splat과 Mesh의 좌표 정합·depth·조명 차이·성능**을 검증하는 것이 목적이다.

### 동일 자산 원칙

가능하면 Three.js 스파이크에서도 동일한 Splat과 동일한 GLB를 사용한다. 엔진별 결과를 비교하려면 입력 조건이 같아야 한다.

---

## 4. 권장 기술 구성

```text
TypeScript
Vite
PlayCanvas Engine
PlayCanvas GSplat
SplatTransform
SuperSplat (필요 시 Splat 편집/변환)
GLB / glTF
world.json
정적 웹 호스팅
```

### PlayCanvas Editor 사용

스파이크에서는 PlayCanvas Editor를 **선택적으로 적극 활용**한다.

Editor를 이용해 다음 작업을 빠르게 검증할 수 있다.

- Splat 배치
- GLB 배치
- Camera
- Collision
- Light
- Audio
- Hotspot 역할을 하는 Entity
- Script 부착
- 좌표·회전·Scale 조정

단, Editor 내부 Scene 데이터만을 프로젝트의 원본 데이터로 삼지 않는다.

---

## 5. 자산 저장 원칙

장기적인 플랫폼 종속 방지를 위해 원본과 런타임 파일을 분리한다.

```text
/assets
  /source
    sample-master.ply
    sample-glb-source/
  /runtime
    scene.sog
    scene.spz
    historical-object.glb
    collision.glb

/world
  world.json
```

### Canonical Asset 권장

- Gaussian Splat 원본/교환: `PLY`
- 웹 런타임: `SOG`, 필요 시 `Streamed SOG` 또는 `SPZ`
- Mesh: `GLB`
- 월드 구조: 자체 정의 `world.json`
- 이미지: WebP/JPEG/PNG
- 음성: AAC/MP3/Opus 등 서비스 정책에 맞게 선택

PlayCanvas 전용 포맷만을 유일한 원본으로 보존하지 않는다.

---

## 6. 최소 world.json 초안

엔진을 교체할 가능성을 고려해 월드의 핵심 정보는 자체 포맷으로 관리한다.

```json
{
  "schemaVersion": 1,
  "id": "spike-sample-world",
  "title": "Gaussian Splat Technical Spike",
  "objects": [
    {
      "id": "present-world",
      "type": "splat",
      "src": "/assets/runtime/scene.sog",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    },
    {
      "id": "historical-object",
      "type": "gltf",
      "src": "/assets/runtime/historical-object.glb",
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

PlayCanvas Scene을 이 데이터로 생성하는 adapter를 두는 것이 이상적이다.

```text
world.json
   ↓
PlayCanvas World Adapter
   ↓
PlayCanvas Scene
```

---

## 7. 구현 단계

### Spike A-1 — Splat 표시

목표:

- 브라우저에서 Splat 로딩
- Orbit camera 또는 자유 카메라
- FPS 표시
- 로딩 상태 표시
- resize 대응

완료 조건:

- 데스크톱 브라우저에서 정상 표시
- iPhone/Android에서도 장면이 표시됨
- 콘솔에 치명적 오류 없음

---

### Spike A-2 — Splat + GLB 혼합

목표:

```text
PlayCanvas Scene
├─ Gaussian Splat
└─ GLB Mesh
```

검증:

- 동일 카메라/좌표계에서 정상 렌더링
- Mesh가 Splat 앞뒤에 있을 때 depth 관계
- GLB의 PBR 재질과 Splat의 촬영 조명 간 이질감
- GLB 위치/회전/scale 조정 난이도
- 2~3개의 GLB를 추가했을 때 성능 변화

완료 조건:

- Splat과 GLB가 한 Scene에서 자연스럽게 표시
- 좌표를 수치로 저장하고 재로드 가능

---

### Spike A-3 — 1인칭 공간 이동

목표:

- WASD
- 마우스 look
- 모바일 touch
- 기본 gravity
- spawn point

이 단계에서는 완전한 게임 캐릭터 컨트롤러보다 **공간 체험에 필요한 최소 이동감**을 검증한다.

---

### Spike A-4 — Collision

Splat 자체를 물리 Geometry로 취급하지 않는다.

```text
보이는 세계
├─ Gaussian Splat
└─ GLB

보이지 않는 세계
└─ collision.glb
```

검증:

- `splat-transform` 등으로 생성한 collision mesh 사용 가능성
- 바닥 판정
- 벽 통과 방지
- 계단/경사면의 체감
- Collision Mesh 단순화 수준에 따른 성능

완료 조건:

- 사용자가 바닥에서 안정적으로 이동
- 테스트 영역의 주요 벽을 통과하지 않음

---

### Spike A-5 — Hotspot

최소 기능:

- 특정 위치 또는 특정 Object와 연결
- 접근 거리 기반 활성화
- 클릭/탭
- 제목
- 짧은 설명
- 이미지 1개
- 닫기

예:

```text
사용자
  ↓ 2m 이내 접근
Hotspot 활성화
  ↓
"이 장소에 대한 설명 보기"
```

Hotspot 콘텐츠와 3D 좌표는 별도 데이터로 저장한다.

---

### Spike A-6 — 현재/과거 레이어 개념 테스트

실제 역사 복원은 하지 않는다.

테스트 GLB를 이용해 다음 개념만 확인한다.

```text
CURRENT
Splat 100%
GLB hidden

HISTORICAL
특정 현재 영역 숨김 또는 별도 편집 Splat
GLB visible
```

첫 스파이크에서는 런타임 Splat 마스킹보다 다음 방식을 우선한다.

- `current.sog`
- `historical-base.sog` — 특정 구조물을 미리 제거한 버전
- `historical-object.glb`

목표는 **한 공간에서 현재 Splat과 과거 Mesh 레이어를 전환할 수 있는가**의 확인이다.

---

### Spike A-7 — 독자 호스팅

PlayCanvas Hosting을 사용하지 않는 배포를 반드시 한 번 수행한다.

예:

```text
Vite build / PlayCanvas export
        ↓
Cloudflare Pages / GitHub Pages / Nginx
        ↓
Splat·GLB는 CDN/Object Storage
```

검증:

- PlayCanvas 서버 없이 실행
- CORS
- Range/캐시 정책
- HTTPS
- asset base URL 분리

---

## 8. PlayCanvas Editor 검증 항목

기술 스파이크에서는 Engine뿐 아니라 Editor가 실제 제작 비용을 얼마나 줄이는지도 측정한다.

### 확인할 기능

- Scene hierarchy
- Transform gizmo
- Inspector
- GLB import
- GSplat 배치
- Collision component
- Camera
- Audio
- Script
- Hotspot용 Entity
- Preview/Launch
- self-host build/export

### 중요한 질문

> 십상 프로젝트에서 실제 월드 제작자가 사용하는 기능은 PlayCanvas Editor 전체 기능 중 몇 %인가?

사용 기능을 기록해두면 향후 Three.js용 자체 World Composer를 만들지 판단할 때 매우 중요한 자료가 된다.

---

## 9. 비교 측정 항목

Three.js 스파이크와 동일한 양식으로 측정한다.

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

추가 기록:

- 브라우저
- OS
- 기기명
- Splat Gaussian 수
- 런타임 파일 크기
- GLB polygon 수
- 네트워크 상태

---

## 10. 성공 기준

다음 조건을 대부분 충족하면 PlayCanvas Track은 "계속 검토할 가치 있음"으로 판단한다.

1. Splat + GLB 혼합 렌더링 정상
2. 모바일 포함 주요 브라우저 동작
3. 1인칭 이동과 Collision 구현 가능
4. Hotspot과 일반 웹 UI 결합 가능
5. 독자 호스팅 가능
6. asset/runtime 구조를 우리 저장소에서 관리 가능
7. Editor가 실제 제작 시간을 의미 있게 절약
8. PlayCanvas 서비스가 없어져도 원본 자산과 서비스 코드를 이전할 수 있는 구조 확보

---

## 11. 예상 위험

### Editor 종속

PlayCanvas Editor는 제작 효율이 높지만, 제작 워크플로가 클라우드 서비스에 의존할 수 있다.

대응:

- PLY/GLB/world.json 별도 보관
- PlayCanvas Scene을 유일한 원본으로 취급하지 않음
- 필요한 Editor 기능을 목록화

### SOG 종속

SOG는 웹 런타임에 유리하지만 canonical source로 사용하지 않는다.

대응:

- PLY master 보존
- 필요 시 SPZ/GLB/다른 런타임 형식 재생성

### Splat과 GLB의 시각적 이질감

Splat에는 촬영 당시 조명이 baked 되어 있고 GLB는 실시간 조명을 사용한다.

대응:

- GLB 조명/톤/재질 조절
- 필요 시 baked lighting 또는 stylized treatment 테스트

### 큰 공간

성지 규모가 커질 경우 단일 Splat은 모바일에서 부담이 될 수 있다.

대응:

- SOG
- Streamed SOG
- LOD
- 공간 분할

---

## 12. 실제 프로젝트 단계에서 추가될 제작 파이프라인

기술 스파이크가 성공한 뒤 실제 성지를 대상으로 할 때 추가한다.

```text
촬영 계획
↓
현장 촬영
↓
프레임/카메라 Pose
↓
3DGS 생성
↓
SuperSplat 등에서 cleanup
↓
PLY master 보존
↓
SOG/Streamed SOG 변환
↓
Collision 생성/수정
↓
월드에 배치
```

이 과정은 웹 런타임 개발과 분리해서 관리한다.

---

## 13. 스파이크 결과물

최종적으로 다음 파일을 남긴다.

```text
/playcanvas-spike
  /src
  /public/assets
  /world/world.json
  README.md
  PERFORMANCE.md
  ASSET-LICENSES.md
```

그리고 브라우저에서 볼 수 있는 독자 호스팅 URL 1개.

---

## 14. 판단 시점

PlayCanvas 스파이크 후 다음 중 하나로 판단한다.

### Continue

- Splat/GLB/모바일 성능 만족
- Editor가 제작 효율을 크게 높임
- 독자 호스팅 및 자체 데이터 관리에 문제 없음

### Compare

- 기능은 만족하지만 Editor/Scene 종속 우려
- 커스텀 UI와 월드 구조가 복잡해질 가능성
- Three.js에서 더 단순하게 구현될 가능성

### Stop

- 모바일 성능 부적합
- Splat+Mesh 혼합 품질 문제
- 프로젝트에 필요한 커스터마이징이 과도하게 어려움

---

## 15. 참고 자료

공식 자료 중심.

- PlayCanvas Engine: https://github.com/playcanvas/engine
- PlayCanvas Engine manual: https://developer.playcanvas.com/user-manual/engine/
- Gaussian Splat formats: https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/
- Streamed SOG: https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/streamed-sog/
- SplatTransform Collision: https://developer.playcanvas.com/user-manual/splat-transform/collision/
- SuperSplat: https://developer.playcanvas.com/user-manual/gaussian-splatting/editing/supersplat/
- Self-hosting: https://developer.playcanvas.com/user-manual/editor/publishing/web/self-hosting/
