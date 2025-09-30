---
title: "[Git] Git Commit Message Guidelines & Template"
date: 2025-09-30
categories: tech-tips
tags: [git, commit-message, best-practices]
toc: true
toc_sticky: true
---

처음 Git을 사용할 때는 그냥 아무렇게나 커밋 메시지를 작성했었다. "update", "fix bug", "작업 완료" 같은 메시지들... 그런데 몇 달 후에 다시 프로젝트를 봤을 때, 도대체 뭘 수정한 건지 한 눈에 파악하기가 너무 어려웠다.

그래서 Git 커밋 컨벤션에 대해 찾아보기 시작했고, 그러던 중 [borahm님의 블로그 포스트](https://velog.io/@bky373/Git-%EC%BB%A4%EB%B0%8B-%EB%A9%94%EC%8B%9C%EC%A7%80-%ED%85%9C%ED%94%8C%EB%A6%BF)에서 정말 잘 정리된 커밋 메시지 템플릿을 발견했다.

그 템플릿을 기반으로 내 스타일을 더해봤다. 특히 `previously/now` 형식을 추가해서 변경 전후를 명확하게 비교할 수 있게 했고, 본문 윗부분은 전체적인 요약을, `previously/now`는 구체적인 변경사항을 보여주도록 역할을 구분했다.

결과적으로 지금은 커밋 히스토리만 봐도 프로젝트의 변화 과정을 한 눈에 파악할 수 있는, 간결하면서도 명확한 템플릿을 완성할 수 있었다. 이 템플릿이 다른 사람들에게도 도움이 되었으면 좋겠다!

## 커밋 메시지 템플릿

```bash
###############
# IMPORTANT: All commit messages must be written in English
# <타입> : <제목> 의 형식으로 제목을 아래 공백줄에 작성
# 제목은 50자 이내 / 변경사항이 "무엇"인지 명확히 작성 / 끝에 마침표 금지
# 예) feat : Add login functionality

# 바로 아래 공백은 지우지 마세요 (제목과 본문의 분리를 위함)

################
# 본문(구체적인 내용)을 아랫줄에 작성
# 줄마다 "-"로 구분 (한 줄은 72자 이내)
# 마지막 2줄은 -previously: , - now: 로 직관적인 수식 등을 활용해 before after 작성
# previously/now는 직관적으로, 그 위의 본문은 요약 느낌으로 작성

################
# 꼬릿말(footer)을 아랫줄에 작성 (현재 커밋과 관련된 이슈 번호 추가 등)
# 예) Close #7

################
# feat : 새로운 기능 추가
# fix : 버그 수정
# docs : 문서 수정
# test : 테스트 코드 추가
# refact : 코드 리팩토링
# style : 코드 의미에 영향을 주지 않는 변경사항
# chore : 빌드 부분 혹은 패키지 매니저 수정사항
################
```

## 형식 상세 설명

### 제목 (Title)
- **형식**: `<타입> : <제목>`
- **길이**: 50자 이내
- **규칙**:
  - 변경사항이 "무엇"인지 명확히 작성
  - 마침표 금지
  - 영어로 작성

### 본문 (Body)
- 구체적인 내용 작성
- 한 줄당 72자 이내
- 각 항목은 "-"로 구분
- 마지막 두 줄은 변경 전후 비교:
  - `- previously: 이전 상태`
  - `- now: 현재 상태`

### 꼬릿말 (Footer)
- 관련 이슈 번호 추가
- 예: `Close #7`, `Fixes #123`

## 커밋 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| **feat** | 새로운 기능 추가 | `feat : Add user authentication` |
| **fix** | 버그 수정 | `fix : Resolve memory leak in data parser` |
| **docs** | 문서 수정 | `docs : Update README with installation guide` |
| **test** | 테스트 코드 추가 | `test : Add unit tests for user service` |
| **refact** | 코드 리팩토링 | `refact : Optimize database query performance` |
| **style** | 코드 의미에 영향 없는 변경 | `style : Format code with prettier` |
| **chore** | 빌드/패키지 매니저 수정 | `chore : Update npm dependencies` |

## 좋은 예시 vs 나쁜 예시

### ❌ 나쁜 예시
```
fix bug
update
작업 완료
```

### ✅ 좋은 예시
```
feat : Add email validation to signup form

- Implement regex pattern for email validation
- Add error message display for invalid emails
- Update form submission logic
- previously: Form accepted any string as email
- now: Form validates email format before submission

Close #42
```

## 팁

- 제목만으로도 변경사항을 파악할 수 있게 작성
- 본문에는 "왜" 변경했는지 설명
- previously/now로 변경 전후를 명확히 비교
- 팀 프로젝트라면 팀원과 규칙 공유

## 블로그 운영을 위한 최적화 버전

위 템플릿은 일반적인 소프트웨어 개발에 적합하지만, **블로그 운영에는 다소 과할 수 있다**는 것을 깨달았다. 포스트 하나 추가하는데 `previously/now`를 쓰는 건 좀 과하지 않나?

그래서 이 블로그 프로젝트에서는 **블로그 운영에 최적화된 버전**을 별도로 만들어 사용하기로 했다.

### 블로그용 커밋 메시지 템플릿

```bash
###############
# IMPORTANT: All commit messages must be written in English
# <타입> : <제목> 의 형식으로 제목을 아래 공백줄에 작성
# 제목은 50자 이내 / 변경사항이 "무엇"인지 명확히 작성 / 끝에 마침표 금지
# 예) post : Add Git commit message guidelines

# 바로 아래 공백은 지우지 마세요 (제목과 본문의 분리를 위함)

################
# post/update 타입인 경우: 포스트 메타정보 추가 (필수)
# Title: 포스트 제목
# Date: YYYY-MM-DD
# Category: 카테고리명
# Tags: tag1, tag2, tag3
#
# 본문(선택사항) - 필요시에만 작성
# 줄마다 "-"로 구분 (한 줄은 72자 이내)
# 코드나 설정 변경 시 previously/now 형식 사용 권장
# - previously: 이전 상태
# - now: 현재 상태

################
# 꼬릿말(선택사항) - 관련 이슈가 있을 경우에만 작성
# 예) Close #7

################
# post : 새 포스트 작성
# update : 포스트 내용 수정
# feat : 블로그 기능 추가 (테마, 플러그인, 페이지 등)
# fix : 오타, 버그, 링크 수정
# docs : README, 문서 수정
# test : 테스트 코드 추가
# refact : 코드 리팩토링
# style : CSS, 디자인, 레이아웃, 포맷팅 변경
# chore : 설정 파일, 의존성, 빌드 관련
################
```

### 일반 템플릿과의 차이점

| 항목 | 일반 템플릿 | 블로그 최적화 템플릿 |
|------|-------------|---------------------|
| **타입 개수** | 7개 | 9개 (`post`, `update` 추가) |
| **본문 작성** | 필수 권장 | 선택사항 (간단한 변경은 제목만) |
| **previously/now** | 항상 사용 권장 | 코드/설정 변경 시에만 |
| **Footer** | 이슈 번호 작성 | 선택사항 |

### 블로그 특화 타입

추가된 두 가지 타입으로 블로그 콘텐츠 관리가 훨씬 명확해진다:

| 타입 | 설명 | 예시 |
|------|------|------|
| **post** | 새 포스트 작성 | `post : Add Docker basic tutorial` |
| **update** | 포스트 내용 수정 | `update : Fix code examples in Docker tutorial` |

**기존 타입들의 의미 변화:**
- `feat` : ~~새 기능~~ → **블로그 기능 추가** (검색, 댓글, 테마 등)
- `style` : ~~코드 포맷~~ → **CSS, 디자인 변경**

### 블로그 운영 예시

#### 1. 새 포스트 작성
```
post : Add Docker basic tutorial

Date: 2025-10-01
Category: tech-tips
Tags: docker, container, tutorial

- Cover Docker installation
- Explain container concepts
- Include practical examples
```

#### 2. 포스트 수정
```
update : Fix typos in Git commit post

Date: 2025-09-30
Category: tech-tips
Tags: git, commit-message

- Correct spelling mistakes
- Fix broken links
```

#### 3. 디자인 변경
```
style : Update navbar design

- Change background color to dark theme
- previously: Light blue navbar
- now: Dark navy navbar with better contrast
```

#### 4. 블로그 기능 추가
```
feat : Add search functionality

- Integrate lunr.js for client-side search
- Add search bar to navigation
```

#### 5. 설정 변경
```
chore : Update site configuration

- Change site URL to custom domain
- Update social media links
- previously: url: "https://username.github.io"
- now: url: "https://myblog.com"
```


