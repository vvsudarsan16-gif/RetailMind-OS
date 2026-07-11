import React, { useState, useEffect } from 'react';
import { 
  CreditCard, QrCode, Wallet, Landmark, Truck, AlertCircle, 
  CheckCircle, ShieldCheck, HelpCircle, Sparkles, Receipt,
  Loader2, Smartphone, ShieldAlert, KeyRound, Check, RefreshCw,
  Terminal, ArrowRight, UserCheck, Shield, Lock, Send
} from 'lucide-react';
import { User } from '../../types';

interface CustomerPaymentsProps {
  cartTotal: number;
  currentUser: User;
  onPaymentComplete: (method: string, splitDetails?: Array<{ method: string; amount: number }>) => void;
  onCancel: () => void;
}

export default function CustomerPayments({ 
  cartTotal, 
  currentUser, 
  onPaymentComplete,
  onCancel 
}: CustomerPaymentsProps) {
  const [paymentType, setPaymentType] = useState('UPI');
  const [error, setError] = useState('');
  
  // Card credentials input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardBrand, setCardBrand] = useState('Generic Card');

  // UPI VPA state
  const [vpa, setVpa] = useState(currentUser.email ? currentUser.email.split('@')[0] + '@okaxis' : 'vvsudarsan@okaxis');
  
  // UPI QR Code countdown state (starting at 5 minutes = 300 seconds)
  const [qrSecondsLeft, setQrSecondsLeft] = useState(300);
  const [qrCodeId, setQrCodeId] = useState(`QR-${Math.floor(100000 + Math.random() * 900000)}`);

  // Net banking bank selection & login states
  const [selectedBank, setSelectedBank] = useState('Chase Bank');
  const [bankUsername, setBankUsername] = useState('');
  const [bankPassword, setBankPassword] = useState('');

  // EMI option selection
  const [emiMonths, setEmiMonths] = useState(3);

  // Split payment configuration states
  const [splitUpi, setSplitUpi] = useState((cartTotal / 2).toFixed(2));
  const [splitCard, setSplitCard] = useState((cartTotal / 2).toFixed(2));

  // COD Captcha state
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  // --- INTERACTIVE SIMULATION ENGINE STATES ---
  // idle -> initiating -> upi_mobile_phone -> card_3ds_otp -> netbanking_login -> netbanking_otp -> wallet_pin -> cod_captcha -> finalized_ledger
  const [processingState, setProcessingState] = useState<
    'idle' | 'initiating' | 'upi_mobile_phone' | 'card_3ds_otp' | 'netbanking_login' | 'netbanking_otp' | 'wallet_pin' | 'cod_captcha' | 'finalized_ledger'
  >('idle');
  
  const [splitPhase, setSplitPhase] = useState<'none' | 'upi' | 'card'>('none');
  const [progressPercent, setProgressPercent] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [activeLogIndex, setActiveLogIndex] = useState(-1);
  
  // Mobile UPI Phone states
  const [phoneNotificationVisible, setPhoneNotificationVisible] = useState(false);
  const [phoneScreenState, setPhoneScreenState] = useState<'home' | 'notification_clicked' | 'pin_screen'>('home');
  const [phoneUpiPin, setPhoneUpiPin] = useState('');
  const [phonePinError, setPhonePinError] = useState('');

  // OTP Verification states (Bank OTP & NetBanking OTP)
  const [receivedOtp, setReceivedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [smsBannerVisible, setSmsBannerVisible] = useState(false);

  // Wallet security state
  const [walletPinInput, setWalletPinInput] = useState('');
  const [walletPinError, setWalletPinError] = useState('');

  // --- SECURE HANDSHAKE LOGS GENERATOR ---
  const addLog = (msg: string) => {
    setSimulationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // 1. UPI QR Code active countdown effect
  useEffect(() => {
    let timer: any;
    if (paymentType === 'UPI' && processingState === 'idle') {
      timer = setInterval(() => {
        setQrSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentType, processingState]);

  // 2. 3DS Bank OTP active countdown effect
  useEffect(() => {
    let timer: any;
    if (smsBannerVisible && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [smsBannerVisible, otpCountdown]);

  // Generate a random Captcha code on mount / when COD is selected
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setCaptchaInput('');
  };

  useEffect(() => {
    if (paymentType === 'COD') {
      generateCaptcha();
    }
  }, [paymentType]);

  // Auto detect Card Brand representation
  useEffect(() => {
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.startsWith('4')) {
      setCardBrand('Visa Secure Card');
    } else if (cleanNum.startsWith('5')) {
      setCardBrand('Mastercard Identity Check');
    } else if (cleanNum.startsWith('3')) {
      setCardBrand('American Express SafeKey');
    } else if (cleanNum.startsWith('6')) {
      setCardBrand('RuPay PaySecure');
    } else {
      setCardBrand('Generic Credit/Debit Card');
    }
  }, [cardNumber]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length > 0 ? parts.join(' ') : v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setCardExpiry(val.substring(0, 5));
  };

  // Helper: auto-prefill correct mock parameters for testing
  const fillSandboxCredentials = () => {
    setCardNumber('4111 2222 3333 4444');
    setCardExpiry('12/28');
    setCardCvv('123');
    setCardHolder(currentUser.username || 'Jonathan Doe');
    setError('');
  };

  const fillNetBankingCredentials = () => {
    setBankUsername('shopper_apex_direct');
    setBankPassword('•••••••••••••');
  };

  // --- TRIGGER TRANSACTION VALIDATIONS & FLOW LAUNCH ---
  const validateAndProceed = () => {
    setError('');
    setOtpInput('');
    setOtpError('');
    setPhoneUpiPin('');
    setPhonePinError('');
    setWalletPinInput('');
    setWalletPinError('');
    setSimulationLogs([]);

    // 1. UPI Payment Mode
    if (paymentType === 'UPI') {
      if (!vpa.includes('@')) {
        setError('Please enter a valid VPA Handle (e.g. username@okaxis).');
        return;
      }
      if (qrSecondsLeft <= 0) {
        setError('The checkout QR code has expired. Please click "Refresh QR" to generate a new token.');
        return;
      }

      setProcessingState('initiating');
      setProgressPercent(10);
      addLog('Establishing handshake with UPI National Payments interface...');
      addLog(`Broadcasting collect request of $${cartTotal.toFixed(2)} to VPA cell line "${vpa}"...`);

      setTimeout(() => {
        setProcessingState('upi_mobile_phone');
        setSplitPhase('none');
        setPhoneScreenState('home');
        setPhoneNotificationVisible(true);
        setProgressPercent(35);
        addLog('Secure collect link transmitted. Awaiting user interaction on hand-held phone device...');
      }, 1500);
      return;
    }

    // 2. Card Payment Mode
    if (paymentType === 'Card') {
      if (cardNumber.length < 19) {
        setError('Please enter a valid 16-digit Credit or Debit Card Number.');
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        setError('Please enter Card Expiration Date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setError('Please enter security CVV code (3 digits).');
        return;
      }
      if (!cardHolder.trim()) {
        setError('Please enter Cardholder Name exactly as printed on the card.');
        return;
      }

      setProcessingState('initiating');
      setProgressPercent(15);
      addLog(`Initiating secure SSL-grade transaction routing for: ${cardBrand}...`);
      addLog('Contacting merchant acquiring gateway and executing 3D-Secure 2.0 validation...');

      setTimeout(() => {
        // Trigger simulated SMS OTP
        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setReceivedOtp(randomOtp);
        setSmsBannerVisible(true);
        setOtpCountdown(60);
        setProcessingState('card_3ds_otp');
        setProgressPercent(45);
        addLog(`3D-Secure challenge dispatched. Bank OTP sent to customer line ending in +1 (***) ***-9972.`);
      }, 1600);
      return;
    }

    // 3. Store Wallet Payment Mode
    if (paymentType === 'Wallet') {
      if (currentUser.walletBalance < cartTotal) {
        setError(`Your prepaid store wallet has insufficient balance ($${currentUser.walletBalance.toFixed(2)}) for the checkout total ($${cartTotal.toFixed(2)}). Please top up or choose a different method.`);
        return;
      }

      setProcessingState('initiating');
      setProgressPercent(20);
      addLog('Acquiring store prepaid ledger reserves...');
      addLog(`Reserving escrow allocation of $${cartTotal.toFixed(2)} for User ID: ${currentUser.id}...`);

      setTimeout(() => {
        setProcessingState('wallet_pin');
        setProgressPercent(50);
        addLog('Requesting Wallet Security PIN authorization...');
      }, 1200);
      return;
    }

    // 4. Net Banking Payment Mode
    if (paymentType === 'NetBanking') {
      setProcessingState('netbanking_login');
      setProgressPercent(20);
      addLog(`Redirecting to secure login gateway of ${selectedBank}...`);
      return;
    }

    // 5. EMI Payment Mode
    if (paymentType === 'EMI') {
      if (cardNumber.length < 19) {
        setError('EMI financing requires checking a valid credit card. Please type card parameters first.');
        return;
      }
      setProcessingState('initiating');
      setProgressPercent(15);
      addLog(`Contacting bank for EMI processing... Checking ${emiMonths} Months installment plan at 12% APR.`);
      addLog('Applying security gateway 3D-secure network tunnels...');

      setTimeout(() => {
        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setReceivedOtp(randomOtp);
        setSmsBannerVisible(true);
        setOtpCountdown(60);
        setProcessingState('card_3ds_otp');
        setProgressPercent(45);
        addLog('EMI Credit check approved. Awaiting secure SMS authentication PIN...');
      }, 1600);
      return;
    }

    // 6. Split Payment Mode (UPI + Card)
    if (paymentType === 'Split') {
      const upiAmt = parseFloat(splitUpi) || 0;
      const cardAmt = parseFloat(splitCard) || 0;
      const totalAlloc = parseFloat((upiAmt + cardAmt).toFixed(2));

      if (Math.abs(totalAlloc - cartTotal) > 0.05) {
        setError(`Split allocation sum ($${totalAlloc.toFixed(2)}) must exactly match the Grand Invoice Total ($${cartTotal.toFixed(2)}).`);
        return;
      }

      setProcessingState('initiating');
      setProgressPercent(10);
      addLog('Configuring multi-channel transaction division core...');
      addLog(`Allocating $${upiAmt.toFixed(2)} to Mobile Phone App & $${cardAmt.toFixed(2)} to Card Gateway.`);

      setTimeout(() => {
        setProcessingState('upi_mobile_phone');
        setSplitPhase('upi');
        setPhoneScreenState('home');
        setPhoneNotificationVisible(true);
        setProgressPercent(25);
        addLog(`[Split Phase 1/2] Sent UPI Collect push notification of $${upiAmt.toFixed(2)} to phone app.`);
      }, 1500);
      return;
    }

    // 7. Cash on Delivery (COD) Mode
    if (paymentType === 'COD') {
      setProcessingState('cod_captcha');
      setProgressPercent(30);
      addLog('Initiating Cash on Delivery risk assessment...');
      addLog('Requesting human-shopper Captcha validation verification...');
      return;
    }
  };

  // --- MOBILE PHONE SIMULATION INTERACTIONS ---
  const handlePhoneNotificationClick = () => {
    setPhoneNotificationVisible(false);
    setPhoneScreenState('notification_clicked');
    addLog('📱 Customer opened incoming UPI payment request in Google Pay app.');
  };

  const handlePhoneUpiPinClick = (digit: string) => {
    setPhonePinError('');
    if (phoneUpiPin.length < 6) {
      setPhoneUpiPin(prev => prev + digit);
    }
  };

  const handlePhoneUpiPinClear = () => {
    setPhoneUpiPin('');
    setPhonePinError('');
  };

  const submitPhoneUpiPayment = (providedPin?: string) => {
    const pin = typeof providedPin === 'string' ? providedPin : phoneUpiPin;
    if (pin.length < 4) {
      setPhonePinError('UPI Security PIN is too short.');
      return;
    }

    // Let's validate. 121212 or 123456 are valid sandbox PINs
    if (pin !== '121212' && pin !== '123456' && pin !== '1234') {
      setPhonePinError('Incorrect secure UPI PIN. Enter "121212" or "123456" for sandbox approval.');
      addLog('❌ UPI Authentication failure: Invalid security PIN entered on phone.');
      return;
    }

    addLog('✓ Phone UPI security PIN authenticated successfully on secure banking infrastructure.');

    if (splitPhase === 'upi') {
      addLog('✓ [Split Phase 1/2] UPI Payment of $' + parseFloat(splitUpi).toFixed(2) + ' completed.');
      addLog('Starting [Split Phase 2/2] Credit Card transaction processing...');
      setProgressPercent(55);
      setProcessingState('initiating');

      setTimeout(() => {
        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setReceivedOtp(randomOtp);
        setSmsBannerVisible(true);
        setOtpCountdown(60);
        setProcessingState('card_3ds_otp');
        setSplitPhase('card');
        setProgressPercent(75);
        addLog(`Dispatched secure bank SMS OTP for Card allocation amount of $${parseFloat(splitCard).toFixed(2)}.`);
      }, 1600);
    } else {
      setProgressPercent(80);
      goToFinalize(`UPI (${vpa})`);
    }
  };

  // --- OTP VERIFICATION ---
  const handleVerifyOtp = () => {
    setOtpError('');
    if (otpInput.trim() !== receivedOtp) {
      setOtpError('Invalid One-Time Password (OTP). Please check your SMS and try again.');
      addLog('❌ 3D-Secure transaction challenge failed: Incorrect OTP.');
      return;
    }

    setSmsBannerVisible(false);
    addLog('✓ SMS One-Time Password authenticated successfully by clearing house.');

    if (splitPhase === 'card') {
      setProgressPercent(90);
      goToFinalize('Split', [
        { method: `UPI (${vpa})`, amount: parseFloat(splitUpi) },
        { method: `Card (${cardNumber.substring(15)})`, amount: parseFloat(splitCard) }
      ]);
    } else {
      setProgressPercent(85);
      goToFinalize(`${paymentType} (${cardNumber.substring(15)})`);
    }
  };

  // --- NET BANKING SECURE FLOW ---
  const handleNetBankingLogin = () => {
    if (!bankUsername.trim()) {
      setError('Please enter your online banking User ID.');
      return;
    }
    setError('');
    addLog(`✓ Username lookup authenticated for ${selectedBank}. Sending authentication request...`);
    
    // Switch to Netbanking OTP stage
    const NB_Otp = Math.floor(100000 + Math.random() * 900000).toString();
    setReceivedOtp(NB_Otp);
    setSmsBannerVisible(true);
    setOtpCountdown(60);
    setProcessingState('netbanking_otp');
    setProgressPercent(55);
    addLog(`Two-factor banking authentication challenge triggered. OTP sent via SMS text line.`);
  };

  const handleVerifyNetBankingOtp = () => {
    setOtpError('');
    if (otpInput.trim() !== receivedOtp) {
      setOtpError('Invalid NetBanking login OTP. Please check the simulated SMS banner.');
      addLog('❌ Bank portal payment challenge failed: Incorrect OTP.');
      return;
    }

    setSmsBannerVisible(false);
    addLog(`✓ Banking authorization verified. Funds captured from checking balance.`);
    setProgressPercent(85);
    goToFinalize(`NetBanking (${selectedBank})`);
  };

  // --- WALLET SECURITY PIN ---
  const handleVerifyWalletPin = () => {
    setWalletPinError('');
    if (walletPinInput !== '1234') {
      setWalletPinError('Incorrect Wallet security code. (Tip: Enter "1234" to authorize sandbox)');
      addLog('❌ Store wallet balance debit failed: PIN validation failed.');
      return;
    }

    addLog('✓ Store wallet prepaid security token approved.');
    setProgressPercent(85);
    goToFinalize('Wallet');
  };

  // --- CAPTCHA VALIDATION ---
  const handleVerifyCaptcha = () => {
    setError('');
    if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
      setError('Captcha characters did not match. Please enter again.');
      generateCaptcha();
      addLog('❌ Cash on Delivery checkout rejected: Human verification CAPTCHA error.');
      return;
    }

    addLog('✓ Anti-bot captcha human verification passed successfully.');
    setProgressPercent(80);
    goToFinalize('COD');
  };

  // --- FINALIZE AND TRIGGER MAIN ORDER SUBMISSION ---
  const goToFinalize = (method: string, splitDetails?: any[]) => {
    setProcessingState('finalized_ledger');
    addLog('Communicating transaction results back to merchant database ledger...');
    addLog('Adjusting warehouse inventory quantities on the server side in real-time...');

    setTimeout(() => {
      setProgressPercent(95);
      addLog('Building final secure commercial sales invoice certificate...');
      
      setTimeout(() => {
        setProgressPercent(100);
        addLog('Order logged successfully! Emptying shopping cart cache.');
        
        setTimeout(() => {
          setProcessingState('idle');
          setSmsBannerVisible(false);
          onPaymentComplete(method, splitDetails);
        }, 1200);
      }, 1200);
    }, 1500);
  };

  const cancelTransaction = () => {
    setProcessingState('idle');
    setSplitPhase('none');
    setPhoneUpiPin('');
    setPhonePinError('');
    setOtpInput('');
    setOtpError('');
    setWalletPinInput('');
    setWalletPinError('');
    setSmsBannerVisible(false);
    setError('');
  };

  const refreshUpiQrCode = () => {
    setQrSecondsLeft(300);
    setQrCodeId(`QR-${Math.floor(100000 + Math.random() * 900000)}`);
    setError('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 relative" id="checkout-payments-panel">
      
      {/* --- REAL-TIME SMARTPHONE SMS PUSH NOTIFICATION SIMULATOR ACCENT --- */}
      {smsBannerVisible && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-slate-900/95 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-md animate-bounce flex items-start gap-3">
          <div className="p-1.5 bg-blue-500 rounded-lg shrink-0 text-white shadow-md">
            <Lock className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="flex justify-between items-center mb-0.5">
              <span className="font-extrabold text-blue-400 font-mono text-[10px]">💬 SECURE BANK SMS</span>
              <span className="text-[9px] text-slate-400">Just Now</span>
            </div>
            <p className="text-slate-200 leading-normal font-medium text-[11px]">
              OTP for your payment of <strong className="text-emerald-400">${splitPhase === 'card' ? parseFloat(splitCard).toFixed(2) : cartTotal.toFixed(2)}</strong> is <strong className="text-yellow-300 font-mono text-xs tracking-wider bg-slate-800 px-1.5 py-0.5 rounded">{receivedOtp}</strong>. Valid for 10 minutes.
            </p>
            <button
              onClick={() => { setOtpInput(receivedOtp); setOtpError(''); }}
              className="mt-1.5 text-[9px] text-emerald-400 hover:text-emerald-300 font-black tracking-wider uppercase cursor-pointer block bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
            >
              ⚡ Click to Auto-Fill OTP
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-xs font-semibold flex items-start gap-2 leading-relaxed animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* --- TRANSACTION PROCESSING STEPPER VIEW (GPAY PORTAL / 3DS BANK WEBPORTAL) --- */}
      {processingState !== 'idle' ? (
        <div className="bg-slate-900 text-slate-100 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-xl mx-auto space-y-6 animate-fade-in" id="gateway-secure-modal">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5 animate-pulse text-emerald-400" />
              </span>
              <div>
                <h3 className="font-black text-base text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  Secure Bank Terminal
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">CHANNEL: HTTPS_TLS_v1.3_256BIT</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse font-mono">
                ● PCI-DSS SECURE
              </span>
            </div>
          </div>

          {/* Progress gauge */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>SECURITY HANDSHAKE PROGRESS: {progressPercent}%</span>
              <span className="font-bold text-slate-200">GRAND TOTAL: ${cartTotal.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* DYNAMIC SUB-SCREENS FOR EACH METHOD */}
          
          {/* A. Generic Network Wait Screen */}
          {(processingState === 'initiating' || processingState === 'finalized_ledger') && (
            <div className="py-8 text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <Shield className="w-5 h-5 text-emerald-400 absolute animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-slate-200 animate-pulse">
                  {processingState === 'initiating' ? 'Authenticating Secure Handshake Directives...' : 'Synching Merchant Inventory Ledger...'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono max-w-xs mx-auto leading-relaxed">
                  Communicating with financial clearing house databases. Please do not close or reload this window.
                </p>
              </div>
            </div>
          )}

          {/* B. UPI Google Pay Phone Simulator */}
          {processingState === 'upi_mobile_phone' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2 items-center">
              
              {/* High Fidelity Phone Frame */}
              <div className="md:col-span-6 bg-slate-950 p-4 rounded-[40px] border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-[9/16] max-w-[215px] mx-auto text-slate-900 font-sans">
                
                {/* Speaker Notch */}
                <div className="w-20 h-4 bg-slate-800 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                  <div className="w-8 h-1 bg-slate-700 rounded-full" />
                </div>

                {/* Internal UI Screen */}
                <div className="bg-[#121212] flex-1 flex flex-col justify-between p-3.5 pt-6 rounded-[32px] text-slate-100 overflow-hidden relative border border-slate-800">
                  
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 mb-2">
                    <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <div className="flex items-center gap-1 font-mono">
                      <span>5G LTE</span>
                      <span className="w-4 h-2 border border-slate-500 rounded-xs relative flex items-center px-[0.5px]">
                        <span className="h-full w-4/5 bg-emerald-500 block rounded-2-sm" />
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Mobile Screen State */}
                  {phoneScreenState === 'home' && (
                    <div className="flex-1 flex flex-col justify-between text-center py-4 space-y-4">
                      
                      <div className="space-y-1">
                        <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                          <Smartphone className="w-5 h-5 text-blue-500" />
                        </div>
                        <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Awaiting Link</h5>
                        <p className="text-[9px] text-slate-500">Dispatching collect push request to mobile register...</p>
                      </div>

                      {/* Sliding Push Notification on Phone Screen */}
                      {phoneNotificationVisible && (
                        <div 
                          onClick={handlePhoneNotificationClick}
                          className="bg-slate-900/95 border border-blue-500/30 p-2.5 rounded-xl text-left shadow-lg animate-bounce cursor-pointer hover:bg-slate-800"
                        >
                          <div className="flex justify-between items-center text-[8px] text-blue-400 font-extrabold">
                            <span className="flex items-center gap-1">🔷 GOOGLE PAY</span>
                            <span>Just Now</span>
                          </div>
                          <p className="text-[9px] font-bold text-white mt-1">Payment Request: ${splitPhase === 'upi' ? parseFloat(splitUpi).toFixed(2) : cartTotal.toFixed(2)}</p>
                          <p className="text-[8px] text-slate-400">Tap to open app & enter UPI security PIN.</p>
                        </div>
                      )}

                      <span className="text-[8px] text-amber-500 animate-pulse font-mono block">
                        💡 Click the phone notification above!
                      </span>
                    </div>
                  )}

                  {/* Notification clicked -> PIN Entry Screen */}
                  {phoneScreenState === 'notification_clicked' && (
                    <div className="flex-1 flex flex-col justify-between py-1 text-center space-y-3 animate-fade-in">
                      
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1">
                        <span className="text-[8px] font-extrabold text-slate-500 uppercase block">SECURE UPI CHECKOUT</span>
                        <p className="text-[9.5px] font-bold text-slate-200">Merchant: Spacelab Superstore</p>
                        <p className="text-sm font-black text-emerald-400 font-mono">
                          ${splitPhase === 'upi' ? parseFloat(splitUpi).toFixed(2) : cartTotal.toFixed(2)}
                        </p>
                        <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center text-[8px] text-slate-400">
                          <span>Bank Account:</span>
                          <span className="font-bold text-slate-200">SBI Credit (•••8829)</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider block">ENTER UPI PIN:</span>
                        <div className="flex justify-center gap-1.5">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="w-5 h-6 bg-slate-950 border border-slate-800 rounded-md flex items-center justify-center font-bold text-xs text-blue-400">
                              {phoneUpiPin[i] ? '•' : ''}
                            </div>
                          ))}
                        </div>
                        {phonePinError && <p className="text-[7.5px] text-rose-500 font-bold">{phonePinError}</p>}
                      </div>

                      {/* Small phone numeric keypad */}
                      <div className="grid grid-cols-3 gap-1 max-w-[140px] mx-auto font-mono text-[9px] font-extrabold text-slate-200">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                          <button
                            key={num}
                            onClick={() => handlePhoneUpiPinClick(num)}
                            className="p-1.5 bg-slate-900/60 hover:bg-slate-800 rounded border border-slate-800/80 cursor-pointer active:scale-90 transition-all text-center"
                          >
                            {num}
                          </button>
                        ))}
                        <button
                          onClick={handlePhoneUpiPinClear}
                          className="p-1.5 bg-rose-950/40 text-rose-300 rounded border border-rose-900/40 text-[7px] font-black cursor-pointer uppercase text-center"
                        >
                          CLR
                        </button>
                        <button
                          onClick={() => handlePhoneUpiPinClick('0')}
                          className="p-1.5 bg-slate-900/60 rounded border border-slate-800 text-center cursor-pointer"
                        >
                          0
                        </button>
                        <button
                          onClick={submitPhoneUpiPayment}
                          className="p-1.5 bg-emerald-950/40 text-emerald-300 rounded border border-emerald-900/40 text-[7px] font-black cursor-pointer uppercase text-center"
                        >
                          PAY
                        </button>
                      </div>

                      <div className="flex gap-1">
                        <button 
                          onClick={() => { setPhoneUpiPin('121212'); setPhonePinError(''); }}
                          className="flex-1 py-1 bg-slate-800 text-slate-300 rounded text-[7.5px] font-bold hover:bg-slate-700 cursor-pointer"
                        >
                          Sandbox PIN (121212)
                        </button>
                      </div>

                    </div>
                  )}

                </div>

                {/* Home bar */}
                <div className="w-14 h-1 bg-slate-800 rounded-full mx-auto mt-2" />
              </div>

              {/* Instructions side-block */}
              <div className="md:col-span-6 flex flex-col justify-center space-y-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" /> Phone Mobile Simulator
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm">Verify UPI Secure VPA Request</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    To make this payment completely real-time, click the simulated blue notification on the smartphone screen, enter your secure 6-digit banking PIN on the phone, and complete the validation sequence.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-1 font-mono">
                  <div className="flex justify-between"><span>Method:</span><span>UPI Broadcast</span></div>
                  <div className="flex justify-between text-blue-400 font-bold"><span>Collect Amount:</span><span>${splitPhase === 'upi' ? parseFloat(splitUpi).toFixed(2) : cartTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>User VPA:</span><span>{vpa}</span></div>
                  <div className="flex justify-between text-yellow-500"><span>Sandbox Code:</span><span>121212 or 123456</span></div>
                </div>

                <button
                  onClick={() => {
                    setPhoneNotificationVisible(false);
                    setPhoneScreenState('notification_clicked');
                    setPhoneUpiPin('121212');
                    addLog('⚡ Auto-filled sandbox credentials on UPI phone terminal.');
                    submitPhoneUpiPayment('121212');
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 text-[10px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  ⚡ One-Tap Auto Bypass Phone
                </button>
              </div>

            </div>
          )}

          {/* C. Credit Card / EMI Bank 3D-Secure Verification Portal */}
          {processingState === 'card_3ds_otp' && (
            <div className="bg-white text-slate-900 p-5 rounded-xl border border-slate-200 space-y-4 max-w-md mx-auto shadow-lg text-xs font-sans">
              
              {/* Secure Bank Logo Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-slate-800 tracking-tight text-[11px] uppercase">Secure Card clearing network</h4>
                    <span className="text-[9px] text-slate-400 block tracking-tight">VERIFIED BY VISA & MASTERCARD IDENTITY CHECK</span>
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-600 font-bold font-mono px-2 py-0.5 rounded text-[8px] border border-blue-100 uppercase">
                  3D-Secure v2.2
                </span>
              </div>

              {/* Purchase statistics */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 font-mono text-[10px] space-y-1 text-slate-600">
                <div className="flex justify-between"><span>Merchant Store:</span><strong className="text-slate-800">Spacelab Retail Supermarket</strong></div>
                <div className="flex justify-between"><span>Transaction ID:</span><span>NBX-{Math.floor(1000000 + Math.random() * 9000000)}</span></div>
                <div className="flex justify-between"><span>Card Account:</span><strong className="text-slate-800">Ending in {cardNumber ? cardNumber.substring(15) : '4444'}</strong></div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200/50 pt-1 text-[11px]">
                  <span>Payment Amount:</span>
                  <span className="text-blue-600">${splitPhase === 'card' ? parseFloat(splitCard).toFixed(2) : cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Challenge OTP verification entry */}
              <div className="space-y-2.5">
                <div className="text-center">
                  <p className="text-[11px] text-slate-500 font-medium">
                    Enter the 6-digit security One-Time-Password (OTP) sent to your registered cellular terminal:
                  </p>
                </div>

                <div className="space-y-1.5 max-w-[240px] mx-auto text-center">
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => { setOtpInput(e.target.value.replace(/[^0-9]/g, '')); setOtpError(''); }}
                    placeholder="e.g. 123456"
                    maxLength={6}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 font-mono text-center text-sm font-black tracking-widest text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 shadow-inner"
                  />
                  {otpError && <p className="text-[10px] text-rose-600 font-bold animate-pulse">{otpError}</p>}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>SMS expires in: <strong>{formatTime(otpCountdown)}</strong></span>
                  <button 
                    onClick={() => {
                      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                      setReceivedOtp(newOtp);
                      setOtpCountdown(60);
                      setSmsBannerVisible(true);
                      addLog('Resent secure SMS challenge code.');
                    }}
                    disabled={otpCountdown > 0}
                    className="text-blue-600 hover:text-blue-700 font-black cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
                  >
                    Resend Code
                  </button>
                </div>
              </div>

              {/* Actions submit */}
              <div className="flex gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={handleVerifyOtp}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-center cursor-pointer shadow-sm transition-colors"
                >
                  Verify & Complete Payment
                </button>
                <button
                  onClick={cancelTransaction}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="p-2 bg-yellow-50 text-yellow-800 rounded border border-yellow-100/70 text-[9.5px] leading-relaxed font-medium">
                ⚡ <strong>Tip:</strong> Look at the <strong>simulated SMS banner at the top of the viewport</strong> to read and click the sandbox OTP code for instant verification.
              </div>

            </div>
          )}

          {/* D. Net Banking Secure Bank Login redirect screen */}
          {processingState === 'netbanking_login' && (
            <div className="bg-[#FAFBFD] text-slate-900 p-5 rounded-xl border border-slate-200 space-y-4 max-w-sm mx-auto shadow-lg text-xs font-sans">
              
              {/* Bank Portal Branding Header */}
              <div className="bg-[#1D4ED8] p-3 -mx-5 -mt-5 rounded-t-xl flex justify-between items-center text-white">
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-5 h-5 text-white shrink-0" />
                  <span className="font-black text-[11px] uppercase tracking-wider font-mono">APEX TRUST ONLINE BANKING</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-blue-200" />
              </div>

              <div className="text-center space-y-1.5 pt-1.5">
                <h4 className="font-extrabold text-slate-800 text-[12px]">Retail Banking Secure Sign-In</h4>
                <p className="text-[10px] text-slate-500">Authorize transfer of <strong className="text-slate-800">${cartTotal.toFixed(2)}</strong> from checking balance.</p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 text-[9px] uppercase">Online User ID / Customer Number:</label>
                  <input
                    type="text"
                    value={bankUsername}
                    onChange={(e) => setBankUsername(e.target.value)}
                    placeholder="e.g. customer_direct_102"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 text-[9px] uppercase">Secure Password / IPIN Code:</label>
                  <input
                    type="password"
                    value={bankPassword}
                    onChange={(e) => setBankPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  onClick={fillNetBankingCredentials}
                  className="w-full py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-md border border-slate-200 cursor-pointer"
                >
                  ⚡ Auto-Fill Secure Demo Credentials
                </button>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={handleNetBankingLogin}
                  className="flex-1 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-extrabold rounded-lg text-center cursor-pointer shadow-sm transition-colors"
                >
                  Secure Direct Login
                </button>
                <button
                  onClick={cancelTransaction}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          )}

          {/* E. Net Banking OTP Verification screen */}
          {processingState === 'netbanking_otp' && (
            <div className="bg-[#FAFBFD] text-slate-900 p-5 rounded-xl border border-slate-200 space-y-4 max-w-sm mx-auto shadow-lg text-xs font-sans">
              
              <div className="bg-[#1D4ED8] p-3 -mx-5 -mt-5 rounded-t-xl flex justify-between items-center text-white">
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-5 h-5 text-white shrink-0" />
                  <span className="font-black text-[11px] uppercase tracking-wider font-mono">APEX BANK SECOND FACTOR</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-blue-200" />
              </div>

              <div className="space-y-3.5 text-center pt-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 text-[11.5px]">Enter Transaction Approval Code</h4>
                  <p className="text-[10px] text-slate-500">We sent a secure One-Time Password to authorize checking transfer of ${cartTotal.toFixed(2)} to Spacelab Store.</p>
                </div>

                <div className="space-y-1 max-w-[180px] mx-auto">
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => { setOtpInput(e.target.value.replace(/[^0-9]/g, '')); setOtpError(''); }}
                    placeholder="OTP Password"
                    maxLength={6}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-center font-mono text-xs font-bold focus:outline-none focus:border-blue-600 shadow-inner tracking-widest text-slate-800"
                  />
                  {otpError && <p className="text-[9.5px] text-rose-600 font-bold">{otpError}</p>}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={handleVerifyNetBankingOtp}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-center cursor-pointer shadow-sm transition-colors"
                >
                  Verify & Approve Transfer
                </button>
                <button
                  onClick={cancelTransaction}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          )}

          {/* F. Store Wallet Prepaid Balance Secure PIN validation */}
          {processingState === 'wallet_pin' && (
            <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 space-y-4 max-w-sm mx-auto text-xs font-mono">
              <div className="text-center space-y-2">
                <Wallet className="w-10 h-10 text-blue-500 mx-auto animate-pulse" />
                <h4 className="font-extrabold text-sm text-slate-100 uppercase tracking-widest">Verify Store Wallet Balance</h4>
                <p className="text-[10px] text-slate-400 font-sans">Deducting exactly ${cartTotal.toFixed(2)} from prepaid account.</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] space-y-1 text-slate-400">
                <div className="flex justify-between"><span>Wallet Balance:</span><span className="font-bold text-slate-200">${currentUser.walletBalance.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Post-Order Bal:</span><span className="font-bold text-emerald-400">${(currentUser.walletBalance - cartTotal).toFixed(2)}</span></div>
              </div>

              <div className="space-y-1.5 text-center">
                <label className="font-bold text-slate-400 text-[9px] uppercase tracking-wider block">ENTER 4-DIGIT TRANSACTION SECURITY PIN:</label>
                <input
                  type="password"
                  value={walletPinInput}
                  onChange={(e) => { setWalletPinInput(e.target.value.replace(/[^0-9]/g, '').substring(0, 4)); setWalletPinError(''); }}
                  placeholder="••••"
                  maxLength={4}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-center text-sm font-black focus:outline-none focus:border-blue-500 max-w-[120px] mx-auto text-blue-400 tracking-widest shadow-inner block"
                />
                {walletPinError && <p className="text-[10px] text-rose-400 font-bold animate-bounce">{walletPinError}</p>}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleVerifyWalletPin}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-center cursor-pointer text-[11px]"
                >
                  Authorize Debit (PIN: 1234)
                </button>
                <button
                  onClick={cancelTransaction}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* G. COD Risk Bot Control Human Verification CAPTCHA */}
          {processingState === 'cod_captcha' && (
            <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 space-y-4 max-w-sm mx-auto text-xs">
              <div className="text-center space-y-1">
                <Truck className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="font-extrabold text-xs text-slate-100 uppercase tracking-widest">Confirm Cash on Delivery Order</h4>
                <p className="text-[10px] text-slate-400">To secure warehouse slot allocation, complete anti-bot captcha:</p>
              </div>

              {/* Captcha representation box */}
              <div className="flex justify-center items-center gap-3">
                <div className="bg-gradient-to-r from-indigo-950 to-slate-950 border-2 border-slate-800 p-3.5 rounded-lg select-none text-center font-mono font-black italic text-lg tracking-widest text-amber-400 select-none shadow-inner relative overflow-hidden flex items-center justify-center w-36 h-12">
                  {/* Grid diagonal noise lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%)] bg-[size:10px_10px] opacity-25" />
                  <span className="relative z-10 rotate-3 transform inline-block">{captchaText}</span>
                </div>
                <button
                  onClick={generateCaptcha}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                  title="Generate New Code"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-400 text-[9px] uppercase tracking-wider block text-center">Type characters displayed above:</label>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Type CAPTCHA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-center text-xs font-extrabold text-white tracking-widest focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleVerifyCaptcha}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-center cursor-pointer shadow-sm"
                >
                  Confirm Cash Dispatch Order
                </button>
                <button
                  onClick={cancelTransaction}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Secure Audit Trails log terminal box */}
          <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono text-[10px]">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-1.5">
              Live Secure Gateway Logs:
            </span>
            <div className="space-y-1 max-h-[85px] overflow-y-auto text-[9px] text-slate-300 leading-normal scrollbar-thin">
              {simulationLogs.map((log, i) => (
                <div key={i} className="flex gap-1 items-start">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>{log}</span>
                </div>
              ))}
              <div className="flex gap-1.5 items-center text-blue-400">
                <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" />
                <span className="animate-pulse">
                  {processingState === 'finalized_ledger' ? 'Performing final inventory database updates...' : 'Listening on secure socket stream...'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Cancel button */}
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={cancelTransaction}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg font-bold text-[10px] cursor-pointer transition-colors"
            >
              Cancel Transaction
            </button>
          </div>

        </div>
      ) : (
        /* --- STANDARD SELECTION VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Left side: payment mode selector buttons */}
          <div className="md:col-span-1 space-y-2 border-r border-slate-200/60 pr-2">
            <span className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase tracking-wider">Select Payment Type:</span>
            
            {[
              { id: 'UPI', label: 'UPI Collect (Phone / QR)', desc: 'GPay, PhonePe, QR Code', icon: QrCode },
              { id: 'Card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
              { id: 'Wallet', label: 'Store Wallet Balance', desc: `Bal: $${currentUser.walletBalance.toFixed(2)}`, icon: Wallet },
              { id: 'NetBanking', label: 'Net Banking transfer', desc: 'Secure direct bank login', icon: Landmark },
              { id: 'EMI', label: 'EMI Financing', desc: 'Monthly split payments', icon: ShieldCheck },
              { id: 'Split', label: 'Split Phone + Card', desc: 'Pay split via UPI & Card', icon: Sparkles },
              { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay Cash at doorstep', icon: Truck }
            ].map(pm => {
              const Icon = pm.icon;
              const isSelected = paymentType === pm.id;
              return (
                <button
                  key={pm.id}
                  onClick={() => { setPaymentType(pm.id); setError(''); }}
                  className={`w-full text-left p-2.5 border rounded-lg transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected ? 'border-blue-600 bg-blue-50/75 text-blue-800 ring-1 ring-blue-500/20' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <span className="font-extrabold block leading-tight">{pm.label}</span>
                    <p className="text-[9px] text-slate-400 truncate font-mono">{pm.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right side: payment method dynamic inputs */}
          <div className="md:col-span-2 space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
            
            {/* UPI SECTION */}
            {paymentType === 'UPI' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-700">Scan Secure UPI Checkout QR Code</h4>
                  <button
                    onClick={refreshUpiQrCode}
                    className="text-[9.5px] font-bold bg-white text-slate-500 hover:text-slate-700 p-1 px-2 border border-slate-200 rounded cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh QR
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                  
                  {/* Simulated dynamic QR code container */}
                  <div className="w-32 h-32 bg-slate-50 border border-slate-200 rounded-lg relative flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                    <div className="absolute inset-2 grid grid-cols-5 gap-1.5 opacity-80">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`rounded-[2px] ${
                          (i % 3 === 0 || i % 7 === 0 || i === 0 || i === 4 || i === 20 || i === 24) ? 'bg-slate-900' : 'bg-slate-100'
                        }`} />
                      ))}
                    </div>
                    {/* QR neon scanning line */}
                    {qrSecondsLeft > 0 ? (
                      <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_#10B981] animate-bounce top-1/4" />
                    ) : (
                      <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-1.5">
                        <ShieldAlert className="w-6 h-6 text-rose-500 mb-1" />
                        <span className="text-[8px] text-slate-300 font-bold font-mono">TOKEN EXPIRED</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Open GPay / PhonePe and scan the secure merchant QR to pay:
                    </p>
                    <p className="font-mono font-black text-lg text-blue-600">${cartTotal.toFixed(2)}</p>
                    <div className="flex flex-wrap gap-1.5 items-center justify-center sm:justify-start">
                      <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Secure Merchant QR
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        qrSecondsLeft > 60 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600 animate-pulse'
                      }`}>
                        ⏳ Expires in {formatTime(qrSecondsLeft)}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono">Token ID: {qrCodeId}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Or Enter VPA Address Handle for direct phone request:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={vpa}
                      onChange={(e) => setVpa(e.target.value)}
                      placeholder="e.g. vvsudarsan@okaxis"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono shadow-inner"
                    />
                    <span className="bg-slate-100 text-slate-500 px-3 py-2 rounded-lg font-bold border border-slate-200 flex items-center justify-center font-mono text-[10px]">
                      @upi
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CARD SECTION */}
            {paymentType === 'Card' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-700">Enter Card Information</h4>
                  <button
                    onClick={fillSandboxCredentials}
                    className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold px-2.5 py-1 rounded-md border border-blue-100 transition-colors cursor-pointer"
                  >
                    ⚡ Auto-Fill Credentials
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="font-bold text-slate-500">16-Digit Card Number:</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4111 2222 3333 4444"
                      maxLength={19}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-inner"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400 font-bold font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                        {cardBrand.split(' ')[0]}
                      </span>
                      <CreditCard className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">Expiry (MM/YY):</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="12/28"
                      maxLength={5}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">Security CVV Code:</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, '').substring(0, 3))}
                      placeholder="***"
                      maxLength={3}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Cardholder Name (as printed):</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="e.g. Jonathan Doe"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* WALLET SECTION */}
            {paymentType === 'Wallet' && (
              <div className="space-y-3.5 text-center py-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Wallet className="w-10 h-10 text-blue-600 mx-auto" />
                <div className="space-y-1 max-w-sm mx-auto px-4">
                  <h4 className="font-bold text-slate-800 text-sm">Prepaid Store Loyalty Wallet</h4>
                  <p className="text-[11px] text-slate-400">Instantly settle this transaction with 1-Click using your loaded digital escrow balance.</p>
                  
                  <div className="pt-2.5 flex justify-center gap-6 font-mono text-[11px] border-t border-slate-100 mt-3">
                    <div><span className="text-slate-400 block">AVAILABLE BALANCE</span><span className="font-extrabold text-slate-700 text-sm">${currentUser.walletBalance.toFixed(2)}</span></div>
                    <div><span className="text-slate-400 block">TOTAL TO PAY</span><span className="font-extrabold text-blue-600 text-sm">${cartTotal.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* NETBANKING SECTION */}
            {paymentType === 'NetBanking' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700">Online Retail Net Banking Client</h4>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Registered Bank Institution:</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none cursor-pointer"
                  >
                    <option value="Chase Bank">Chase Bank Online Banking</option>
                    <option value="Wells Fargo">Wells Fargo Checking Account</option>
                    <option value="Bank of America">Bank of America Private Client</option>
                    <option value="Citibank">Citibank Retail checking</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank NetBanking Portal</option>
                  </select>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100/75 rounded-lg flex items-start gap-2 text-blue-800">
                  <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[10.5px] leading-relaxed">
                    Proceeding will route you securely to a <strong>simulated online banking portal login form</strong> to authenticate check debit.
                  </p>
                </div>
              </div>
            )}

            {/* EMI SECTION */}
            {paymentType === 'EMI' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700">Select Monthly EMI Plan</h4>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">EMI Schedule Duration:</label>
                  <select
                    value={emiMonths}
                    onChange={(e) => setEmiMonths(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value={3}>3 Months @ 12% APR</option>
                    <option value={6}>6 Months @ 14% APR</option>
                    <option value={12}>12 Months @ 15% APR</option>
                  </select>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-[11px] font-mono space-y-1">
                  <div className="flex justify-between"><span>EMI Principal due:</span><span>${cartTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-slate-500"><span>Applicable Interest:</span><span>~12.00% APR</span></div>
                  <div className="flex justify-between font-extrabold text-slate-800 border-t border-slate-100 pt-1.5">
                    <span>Monthly Installment:</span>
                    <span className="text-blue-600">${((cartTotal * (1 + 0.12)) / emiMonths).toFixed(2)} / month</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-100 rounded-lg text-[10px] text-slate-500">
                  ⚠️ <strong>Note:</strong> EMI checkout requires typing credit card credentials first (Select the "Credit / Debit Card" tab above to prefill or input card parameters).
                </div>
              </div>
            )}

            {/* SPLIT SECTION */}
            {paymentType === 'Split' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Allocate Multi-Mode Split Payments
                </h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Excellent for splitting the check. Allocate the balance between a smartphone app UPI request and your credit card.
                </p>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="space-y-1 bg-white p-2.5 border border-slate-200 rounded-lg">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase">Phone App (UPI) Split:</label>
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-1 font-bold">$</span>
                      <input
                        type="number"
                        value={splitUpi}
                        onChange={(e) => setSplitUpi(e.target.value)}
                        className="w-full bg-slate-50 rounded border-none px-2 py-1 text-xs focus:outline-none text-slate-800 font-extrabold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 bg-white p-2.5 border border-slate-200 rounded-lg">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase">Card Split:</label>
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-1 font-bold">$</span>
                      <input
                        type="number"
                        value={splitCard}
                        onChange={(e) => setSplitCard(e.target.value)}
                        className="w-full bg-slate-50 rounded border-none px-2 py-1 text-xs focus:outline-none text-slate-800 font-extrabold"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-mono flex justify-between items-center">
                  <span>Allocation Sum: ${ (parseFloat(splitUpi) || 0) + (parseFloat(splitCard) || 0) }</span>
                  <span>Invoice Total: ${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* COD SECTION */}
            {paymentType === 'COD' && (
              <div className="space-y-2.5 text-center py-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Truck className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="space-y-1 max-w-sm mx-auto px-4">
                  <h4 className="font-bold text-slate-800 text-sm">Pay cash upon delivery doorstep</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dispatch logistics begins immediately. Settle full check amount with the delivery agent at your door.
                  </p>
                </div>
              </div>
            )}

            {/* Authorization Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={validateAndProceed}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-center cursor-pointer shadow-sm transition-colors flex items-center justify-center gap-1 text-[12px]"
              >
                <ShieldCheck className="w-4 h-4" /> Authorize & Pay ${cartTotal.toFixed(2)}
              </button>
              <button
                onClick={onCancel}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-center cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
