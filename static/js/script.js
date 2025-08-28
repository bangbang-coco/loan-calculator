// DOM 요소들
const loanForm = document.getElementById('loanForm');
const resultPanel = document.getElementById('resultPanel');
const resultSummary = document.getElementById('resultSummary');
const scheduleContainer = document.getElementById('scheduleContainer');
const scheduleTable = document.getElementById('scheduleTable');
const paymentTypeSelect = document.getElementById('payment_type');
const stepRateGroup = document.getElementById('step-rate-group');
const loadingModal = document.getElementById('loadingModal');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');

// 모바일 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    // 모바일 최적화 초기화
    initMobileOptimizations();
    
    // 상환 방식 변경 시 체증률 입력 필드 표시/숨김
    paymentTypeSelect.addEventListener('change', function() {
        if (this.value === 'step_up_payment') {
            stepRateGroup.style.display = 'block';
        } else {
            stepRateGroup.style.display = 'none';
        }
    });

    // 폼 제출 이벤트
    loanForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateLoan();
    });

    // 숫자 입력 필드에 천단위 콤마 추가
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        if (input.id === 'principal') {
            // input 타입을 text로 변경하여 콤마 입력 허용
            input.type = 'text';
            input.inputMode = 'numeric';
            
            // 입력 이벤트
            input.addEventListener('input', function(e) {
                formatNumberInput(this);
            });
            
            // 포커스 시 전체 선택 (사용자 편의성)
            input.addEventListener('focus', function() {
                setTimeout(() => {
                    this.select();
                }, 0);
            });
            
            // 키 입력 제한 (숫자, 백스페이스, 삭제, 화살표키만 허용)
            input.addEventListener('keydown', function(e) {
                const allowedKeys = [
                    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                    'Home', 'End'
                ];
                
                if (allowedKeys.includes(e.key) ||
                    (e.key >= '0' && e.key <= '9') ||
                    (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))) {
                    return true;
                }
                
                e.preventDefault();
                return false;
            });
        }
        
        // 모바일에서 숫자 키패드 최적화
        if (isMobile) {
            input.addEventListener('focus', function() {
                // iOS Safari에서 더 나은 숫자 입력을 위해
                if (this.id === 'principal') {
                    this.inputMode = 'numeric';
                } else if (this.id === 'annual_rate' || this.id === 'step_rate') {
                    this.inputMode = 'decimal';
                }
            });
        }
    });
});

// 모바일 최적화 초기화
function initMobileOptimizations() {
    if (isMobile) {
        // 모바일에서 부드러운 스크롤링 개선
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // 터치 스크롤 최적화
        const scrollElements = document.querySelectorAll('.table-responsive');
        scrollElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
        });
        
        // 모바일에서 폰트 크기 자동 조정 방지
        document.querySelector('meta[name=viewport]').setAttribute('content', 
            'width=device-width, initial-scale=1.0, user-scalable=yes, maximum-scale=5.0');
    }
}

// 숫자 포맷팅 함수
function formatNumberInput(input) {
    // 현재 커서 위치 저장
    let cursorPosition = input.selectionStart;
    let originalLength = input.value.length;
    
    // 콤마 제거
    let value = input.value.replace(/,/g, '');
    
    // 숫자가 아닌 문자 제거 (첫 번째 자리의 0도 허용)
    value = value.replace(/[^\d]/g, '');
    
    if (value && value !== '0') {
        // 천단위 콤마 추가
        let formattedValue = parseInt(value).toLocaleString();
        input.value = formattedValue;
        
        // 커서 위치 조정 (콤마가 추가된 만큼 조정)
        let newLength = formattedValue.length;
        let lengthDiff = newLength - originalLength;
        let newPosition = cursorPosition + lengthDiff;
        
        // 커서 위치가 유효한 범위 내에 있도록 조정
        if (newPosition > newLength) newPosition = newLength;
        if (newPosition < 0) newPosition = 0;
        
        // 다음 이벤트 루프에서 커서 위치 설정
        setTimeout(() => {
            input.setSelectionRange(newPosition, newPosition);
        }, 0);
    } else if (value === '') {
        input.value = '';
    }
}

// 숫자에서 콤마 제거하고 파싱
function parseNumber(value) {
    if (typeof value === 'string') {
        // 콤마와 공백 제거
        const cleanValue = value.replace(/[,\s]/g, '');
        const number = parseFloat(cleanValue);
        return isNaN(number) ? 0 : number;
    }
    return parseFloat(value) || 0;
}

