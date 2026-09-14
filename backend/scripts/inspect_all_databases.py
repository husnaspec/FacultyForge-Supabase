import os
import glob
import sqlite3
from pathlib import Path

def inspect_all():
    print("=" * 70)
    print("STEP 1 & 2: DISCOVERING AND INSPECTING ALL SQLITE DATABASES")
    print("=" * 70)

    # Search in workspace and user home if needed
    patterns = ['**/*.db', '**/*.sqlite', '**/*.sqlite3']
    discovered = []
    for pat in patterns:
        for p in glob.glob(pat, recursive=True):
            discovered.append(Path(p).resolve())
    
    # Also check parent directory just in case
    for pat in ['*.db', '*.sqlite']:
        for p in glob.glob(f"../{pat}"):
            discovered.append(Path(p).resolve())

    # Deduplicate
    discovered = sorted(list(set(discovered)))

    target_tables = [
        'departments',
        'faculty',
        'events',
        'event_sessions',
        'proposals',
        'approval_history',
        'registrations',
        'attendances',
        'assessments',
        'assessment_questions',
        'assessment_attempts',
        'feedbacks',
        'skill_evidence',
        'teaching_impacts',
        'certificates',
        'compliance_rules',
        'resource_persons'
    ]

    named_records_to_search = [
        "AI for Engineers Day",
        "Quantum Computing Fundamentals",
        "Generative AI for Engineering Faculty",
        "Cybersecurity Fundamentals for Faculty",
        "Dr. Ayesha Khan",
        "Dr. Veda Prakash"
    ]

    for idx, db_path in enumerate(discovered, 1):
        size = os.path.getsize(db_path) if db_path.exists() else 0
        mtime = os.path.getmtime(db_path) if db_path.exists() else 0
        import time
        mtime_str = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(mtime))

        print(f"\n[{idx}] DATABASE: {db_path}")
        print(f"    Size: {size:,} bytes | Modified: {mtime_str}")

        if size == 0:
            print("    (Empty file)")
            continue

        try:
            conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
            cur = conn.cursor()
            cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables_in_db = [r[0] for r in cur.fetchall()]

            print(f"    Tables found ({len(tables_in_db)}): {', '.join(tables_in_db[:8])}...")

            counts = {}
            for t in target_tables:
                if t in tables_in_db:
                    cnt = cur.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
                    counts[t] = cnt
                else:
                    # check alternate names
                    alt_t = None
                    if t == 'attendances' and 'attendance' in tables_in_db:
                        alt_t = 'attendance'
                    elif t == 'feedbacks' and 'feedback' in tables_in_db:
                        alt_t = 'feedback'
                    elif t == 'teaching_impacts' and 'teaching_impact' in tables_in_db:
                        alt_t = 'teaching_impact'
                    
                    if alt_t:
                        cnt = cur.execute(f"SELECT count(*) FROM {alt_t}").fetchone()[0]
                        counts[t] = cnt
                    else:
                        counts[t] = "(table missing)"

            for t, c in counts.items():
                if c != 0 and c != "(table missing)":
                    print(f"      * {t}: {c}")
                elif c == 0:
                    print(f"        {t}: 0")

            # Search specific target names
            found_names = []
            for name in named_records_to_search:
                found = False
                if 'events' in tables_in_db:
                    res = cur.execute("SELECT id, title FROM events WHERE title LIKE ?", (f"%{name}%",)).fetchall()
                    if res:
                        found_names.append(f"Event: {res[0][1]} (ID {res[0][0]})")
                        found = True
                if 'faculty' in tables_in_db:
                    res = cur.execute("SELECT id, full_name FROM faculty WHERE full_name LIKE ?", (f"%{name}%",)).fetchall()
                    if res:
                        found_names.append(f"Faculty: {res[0][1]} (ID {res[0][0]})")
                        found = True
            
            print(f"    Named records matched ({len(found_names)}): {', '.join(found_names)}")
            conn.close()
        except Exception as e:
            print(f"    Error reading DB: {e}")

if __name__ == "__main__":
    inspect_all()
