# gksrmf-to-hangul

한국어 | [English](./README-en_us.md)

영문 두벌식 입력을 한 번에 변환해 주는 간단한 웹 입력기입니다.  
예를 들어 `gksrmf`를 입력하면 `한글`로 실시간 변환됩니다.

## 기능

- 단일 입력창 IME 스타일 동작
- 영타 입력을 실시간으로 한글로 변환
- 변환 결과 복사 버튼 제공
- 결과는 동일한 창에 표시되어 별도 출력창 없음

## 기술 스택

- React
- TypeScript
- Vite

## 시작하기

### 요구 사항

- Node.js 18 이상 권장
- npm

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

기본 주소:

```text
http://localhost:5173
```

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 결과 미리보기

```bash
npm run preview
```

## 환경 변수

`.env.example`을 참고해 `.env` 파일을 만들 수 있습니다.

```env
VITE_PORT=5173
VITE_HOST=0.0.0.0
VITE_ALLOWED_HOSTS=
```

- `VITE_PORT`: 개발 서버 및 프리뷰 서버 포트
- `VITE_HOST`: 바인딩할 호스트
- `VITE_ALLOWED_HOSTS`: 허용할 호스트 목록. 여러 값은 쉼표로 구분

## 사용 예시

- `gksrmf` -> `한글`
- `dkssudgktpdy` -> `안녕하세요`

## 프로젝트 구조

```text
src/
  App.tsx        메인 UI 및 변환 로직
  App.css        컴포넌트 스타일
  main.tsx       앱 진입점
  index.css      전역 스타일
```

## 라이선스

[MIT](./LICENSE)
