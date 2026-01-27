## Branch Strategy

- develop: 개발용 브랜치
- release: 운영 배포 전 점검용 브랜치
- main: 운영 배포 브랜치

## Deployment Flow

1. develop에서 release 브랜치 생성
2. release에서 기능 점검 및 수정
3. 점검 완료 후 release → main 병합
4. main 병합 직후 버전 태그 생성
5. main의 변경 사항을 develop에 병합

## Rules

- main에는 직접 커밋하지 않는다
- main 병합은 반드시 PR을 통해 진행한다
- 운영 배포 시 반드시 태그를 생성한다
