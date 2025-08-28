# 대출의 모든것 🏛️

> 대출이 궁금하신가요? 잘 오셨습니다.

**대출의 모든것**은 개인 및 사업자를 위한 종합 대출 이자 계산 서비스입니다. 다양한 상환 방식과 신용점수 기반 금리 예측 기능을 제공하여 최적의 대출 계획을 세울 수 있도록 도와드립니다.

## 🌟 주요 기능

### 💰 대출 계산기
- **원리금 균등상환**: 매월 동일한 금액 상환
- **원금 균등상환**: 매월 동일한 원금 상환 (이자 점차 감소)
- **만기일시상환**: 만기에 원금과 이자를 일시 상환
- **체증식 상환**: 초기 낮은 상환액에서 시간에 따라 증가

### 📊 신용점수 기반 금리 예측
- **신용점수 범위**: 300~999점 지원
- **7단계 신용등급**: 최우수(900~999) ~ 매우위험(300~449)
- **대출 종류별 차별화**: 주택담보/신용/자동차/사업자대출
- **개인 맞춤 금리**: 소득수준, 근무형태 고려

### 🏦 은행 연동 서비스
- **주요 5개 은행**: 우리은행, 농협은행, 신한은행, KB국민은행, 하나은행
- **공식 홈페이지 연결**: 각 은행의 공식 웹사이트 바로가기
- **보안 최적화**: 안전한 외부 링크 연결

### 📱 모바일 최적화
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 완벽 지원
- **터치 친화적 UI**: 48px 최소 터치 영역
- **부드러운 애니메이션**: 60fps 최적화

## 🚀 시작하기

### 필요 조건
- Python 3.8 이상
- pip (Python 패키지 관리자)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/loan-calculator.git
   cd loan-calculator
   ```

2. **가상환경 생성 (권장)**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # macOS/Linux
   # 또는
   .venv\Scripts\activate     # Windows
   ```

3. **패키지 설치**
   ```bash
   pip install -r requirements.txt
   ```

4. **서버 실행**
   ```bash
   python3 app.py
   ```

5. **웹브라우저에서 접속**
   ```
   http://127.0.0.1:5000
   ```

## 🛠️ 기술 스택

### Backend
- **Flask**: Python 웹 프레임워크
- **NumPy**: 수치 계산 라이브러리
- **Jinja2**: 템플릿 엔진

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 반응형 디자인, CSS Grid/Flexbox
- **JavaScript**: 클라이언트 사이드 로직

### 디자인
- **정부 공공기관 스타일**: 신뢰성 있는 디자인
- **색상 팔레트**: 네이비 블루 (#1E3A8A), 청록색 (#0891B2)
- **폰트**: Noto Sans KR

## 📁 프로젝트 구조

```
loan-calculator/
├── app.py                 # Flask 메인 애플리케이션
├── requirements.txt       # Python 패키지 의존성
├── PRD.md                # 제품 요구사항 문서
├── README.md             # 프로젝트 설명서
├── .gitignore            # Git 무시 파일 목록
├── static/               # 정적 파일
│   ├── css/
│   │   └── style.css     # 메인 스타일시트
│   └── js/
│       └── script.js     # 프론트엔드 JavaScript
└── templates/            # HTML 템플릿
    └── index.html        # 메인 페이지
```

## 🔧 API 엔드포인트

### POST /calculate
대출 이자 계산

**요청 파라미터:**
```json
{
  "principal": 100000000,
  "annual_rate": 3.5,
  "years": 20,
  "months": 0,
  "payment_type": "equal_payment",
  "step_rate": 5
}
```

### POST /estimate-rate
신용점수 기반 금리 예측

**요청 파라미터:**
```json
{
  "credit_score": 750,
  "loan_type": "mortgage",
  "income": 5000,
  "employment_type": "regular"
}
```

## 🧮 계산 방식 설명

### 원리금 균등상환
매월 동일한 금액(원금+이자)을 상환하는 방식으로, 초기에는 이자 비중이 높고 시간이 지날수록 원금 비중이 높아집니다.

### 원금 균등상환
매월 동일한 원금을 상환하고 이자는 잔여 원금에 대해 계산하는 방식으로, 시간이 지날수록 월 상환액이 감소합니다.

### 만기일시상환
대출 기간 중에는 이자만 납부하고 만기에 원금을 일시 상환하는 방식입니다.

### 체증식 상환
초기에는 낮은 상환액으로 시작하여 매년 일정 비율씩 상환액이 증가하는 방식으로, 소득 증가가 예상되는 고객에게 적합합니다.

## 📊 신용등급 시스템

| 신용점수 | 등급 | 금리 조정 |
|---------|------|----------|
| 900~999 | 최우수 | -2.0% |
| 850~899 | 우수 | -1.5% |
| 750~849 | 양호 | -1.0% |
| 650~749 | 보통 | -0.5% |
| 550~649 | 주의 | +0.5% |
| 450~549 | 위험 | +1.5% |
| 300~449 | 매우위험 | +3.0% |

## 🏦 연계 금융기관

- [우리은행](https://www.wooribank.com) 🔷
- [농협은행](https://www.nonghyup.com) 🟢
- [신한은행](https://www.shinhan.com) 🔵
- [KB국민은행](https://www.kbstar.com) 🟡
- [하나은행](https://www.kebhana.com) 🟠

## 🔗 관련 기관

- [금융감독원](https://www.fss.or.kr)
- [한국은행](https://www.bok.or.kr)
- [예금보험공사](https://www.kdic.or.kr)
- [주택도시기금](https://www.hf.go.kr)

## 📱 반응형 지원

- **데스크톱**: 1400px+ (3단 레이아웃)
- **태블릿**: 768px~1199px (2단 레이아웃)
- **모바일**: ~767px (1단 레이아웃)

## ⚠️ 중요 고지사항

본 계산기는 **참고용**이며, 실제 대출 조건은 각 금융기관에 문의하시기 바랍니다. 계산 결과는 일반적인 대출 상품 기준이며, 개인의 신용상태, 담보 조건, 대출 정책 등에 따라 실제 조건과 차이가 날 수 있습니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🤝 기여하기

프로젝트 개선에 기여하고 싶으시다면:

1. Fork 생성
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📞 문의

프로젝트에 대한 문의사항이나 개선 제안이 있으시면 이슈를 생성해 주세요.

---

**© 2025 대출의 모든것. All rights reserved.**
