# 
姓名（必填）
規則：不可空白（trim 後）
觸發時機：blur（離開欄位）與 input（輸入時清除錯誤）
錯誤訊息：'請輸入姓名'
顯示位置：<p id="nameError">
實作：在 blur 時若空白呼叫 setCustomValidity，並將訊息寫進 nameError。input 時若有值則 clearError。

Email（必填 + 格式）
規則：必填且符合 type="email" 的內建格式檢查
觸發時機：blur 與 input（通過格式即清除錯誤）
錯誤訊息：
欄位空：'請輸入Email'
格式錯誤：'請輸入有效的Email格式'
顯示位置：<p id="emailError">
實作：使用 input 的 validity 檢查搭配 setCustomValidity。

手機（必填，10 碼數字）
規則：必填且符合正則 /^\d{10}$/
觸發時機：blur 與 input（匹配則清除錯誤）
錯誤訊息：
欄位空：'請輸入手機號碼'
格式錯誤：'請輸入10碼數字'
顯示位置：<p id="phoneError">
實作：使用 pattern 屬性與額外的正則驗證（以確保嚴格匹配）。

密碼（至少 8 碼，英數混合）
規則：required + 至少 8 字元（minlength）且必須包含英文字母與數字（passwordRegex）
觸發時機：blur（檢查錯誤）與 input（即時更新強度狀態與重新驗證確認密碼）
錯誤訊息：
欄位空：'請輸入密碼'
不符合規則：'密碼需至少8碼，且包含英文和數字'
顯示位置：<p id="passwordError">
額外行為：會即時更新密碼強度條（弱/中/強）與顯示文字（#passwordStrength），但強度屬於提示而非阻止送出。

確認密碼（需與密碼一致）
規則：required 且值需與 password 欄位一致
觸發時機：blur 與 input（即時檢查一致性）
錯誤訊息：
欄位空：'請再次輸入密碼'
不一致：'密碼不一致'
顯示位置：<p id="confirmPasswordError">
實作：在 password 與 confirmPassword 的變化時都會呼叫 validateConfirmPassword() 來同步檢查。

興趣標籤（至少勾選 1 個）
規則：selectedInterests.size >= 1
觸發時機：點選興趣標籤（事件委派）時進行計數檢查；submit 時若為 0 也會阻止並顯示錯誤
錯誤訊息：'請至少選擇一個興趣'
顯示位置：<p id="interestsError">
實作要點：興趣使用父層監聽（interestsContainer），僅切換 class selected 並在內部 Set（selectedInterests）記錄選取；當為 0 時呼叫 setCustomError(interestsContainer, 'interestsError', ...)、但注意：setCustomValidity 只對 form control （例如 input）有效；針對容器 we 的做法主要是為了統一錯誤顯示與訊息提示（若需讓 constraint 驗證機制完全支援，建議新增一個隱藏的 required hidden input 並同步其 validity）。

服務條款（須勾選）
規則：terms.checked === true
觸發時機：change（切換時）與 submit（若未勾選則阻止）
錯誤訊息：'請同意服務條款'
顯示位置：<p id="termsError">
實作：直接對 checkbox 使用 setCustomValidity/clear。

# 加分項目
