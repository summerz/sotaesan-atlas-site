# 십상 디지털 공간 프로젝트 — 서비스 MVP와 발전 방향

- 문서 상태: Concept / Roadmap v0.1
- 작성일: 2026-09-28
- 대상: 원불교 대종사 십상과 관련 성지를 디지털 공간에서 경험하게 하는 서비스
- 주의: 현재 단계에서는 서비스의 최종 성격을 하나로 고정하지 않는다.

---

## 1. 프로젝트의 출발점

이 프로젝트는 원불교 대종사 십상과 관련 성지를 디지털 환경에서 경험할 수 있도록 하는 것을 출발점으로 한다.

다만 같은 기술과 콘텐츠를 사용하더라도 **어디에 강조점을 두느냐에 따라 프로젝트의 성격은 크게 달라질 수 있다.**

예:

- 디지털 성지순례
- 몰입형 역사 체험
- 원불교 교육 서비스
- 디지털 아카이브
- 성지 해설 서비스
- 온라인 공동체 공간
- 수행·명상 공간
- 문화유산/종교문화 체험
- 역사적 공간 복원

현재는 이 중 하나를 성급하게 확정하지 않는다.

첫 기술 테스트와 한 장소의 Pilot을 통해 어떤 경험이 실제로 가치가 있는지 확인한 뒤 프로젝트의 중심 성격을 결정한다.

---

## 2. 현재 프로젝트 가설

기술과 콘텐츠를 다음처럼 세 레이어로 구분한다.

```text
역사·교법·기록
       │
       ▼
Semantic / Content Layer

현재 실제 성지
       │
       ▼
Spatial / Reality Layer

사용자의 이동·탐색·대화
       │
       ▼
Experience Layer
```

Gaussian Splat은 **Spatial Layer를 효율적으로 확보하는 방법 중 하나**이다.

따라서 프로젝트를 "Gaussian Splat 서비스"로 정의하지 않는다.

---

## 3. 핵심 표현 방식

### 현재 존재하는 공간

현존 성지는 실제 촬영을 통해 Gaussian Splat으로 기록하는 방식을 우선 검토한다.

장점:

- 사실적인 공간감
- 모든 건축/지형을 Blender에서 재제작할 필요 감소
- 비교적 빠른 현장 기록
- 실제 성지의 현재 모습을 보존하는 아카이브 역할 가능

### 과거에 존재했지만 현재는 사라진 요소

다음 방식으로 별도 제작한다.

- GLB / glTF
- Blender 모델
- 역사 자료 기반 3D reconstruction
- 필요한 경우 제한적인 AI 보조 제작

### 하나의 Scene에서 결합

```text
하나의 World

├─ Current Reality
│   └─ Gaussian Splat
│
├─ Historical Reconstruction
│   └─ GLB
│
├─ Physics
│   └─ Collision / Navmesh
│
└─ Meaning
    ├─ Hotspot
    ├─ Narrative
    ├─ Source
    └─ Interaction
```

이 구조를 기본 모델로 한다.

---

## 4. 중요한 원칙: 사실과 재구성의 구분

역사·종교 콘텐츠를 다룰 때 사실적 기록과 시각적 재구성을 구분한다.

예:

```text
A. 현존 상태를 직접 촬영
B. 문헌/사진으로 형태가 확인되는 복원
C. 일부 자료를 토대로 한 추정 복원
D. 분위기 전달을 위한 상징적/연출적 표현
```

사용자에게 이 차이를 숨기지 않는다.

향후 콘텐츠 데이터는 다음과 같은 메타데이터를 가질 수 있다.

```json
{
  "representation": "historical-reconstruction",
  "confidence": "medium",
  "sources": [
    "source-001",
    "source-004"
  ]
}
```

AI로 생성한 장면이 역사적 사실처럼 인식되는 것을 방지한다.

---

## 5. 기술 테스트 단계

현재 단계에서는 **성지를 촬영하지 않는다.**

기존에 사용할 수 있는 라이선스 명확한 Gaussian Splat 파일을 이용해 웹 런타임을 먼저 검증한다.

두 개의 Track을 병행 가능한 형태로 설계한다.

```text
Track A
PlayCanvas Engine

Track B
Three.js + Spark
```

