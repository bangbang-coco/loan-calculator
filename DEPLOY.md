# 배포 가이드 (Deployment Guide)

이 문서는 로컬에서 빌드한 `loan-calculator` 컨테이너 이미지를 다른 서버나 Kubernetes 클러스터에 배포하는 방법을 설명합니다.

## 1. 컨테이너 레지스트리에 이미지 업로드

다른 서버에서 이미지를 다운로드하려면 먼저 Docker Hub와 같은 컨테이너 레지스트리에 이미지를 올려야 합니다.

### 1.1 Docker Hub 계정 준비
[Docker Hub](https://hub.docker.com/) 계정이 없다면 회원가입을 진행해주세요.

### 1.2 이미지 태그 설정
로컬 이미지를 Docker Hub 사용자 이름과 매칭되도록 태그를 지정합니다.
(`your-username`을 실제 Docker Hub 아이디로 변경하세요)

```bash
# 형식: docker tag [로컬이미지명] [사용자명]/[이미지명]:[태그]
docker tag loan-calculator:latest your-username/loan-calculator:latest
```

### 1.3 Docker Hub 로그인
터미널에서 Docker Hub에 로그인합니다.

```bash
docker login
# 아이디와 비밀번호 입력
```

### 1.4 이미지 푸시 (업로드)
이미지를 Docker Hub로 전송합니다.

```bash
docker push your-username/loan-calculator:latest
```

---

## 2. 다른 서버에서 실행하기 (Docker)

Docker가 설치된 다른 서버에서 이미지를 받아 실행하는 방법입니다.

### 2.1 이미지 다운로드 (Pull)
```bash
docker pull your-username/loan-calculator:latest
```

### 2.2 컨테이너 실행
```bash
# 8080 포트로 실행 (포트 충돌 방지)
docker run -d -p 8080:5000 --name loan-app your-username/loan-calculator:latest
```

---

## 3. Kubernetes(K8S)에 배포하기

Kubernetes 클러스터에 배포하려면 매니페스트 파일을 수정하여 Docker Hub 이미지를 사용하도록 설정해야 합니다.

### 3.1 deployment.yaml 수정
`k8s/deployment.yaml` 파일에서 `image` 부분을 수정합니다.

**변경 전:**
```yaml
    spec:
      containers:
      - name: loan-calculator
        image: loan-calculator:latest  # 로컬 이미지
        imagePullPolicy: IfNotPresent
```

**변경 후:**
```yaml
    spec:
      containers:
      - name: loan-calculator
        image: your-username/loan-calculator:latest  # Docker Hub 이미지
        imagePullPolicy: Always
```

### 3.2 배포 적용
kubectl 명령어로 클러스터에 배포합니다.

```bash
# 배포 생성/업데이트
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 상태 확인
kubectl get pods
kubectl get svc
```

### 3.3 서비스 접속
`LoadBalancer` 타입의 서비스인 경우, 할당된 `EXTERNAL-IP`를 확인하여 접속합니다.

```bash
kubectl get svc loan-calculator-service
```
