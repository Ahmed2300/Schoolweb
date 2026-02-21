# Dark Mode Batch Fixer for Admin Pages - Literal String Replacement
# Uses .NET string Replace() for literal text matching (no regex issues with brackets)

$adminDir = "D:\education\school web\Schoolweb\src\presentation\pages\admin"

$files = Get-ChildItem -Path $adminDir -Recurse -Filter "*.tsx" | 
    Where-Object { $_.Name -ne "AdminSettingsPage.tsx" -and $_.Name -ne "CourseNode.tsx" -and $_.Name -ne "GradeNode.tsx" -and $_.Name -ne "PackageNode.tsx" -and $_.Name -ne "TermNode.tsx" }

Write-Host "Found $($files.Count) files to process"

$replacements = @(
    # CARD CONTAINERS (order matters - more specific first)
    @('bg-white rounded-[20px] shadow-card border border-slate-100 overflow-hidden', 'bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 overflow-hidden'),
    @('bg-white rounded-[20px] shadow-card border border-slate-100 p-8', 'bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-8'),
    @('bg-white rounded-[20px] shadow-card border border-slate-100 p-6', 'bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6'),
    @('bg-white rounded-[20px] shadow-card border border-slate-100', 'bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10'),
    @('bg-white rounded-[20px] p-6 shadow-card border border-slate-100', 'bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6 shadow-card border border-slate-100 dark:border-white/10'),
    @('bg-white rounded-[20px] border border-slate-100 overflow-hidden', 'bg-white dark:bg-[#1E1E1E] rounded-[20px] border border-slate-100 dark:border-white/10 overflow-hidden'),
    @('bg-white rounded-[20px] border border-slate-100 p-6', 'bg-white dark:bg-[#1E1E1E] rounded-[20px] border border-slate-100 dark:border-white/10 p-6'),
    @('bg-white rounded-[20px] border border-slate-100', 'bg-white dark:bg-[#1E1E1E] rounded-[20px] border border-slate-100 dark:border-white/10'),
    @('bg-white rounded-[20px] p-6', 'bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6'),
    @('bg-white rounded-[20px]', 'bg-white dark:bg-[#1E1E1E] rounded-[20px]'),
    @('bg-white rounded-2xl shadow-card border border-slate-100', 'bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-card border border-slate-100 dark:border-white/10'),
    @('bg-white rounded-2xl border border-slate-100', 'bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-100 dark:border-white/10'),
    @('bg-white rounded-2xl', 'bg-white dark:bg-[#1E1E1E] rounded-2xl'),
    @('bg-white rounded-xl shadow-card border border-slate-100', 'bg-white dark:bg-[#1E1E1E] rounded-xl shadow-card border border-slate-100 dark:border-white/10'),
    @('bg-white rounded-xl border border-slate-100 shadow', 'bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-100 dark:border-white/10 shadow'),
    @('bg-white rounded-xl border border-slate-100', 'bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-100 dark:border-white/10'),
    @('bg-white rounded-xl', 'bg-white dark:bg-[#1E1E1E] rounded-xl'),
    @('bg-white rounded-lg border border-slate-200', 'bg-white dark:bg-[#1E1E1E] rounded-lg border border-slate-200 dark:border-white/10'),
    @('bg-white rounded-lg border border-slate-100', 'bg-white dark:bg-[#1E1E1E] rounded-lg border border-slate-100 dark:border-white/10'),
    @('bg-white rounded-lg shadow-sm', 'bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm'),
    @('bg-white rounded-lg p-4', 'bg-white dark:bg-[#1E1E1E] rounded-lg p-4'),
    @('bg-white rounded-lg p-6', 'bg-white dark:bg-[#1E1E1E] rounded-lg p-6'),
    @('bg-white rounded-lg', 'bg-white dark:bg-[#1E1E1E] rounded-lg'),
    @(' bg-white rounded-[12px]', ' bg-white dark:bg-[#1E1E1E] rounded-[12px]'),

    # MODAL BACKGROUNDS
    @('relative bg-white rounded-[20px] shadow-2xl', 'relative bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-2xl'),
    @('"bg-white rounded-[20px] shadow-xl', '"bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-xl'),
    @('"bg-white rounded-[20px] w-full', '"bg-white dark:bg-[#1E1E1E] rounded-[20px] w-full'),

    # TABLE HEADERS
    @('bg-slate-50 border-b border-slate-100', 'bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10'),
    @('sticky top-0 bg-slate-50 border-b border-slate-100', 'sticky top-0 bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10'),
    @('"bg-slate-50/80"', '"bg-slate-50/80 dark:bg-white/5"'),
    @('"bg-slate-50 rounded-lg"', '"bg-slate-50 dark:bg-white/5 rounded-lg"'),

    # SECTION HEADERS 
    @('px-6 py-5 border-b border-slate-100 flex items-center justify-between', 'px-6 py-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between'),
    @('px-6 py-5 border-b border-slate-100', 'px-6 py-5 border-b border-slate-100 dark:border-white/10'),
    @('px-6 py-4 border-b border-slate-100', 'px-6 py-4 border-b border-slate-100 dark:border-white/10'),

    # TABLE BODY
    @('divide-y divide-slate-100', 'divide-y divide-slate-100 dark:divide-white/10'),
    @('divide-y divide-slate-50', 'divide-y divide-slate-50 dark:divide-white/5'),
    @('border-b border-slate-50 hover:bg-slate-50', 'border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'),
    @('border-b border-slate-100 hover:bg-slate-50', 'border-b border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'),
    @('hover:bg-slate-50/50 transition-colors', 'hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors'),
    @('hover:bg-slate-50 transition-colors', 'hover:bg-slate-50 dark:hover:bg-white/5 transition-colors'),

    # PAGE HEADINGS
    @('text-2xl font-extrabold text-charcoal', 'text-2xl font-extrabold text-charcoal dark:text-white'),
    @('text-3xl font-extrabold text-charcoal', 'text-3xl font-extrabold text-charcoal dark:text-white'),
    @('text-xl font-extrabold text-charcoal', 'text-xl font-extrabold text-charcoal dark:text-white'),
    @('text-xl font-bold text-charcoal', 'text-xl font-bold text-charcoal dark:text-white'),
    @('text-lg font-bold text-charcoal', 'text-lg font-bold text-charcoal dark:text-white'),
    @('text-sm font-bold text-charcoal', 'text-sm font-bold text-charcoal dark:text-white'),
    @('font-bold text-charcoal text-xl', 'font-bold text-charcoal dark:text-white text-xl'),
    @('font-bold text-charcoal text-lg', 'font-bold text-charcoal dark:text-white text-lg'),
    @('font-bold text-charcoal text-sm', 'font-bold text-charcoal dark:text-white text-sm'),
    @('font-bold text-charcoal text-2xl', 'font-bold text-charcoal dark:text-white text-2xl'),
    @(' font-bold text-charcoal mb-', ' font-bold text-charcoal dark:text-white mb-'),
    @('"font-bold text-charcoal"', '"font-bold text-charcoal dark:text-white"'),
    @('font-semibold text-charcoal"', 'font-semibold text-charcoal dark:text-white"'),
    @(' font-extrabold text-charcoal"', ' font-extrabold text-charcoal dark:text-white"'),
    @('"font-medium text-charcoal"', '"font-medium text-charcoal dark:text-white"'),
    @('text-charcoal text-sm"', 'text-charcoal dark:text-white text-sm"'),
    @('"text-charcoal font-bold"', '"text-charcoal dark:text-white font-bold"'),

    # TABLE TEXT  
    @('px-6 py-4 font-bold text-charcoal text-sm', 'px-6 py-4 font-bold text-charcoal dark:text-white text-sm'),
    @('px-4 py-3 font-bold text-charcoal text-sm', 'px-4 py-3 font-bold text-charcoal dark:text-white text-sm'),
    @('px-6 py-4 text-sm text-charcoal', 'px-6 py-4 text-sm text-charcoal dark:text-white'),
    @('px-6 py-4 text-charcoal', 'px-6 py-4 text-charcoal dark:text-white'),

    # MUTED TEXT
    @('"text-slate-500 text-sm"', '"text-slate-500 dark:text-slate-400 text-sm"'),
    @('"text-sm text-slate-500"', '"text-sm text-slate-500 dark:text-slate-400"'),
    @('text-slate-500 font-medium text-sm', 'text-slate-500 dark:text-slate-400 font-medium text-sm'),
    @('px-6 py-4 text-sm text-slate-500', 'px-6 py-4 text-sm text-slate-500 dark:text-slate-400'),
    @('px-4 py-3 text-sm text-slate-500', 'px-4 py-3 text-sm text-slate-500 dark:text-slate-400'),

    # STANDALONE BORDERS
    @('"border-b border-slate-100"', '"border-b border-slate-100 dark:border-white/10"'),
    @('"border border-slate-100"', '"border border-slate-100 dark:border-white/10"'),

    # HEADER FILTER BARS
    @('h-11 px-4 bg-white border border-slate-200 rounded-[12px] flex', 'h-11 px-4 bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 rounded-[12px] dark:text-white flex'),
    @('h-11 px-5 rounded-[12px] bg-white border border-slate-200 hover', 'h-11 px-5 rounded-[12px] bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 dark:text-white hover'),

    # MODAL FOOTER
    @('border-t border-slate-100 bg-slate-50 text-sm text-slate-500', 'border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#2A2A2A] text-sm text-slate-500 dark:text-slate-400'),

    # INPUTS
    @('border border-slate-200 rounded-[10px] focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm', 'border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white rounded-[10px] focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm'),

    # PAGE HEADER SUBTEXT
    @('text-slate-500 text-sm mb-1"', 'text-slate-500 dark:text-slate-400 text-sm mb-1"')
)

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    foreach ($pair in $replacements) {
        $content = $content.Replace($pair[0], $pair[1])
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "  Updated: $($file.Name)"
    } else {
        Write-Host "  No changes: $($file.Name)"
    }
}

Write-Host "`nDone!"