같은 Splat/GLB/Collision을 사용하여 비교한다.

### 기술 스파이크 공통 범위

- Gaussian Splat 표시
- GLB 동시 배치
- 1인칭 또는 공간 탐색
- Collision
- Hotspot
- 간단한 현재/과거 레이어 전환
- Desktop
- iPhone
- Android
- 독자 호스팅
- 성능 측정

### 제외

- 실제 현장 촬영
- 3DGS 학습
- 회원
- 멀티유저
- 음성
- CMS
- 실제 역사 복원

---

## 6. Pilot MVP — 한 장소

기술 테스트 후 첫 실제 MVP는 **성지 한 장소**만 대상으로 한다.

한 장소조차 충분한 난도가 있으므로, 십상 전체나 여러 성지를 동시에 진행하지 않는다.

### MVP 목적

> 실제 성지 하나를 디지털 공간으로 만들었을 때, 사용자가 장소성을 느끼며 정보를 경험할 수 있는가?

### MVP 권장 기능

#### 필수

- 실제 장소 촬영
- 3DGS 생성
- Splat cleanup
- 웹 로딩
- 데스크톱/모바일 이동
- Collision
- Spawn point
- 2~5개의 Hotspot
- 텍스트
- 이미지
- 간단한 음성 또는 내레이션
- 기본 콘텐츠 출처 표시
- 독자 호스팅

#### 선택

- 과거 GLB 요소 1개
- 현재/과거 비교
- 위치 기반 ambient audio
- 간단한 guided path

#### 제외 권장

- 멀티유저
- 아바타
- 음성 채팅
- 로그인
- 게임화
- 복잡한 AI NPC
- 전체 십상
- 전체 성지 네트워크

---

## 7. MVP에서 확인할 사용자 경험

기술 성공과 사용자 경험 성공을 구분한다.

### 기술 질문

- 잘 보이는가?
- 빠르게 로딩되는가?
- 모바일에서 움직이는가?
- 벽을 통과하지 않는가?

### 경험 질문

- 단순한 3D 사진보다 "장소"처럼 느껴지는가?
- 실제 장소에 가보지 않은 사람에게 공간 관계를 전달하는가?
- 정보가 3D 경험을 방해하지 않는가?
- 공간 안에서 설명을 접하는 것이 일반 웹페이지/영상보다 가치가 있는가?
- 종교적·역사적 경험에 과도한 게임성이 없는가?
- 체험 후 사용자가 해당 장소와 십상을 더 잘 이해하는가?

두 번째 질문군이 최종 프로젝트의 성격을 결정한다.

---

## 8. 향후 발전 단계

### Phase 0 — Technical Spike

기존 Splat으로 PlayCanvas / Three.js 검증.

결과:

- 엔진 후보
- 성능 수치
- 모바일 가능성
- 개발 복잡도
- 저작 방식 비교

---

### Phase 1 — Single Site Pilot

실제 성지 한 곳.

```text
촬영
↓
3DGS
↓
웹 공간
↓
Hotspot
↓
콘텐츠
```

목적:

- 제작 전체 파이프라인 검증
- 한 장소의 실제 체험 가치 검증

---

### Phase 2 — Historical Hybrid

현재와 과거의 차이를 부분적으로 표현한다.

```text
Current Splat
   +
Historical GLB
   +
Narrative
```

기능:

- 역사적 구조물
- 시간 레이어
- 과거/현재 비교
- 자료 출처
- 복원 신뢰도

---

### Phase 3 — Guided Experience

하나의 장소를 단순 자유 탐색에서 **의도된 경험**으로 확장한다.

예:

- 십상 관련 순서
- 해설
- 질문
- 음성
- 주요 위치 안내
- contemplative pause / 마음공부 요소

여기서 프로젝트의 성격을 더 분명하게 결정할 수 있다.

---

### Phase 4 — Multi-user / Guided Tour

멀티유저는 가치가 확인된 뒤 추가한다.

가능한 형태:

```text
교무/해설자
     │
     ├── 참가자 A
     ├── 참가자 B
     ├── 참가자 C
     └── 참가자 D
```

기능:

- 같은 월드 입장
- 사용자 위치 공유
- 간단한 아바타
- 텍스트
- 음성
- 거리 기반 음향 또는 그룹 음향
- 안내자 follow
- 특정 장소 동시 이동

