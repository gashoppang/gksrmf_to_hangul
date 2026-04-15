import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'

const LEAD_CONSONANTS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const VOWELS = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
const TRAILING_CONSONANTS = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

const leadSingleMap: Record<string, number> = {
  r: 0,
  R: 1,
  s: 2,
  e: 3,
  E: 4,
  f: 5,
  a: 6,
  q: 7,
  Q: 8,
  t: 9,
  T: 10,
  d: 11,
  w: 12,
  W: 13,
  c: 14,
  z: 15,
  x: 16,
  v: 17,
  g: 18,
}

const tailSingleMap: Record<string, number> = {
  r: 1,
  R: 2,
  s: 4,
  e: 7,
  E: 7,
  f: 8,
  a: 16,
  q: 17,
  Q: 17,
  t: 19,
  T: 20,
  d: 21,
  w: 22,
  W: 22,
  c: 23,
  z: 24,
  x: 25,
  v: 26,
  g: 27,
}

const vowelSingleMap: Record<string, number> = {
  k: 0,
  o: 1,
  i: 2,
  O: 3,
  j: 4,
  p: 5,
  u: 6,
  P: 7,
  h: 8,
  y: 12,
  n: 13,
  b: 17,
  m: 18,
  l: 20,
}

const leadDoubleMap: Record<string, number> = {
  rr: 1,
  ee: 4,
  qq: 8,
  tt: 10,
  ww: 13,
}

const vowelDoubleMap: Record<string, number> = {
  hk: 9,
  ho: 10,
  hO: 10,
  hl: 11,
  nj: 14,
  nP: 15,
  np: 15,
  nl: 16,
  ml: 19,
}

const tailDoubleMap: Record<string, number> = {
  rt: 3,
  sw: 5,
  sg: 6,
  fr: 9,
  fa: 10,
  fq: 11,
  ft: 12,
  fx: 13,
  fv: 14,
  fg: 15,
  qt: 18,
  qT: 18,
}

const splitTailMap: Record<number, [number, number]> = {
  3: [1, 19],
  5: [4, 22],
  6: [4, 27],
  9: [8, 1],
  10: [8, 16],
  11: [8, 17],
  12: [8, 19],
  13: [8, 25],
  14: [8, 26],
  15: [8, 27],
  18: [17, 19],
}

type ConversionResult = {
  text: string
  rawPrefix: number[]
}

function toUnicodeSyllable(lead: number, vowel: number, tail: number): string {
  const code = 0xAC00 + lead * 588 + vowel * 28 + tail
  return String.fromCharCode(code)
}

function tailToLeadIndex(tail: number): number {
  return LEAD_CONSONANTS.indexOf(TRAILING_CONSONANTS[tail])
}

