from flask import Flask, render_template, request, jsonify
import numpy as np
from datetime import datetime, timedelta
import math

app = Flask(__name__)

class LoanCalculator:
    def __init__(self, principal, annual_rate, years, months=0):
        self.principal = principal
        self.annual_rate = annual_rate / 100  # 퍼센트를 소수로 변환
        self.monthly_rate = self.annual_rate / 12
        self.total_months = years * 12 + months
        
    def equal_payment(self):
        """원리금 균등상환 계산"""
        if self.monthly_rate == 0:
            monthly_payment = self.principal / self.total_months
            return self._generate_schedule_zero_rate(monthly_payment)
        
        monthly_payment = self.principal * (self.monthly_rate * (1 + self.monthly_rate)**self.total_months) / \
                         ((1 + self.monthly_rate)**self.total_months - 1)
        
        schedule = []
        remaining_balance = self.principal
        total_interest = 0
        
        for month in range(1, self.total_months + 1):
            interest_payment = remaining_balance * self.monthly_rate
            principal_payment = monthly_payment - interest_payment
            remaining_balance -= principal_payment
            total_interest += interest_payment
            
            schedule.append({
                'month': month,
                'payment': round(monthly_payment, 0),
                'principal': round(principal_payment, 0),
                'interest': round(interest_payment, 0),
                'balance': round(max(0, remaining_balance), 0)
            })
        
        return {
            'schedule': schedule,
            'total_payment': round(self.principal + total_interest, 0),
            'total_interest': round(total_interest, 0),
            'monthly_payment': round(monthly_payment, 0)
        }
    
    def equal_principal(self):
        """원금 균등상환 계산"""
        principal_payment = self.principal / self.total_months
        
        schedule = []
        remaining_balance = self.principal
        total_interest = 0
        
        for month in range(1, self.total_months + 1):
            interest_payment = remaining_balance * self.monthly_rate
            total_payment = principal_payment + interest_payment
            remaining_balance -= principal_payment
            total_interest += interest_payment
            
            schedule.append({
                'month': month,
                'payment': round(total_payment, 0),
                'principal': round(principal_payment, 0),
                'interest': round(interest_payment, 0),
                'balance': round(max(0, remaining_balance), 0)
            })
        
        return {
            'schedule': schedule,
            'total_payment': round(self.principal + total_interest, 0),
            'total_interest': round(total_interest, 0),
            'first_payment': round(schedule[0]['payment'], 0),
            'last_payment': round(schedule[-1]['payment'], 0)
        }
    
    def maturity_payment(self):
        """만기일시상환 계산"""
        total_interest = self.principal * self.annual_rate * (self.total_months / 12)
        monthly_interest = self.principal * self.monthly_rate
        
        schedule = []
        
        for month in range(1, self.total_months + 1):
            if month == self.total_months:
                # 마지막 달에 원금 + 이자 상환
                payment = self.principal + monthly_interest
                principal_payment = self.principal
                balance = 0
            else:
                # 매월 이자만 상환
                payment = monthly_interest
                principal_payment = 0
                balance = self.principal
            
            schedule.append({
                'month': month,
                'payment': round(payment, 0),
                'principal': round(principal_payment, 0),
                'interest': round(monthly_interest, 0),
                'balance': round(balance, 0)
            })
        
        return {
            'schedule': schedule,
            'total_payment': round(self.principal + total_interest, 0),
            'total_interest': round(total_interest, 0),
            'monthly_interest': round(monthly_interest, 0),
            'final_payment': round(self.principal + monthly_interest, 0)
        }
    
    def step_up_payment(self, step_rate=5):
        """체증식 상환 계산"""
        step_rate = step_rate / 100  # 퍼센트를 소수로 변환
        
        # 초기 월 상환액을 계산 (시행착오 방법 사용)
        def calculate_total_payment(initial_payment):
            total = 0
            current_payment = initial_payment
            for month in range(self.total_months):
                if month > 0 and month % 12 == 0:  # 매년 증가
                    current_payment *= (1 + step_rate)
                total += current_payment
            return total
        
        # 이진 탐색으로 초기 상환액 찾기
        low, high = 1000, self.principal
        while high - low > 1:
            mid = (low + high) / 2
            total = calculate_total_payment(mid)
            if total < self.principal:
                low = mid
            else:
                high = mid
        
        initial_payment = high
        
        schedule = []
        remaining_balance = self.principal
        current_payment = initial_payment
        total_interest = 0
        
        for month in range(1, self.total_months + 1):
            if month > 1 and (month - 1) % 12 == 0:  # 매년 증가
                current_payment *= (1 + step_rate)
            
            interest_payment = remaining_balance * self.monthly_rate
            principal_payment = current_payment - interest_payment
            
            # 마지막 달 조정
            if month == self.total_months:
                principal_payment = remaining_balance
                current_payment = principal_payment + interest_payment
            
            remaining_balance -= principal_payment
            total_interest += interest_payment
            
            schedule.append({
                'month': month,
                'payment': round(current_payment, 0),
                'principal': round(principal_payment, 0),
                'interest': round(interest_payment, 0),
                'balance': round(max(0, remaining_balance), 0)
            })
        
        return {
            'schedule': schedule,
            'total_payment': round(self.principal + total_interest, 0),
            'total_interest': round(total_interest, 0),
            'initial_payment': round(initial_payment, 0),
            'final_payment': round(schedule[-1]['payment'], 0),
            'step_rate': step_rate * 100
        }
    
    def _generate_schedule_zero_rate(self, monthly_payment):
        """이자율이 0%인 경우의 스케줄 생성"""
        schedule = []
        remaining_balance = self.principal
        
        for month in range(1, self.total_months + 1):
            principal_payment = monthly_payment
            remaining_balance -= principal_payment
            
            schedule.append({
                'month': month,
                'payment': round(monthly_payment, 0),
                'principal': round(principal_payment, 0),
                'interest': 0,
                'balance': round(max(0, remaining_balance), 0)
            })
        
        return {
            'schedule': schedule,
            'total_payment': round(self.principal, 0),
            'total_interest': 0,
            'monthly_payment': round(monthly_payment, 0)
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        
        principal = float(data.get('principal', 0))
        annual_rate = float(data.get('annual_rate', 0))
        years = int(data.get('years', 0))
        months = int(data.get('months', 0))
        payment_type = data.get('payment_type', 'equal_payment')
        step_rate = float(data.get('step_rate', 5))
        
        if principal <= 0:
            return jsonify({'error': '대출 원금을 입력해주세요.'}), 400
        
        if years == 0 and months == 0:
            return jsonify({'error': '대출 기간을 입력해주세요.'}), 400
        
        calculator = LoanCalculator(principal, annual_rate, years, months)
        
        if payment_type == 'equal_payment':
            result = calculator.equal_payment()
        elif payment_type == 'equal_principal':
            result = calculator.equal_principal()
        elif payment_type == 'maturity_payment':
            result = calculator.maturity_payment()
        elif payment_type == 'step_up_payment':
            result = calculator.step_up_payment(step_rate)
        else:
            return jsonify({'error': '올바른 상환 방식을 선택해주세요.'}), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': f'계산 중 오류가 발생했습니다: {str(e)}'}), 500

@app.route('/estimate-rate', methods=['POST'])
def estimate_rate():
    try:
        data = request.get_json()
        
        credit_score = int(data.get('credit_score', 0))
        loan_type = data.get('loan_type', 'personal')
        income = int(data.get('income', 0))
        employment_type = data.get('employment_type', 'regular')
        
        if not (300 <= credit_score <= 999):
            return jsonify({'error': '신용점수는 300~999 사이의 값이어야 합니다.'}), 400
        
        if income <= 0:
            return jsonify({'error': '연소득을 입력해주세요.'}), 400
        
        # 기본 금리 설정
        base_rates = {
            'mortgage': 3.5,    # 주택담보대출
            'personal': 6.5,    # 신용대출
            'auto': 4.5,        # 자동차대출
            'business': 5.5     # 사업자대출
        }
        base_rate = base_rates.get(loan_type, 5.0)
        
        # 신용점수 조정
        if credit_score >= 900:
            credit_adj = -2.0
            grade = "최우수"
        elif credit_score >= 850:
            credit_adj = -1.5
            grade = "우수"
        elif credit_score >= 750:
            credit_adj = -1.0
            grade = "양호"
        elif credit_score >= 650:
            credit_adj = -0.5
            grade = "보통"
        elif credit_score >= 550:
            credit_adj = 0.5
            grade = "주의"
        elif credit_score >= 450:
            credit_adj = 1.5
            grade = "위험"
        else:
            credit_adj = 3.0
            grade = "매우 위험"
        
        # 근무형태 조정
        employment_adj = {
            'regular': 0,       # 정규직
            'contract': 0.3,    # 계약직
            'freelance': 0.8,   # 프리랜서
            'business': 0.5     # 사업자
        }.get(employment_type, 0)
        
        # 소득 조정
        if income >= 10000:
            income_adj = -0.3
        elif income >= 7000:
            income_adj = -0.2
        elif income >= 5000:
            income_adj = -0.1
        elif income < 3000:
            income_adj = 0.2
        else:
            income_adj = 0
        
        # 최종 금리 계산
        estimated_rate = max(1.0, min(15.0, base_rate + credit_adj + employment_adj + income_adj))
        min_rate = max(1.0, estimated_rate - 0.5)
        max_rate = min(15.0, estimated_rate + 0.5)
        
        return jsonify({
            'estimated_rate': round(estimated_rate, 2),
            'min_rate': round(min_rate, 2),
            'max_rate': round(max_rate, 2),
            'credit_grade': grade,
            'base_rate': base_rate,
            'adjustments': {
                'credit': credit_adj,
                'employment': employment_adj,
                'income': income_adj
            }
        })
    
    except Exception as e:
        return jsonify({'error': f'금리 계산 중 오류가 발생했습니다: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
