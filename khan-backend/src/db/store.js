/**
 * Local JSON File Store — drop-in replacement for Supabase client
 * Provides the same chaining API: .from('table').select('*').eq('col', val)
 */
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', '..', 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function readTable(name) {
  const file = path.join(DATA_DIR, `${name}.json`)
  if (!fs.existsSync(file)) return []
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return [] }
}

function writeTable(name, rows) {
  const file = path.join(DATA_DIR, `${name}.json`)
  fs.writeFileSync(file, JSON.stringify(rows, null, 2), 'utf-8')
}

function genId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

// Chainable query that mimics Supabase
class Chain {
  constructor(table) {
    this._table = table
    this._op = null       // 'select' | 'insert' | 'update' | 'delete'
    this._pendingOp = null // tracks insert/update before .select() chains
    this._body = null
    this._filters = []
    this._orderCol = null
    this._orderAsc = true
    this._limitN = null
    this._offsetN = null
    this._single = false
    this._headOnly = false
    this._countExact = false
  }

  // ── Operation starters ──
  select(cols, opts) {
    // If we already did insert/update, .select() means "return the result"
    if (this._op === 'insert' || this._op === 'update') {
      this._pendingOp = this._op
      // Don't overwrite _op — keep insert/update as the real operation
    } else {
      this._op = 'select'
    }
    this._selectCols = cols || '*'
    if (opts?.count === 'exact') this._countExact = true
    if (opts?.head) this._headOnly = true
    return this
  }

  insert(body) {
    this._op = 'insert'
    this._body = body
    return this
  }

  update(body) {
    this._op = 'update'
    this._body = body
    return this
  }

  delete() {
    this._op = 'delete'
    return this
  }

  // ── Filters ──
  eq(col, val) { this._filters.push({ type: 'eq', col, val }); return this }
  neq(col, val) { this._filters.push({ type: 'neq', col, val }); return this }
  gt(col, val) { this._filters.push({ type: 'gt', col, val }); return this }
  gte(col, val) { this._filters.push({ type: 'gte', col, val }); return this }
  lt(col, val) { this._filters.push({ type: 'lt', col, val }); return this }
  lte(col, val) { this._filters.push({ type: 'lte', col, val }); return this }

  in(col, vals) {
    this._filters.push({ type: 'in', col, vals })
    return this
  }

  or(expr) {
    this._filters.push({ type: 'or', expr })
    return this
  }

  ilike(col, pattern) {
    this._filters.push({ type: 'ilike', col, pattern })
    return this
  }

  // ── Modifiers ──
  order(col, opts = {}) {
    this._orderCol = col
    this._orderAsc = opts.ascending !== false
    return this
  }

  limit(n) { this._limitN = n; return this }

  range(from, to) {
    this._offsetN = from
    this._limitN = to - from + 1
    return this
  }

  single() { this._single = true; return this }

  // ── Apply filters to rows ──
  _applyFilters(rows) {
    for (const f of this._filters) {
      switch (f.type) {
        case 'eq': rows = rows.filter(r => r[f.col] === f.val); break
        case 'neq': rows = rows.filter(r => r[f.col] !== f.val); break
        case 'gt': rows = rows.filter(r => r[f.col] > f.val); break
        case 'gte': rows = rows.filter(r => r[f.col] >= f.val); break
        case 'lt': rows = rows.filter(r => r[f.col] < f.val); break
        case 'lte': rows = rows.filter(r => r[f.col] <= f.val); break
        case 'in': rows = rows.filter(r => f.vals.includes(r[f.col])); break
        case 'ilike': {
          const re = new RegExp(f.pattern.replace(/%/g, '.*'), 'i')
          rows = rows.filter(r => re.test(r[f.col] || ''))
          break
        }
        case 'or': {
          const parts = f.expr.split(',').map(p => {
            const m = p.match(/^(\w+)\.ilike\.(.+)$/)
            if (m) {
              const re = new RegExp(m[2].replace(/%/g, '.*'), 'i')
              return r => re.test(r[m[1]] || '')
            }
            return () => true
          })
          rows = rows.filter(r => parts.some(fn => fn(r)))
          break
        }
      }
    }
    return rows
  }

  // ── Execute (thenable so `await chain` works) ──
  then(resolve, reject) {
    try {
      const result = this._exec()
      resolve(result)
    } catch (err) {
      if (reject) reject(err)
      else resolve({ data: null, error: { message: err.message } })
    }
  }

  _exec() {
    let rows = readTable(this._table)
    let count = 0

    // If insert or update was done and .select() was chained after
    const effectiveOp = this._pendingOp || this._op

    switch (effectiveOp) {
      case 'select': {
        rows = this._applyFilters(rows)
        count = rows.length
        if (this._headOnly) return { data: null, error: null, count }

        if (this._orderCol) {
          rows.sort((a, b) => {
            const va = a[this._orderCol] ?? ''
            const vb = b[this._orderCol] ?? ''
            const cmp = String(va).localeCompare(String(vb))
            return this._orderAsc ? cmp : -cmp
          })
        }
        if (this._offsetN !== null) rows = rows.slice(this._offsetN)
        if (this._limitN !== null) rows = rows.slice(0, this._limitN)
        if (this._single) rows = rows[0] || null
        return { data: rows, error: null, count }
      }

      case 'insert': {
        const items = Array.isArray(this._body) ? this._body : [this._body]
        const all = readTable(this._table)
        const inserted = items.map(r => ({
          id: r.id || genId(),
          created_at: r.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...r,
        }))
        all.push(...inserted)
        writeTable(this._table, all)
        const data = this._single ? inserted[0] : (inserted.length === 1 ? inserted[0] : inserted)
        return { data, error: null }
      }

      case 'update': {
        const all = readTable(this._table)
        let updated = null
        const result = all.map(r => {
          let match = true
          for (const f of this._filters) {
            if (f.type === 'eq' && r[f.col] !== f.val) match = false
          }
          if (match) {
            updated = { ...r, ...this._body, updated_at: new Date().toISOString() }
            return updated
          }
          return r
        })
        writeTable(this._table, result)
        return { data: updated, error: null }
      }

      case 'delete': {
        const all = readTable(this._table)
        const remaining = all.filter(r => {
          for (const f of this._filters) {
            if (f.type === 'eq' && r[f.col] === f.val) return false
          }
          return true
        })
        writeTable(this._table, remaining)
        return { data: null, error: null }
      }

      default:
        return { data: null, error: { message: 'No operation specified' } }
    }
  }
}

// The "from()" method returns a new Chain
function createLocalClient() {
  return {
    from(table) {
      return new Chain(table)
    }
  }
}

module.exports = { createLocalClient, readTable, writeTable, DATA_DIR }