function transliterateToHangulWithMap(input: string): ConversionResult {
  let output = ''
  let lead = -1
  let leadKey = ''
  let vowel = -1
  let vowelKey = ''
  let tail = -1
  let tailKey = ''
  const rawPrefix: number[] = [0]

  const flush = (): string => {
    if (lead === -1 && vowel === -1) return ''
    if (lead === -1 && vowel !== -1) return VOWELS[vowel]
    if (vowel === -1) return LEAD_CONSONANTS[lead]
    const trailing = tail === -1 ? 0 : tail
    return toUnicodeSyllable(lead, vowel, trailing)
  }

  const reset = (): void => {
    lead = -1
    leadKey = ''
    vowel = -1
    vowelKey = ''
    tail = -1
    tailKey = ''
  }

  const normalizeVowelShift = (raw: string): string => {
    if (!raw) return raw
    const lower = raw.toLowerCase()
    if (raw === lower) return raw
    if (raw in leadSingleMap) return raw
    if (lower in vowelSingleMap) return lower
    return raw
  }

  for (let i = 0; i < input.length; i++) {
    const rawCh = input[i]
    const ch = normalizeVowelShift(rawCh)
    const isConsonant = ch in leadSingleMap
    const isVowel = ch in vowelSingleMap
    const next = input[i + 1]
    const nextCh = next ? normalizeVowelShift(next) : ''
    const nextIsVowel = !!(nextCh && nextCh in vowelSingleMap)

    if (!isConsonant && !isVowel) {
      output += flush()
      reset()
      output += ch
      rawPrefix.push(output.length)
      continue
    }

    if (isVowel) {
      const nextVowel = vowelSingleMap[ch]

      if (tail !== -1) {
        const splitTail = splitTailMap[tail]

        if (splitTail) {
          output += toUnicodeSyllable(lead, vowel, splitTail[0])
          lead = tailToLeadIndex(splitTail[1])
        } else {
          output += toUnicodeSyllable(lead, vowel, 0)
          lead = tailToLeadIndex(tail)
        }

        leadKey = ''
        vowel = nextVowel
        vowelKey = ch
        tail = -1
        tailKey = ''
        rawPrefix.push(output.length)
        continue
      }

      if (vowel === -1) {
        vowel = nextVowel
        vowelKey = ch
        rawPrefix.push(output.length + flush().length)
        continue
      }

      const combined = vowelDoubleMap[`${vowelKey}${ch}`]
      if (combined !== undefined) {
        vowel = combined
        vowelKey += ch
        rawPrefix.push(output.length + flush().length)
        continue
      }

      output += flush()
      lead = -1
      leadKey = ''
      vowel = nextVowel
      vowelKey = ch
      tail = -1
      tailKey = ''
      rawPrefix.push(output.length + flush().length)
      continue
    }

    if (isConsonant) {
      const nextLead = leadSingleMap[ch]

      if (lead === -1) {
        lead = nextLead
        leadKey = ch
        rawPrefix.push(output.length + flush().length)
        continue
      }

      if (vowel === -1) {
        const doubled = leadDoubleMap[`${leadKey}${ch}`]
        if (doubled !== undefined && leadKey !== ch) {
          lead = doubled
          leadKey += ch
          rawPrefix.push(output.length + flush().length)
          continue
        }

        output += LEAD_CONSONANTS[lead]
        lead = nextLead
        leadKey = ch
        rawPrefix.push(output.length + flush().length)
        continue
      }

      if (tail === -1) {
        if (nextIsVowel) {
          output += flush()
          lead = nextLead
          leadKey = ch
          vowel = -1
          vowelKey = ''
          tail = -1
          tailKey = ''
          rawPrefix.push(output.length + flush().length)
          continue
        }

        const doubledTail =
          tailDoubleMap[`${tailKey}${ch}`] ??
          tailDoubleMap[`${tailKey.toLowerCase()}${ch}`] ??
          tailDoubleMap[`${tailKey}${ch.toLowerCase()}`] ??
          tailDoubleMap[`${tailKey.toLowerCase()}${ch.toLowerCase()}`]

        if (doubledTail !== undefined && tailKey !== ch) {
          tail = doubledTail
          tailKey += ch
          rawPrefix.push(output.length + flush().length)
          continue
        }

        const singleTail = tailSingleMap[ch]
        if (singleTail === undefined) {
          output += flush()
          lead = nextLead
          leadKey = ch
          vowel = -1
          vowelKey = ''
          tail = -1
          tailKey = ''
          rawPrefix.push(output.length + flush().length)
          continue
        }

        tail = singleTail
        tailKey = ch
        rawPrefix.push(output.length + flush().length)
        continue
      }

      if (nextIsVowel) {
        output += flush()
        lead = nextLead
        leadKey = ch
        vowel = -1
        vowelKey = ''
        tail = -1
        tailKey = ''
        rawPrefix.push(output.length + flush().length)
        continue
      }

      const doubledTail =
        tailDoubleMap[`${tailKey}${ch}`] ??
        tailDoubleMap[`${tailKey.toLowerCase()}${ch}`] ??
        tailDoubleMap[`${tailKey}${ch.toLowerCase()}`] ??
        tailDoubleMap[`${tailKey.toLowerCase()}${ch.toLowerCase()}`]

      if (doubledTail !== undefined && tailKey !== ch) {
        tail = doubledTail
        tailKey += ch
        rawPrefix.push(output.length + flush().length)
        continue
      }

      output += flush()
      lead = nextLead
      leadKey = ch
      vowel = -1
      vowelKey = ''
      tail = -1
      tailKey = ''
      rawPrefix.push(output.length + flush().length)
    }
  }

  const finalOutput = output + flush()
  rawPrefix[rawPrefix.length - 1] = finalOutput.length

  return { text: finalOutput, rawPrefix }
}

function rawIndexToDisplayIndex(rawIndex: number, rawPrefix: number[]): number {
  const max = rawPrefix.length - 1
  return rawPrefix[Math.max(0, Math.min(rawIndex, max))]
}

function displayIndexToRawIndex(displayIndex: number, rawPrefix: number[]): number {
  const target = Math.max(0, Math.min(displayIndex, rawPrefix[rawPrefix.length - 1]))
  let lo = 0
  let hi = rawPrefix.length

  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (rawPrefix[mid] <= target) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }

  return Math.max(0, lo - 1)
}

