---
title: "[연구일지] 2024년 1월 4주차 - RL 기반 궤적 최적화"
date: 2025-09-29
categories: projects
tags: [research-log, reinforcement-learning, trajectory-planning]
toc: true
toc_sticky: true
published: false
---

## 📅 이번 주 요약

이번 주는 강화학습 에이전트의 학습 안정성을 개선하는데 집중했다.
PPO 알고리즘의 하이퍼파라미터 튜닝과 reward shaping을 통해 성능 향상을 확인했다.

## 🎯 주간 목표

- [x] PPO 하이퍼파라미터 최적화
- [x] Reward function 재설계
- [ ] Sim-to-real transfer 실험 준비
- [ ] 베이스라인 알고리즘과 비교 실험

## 📊 실험 결과

### 학습 곡선

```
Episode 1000: Average Reward = 124.5 ± 12.3
Episode 2000: Average Reward = 256.8 ± 8.7
Episode 3000: Average Reward = 312.4 ± 5.2
```

### 주요 발견사항

1. **Learning rate scheduling**이 수렴 속도에 큰 영향
2. Entropy coefficient를 0.01에서 0.005로 낮춘 후 policy 안정성 향상
3. Reward clipping이 오히려 성능 저하 유발

## 💡 아이디어 & 인사이트

### Curiosity-driven Exploration
- 현재 epsilon-greedy 방식의 한계점 발견
- Intrinsic motivation 기반 exploration 방법 고려 중
- 참고 논문: [Curiosity-driven Exploration by Self-supervised Prediction](https://arxiv.org/abs/1705.05363)

### Multi-objective Optimization
- 단일 reward function의 한계
- Pareto optimal solution 탐색 필요
- TODO: Multi-objective RL 논문 리뷰

## 🐛 이슈 & 해결

### Issue #1: GPU 메모리 부족
**문제**: Batch size 512에서 OOM 에러 발생
**원인**: Replay buffer가 GPU 메모리에 상주
**해결**:
```python
# CPU로 replay buffer 이동
self.replay_buffer = ReplayBuffer(size=100000, device='cpu')
# 학습 시에만 GPU로 이동
batch = batch.to('cuda')
```

### Issue #2: 학습 불안정성
**문제**: 2000 episode 이후 reward가 급격히 감소
**원인**: Learning rate가 너무 높음 (1e-3)
**해결**: Cosine annealing scheduler 적용

## 📝 코드 스니펫

### Reward Shaping 함수
```python
def compute_reward(self, state, action, next_state):
    # Distance to goal
    dist_reward = -np.linalg.norm(next_state[:3] - self.goal)

    # Smoothness penalty
    jerk = np.diff(action, n=2)
    smooth_penalty = -0.1 * np.sum(jerk**2)

    # Energy efficiency
    energy_penalty = -0.05 * np.sum(action**2)

    return dist_reward + smooth_penalty + energy_penalty
```

## 🔄 다음 주 계획

1. **Sim-to-real Transfer**
   - Domain randomization 파라미터 설정
   - Real robot 환경 셋업
   - Safety constraints 구현

2. **베이스라인 비교**
   - RRT* 알고리즘 구현
   - MPC (Model Predictive Control) 비교
   - 계산 시간 및 최적성 분석

3. **논문 작성**
   - Related work 섹션 초안 작성
   - 실험 결과 정리

## 📚 참고 자료

- [PPO Paper](https://arxiv.org/abs/1707.06347)
- [Sim-to-Real: Learning Agile Locomotion](https://arxiv.org/abs/1804.10332)
- [ROS2 RL Tutorial](https://docs.ros.org/en/humble/Tutorials/Reinforcement-Learning/)

## 💬 메모

- 내일 교수님 미팅에서 domain randomization 범위 논의 필요
- Lab seminar 발표 준비 (2/1)
- ICRA 2025 deadline: 2024/09/15

---

*연구 일지는 매주 금요일에 업데이트됩니다.*
