# Hi-Korea

Hi-Korea은 한국의 음식, 셀카 명소, 가족 친화적인 장소를 중점적으로 다루는 여행 앱의 백엔드 API 서버입니다.

## 기술 스택

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication
- Passport
- Docker

## 시작하기

### 사전 요구사항

- Node.js (v18 이상)
- pnpm
- PostgreSQL
- Docker (선택사항)

### 설치

```bash
# 프로젝트 클론
$ git clone https://github.com/cocoburger/Hi-Korea

# 디렉토리 이동
$ cd k-road-trip

# 의존성 설치
$ pnpm install

# 환경 변수 설정
$ cp .env.example .env
```

### 환경 변수 설정

`.env` 파일을 다음과 같이 설정하세요:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=k_road_trip
JWT_SECRET=your_jwt_secret
```

### 실행 방법

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

### 테스트

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## API 문서

API 문서는 Swagger를 통해 제공됩니다. 서버 실행 후 다음 URL에서 확인할 수 있습니다:
`http://localhost:3000/api`

## 주요 기능

### 현재 구현된 기능

- 사용자 인증
    - 회원가입
    - 로그인
    - JWT 인증

### 구현 예정 기능

- 소셜 로그인 (카카오, 네이버, 구글)
- 사용자 프로필 관리
- 이메일 인증
- 비밀번호 재설정
- 맛집 정보 관리
- 셀카 명소 정보 관리
- 가족 친화 장소 정보 관리
- 여행 코스 관리
- 커뮤니티 기능
- 다국어 지원

## 프로젝트 구조

```
src/
├── auth/              # 인증 관련 모듈
├── users/             # 사용자 관련 모듈
├── common/            # 공통 유틸리티, 데코레이터 등
├── config/           # 환경 설정
└── main.ts           # 애플리케이션 엔트리 포인트
```

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

MIT License를 따릅니다. [LICENSE](LICENSE) 파일을 참고하세요.

## 연락처

프로젝트 관리자 - [@your-twitter](https://twitter.com/your-twitter) - email@example.com

프로젝트 링크: [https://github.com/your-username/k-road-trip](https://github.com/your-username/k-road-trip)
