# Dark Mode Fixer for pages using rounded-3xl and slate-900 patterns
# Targets: AdminScheduleConfigPage.tsx, AdminSlotRequestsPage.tsx

$files = @(
    "D:\education\school web\Schoolweb\src\presentation\pages\admin\AdminScheduleConfigPage.tsx",
    "D:\education\school web\Schoolweb\src\presentation\pages\admin\AdminSlotRequestsPage.tsx"
)

$replacements = @(
    # CARD CONTAINERS - rounded-3xl pattern
    @('bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60', 'bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-slate-200/60 dark:border-white/10'),
    @('bg-white rounded-3xl shadow-sm border border-slate-200/60', 'bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-slate-200/60 dark:border-white/10'),
    @('bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden', 'bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-white/10 overflow-hidden'),
    @('bg-white rounded-3xl', 'bg-white dark:bg-[#1E1E1E] rounded-3xl'),
    @('bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100', 'bg-white dark:bg-[#1E1E1E] rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-white/10'),
    @('bg-white p-3 rounded-xl border border-amber-100', 'bg-white dark:bg-[#2A2A2A] p-3 rounded-xl border border-amber-100 dark:border-white/10'),

    # HEADINGS - slate-900/800
    @('text-3xl font-extrabold text-slate-900', 'text-3xl font-extrabold text-slate-900 dark:text-white'),
    @('font-bold text-slate-900 mb-6', 'font-bold text-slate-900 dark:text-white mb-6'),
    @('font-bold text-slate-900 mb-4', 'font-bold text-slate-900 dark:text-white mb-4'),
    @('font-bold text-slate-900 flex', 'font-bold text-slate-900 dark:text-white flex'),
    @('"font-bold text-slate-900"', '"font-bold text-slate-900 dark:text-white"'),
    @('font-bold text-slate-800', 'font-bold text-slate-800 dark:text-white'),
    @('font-bold text-lg text-slate-800', 'font-bold text-lg text-slate-800 dark:text-white'),
    @('text-2xl font-bold text-white flex', 'text-2xl font-bold text-white flex'),

    # TABLE HEADER - FAFAFA pattern
    @('"bg-[#FAFAFA] border-b border-slate-100"', '"bg-[#FAFAFA] dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10"'),
    @('border-b border-slate-100 overflow-x-auto', 'border-b border-slate-100 dark:border-white/10 overflow-x-auto'),
    
    # TABLE ROW
    @('border-b border-slate-50 hover:bg-[#FFF9F9]', 'border-b border-slate-50 dark:border-white/5 hover:bg-[#FFF9F9] dark:hover:bg-white/5'),

    # INNER SECTION HEADERS
    @('p-6 border-b border-slate-100 bg-slate-50/30', 'p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/30 dark:bg-white/5'),

    # DAY TABS BAR
    @('flex border-b border-slate-100 overflow-x-auto p-2 gap-2 bg-slate-50/50', 'flex border-b border-slate-100 dark:border-white/10 overflow-x-auto p-2 gap-2 bg-slate-50/50 dark:bg-[#2A2A2A]'),
    @('bg-white text-[#AF0C15] shadow-sm ring-1 ring-slate-200', 'bg-white dark:bg-[#1E1E1E] text-[#AF0C15] shadow-sm ring-1 ring-slate-200 dark:ring-white/10'),

    # INLINE INPUTS
    @('border border-slate-200 rounded-xl bg-white focus:ring-4', 'border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#2A2A2A] dark:text-white focus:ring-4'),
    @('border border-slate-200 rounded-lg text-sm bg-white focus:ring-2', 'border border-slate-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#2A2A2A] dark:text-white focus:ring-2'),
    @('border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-[#AF0C15]/10 focus:border-[#AF0C15] transition-all font-mono text-center font-bold text-slate-700', 'border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#2A2A2A] dark:text-white focus:ring-4 focus:ring-[#AF0C15]/10 focus:border-[#AF0C15] transition-all font-mono text-center font-bold text-slate-700 dark:text-white'),

    # FILTER TAB BAR
    @('flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm', 'flex items-center gap-3 bg-white dark:bg-[#1E1E1E] p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm'),

    # BOOKING MODE BAR
    @('flex bg-slate-100 p-1 rounded-lg', 'flex bg-slate-100 dark:bg-[#2A2A2A] p-1 rounded-lg'),

    # REFRESH BUTTON
    @('bg-white text-slate-600 rounded-xl hover:bg-slate-50 hover:text-shibl-crimson border border-slate-200', 'bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 hover:text-shibl-crimson border border-slate-200 dark:border-white/10'),

    # DATE DISPLAY BOX
    @('flex flex-wrap gap-4 items-end p-3 rounded-lg border bg-slate-50 border-slate-100', 'flex flex-wrap gap-4 items-end p-3 rounded-lg border bg-slate-50 dark:bg-[#2A2A2A] border-slate-100 dark:border-white/10'),

    # PAGINATION BORDER
    @('"flex items-center justify-between px-4 py-3 border-t border-slate-100"', '"flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-white/10"'),

    # STAT CARD - already has dark:bg-[#1E1E1E] in StatCard component but border needs fix
    @('border border-slate-100 shadow-sm hover:shadow', 'border border-slate-100 dark:border-white/10 shadow-sm hover:shadow'),

    # INFO BOX TEXT
    @('p-6 space-y-5', 'p-6 space-y-5'),

    # TEACHER INFO CARD
    @('flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-100', 'flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 dark:from-[#2A2A2A] to-slate-100 dark:to-[#2A2A2A] rounded-2xl border border-slate-100 dark:border-white/10'),

    # PAGE SUBTEXT
    @('text-slate-500 mt-2 font-medium"', 'text-slate-500 dark:text-slate-400 mt-2 font-medium"'),
    @('text-slate-500 mt-2 text-lg font-medium"', 'text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium"'),

    # GRADE ITEMS
    @(': ''bg-white text-slate-600 hover:bg-slate-50 border-transparent hover:border-slate-200''', ': ''bg-white dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-300 hover:bg-slate-50 border-transparent hover:border-slate-200 dark:hover:border-white/10'''),

    # PUBLISH CARD AREA
    @('p-6 space-y-8"', 'p-6 space-y-8 dark:text-white"')
)

foreach ($filepath in $files) {
    $content = Get-Content $filepath -Raw -Encoding UTF8
    $original = $content

    foreach ($pair in $replacements) {
        $content = $content.Replace($pair[0], $pair[1])
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($filepath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "  Updated: $(Split-Path $filepath -Leaf)"
    } else {
        Write-Host "  No changes: $(Split-Path $filepath -Leaf)"
    }
}

Write-Host "`nDone!"
