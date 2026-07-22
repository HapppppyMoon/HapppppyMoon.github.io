---
title: "[개발일지] Stanley + PID 궤적 추종 컨트롤러 구현"
date: 2026-07-22
categories: projects
tags: [research-log, stanley-controller, path-tracking, control, robotics]
toc: true
toc_sticky: true
---

## 요약

로봇이 planner가 만들어준 경로를 그대로 따라가게 해주는 **Stanley + PID 컨트롤러**를 구현해서 GitHub에 공개했다.
파일 하나에 numpy만 있으면 돌아간다. 로봇의 현재 위치를 넣으면 "얼마나 빠르게 갈지(v), 얼마나 꺾을지(w)"를 돌려주는 단순한 구조라, 시뮬레이터든 실제 로봇이든 제어 루프에 바로 붙일 수 있다.

- Repo: [HapppppyMoon/StanleyController](https://github.com/HapppppyMoon/StanleyController)

## 구현 목표

- [x] 차동 구동(differential-drive) 로봇용 경로 추종 컨트롤러
- [x] 프레임워크 의존성 없이 `numpy`만으로 동작하는 단일 파일
- [x] 전진 / 후진 / 제자리 회전 / 정지를 상황에 맞게 자동 전환
- [x] 경로가 바뀌어도(replanning) `set_trajectory()` 한 번이면 이어서 주행
- [x] S-curve 데모와 시각화 (`example.py`)

## 구현 내용

### 조향과 속도를 따로 제어한다

**조향 (Stanley)**: "경로 쪽으로 꺾는" 규칙이다. 두 가지 오차를 본다.

- **heading 오차**: 로봇이 바라보는 방향이 경로 방향과 얼마나 어긋났는지
- **cross-track 오차**: 로봇이 경로에서 옆으로 얼마나 벗어났는지

```
delta = heading_err + arctan(k_e * cross_track / (|v| + k_soft))
w     = v * path_curvature + k_steer * delta
```

말로 풀면 이렇다. 경로가 굽은 만큼은 미리 꺾어두고(feedforward), 방향이 어긋난 만큼 + 옆으로 벗어난 만큼을 추가로 꺾는다(feedback). 분모의 `k_soft`는 속도가 0에 가까울 때 조향이 튀는 것을 막아주는 완충 상수다.

**속도 (PID)**: 목표 속도를 정해두고 PID로 따라간다. 적분값은 [-1, 1] 범위로 잘라서, 오차가 오래 쌓여도 속도가 폭주하지 않게 했다 (integral windup 방지).

### 목표 속도는 waypoint 간격이 알려준다

궤적은 점들의 위치와 방향만 담긴 배열이고(`[T, 4] = (x, y, cos_h, sin_h)`), 속도 열이 따로 없다. 대신 **점 사이의 간격을 속도로 해석**한다. 제어 주기마다 한 점씩 지나간다고 보면, 점이 촘촘하면 천천히, 널찍하면 빠르게 가라는 뜻이 된다 (`간격 / time_step`).

여기에 두 가지 감속을 얹는다.

1. **굽은 구간 감속**: `v_pref / (1 + curvature_speed_gain * |곡률|)`
2. **도착 감속**: 남은 거리가 `approach_dist` 안으로 들어오면 속도를 선형으로 줄임

planner 입장에서는 점 간격만 조절하면 의도한 속도가 그대로 전달된다. 주고받는 데이터가 배열 하나뿐이라 인터페이스도 단순해진다.

### 상황에 따라 모드를 바꾼다

| Mode | 언제 | 어떻게 |
|---|---|---|
| `forward` | 기본 | Stanley 조향 |
| `reverse` | 다음 목표점이 로봇 뒤에 있을 때 | Pure-pursuit 곡률 조향 |
| `rotate` | 방향이 45° 이상 어긋났을 때 | 제자리 회전 (감속 프로파일) |
| `stop` | 도착했거나 경로가 없을 때 | 정지 |

Stanley는 "앞으로 달리는 차"를 가정하고 만들어진 규칙이라 후진에는 그대로 못 쓴다. 후진할 때는 뒤쪽 목표점을 향해 원호를 그리며 접근하는 pure-pursuit 방식으로 바꿔 탄다.

## 실험 결과 (S-curve 데모)

8m 길이의 S-curve를 0.25초 제어 주기로 따라가게 한 결과:

```
finished in 15.45s
max|cte|  = 0.098 m
mean|cte| = 0.046 m
```

![S-curve tracking result](/assets/images/posts/stanley-controller/stanley_scurve.png)

경로에서 가장 많이 벗어난 순간이 약 10cm다. 커브 방향이 바뀌는 변곡점 근처에서 가장 크게 벗어나고, 직선 구간에서는 다시 경로에 딱 붙는다. Stanley의 전형적인 거동이다.

## 이슈 & 해결

### Issue #1: 경로가 자기 자신과 교차하면 로봇이 뒤로 돌아가려 한다

**문제**: 기준 궤적이 단순 선형이 아니라 8자처럼 **한 지점에 여러 시점이 교차하는 경우**, 가장 가까운 점을 거리로만(`argmin`) 찾으면 이미 지나온 시점의 점이 잡힐 수 있다. 그러면 로봇이 갑자기 뒤로 돌아가려 한다
**원인**: 교차 지점 근처에서는 서로 다른 시점의 waypoint들이 거의 같은 거리에 있어, "가장 가까운 점"이 두 개 이상 생긴다
**해결**: 거리가 움푹 들어간 지점(local minima)을 전부 찾은 뒤, **지금까지 진행한 지점(`furthest_reached`) 이후에 있는 것 중 가장 이른 것**을 고른다

```python
def _find_closest(self, dists_sq):
    minima = self._find_all_minima(dists_sq)
    candidates = [i for i in minima if i >= self._furthest_reached]
    if not candidates:
        candidates = minima
    return candidates[0]
```

### Issue #2: 전진/후진 모드 진동 문제

**문제**: 목표점이 로봇 바로 옆에 있으면 전진/후진 판정이 스텝마다 뒤집히는 모드 진동이 발생해서 로봇이 덜덜거린다
**해결**: 전환에 여유(hysteresis)를 둔다. 전진 중일 때는 목표점이 확실히 뒤쪽(-0.1m 이하)으로 가야만 후진으로 바꾼다

```python
if self.last_mode == 'forward':
    is_reverse = look_rx < -0.1   # 여유를 둔 전환
else:
    is_reverse = look_rx < 0
```

### Issue #3: 제자리 회전이 목표 방향을 지나친다

**문제**: 고정된 속도로 돌면 목표 방향을 지나쳤다가 반대로 다시 도는 일이 반복된다
**해결**: 남은 각도가 줄어들수록 회전 속도에 상한을 건다. `w_limit = min(sqrt(2 * a_max * |남은 각도|), |남은 각도| / dt)`, 즉 "지금 감속을 시작해도 제때 멈출 수 있는 속도"까지만 허용하는 것

## 인사이트

- **궤적 포맷은 단순할수록 좋다**: 속도 열을 없애고 점 간격에 속도를 담았더니 planner와 주고받는 게 배열 하나로 끝난다. 재계획도 배열을 다시 넘기면 끝.
- **가속도 제한은 컨트롤러 밖으로**: 컨트롤러는 속도 상한만 지키고, 출력을 부드럽게 다듬는 일은 로봇 플랫폼 쪽에 맡기는 게 역할 분리가 깔끔하다.
- **디버그 훅은 미리 심어두자**: 매 스텝의 오차들을 `ctrl._debug`에 넣어두니, 튜닝할 때 로깅 코드를 따로 짤 일이 없었다.

## 고찰: 왜 Stanley인가

경로 추종에 흔히 쓰는 세 가지 방식을 놓고 보면, **기준 궤적에서 벗어나는 정도가 가장 작은 것**이 Stanley를 고른 이유다.

- **Pure pursuit**: 앞쪽의 목표점 하나를 계속 쫓아간다. 경로 자체와의 오차는 보지 않기 때문에, 커브에서 항상 안쪽으로 파고드는(corner cutting) 오차가 구조적으로 남는다. 목표점을 얼마나 앞에 잡느냐에 따라 성능이 크게 달라지는 것도 부담이다.
- **Cross-track PID**: 옆으로 벗어난 거리만 보고 조향한다. 방향 정보가 없어서 경로에 붙은 뒤에도 자세가 안 맞고, 지그재그로 진동하기 쉽다.
- **Stanley**: 방향 오차와 벗어난 거리를 둘 다 본다. 벗어나 있으면 경로 쪽으로 꺾고, 경로 위에서는 방향을 맞춘다. 벗어난 거리를 명시적으로 0으로 수렴시키는 규칙이라, 위 두 방식처럼 오차가 구조적으로 남지 않는다.

planner가 장애물과의 여유까지 계산해서 궤적을 뽑았다면, 그 궤적을 정확히 따라가는 것이 곧 안전이다. 그래서 목표점을 느슨하게 쫓는 방식보다, 경로 위에 로봇을 붙잡아두는 Stanley가 이 용도에 맞다고 판단했다. 실제 데모에서도 최대 이탈이 10cm 수준이었다.

물론 Stanley도 만능은 아니다. 전진을 가정한 규칙이라 후진에서는 pure pursuit로 바꿔 타야 했다.

## 참고 자료

- Hoffmann et al., ["Autonomous Automobile Trajectory Tracking for Off-Road Driving"](https://ieeexplore.ieee.org/document/4282788) (ACC 2007), Stanley controller 원 논문
- Thrun et al., "Stanley: The Robot that Won the DARPA Grand Challenge" (JFR 2006)
- [PythonRobotics - Stanley Control](https://github.com/AtsushiSakai/PythonRobotics)
