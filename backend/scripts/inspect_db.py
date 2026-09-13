import sqlite3

def inspect():
    conn = sqlite3.connect('backend/facultyforge_sqlite_backup.db')
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [r[0] for r in cur.fetchall() if not r[0].startswith('sqlite')]
    print(f"Total tables: {len(tables)}")
    for t in tables:
        count = cur.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
        cur.execute(f"PRAGMA table_info({t})")
        cols = [c[1] for c in cur.fetchall()]
        print(f"\n--- {t} (rows: {count}) ---")
        print("Columns:", ", ".join(cols))
    conn.close()

if __name__ == '__main__':
    inspect()
