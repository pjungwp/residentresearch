/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)', slate: 'var(--slate)', teal: 'var(--teal)', 'teal-soft': 'var(--teal-soft)', primary: 'var(--btn-primary)',
        ivory: 'var(--ivory)', page: 'var(--page)', surface: 'var(--surface)', 'surface-2': 'var(--surface-2)', sage: 'var(--sage)', lavender: 'var(--lavender)',
        ok: 'var(--ok)', 'ok-soft': 'var(--ok-soft)', err: 'var(--err)', 'err-soft': 'var(--err-soft)', warn: 'var(--warn)', 'warn-soft': 'var(--warn-soft)',
        terra: 'var(--terra)', 'terra-ui': 'var(--terra-ui)', 'terra-soft': 'var(--terra-soft)', line: 'var(--line)', 'line-strong': 'var(--line-strong)',
        w1: 'var(--w1)', 'w1-text': 'var(--w1-text)', 'w1-soft': 'var(--w1-soft)', w2: 'var(--w2)', 'w2-text': 'var(--w2-text)', 'w2-soft': 'var(--w2-soft)',
        w3: 'var(--w3)', 'w3-text': 'var(--w3-text)', 'w3-soft': 'var(--w3-soft)', w4: 'var(--w4)', 'w4-text': 'var(--w4-text)', 'w4-soft': 'var(--w4-soft)',
        w5: 'var(--w5)', 'w5-text': 'var(--w5-text)', 'w5-soft': 'var(--w5-soft)',
        w6: 'var(--w6)', 'w6-text': 'var(--w6-text)', 'w6-soft': 'var(--w6-soft)', w7: 'var(--w7)', 'w7-text': 'var(--w7-text)', 'w7-soft': 'var(--w7-soft)'
      },
      fontFamily: { display: ['Fraunces Variable', 'Georgia', 'serif'], sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
      borderRadius: { card: '16px' },
      maxWidth: { patient: '1120px', academy: '1440px', read: '70ch' }
    }
  },
  plugins: []
};