function App() {
  const [rawInput, setRawInput] = useState('')
  const [rawCaret, setRawCaret] = useState(0)
  const [rawSelectionStart, setRawSelectionStart] = useState(0)
  const [rawSelectionEnd, setRawSelectionEnd] = useState(0)
  const [copyLabel, setCopyLabel] = useState('복사')
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const conversion = useMemo(() => transliterateToHangulWithMap(rawInput), [rawInput])
  const translated = conversion.text
  const hasSelection = rawSelectionStart !== rawSelectionEnd
  const selectionStart = Math.min(rawSelectionStart, rawSelectionEnd)
  const selectionEnd = Math.max(rawSelectionStart, rawSelectionEnd)

  useEffect(() => {
    if (copyLabel === '복사') return

    const timeoutId = window.setTimeout(() => setCopyLabel('복사'), 1500)
    return () => window.clearTimeout(timeoutId)
  }, [copyLabel])

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    if (hasSelection) {
      const start = rawIndexToDisplayIndex(selectionStart, conversion.rawPrefix)
      const end = rawIndexToDisplayIndex(selectionEnd, conversion.rawPrefix)

      if (input.selectionStart === start && input.selectionEnd === end) return
      input.setSelectionRange(start, end)
      return
    }

    const target = rawIndexToDisplayIndex(rawCaret, conversion.rawPrefix)
    if (input.selectionStart === target && input.selectionEnd === target) return

    input.setSelectionRange(target, target)
  }, [rawCaret, conversion.rawPrefix, translated, hasSelection, selectionStart, selectionEnd])

  const syncSelectionFromDisplay = () => {
    const element = inputRef.current
    if (!element) return

    const nextStart = displayIndexToRawIndex(element.selectionStart ?? 0, conversion.rawPrefix)
    const nextEnd = displayIndexToRawIndex(element.selectionEnd ?? nextStart, conversion.rawPrefix)
    const a = Math.min(nextStart, nextEnd)
    const b = Math.max(nextStart, nextEnd)

    setRawSelectionStart(a)
    setRawSelectionEnd(b)
    setRawCaret(b)
  }

  const insertRawAtCaret = (value: string) => {
    if (!value) return

    const nextCaret = hasSelection
      ? selectionStart + value.length
      : rawCaret + value.length

    setRawInput((prev) => {
      const start = hasSelection ? selectionStart : rawCaret
      const end = hasSelection ? selectionEnd : rawCaret
      return prev.slice(0, start) + value + prev.slice(end)
    })

    setRawCaret(nextCaret)
    setRawSelectionStart(nextCaret)
    setRawSelectionEnd(nextCaret)
  }

  const deleteBeforeCaret = () => {
    if (hasSelection) {
      setRawInput((prev) => prev.slice(0, selectionStart) + prev.slice(selectionEnd))
      setRawCaret(selectionStart)
      setRawSelectionStart(selectionStart)
      setRawSelectionEnd(selectionStart)
      return
    }

    if (rawCaret === 0) return

    setRawInput((prev) => prev.slice(0, rawCaret - 1) + prev.slice(rawCaret))
    setRawCaret((prev) => prev - 1)
    setRawSelectionStart(rawCaret - 1)
    setRawSelectionEnd(rawCaret - 1)
  }

  const deleteAtCaret = () => {
    if (hasSelection) {
      setRawInput((prev) => prev.slice(0, selectionStart) + prev.slice(selectionEnd))
      setRawCaret(selectionStart)
      setRawSelectionStart(selectionStart)
      setRawSelectionEnd(selectionStart)
      return
    }

    if (rawCaret >= rawInput.length) return

    setRawInput((prev) => prev.slice(0, rawCaret) + prev.slice(rawCaret + 1))
    setRawSelectionStart(rawCaret)
    setRawSelectionEnd(rawCaret)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const { key, ctrlKey, metaKey, altKey } = event
    const isModifier = ctrlKey || metaKey || altKey

    if (isModifier) return

    if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown' || key === 'Home' || key === 'End' || key === 'PageUp' || key === 'PageDown') {
      return
    }

    if (key === 'Backspace') {
      event.preventDefault()
      deleteBeforeCaret()
      return
    }

    if (key === 'Delete') {
      event.preventDefault()
      deleteAtCaret()
      return
    }

    if (key === 'Enter') {
      event.preventDefault()
      insertRawAtCaret('\n')
      return
    }

    if (key.length === 1) {
      event.preventDefault()
      insertRawAtCaret(key)
    }
  }

  const handleMouseUp = () => {
    syncSelectionFromDisplay()
  }

  const handleKeyUp = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const { key, ctrlKey, metaKey, altKey } = event

    if (ctrlKey || metaKey || altKey) return

    if (key.length === 1 || key === 'Enter' || key === 'Backspace' || key === 'Delete') {
      return
    }

    syncSelectionFromDisplay()
  }

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text')
    if (!text) return
    insertRawAtCaret(text)
  }

  const handleCopy = async () => {
    if (!translated) return

    try {
      await navigator.clipboard.writeText(translated)
      setCopyLabel('복사됨')
    } catch {
      setCopyLabel('실패')
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>한글 IME 입력기</h1>
        <p className="subtitle">입력한 영타가 실시간으로 같은 위치 기준으로 변환됩니다.</p>
        <div className="single-io">
          <label className="field-label" htmlFor="source">
            입력
          </label>
          <textarea
            id="source"
            ref={inputRef}
            className="source-textarea"
            value={translated}
            onChange={() => {}}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onMouseUp={handleMouseUp}
            onPaste={handlePaste}
            placeholder="예: gksrmf"
            spellCheck={false}
          />
          <div className="single-actions">
            <button type="button" className="copy-button" onClick={handleCopy} disabled={!translated}>
              {copyLabel}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
