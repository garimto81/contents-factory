@echo off
chcp 65001 >nul
echo ========================================
echo 📱 Photo Factory 모바일 테스트 서버
echo ========================================
echo.

echo [1/3] 로컬 IP 주소 확인 중...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%
echo ✅ 로컬 IP: %IP%
echo.

echo [2/3] 서버 시작 중...
echo.
echo ========================================
echo 🌐 스마트폰에서 접속하세요:
echo.
echo    http://%IP%:8080/public/index.html
echo.
echo ========================================
echo.
echo [주의사항]
echo - PC와 스마트폰이 같은 WiFi에 연결되어야 합니다
echo - Cloudinary 설정을 완료했는지 확인하세요
echo - 서버 종료: Ctrl+C
echo.
echo [3/3] HTTP 서버 실행...
echo.

cd src
python -m http.server 8080

pause
