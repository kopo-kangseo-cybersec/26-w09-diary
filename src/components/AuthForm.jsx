import { useState } from 'react'
import { signIn, signUp } from '../api/auth.js'

function getAuthErrorMessage(error) {
  if (error instanceof Error && /email rate limit exceeded/i.test(error.message)) {
    return '인증 이메일 발송 한도를 초과했습니다. 받은편지함과 스팸함을 먼저 확인하고, 잠시 후 다시 시도해 주세요. 계속 발생하면 Supabase에서 SMTP 설정을 확인해 주세요.'
  }

  return error instanceof Error
    ? error.message
    : '계정 요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { session } = await signUp(email, password)
        if (!session) {
          setMessage('가입 확인 메일을 보냈습니다. 이메일 인증 후 로그인해 주세요.')
        }
      } else {
        await signIn(email, password)
      }
      setPassword('')
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchMode = () => {
    setIsSignUp((current) => !current)
    setError('')
    setMessage('')
  }

  return (
    <section className="retro-window mx-auto w-full max-w-md p-5 sm:p-7" aria-labelledby="account-title">
      <div className="retro-window-titlebar">
        <span>계정 관리</span>
        <span className="retro-window-controls" aria-hidden="true">
          <i>_</i><i>□</i><i>×</i>
        </span>
      </div>
      <p className="retro-window-kicker text-xs font-bold uppercase tracking-[0.18em]">
        {isSignUp ? 'CREATE ACCOUNT' : 'ACCOUNT LOGIN'}
      </p>
      <h2 id="account-title" className="mt-2 text-xl font-bold">
        {isSignUp ? '새 계정 만들기' : '로그인'}
      </h2>
      <p className="retro-hint mt-2 text-sm">
        로그인한 계정의 일기만 볼 수 있습니다.
      </p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <label htmlFor="account-email" className="mb-2 block text-sm font-semibold">
            이메일
          </label>
          <input
            id="account-email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="name@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value.trim())}
            className="retro-textarea w-full rounded-xl border border-stone-200 bg-[#fdfcf9] px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
          />
          <p className="retro-hint mt-2 text-xs">
            name@example.com 형식으로 입력해 주세요. 앞뒤 공백은 자동으로 제거됩니다.
          </p>
        </div>
        <div>
          <label htmlFor="account-password" className="mb-2 block text-sm font-semibold">
            비밀번호
          </label>
          <input
            id="account-password"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="retro-textarea w-full rounded-xl border border-stone-200 bg-[#fdfcf9] px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
          />
        </div>

        {(error || message) && (
          <p role={error ? 'alert' : 'status'} className={`rounded-xl p-3 text-sm ${error ? 'bg-rose-50 text-rose-900' : 'bg-emerald-50 text-emerald-900'}`}>
            {error || message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="retro-button w-full rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? '처리 중...' : isSignUp ? '계정 만들기' : '로그인'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm">
        {isSignUp ? '이미 계정이 있나요?' : '처음 방문하셨나요?'}{' '}
        <button
          type="button"
          onClick={switchMode}
          className="retro-link font-semibold underline underline-offset-2"
        >
          {isSignUp ? '로그인' : '계정 만들기'}
        </button>
      </p>
    </section>
  )
}

export default AuthForm
