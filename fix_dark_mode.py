import os
import glob

# Directory with admin pages
base = r'D:\education\school web\Schoolweb\src\presentation\pages\admin'

# Find all TSX files recursively (skip settings which is already done)
files = glob.glob(os.path.join(base, '**', '*.tsx'), recursive=True)
files = [f for f in files if 'AdminSettingsPage' not in f]

print(f"Found {len(files)} files to process")

# Common patterns and their dark mode replacements
# Each tuple: (old, new)
replacements = [
    # ── CARD CONTAINERS ──────────────────────────────────────────────
    ('bg-white rounded-[20px] shadow-card border border-slate-100 p-6',
     'bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6'),
    ('bg-white rounded-[20px] shadow-card border border-slate-100 p-8',
     'bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-8'),
    ('bg-white rounded-[20px] shadow-card border border-slate-100',
     'bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10'),
    # Table wrapper
    ('bg-white rounded-[20px] border border-slate-100',
     'bg-white dark:bg-[#1E1E1E] rounded-[20px] border border-slate-100 dark:border-white/10'),
    # Simple white rounded
    ('bg-white rounded-[20px]',
     'bg-white dark:bg-[#1E1E1E] rounded-[20px]'),
    # Simple white rounded-2xl
    ('bg-white rounded-2xl shadow-card border border-slate-100',
     'bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-card border border-slate-100 dark:border-white/10'),
    ('bg-white rounded-2xl',
     'bg-white dark:bg-[#1E1E1E] rounded-2xl'),
    # rounded-xl cards
    ('bg-white rounded-xl border border-slate-100',
     'bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-100 dark:border-white/10'),
    ('bg-white rounded-xl',
     'bg-white dark:bg-[#1E1E1E] rounded-xl'),
    # shadow-sm cards
    ('bg-white rounded-lg border border-slate-100 shadow-sm',
     'bg-white dark:bg-[#1E1E1E] rounded-lg border border-slate-100 dark:border-white/10 shadow-sm'),
    ('bg-white rounded-lg border border-slate-200',
     'bg-white dark:bg-[#1E1E1E] rounded-lg border border-slate-200 dark:border-white/10'),
    ('bg-white rounded-lg',
     'bg-white dark:bg-[#1E1E1E] rounded-lg'),

    # ── TABLE HEADERS ────────────────────────────────────────────────
    ('bg-slate-50 border-b border-slate-100',
     'bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10'),
    ('bg-slate-50/80',
     'bg-slate-50/80 dark:bg-white/5'),
    ('bg-slate-50',
     'bg-slate-50 dark:bg-[#2A2A2A]'),

    # ── TABLE ROWS ───────────────────────────────────────────────────
    ('border-b border-slate-50 hover:bg-slate-50',
     'border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'),
    ('border-b border-slate-100 hover:bg-slate-50',
     'border-b border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'),
    ('divide-y divide-slate-100',
     'divide-y divide-slate-100 dark:divide-white/10'),
    ('divide-y divide-slate-50',
     'divide-y divide-slate-50 dark:divide-white/5'),

    # ── HEADING / TEXT ───────────────────────────────────────────────
    ('text-charcoal font-bold',
     'text-charcoal dark:text-white font-bold'),
    ('font-bold text-charcoal',
     'font-bold text-charcoal dark:text-white'),
    ('text-xl font-bold text-charcoal',
     'text-xl font-bold text-charcoal dark:text-white'),
    ('text-2xl font-bold text-charcoal',
     'text-2xl font-bold text-charcoal dark:text-white'),
    ('text-lg font-bold text-charcoal',
     'text-lg font-bold text-charcoal dark:text-white'),
    ('text-sm font-bold text-charcoal',
     'text-sm font-bold text-charcoal dark:text-white'),
    ('font-semibold text-charcoal',
     'font-semibold text-charcoal dark:text-white'),
    ('text-charcoal text-sm',
     'text-charcoal dark:text-white text-sm'),

    # ── MUTED TEXT ───────────────────────────────────────────────────
    ('text-slate-500 text-sm',
     'text-slate-500 dark:text-slate-400 text-sm'),
    ('text-sm text-slate-500',
     'text-sm text-slate-500 dark:text-slate-400'),
    ('text-slate-400 text-sm',
     'text-slate-400 dark:text-slate-500 text-sm'),
    ('text-slate-600 text-sm',
     'text-slate-600 dark:text-slate-300 text-sm'),

    # ── BORDERS ──────────────────────────────────────────────────────
    ('border-b border-slate-100',
     'border-b border-slate-100 dark:border-white/10'),
    ('border border-slate-100',
     'border border-slate-100 dark:border-white/10'),
    ('border border-slate-200',
     'border border-slate-200 dark:border-white/10'),

    # ── LABELS ───────────────────────────────────────────────────────
    ('block text-xs font-bold text-slate-600 mb-1.5',
     'block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5'),
    ('block text-xs font-bold text-slate-600 mb-2',
     'block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2'),
    ('block text-sm font-bold text-slate-600 mb-1.5',
     'block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5'),
    ('block text-sm font-bold text-slate-600 mb-2',
     'block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2'),

    # ── INPUTS ───────────────────────────────────────────────────────
    ('h-11 px-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"',
     'h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"'),
    ('h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"',
     'h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"'),
    ('rounded-[10px] border border-slate-200 focus:border-shibl-crimson outline-none text-sm font-medium appearance-none bg-white"',
     'rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] dark:text-white focus:border-shibl-crimson outline-none text-sm font-medium appearance-none"'),

    # ── TABLE HEADER CELLS ───────────────────────────────────────────
    ('text-xs font-bold text-slate-500 uppercase',
     'text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'),
    ('text-xs text-slate-500 font-bold uppercase',
     'text-xs text-slate-500 dark:text-slate-400 font-bold uppercase'),

    # ── PAGE BACKGROUND ──────────────────────────────────────────────
    ('min-h-screen bg-[#F8F9FA]',
     'min-h-screen bg-[#F8F9FA] dark:bg-[#121212]'),
    ('min-h-screen bg-soft-cloud',
     'min-h-screen bg-soft-cloud dark:bg-[#121212]'),

    # ── STAT CARDS ───────────────────────────────────────────────────
    ('bg-white p-6 rounded-[20px]',
     'bg-white dark:bg-[#1E1E1E] p-6 rounded-[20px]'),

    # ── MODAL / DIALOG ───────────────────────────────────────────────
    ('bg-white rounded-[20px] shadow-xl',
     'bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-xl'),
    ('bg-white rounded-[20px] p-6',
     'bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6'),
    ('bg-white rounded-[20px] w-full',
     'bg-white dark:bg-[#1E1E1E] rounded-[20px] w-full'),
]

total_changes = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    
    content = original
    for old, new in replacements:
        content = content.replace(old, new)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        changes = sum(original.count(old) for old, _ in replacements)
        print(f"  Updated: {os.path.basename(filepath)}")
        total_changes += 1
    else:
        print(f"  No changes: {os.path.basename(filepath)}")

print(f"\nDone! Updated {total_changes} files.")
