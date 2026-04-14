import { useMemo, useState } from 'react'
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

function toUnicodeSyllable(lead: number, vowel: number, tail: number): string {
  const code = 0xAC00 + lead * 588 + vowel * 28 + tail
  return String.fromCharCode(code)
}

function tailToLeadIndex(tail: number): number {
  return LEAD_CONSONANTS.indexOf(TRAILING_CONSONANTS[tail])
}

function transliterateToHangul(input: string): string {
  let output = ''
  let lead = -1
  let leadKey = ''
  let vowel = -1
  let vowelKey = ''
  let tail = -1
  let tailKey = ''

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

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    const isConsonant = ch in leadSingleMap
    const isVowel = ch in vowelSingleMap
    const next = input[i + 1]
    const nextIsVowel = !!(next && next in vowelSingleMap)

    if (!isConsonant && !isVowel) {
      output += flush()
      reset()
      output += ch
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
        continue
      }

      if (vowel === -1) {
        vowel = nextVowel
        vowelKey = ch
        continue
      }

      const combined = vowelDoubleMap[`${vowelKey}${ch}`]
      if (combined !== undefined) {
        vowel = combined
        vowelKey += ch
        continue
      }

      output += flush()
      lead = -1
      leadKey = ''
      vowel = nextVowel
      vowelKey = ch
      tail = -1
      tailKey = ''
      continue
    }

    if (isConsonant) {
      const nextLead = leadSingleMap[ch]

      if (lead === -1) {
        lead = nextLead
        leadKey = ch
        continue
      }

      if (vowel === -1) {
        const doubled = leadDoubleMap[`${leadKey}${ch}`]
        if (doubled !== undefined) {
          lead = doubled
          leadKey += ch
          continue
        }

        output += LEAD_CONSONANTS[lead]
        lead = nextLead
        leadKey = ch
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
          continue
        }

        const doubledTail =
          tailDoubleMap[`${tailKey}${ch}`] ??
          tailDoubleMap[`${tailKey.toLowerCase()}${ch}`] ??
          tailDoubleMap[`${tailKey}${ch.toLowerCase()}`] ??
          tailDoubleMap[`${tailKey.toLowerCase()}${ch.toLowerCase()}`]

        if (doubledTail !== undefined) {
          tail = doubledTail
          tailKey += ch
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
          continue
        }

        tail = singleTail
        tailKey = ch
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
        continue
      }

      const doubledTail =
        tailDoubleMap[`${tailKey}${ch}`] ??
        tailDoubleMap[`${tailKey.toLowerCase()}${ch}`] ??
        tailDoubleMap[`${tailKey}${ch.toLowerCase()}`] ??
        tailDoubleMap[`${tailKey.toLowerCase()}${ch.toLowerCase()}`]

      if (doubledTail !== undefined) {
        tail = doubledTail
        tailKey += ch
        continue
      }

      output += flush()
      lead = nextLead
      leadKey = ch
      vowel = -1
      vowelKey = ''
      tail = -1
      tailKey = ''
    }
  }

  return output + flush()
}

function transliterateWithRawEnglish(input: string): string {
  const segments = input.split('//')

  return segments
    .map((segment, index) => (index % 2 === 1 ? segment : transliterateToHangul(segment)))
    .join('')
}

function App() {
  const [source, setSource] = useState('')

  const translated = useMemo(() => transliterateWithRawEnglish(source), [source])

  return (
    <main className="page">
      <section className="card">
        <h1>영타→한글 번역기</h1>
        <p className="subtitle">영타를 한국어로 바꿉니다.</p>
        <div className="translator-grid">
          <label className="field">
            <span>영타 입력</span>
            <textarea
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="예: gksrmf"
              spellCheck={false}
            />
            <p className="field-hint">영어 원문은 `//hello world//`처럼 감싸면 그대로 출력됩니다.</p>
          </label>
          <label className="field">
            <span>한글 결과</span>
            <textarea value={translated} readOnly />
          </label>
        </div>
      </section>
    </main>
  )
}

export default App
