#!/usr/bin/env python3
"""
Taiki Life OS - メール通知スケジューラー
毎朝7:00に日次サマリーメールを送信
"""

import schedule
import time
import requests
import os
from datetime import datetime

def send_daily_summary():
    """毎朝の日次サマリーメールを送信"""
    try:
        print(f"[{datetime.now()}] 日次サマリーメール送信を開始...")
        
        # バックエンドAPIを呼び出し
        response = requests.post(
            'http://localhost:5001/api/email/send-daily-summary',
            json={'email': 'taiki.mishima.biz@gmail.com'},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print(f"[{datetime.now()}] 日次サマリーメール送信成功")
        else:
            print(f"[{datetime.now()}] 日次サマリーメール送信失敗: {response.text}")
            
    except Exception as e:
        print(f"[{datetime.now()}] エラー: {str(e)}")

def main():
    """スケジューラーのメイン処理"""
    print("Taiki Life OS メール通知スケジューラーを開始...")
    
    # 毎朝7:00に日次サマリーメールを送信
    schedule.every().day.at("07:00").do(send_daily_summary)
    
    # テスト用: 1分ごとに実行（開発環境のみ）
    if os.getenv('ENVIRONMENT') != 'production':
        print("開発環境: テスト用に1分ごとにメール送信をスケジュール")
        schedule.every(1).minutes.do(send_daily_summary)
    
    print("スケジューラーが開始されました。")
    print("毎朝7:00に日次サマリーメールを送信します。")
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main()

