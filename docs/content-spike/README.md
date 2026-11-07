# 콘텐츠 스파이크 기획 토론 기록

2026-10-14. 기술 스파이크 이후 단계(콘텐츠 스파이크)의 범위를 정하기 위해 Claude와 Codex가 적대적 토론을 거쳐 합의안을 만든다. 초안과 최종안은 각각 보존하고 중간 문서도 순서대로 남긴다.

| 순서 | 문서 | 작성 | 역할 |
|---|---|---|---|
| 0 | [00-initial.md](00-initial.md) | Claude (Fable 5.1) | 초안. 동결 |
| 1 | [01-codex-critique.md](01-codex-critique.md) | Codex (GPT-6-Astra high) | 초안 반박. 문서 머리의 모델 표기는 Codex가 잘못 적은 것이며 터미널 상태줄은 GPT-6-Astra high였다 |
| 2 | [02-claude-rebuttal.md](02-claude-rebuttal.md) | Claude | 재반박과 수용 항목 |
| 3 | [03-codex-counter.md](03-codex-counter.md) | Codex | 재반박에 대한 응답 |
| 4 | [04-consensus-draft.md](04-consensus-draft.md) | Claude | 합의안 초안 |
| 5 | [05-codex-final-review.md](05-codex-final-review.md) | Codex | 합의안 검토, 잔여 이견 |
| F1 | [FINAL-v1.md](FINAL-v1.md) | 공동 | 최종안 v1. 05의 조건부 승인 조건 6개를 모두 반영. 보존 |
| 6 | [06-change-request-claude.md](06-change-request-claude.md) | Claude | 사용자 변경 요청(모바일 비중 축소) 영향 분석, 수정 vs 재작성 판단 |
| 7 | [07-codex-response.md](07-codex-response.md) | Codex | 변경 요청 응답. 수정으로 합의, 합격선 40ms, 엔진 근거 정정 |
| F2 | [FINAL.md](FINAL.md) | 공동 | **최종안 v2 (현행)**. 데스크톱 판정, iPhone 참고 측정. 2026-10-16 임시 문장 대체 반영 |
| A | [ASSETS.md](ASSETS.md) | Claude | 이 스파이크용 공개·합성 자산과 출처 |
| R1 | [RESULTS-01.md](RESULTS-01.md) | Claude | 1차 기능 확인 결과, 관찰된 문제, 미시험 항목. 근거는 [evidence/](evidence/) |
| R2 | [RESULTS-02-sky.md](RESULTS-02-sky.md) | Claude | 하늘 고정 8시점 비교. 지평선 틈 해소, 현관 건물 반투명 노출로 기준 미충족 |

진행 방식: Codex는 Orca 터미널의 TUI 세션에서 실행했다. 1라운드는 처음 GPT-5.6-Terra로 시작했다가 사용자가 모델을 GPT-6-Astra로 바꾼 뒤 중단하고 같은 프롬프트로 다시 실행했다. 각 라운드의 프롬프트는 저장소 문서를 근거로 인용하고 근거 없는 주장은 추정으로 표시하도록 요구했다.

결과 요약: 초안의 네 축(듣기·연출·하늘·인물)은 유지하되 범위를 줄였다. Codex가 1라운드에서 요구한 초심자 A/B 학습 평가는 3라운드에서 철회됐고, 이 단계는 표현 수단의 기술 시험으로 확정했다. 추정 총 작업량은 11–20인일이었다.

변경(같은 날): 사용자가 iPhone 11(출시 7년)이 주요 기기가 아닐 가능성이 높다고 판단해 모바일 시험 축소와 비판정을 요청했다. 양측 모두 전면 재작성이 아닌 수정으로 판단했다. v2에서 판정 기기는 데스크톱(p95 ≤ 40ms, 증가 ≤ 5ms), iPhone은 두 구성 × 1회 참고 측정이다. Codex는 Claude의 "엔진 추천은 주로 iPhone 근거"라는 해석을 보고서의 데스크톱 로딩 수치로 정정했고 PlayCanvas 우선 후보는 유지됐다. 추정 총 작업량은 10.5–19.5인일이다.

변경(2026-10-16): 사용자가 실제 십상 사실 3개 대신 임시 문장을 쓰기로 결정했다. 콘텐츠 데이터는 흐름(안내문 → 정지 지점 2–3곳 → 임시 출처 → 시대 전환 전후 변경)을 보여주는 임시 대본으로 바꾸고, 사실 조사와 교무 검수를 제외했다. 실제 출처와의 연결 확인은 이 단계에서 빠진다. 사용자 결정이라 Codex와 재토론하지 않고 Claude가 FINAL §2·§4·§8을 수정했다. 추정 총 작업량은 10–18.5인일이다.