// 숫자를 천단위 콤마로 포맷
function formatNumber(number) {
    return Math.round(number).toLocaleString();
}

// 대출 계산 함수
async function calculateLoan() {
    const formData = new FormData(loanForm);
    
    // principal 값을 직접 input에서 가져와서 파싱
    const principalInput = document.getElementById('principal');
    const principalValue = parseNumber(principalInput.value);
    
    const data = {
        principal: principalValue,
        annual_rate: parseFloat(formData.get('annual_rate')) || 0,
        years: parseInt(formData.get('years')) || 0,
        months: parseInt(formData.get('months')) || 0,
        payment_type: formData.get('payment_type'),
        step_rate: parseFloat(formData.get('step_rate')) || 5
    };

    // 유효성 검사
    if (!validateInput(data)) {
        return;
    }

    showLoading();

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            displayResult(result, data);
        } else {
            showError(result.error || '계산 중 오류가 발생했습니다.');
        }
    } catch (error) {
        showError('서버 연결 오류가 발생했습니다.');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

// 입력 유효성 검사
function validateInput(data) {
    if (data.principal <= 0) {
        showError('대출 원금을 올바르게 입력해주세요.');
        return false;
    }

    if (data.annual_rate < 0) {
        showError('연이율은 0% 이상이어야 합니다.');
        return false;
    }

    if (data.years === 0 && data.months === 0) {
        showError('대출 기간을 입력해주세요.');
        return false;
    }

    if (!data.payment_type) {
        showError('상환 방식을 선택해주세요.');
        return false;
    }

    if (data.payment_type === 'step_up_payment' && data.step_rate <= 0) {
        showError('체증률은 0%보다 커야 합니다.');
        return false;
    }

    return true;
}

// 결과 표시
function displayResult(result, inputData) {
    const paymentTypeNames = {
        'equal_payment': '원리금 균등상환',
        'equal_principal': '원금 균등상환',
        'maturity_payment': '만기일시상환',
        'step_up_payment': '체증식 상환'
    };

    let summaryHTML = `
        <div class="result-item">
            <span class="result-label">대출 원금</span>
            <span class="result-value">${formatNumber(inputData.principal)}원</span>
        </div>
        <div class="result-item">
            <span class="result-label">연이율</span>
            <span class="result-value">${inputData.annual_rate}%</span>
        </div>
        <div class="result-item">
            <span class="result-label">대출 기간</span>
            <span class="result-value">${inputData.years}년 ${inputData.months}개월</span>
        </div>
        <div class="result-item">
            <span class="result-label">상환 방식</span>
            <span class="result-value">${paymentTypeNames[inputData.payment_type]}</span>
        </div>
    `;

    // 상환 방식별 특별 정보 추가
    if (inputData.payment_type === 'equal_payment') {
        summaryHTML += `
            <div class="result-item">
                <span class="result-label">월 상환액</span>
                <span class="result-value highlight">${formatNumber(result.monthly_payment)}원</span>
            </div>
        `;
    } else if (inputData.payment_type === 'equal_principal') {
        summaryHTML += `
            <div class="result-item">
                <span class="result-label">첫 달 상환액</span>
                <span class="result-value highlight">${formatNumber(result.first_payment)}원</span>
            </div>
            <div class="result-item">
                <span class="result-label">마지막 달 상환액</span>
                <span class="result-value">${formatNumber(result.last_payment)}원</span>
            </div>
        `;
    } else if (inputData.payment_type === 'maturity_payment') {
        summaryHTML += `
            <div class="result-item">
                <span class="result-label">월 이자액</span>
                <span class="result-value highlight">${formatNumber(result.monthly_interest)}원</span>
            </div>
            <div class="result-item">
                <span class="result-label">만기 상환액</span>
                <span class="result-value highlight">${formatNumber(result.final_payment)}원</span>
            </div>
        `;
    } else if (inputData.payment_type === 'step_up_payment') {
        summaryHTML += `
            <div class="result-item">
                <span class="result-label">체증률</span>
                <span class="result-value">${inputData.step_rate}%/년</span>
            </div>
            <div class="result-item">
                <span class="result-label">초기 상환액</span>
                <span class="result-value highlight">${formatNumber(result.initial_payment)}원</span>
            </div>
            <div class="result-item">
                <span class="result-label">최종 상환액</span>
                <span class="result-value">${formatNumber(result.final_payment)}원</span>
            </div>
        `;
    }

    summaryHTML += `
        <div class="result-item">
            <span class="result-label">총 상환 금액</span>
            <span class="result-value highlight">${formatNumber(result.total_payment)}원</span>
        </div>
        <div class="result-item">
            <span class="result-label">총 이자 부담</span>
            <span class="result-value highlight">${formatNumber(result.total_interest)}원</span>
        </div>
    `;

    resultSummary.innerHTML = summaryHTML;
    resultPanel.style.display = 'block';

    // 모바일에서 부드러운 스크롤
    const scrollOptions = {
        behavior: 'smooth',
        block: isMobile ? 'start' : 'center'
    };
    
    // 스크롤을 결과 영역으로 이동
    setTimeout(() => {
        resultPanel.scrollIntoView(scrollOptions);
    }, 100);

    // 스케줄 데이터 저장 (나중에 표시할 때 사용)
    window.currentSchedule = result.schedule;
}

// 상환 계획표 토글
function toggleSchedule() {
    if (scheduleContainer.style.display === 'none') {
        generateScheduleTable();
        scheduleContainer.style.display = 'block';
    } else {
        scheduleContainer.style.display = 'none';
    }
}

// 상환 계획표 생성
function generateScheduleTable() {
    if (!window.currentSchedule) return;

    const schedule = window.currentSchedule;
    
    // 모바일에서는 더 간단한 테이블 헤더 사용
    const isMobileTable = window.innerWidth <= 480;
    
    let tableHTML = `
        <thead>
            <tr>
                <th>회차</th>
                <th>${isMobileTable ? '상환액' : '월상환액'}</th>
                <th>원금</th>
                <th>이자</th>
                <th>${isMobileTable ? '잔액' : '대출잔액'}</th>
            </tr>
        </thead>
        <tbody>
    `;

    schedule.forEach(row => {
        // 모바일에서는 숫자 표시를 더 간결하게
        const formatForMobile = (num) => {
            if (isMobileTable && num >= 10000) {
                return Math.round(num / 10000) + '만원';
            }
            return formatNumber(num) + '원';
        };
        
        tableHTML += `
            <tr>
                <td>${row.month}</td>
                <td>${isMobileTable ? formatForMobile(row.payment) : formatNumber(row.payment) + '원'}</td>
                <td>${isMobileTable ? formatForMobile(row.principal) : formatNumber(row.principal) + '원'}</td>
                <td>${isMobileTable ? formatForMobile(row.interest) : formatNumber(row.interest) + '원'}</td>
                <td>${isMobileTable ? formatForMobile(row.balance) : formatNumber(row.balance) + '원'}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody>';
    scheduleTable.innerHTML = tableHTML;
    
    // 모바일에서 테이블 스크롤 힌트 추가
    if (isMobileTable) {
        const tableContainer = scheduleContainer.querySelector('.table-responsive');
        if (tableContainer && !tableContainer.querySelector('.scroll-hint')) {
            const scrollHint = document.createElement('div');
            scrollHint.className = 'scroll-hint';
            scrollHint.innerHTML = '← 좌우로 스크롤하여 전체 내용을 확인하세요 →';
            scrollHint.style.cssText = `
                text-align: center;
                font-size: 0.8rem;
                color: #6B7280;
                padding: 0.5rem;
                background: #F9FAFB;
                border-top: 1px solid #E5E7EB;
            `;
            tableContainer.appendChild(scrollHint);
        }
    }
}

// 로딩 표시
function showLoading() {
    loadingModal.style.display = 'flex';
}

// 로딩 숨김
function hideLoading() {
    loadingModal.style.display = 'none';
}

// 오류 표시
function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
}

// 오류 모달 닫기
function closeErrorModal() {
    errorModal.style.display = 'none';
}

// 인쇄 기능
function printResult() {
    window.print();
}

// 스무스 스크롤링 (네비게이션용)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 모달 외부 클릭 시 닫기
window.addEventListener('click', function(e) {
    if (e.target === errorModal) {
        closeErrorModal();
    }
});

// 키보드 접근성
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (errorModal.style.display === 'flex') {
            closeErrorModal();
        }
    }
});

// 신용점수 기반 금리 계산 함수
function calculateInterestRate() {
    const creditScore = parseInt(document.getElementById('credit_score').value) || 0;
    const loanType = document.getElementById('loan_type').value;
    const income = parseInt(document.getElementById('income').value) || 0;
    const employmentType = document.getElementById('employment_type').value;
    
    if (creditScore < 300 || creditScore > 950) {
        showError('신용점수는 300~950 사이의 값을 입력해주세요.');
        return;
    }
    
    if (income <= 0) {
        showError('연소득을 입력해주세요.');
        return;
    }
    
    // 기본 금리 설정 (대출 종류별)
    let baseRate = 0;
    switch (loanType) {
        case 'mortgage':
            baseRate = 3.5; // 주택담보대출
            break;
        case 'personal':
            baseRate = 6.5; // 신용대출
            break;
        case 'auto':
            baseRate = 4.5; // 자동차대출
            break;
        case 'business':
            baseRate = 5.5; // 사업자대출
            break;
        default:
            baseRate = 5.0;
    }
    
    // 신용점수에 따른 금리 조정
    let creditAdjustment = 0;
    if (creditScore >= 850) {
        creditAdjustment = -1.5; // 우수
    } else if (creditScore >= 750) {
        creditAdjustment = -1.0; // 양호
    } else if (creditScore >= 650) {
        creditAdjustment = -0.5; // 보통
    } else if (creditScore >= 550) {
        creditAdjustment = 0.5; // 주의
    } else if (creditScore >= 450) {
        creditAdjustment = 1.5; // 위험
    } else {
        creditAdjustment = 3.0; // 매우 위험
    }
    
    // 근무형태에 따른 금리 조정
    let employmentAdjustment = 0;
    switch (employmentType) {
        case 'regular':
            employmentAdjustment = 0; // 정규직
            break;
        case 'contract':
            employmentAdjustment = 0.3; // 계약직
            break;
        case 'freelance':
            employmentAdjustment = 0.8; // 프리랜서
            break;
        case 'business':
            employmentAdjustment = 0.5; // 사업자
            break;
    }
    
    // 소득에 따른 금리 조정 (연소득 5000만원 이상 우대)
    let incomeAdjustment = 0;
    if (income >= 10000) {
        incomeAdjustment = -0.3; // 고소득
    } else if (income >= 7000) {
        incomeAdjustment = -0.2; // 중상위소득
    } else if (income >= 5000) {
        incomeAdjustment = -0.1; // 중위소득
    } else if (income < 3000) {
        incomeAdjustment = 0.2; // 저소득
    }
    
    // 최종 금리 계산
    const estimatedRate = Math.max(
        1.0, // 최소 금리 1%
        Math.min(
            15.0, // 최대 금리 15%
            baseRate + creditAdjustment + employmentAdjustment + incomeAdjustment
        )
    );
    
    // 금리 범위 계산 (±0.5%)
    const minRate = Math.max(1.0, estimatedRate - 0.5);
    const maxRate = Math.min(15.0, estimatedRate + 0.5);
    
    // 결과 표시
    displayCreditResult(estimatedRate, minRate, maxRate, creditScore);
}

// 신용점수 계산 결과 표시
function displayCreditResult(rate, minRate, maxRate, creditScore) {
    const creditResult = document.getElementById('creditResult');
    const estimatedRateElement = document.getElementById('estimatedRate');
    const rateRangeElement = document.getElementById('rateRange');
    
    estimatedRateElement.textContent = rate.toFixed(2) + '%';
    rateRangeElement.textContent = `예상 금리 범위: ${minRate.toFixed(2)}% ~ ${maxRate.toFixed(2)}%`;
    
    // 신용점수 등급 표시
    let creditGrade = '';
    if (creditScore >= 850) creditGrade = '(우수 등급)';
    else if (creditScore >= 750) creditGrade = '(양호 등급)';
    else if (creditScore >= 650) creditGrade = '(보통 등급)';
    else if (creditScore >= 550) creditGrade = '(주의 등급)';
    else if (creditScore >= 450) creditGrade = '(위험 등급)';
    else creditGrade = '(매우 위험 등급)';
    
    rateRangeElement.innerHTML += `<br><small>신용점수 ${creditScore}점 ${creditGrade}</small>`;
    
    creditResult.style.display = 'block';
    
    // 전역 변수로 저장 (다른 함수에서 사용)
    window.estimatedInterestRate = rate;
}

// 예상 금리를 대출 계산에 적용
function applyEstimatedRate() {
    if (window.estimatedInterestRate) {
        document.getElementById('annual_rate').value = window.estimatedInterestRate.toFixed(2);
        
        // 부드러운 스크롤로 대출 조건 입력으로 이동
        document.getElementById('annual_rate').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // 입력 필드 강조
        const rateInput = document.getElementById('annual_rate');
        rateInput.style.borderColor = '#0891B2';
        rateInput.style.boxShadow = '0 0 0 3px rgba(8, 145, 178, 0.3)';
        
        setTimeout(() => {
            rateInput.style.borderColor = '';
            rateInput.style.boxShadow = '';
        }, 2000);
    }
}