기술 후보:

- Colyseus 또는 유사 authoritative state server
- LiveKit 또는 유사 WebRTC SFU

이 단계의 목적은 "메타버스 기능 추가"가 아니라 **공동 성지 체험 또는 온라인 해설의 가치가 있는가**를 검증하는 것이다.

---

### Phase 5 — Multiple Sites / 십상 네트워크

한 장소의 제작 방식이 반복 가능하다고 확인되면 확장한다.

```text
십상
 │
 ├─ 영산 관련 장소
 ├─ 변산 관련 장소
 └─ 익산 관련 장소
```

이 단계부터 다음 필요성이 커진다.

- 콘텐츠 CMS
- Asset 관리
- World Composer
- 검색
- 십상/인물/사건/장소 연결
- 다국어
- 운영 권한
- 통계/분석

---

## 9. World Composer 발전 방향

초기에는 범용 3D Editor를 만들지 않는다.

### Level 0

개발자가 `world.json` 직접 수정.

### Level 1

간단한 내부 도구.

- Object 선택
- Position
- Rotation
- Scale
- Hotspot 추가
- Save

### Level 2

십상 프로젝트 전용 World Composer.

```text
Scene Tree
3D View
Inspector
Asset Browser
Hotspot
Audio
Historical Layer
Source Metadata
Preview
```

### Level 3

콘텐츠 운영도구 통합.

예:

```text
장소
├ 3D Asset
├ 역사
├ 십상
├ 관련 인물
├ 관련 사건
├ 법문
├ 사진
├ 출처
└ 복원 신뢰도
```

PlayCanvas Editor 수준의 범용 기능을 목표로 하지 않는다.

---

## 10. 데이터/플랫폼 독립 원칙

프로젝트 장기 존속성을 위해 다음 원칙을 적용한다.

> Cloud service is optional. Canonical assets and world data are owned by the project.

### 보존할 핵심 자산

- 촬영 원본
- 영상/사진
- PLY master
- GLB
- collision mesh
- 원본 텍스처
- 음성/이미지
- world.json
- 콘텐츠 데이터
- 출처 데이터

### 런타임 파일

필요에 따라 재생성 가능한 것으로 취급.

- SOG
- Streamed SOG
- SPZ
- 압축 Texture
- CDN 최적화 파일

### SaaS

편의를 위해 사용할 수 있지만 필수 인프라로 만들지 않는다.

예:

- PlayCanvas Editor
- SuperSplat hosted functions
- 특정 AI 3D 서비스
- 상용 호스팅

서비스가 종료되어도 핵심 콘텐츠를 다른 기술로 이전할 수 있어야 한다.

---

## 11. 예상 전체 기술 구조

```text
                [Content / Historical Data]
                          │
                          ▼
                       world.json
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
Gaussian Splat           GLB             Hotspot
현재 공간             과거/복원          정보/서사
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ▼
                     Web Runtime
                 PlayCanvas or Three.js
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
              Solo              Multi-user
                                  │
                         State + Voice Server
```

---

## 12. 제작 파이프라인

### 실제 공간 제작

```text
촬영 계획
↓
현장 촬영
↓
사진/영상 정리
↓
카메라 Pose
↓
3DGS
↓
Splat cleanup
↓
PLY master
↓
runtime 변환
↓
Collision
↓
배치
```

### 역사 재구성

```text
문헌/사진/지도
↓
사료 검토
↓
복원 범위 결정
↓
Blender/3D
↓
GLB
↓
공간 배치
↓
출처/신뢰도 연결
```

### 콘텐츠

```text
십상/성지 조사
↓
서사 구성
↓
텍스트/사진/음성
↓
Hotspot
↓
경험 설계
```

세 제작 파이프라인은 서로 다른 전문성이 필요하다.

---

## 13. 필요 역할

프로젝트 규모에 따라 한 사람이 여러 역할을 겸할 수 있다.

### 기술

- Web 3D 개발
- Frontend/Web service
- Backend/Infra
- Multiplayer/RTC (후기 단계)

### 3D

- 현장 촬영
- Photogrammetry / 3DGS
- Splat cleanup
- Blender / historical modeling
- optimization

### 콘텐츠

