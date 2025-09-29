---
title: "[Ubuntu 22.04] Chrome Remote Desktop 설정 가이드"
date: 2025-09-29
categories: tech-tips
tags: [Ubuntu, Chrome Remote Desktop]
toc: true
toc_sticky: true
---

## 개요

이 문서는 우분투 22.04 환경에서 크롬 원격 데스크톱(Chrome Remote Desktop)이 새로운 가상 세션을 만들지 않고, **현재 컴퓨터 모니터에 보이는 데스크톱 세션에 직접 연결(미러링)**하도록 설정하는 방법을 안내합니다.

## 0단계: 권장 버전 설치 (Ubuntu 22.04 이상 사용자)

최신 버전의 우분투(22.04 LTS 이상)에서는 최신 크롬 원격 데스크톱 패키지가 정상적으로 작동하지 않을 수 있습니다. 안정적인 연결을 위해 아래의 특정 버전을 수동으로 설치하는 것을 권장합니다.

### 1. 패키지 다운로드

터미널을 열고 wget 명령어를 사용하여 아래 링크의 .deb 파일을 다운로드합니다.

```bash
wget http://dl.google.com/linux/chrome-remote-desktop/deb/pool/main/c/chrome-remote-desktop/chrome-remote-desktop_105.0.5.14_amd64.deb
```

### 2. 패키지 설치

다운로드가 완료되면 dpkg 명령어로 패키지를 설치합니다.

```bash
sudo dpkg -i chrome-remote-desktop_105.0.5.14_amd64.deb
```

### 3. 패키지 버전 고정 (중요)

설치 후, 시스템이 자동으로 패키지를 최신 버전으로 업데이트하지 않도록 버전을 '고정(hold)'해야 합니다. 이 단계는 매우 중요합니다.

```bash
sudo apt-mark hold chrome-remote-desktop
```

## 1단계: 원격 데스크톱 초기 설정 및 인증

스크립트 파일을 수정하기 전에, 먼저 웹사이트를 통해 원격 데스크톱을 계정에 등록하고 기본 설정을 완료해야 합니다.

### 1. 원격 액세스 설정 페이지 접속

웹 브라우저에서 아래 주소로 이동하여 본인 구글 계정으로 로그인합니다.
- https://remotedesktop.google.com/access

### 2. 원격 액세스 사용 설정

페이지 왼쪽 상단의 'SSH 창을 통해 설정' 탭을 클릭한 뒤, '시작' → '다음' → '승인' 버튼을 차례대로 누르면 화면에 Debian Linux용 명령어가 나타납니다. 이 명령어를 복사합니다.

### 3. 터미널에 인증 명령어 실행

복사한 명령어를 우분투 터미널(SSH 창)에 붙여넣고 실행합니다. 이 과정에서 컴퓨터가 구글 계정에 등록됩니다.

### 4. PIN 번호 설정

명령어를 실행하면, 원격 접속 시 사용할 6자리 이상의 PIN 번호를 입력하라는 메시지가 표시됩니다. 원하는 PIN 번호를 설정합니다.

## 2단계: 사전 준비 (스크립트 수정을 위해)

초기 설정이 완료되었으니, 이제 미러링을 위해 스크립트 파일을 수정할 준비를 합니다.

### 1. 서비스 중지

터미널을 열고 아래 명령어를 입력하여 크롬 원격 데스크톱 서비스를 중지합니다.

```bash
/opt/google/chrome-remote-desktop/chrome-remote-desktop --stop
```

### 2. 현재 디스플레이 번호 확인

아래 명령어를 실행하여 현재 사용 중인 디스플레이 번호를 확인하고 기억해 둡니다. (보통 :0 또는 :1과 같은 형식으로 출력됩니다.)

```bash
echo $DISPLAY
```

예를 들어, 출력이 :0이라면 디스플레이 번호는 0입니다.

## 3단계: 설정 스크립트 파일 수정

이제 핵심 설정 스크립트 파일을 수정합니다. 관리자 권한이 필요합니다.

### 1. 편집기로 파일 열기

nano 또는 선호하는 텍스트 편집기를 사용하여 아래 경로의 파일을 엽니다.

```bash
sudo nano /opt/google/chrome-remote-desktop/chrome-remote-desktop
```

### 2. FIRST_X_DISPLAY_NUMBER 값 변경

파일 내에서 FIRST_X_DISPLAY_NUMBER 변수를 찾은 후, 2단계에서 확인했던 디스플레이 번호로 값을 수정합니다.

- 변경 전:
```python
FIRST_X_DISPLAY_NUMBER = 99
```

- 변경 후 (예시: 디스플레이 번호가 0인 경우):
```python
FIRST_X_DISPLAY_NUMBER = 0
```

### 3. while 루프 주석 처리

새로운 디스플레이를 찾는 로직을 비활성화하기 위해 아래 두 줄을 찾아 각 줄 맨 앞에 # 기호를 추가하여 주석으로 만듭니다.

- 수정할 부분:
```python
# while os.path.exists(X_LOCK_FILE_TEMPLATE % display):
#   display += 1
```

### 4. launch_session 함수 수정

새로운 세션을 시작하는 launch_session 함수의 내부 코드를 수정합니다. 기존 서버 실행 관련 코드를 주석 처리하고, 대신 현재 디스플레이 환경 변수를 사용하도록 설정합니다. 아래 코드 블록과 완전히 동일한 모양이 되도록 해당 함수를 수정하세요.

- 수정 후 최종 모습:
```python
def launch_session(self, x_args):
  self._init_child_env()
  self._setup_pulseaudio()
  self._setup_gnubby()
  # self._launch_server(x_args)
  # if not self._launch_pre_session():
  #   # If there was no pre-session script, launch the session immediately.
  #   self.launch_desktop_session()
  display = self.get_unused_display_number()
  self.child_env["DISPLAY"] = ":%d" % display
```

### 5. 저장 후 종료

nano 편집기를 기준으로, Ctrl+X를 누른 다음 Y를 누르고 Enter 키를 쳐서 변경 사항을 저장하고 파일을 닫습니다.

## 4단계: 서비스 재시작

수정한 스크립트 설정을 적용하기 위해 크롬 원격 데스크톱 서비스를 다시 시작합니다.

```bash
/opt/google/chrome-remote-desktop/chrome-remote-desktop --start
```

## 완료!

이제 모든 설정이 완료되었습니다. 원격으로 접속하면 별도의 가상 세션이 아닌 현재 사용 중인 데스크톱 화면이 그대로 보이게 됩니다.