- 원불교/십상 내용 검토
- 성지 조사
- 역사자료 조사
- 사료 검수
- 시나리오/해설
- 음성/미디어 제작

### 경험

- UX
- 공간 동선
- 교육/해설 설계
- 접근성
- 모바일 사용성

---

## 14. 프로젝트의 크리티컬 포인트

### 1. Gaussian Splat 자체보다 월드화

Splat은 사진처럼 보이는 공간을 제공하지만 다음을 자동으로 제공하지 않는다.

- 바닥
- 벽
- 충돌
- 문
- 길
- 의미
- 역사
- 상호작용

따라서 실제 월드는:

```text
Visual
+
Physics
+
Semantic
+
Content
```

의 결합이다.

### 2. 모바일 성능

실제 이용자 접근성을 생각하면 고성능 PC만을 기준으로 할 수 없다.

첫 Pilot부터 iPhone/Android를 테스트해야 한다.

### 3. 제작 반복성

한 장소를 잘 만드는 것만으로는 충분하지 않다.

```text
촬영 → Splat → 정리 → Collision → 콘텐츠 → Publish
```

과정이 다음 장소에서도 반복 가능해야 한다.

### 4. 역사적 정확성

몰입도가 높아질수록 사용자는 시각적 표현을 사실로 받아들이기 쉽다.

따라서 출처와 재구성 수준을 관리한다.

### 5. 서비스 성격

기술이 서비스 정체성을 결정하게 두지 않는다.

"3D라서 무엇을 할 것인가"가 아니라:

> 사용자가 십상과 성지를 어떤 방식으로 경험하게 할 것인가?

를 중심에 둔다.

---

## 15. 현재 의사결정 순서

지금 결정할 필요가 없는 것:

- 전체 십상 UX
- 최종 메타버스 여부
- 전체 성지
- 멀티유저 규모
- VR 중심 여부
- 자체 Editor 수준

지금 결정하고 검증할 것:

1. 동일 Splat 자산 선정
2. PlayCanvas 스파이크
3. Three.js 스파이크
4. 동일 기준 성능/개발성 비교
5. 첫 실제 Pilot 엔진 선택
6. 첫 장소 선정
7. 실제 촬영/3DGS 제작 파이프라인 시작

---

## 16. 기술 선택 Decision Gate

두 스파이크 후 다음 기준으로 판단한다.

### PlayCanvas 우선 조건

- Splat 대형 장면 성능과 모바일 대응 우수
- Editor가 월드 제작 시간을 크게 줄임
- Engine/Editor 구조가 서비스와 잘 맞음
- 자체 호스팅과 데이터 독립성에 문제 없음

### Three.js 우선 조건

- 일반 Web UI/CMS와 긴밀한 결합이 중요
- PlayCanvas Scene/Editor가 프로젝트 구조를 제약
- 자체 World Composer 필요성이 높음
- 직접 개발 증가분이 감당 가능
- Three.js/Spark 성능이 충분함

최종 판단은 철학적 선호가 아니라 **같은 자산을 사용한 실제 스파이크 결과**를 기준으로 한다.

---

## 17. 기술 스파이크가 끝난 뒤 남아야 할 질문

다음 질문에 답할 수 있어야 한다.

1. Gaussian Splat 공간이 실제로 "장소 경험"을 제공하는가?
2. 단순 360도 사진/영상보다 어떤 가치가 있는가?
3. Splat + GLB 혼합이 역사적 재구성에 실용적인가?
4. 모바일에서 실용적인가?
5. 한 장소를 제작하는 반복 비용은 어느 정도인가?
6. PlayCanvas와 Three.js 중 어느 쪽이 프로젝트 전체 비용을 낮추는가?
7. 공간이 주인공인가, 아니면 콘텐츠를 담는 배경인가?
8. 멀티유저가 정말 필요한가?
9. 사용자는 자유 탐색과 guided experience 중 어느 쪽에서 더 많은 가치를 얻는가?
10. 프로젝트의 최종 성격은 디지털 성지순례·교육·아카이브·공동체 중 어디에 중심을 두어야 하는가?

이 질문에 대한 답이 다음 기획 단계의 출발점이 된다.

---

## 18. 관련 문서

- `01_tech_spike_playcanvas.md`
- `02_tech_spike_threejs.md`
