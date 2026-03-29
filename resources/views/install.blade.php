<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Install Brevio</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Figtree', 'sans-serif'] },
                }
            }
        }
    </script>
</head>
<body class="font-sans antialiased bg-gray-950 min-h-screen flex items-center justify-center px-4 py-12">

    <!-- Ambient Background -->
    <div class="fixed inset-0 pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-xl" id="app">
        <!-- Logo -->
        <div class="flex items-center justify-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            </div>
            <span class="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Brevio</span>
        </div>

        <!-- Form Step -->
        <form id="installForm" class="space-y-6" onsubmit="return handleSubmit(event)">
            <div class="text-center mb-2">
                <h1 class="text-xl font-bold text-white">Installation Wizard</h1>
                <p class="text-sm text-gray-500 mt-1">Configure your Brevio instance in just a few steps.</p>
            </div>

            <div id="globalError" class="hidden p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"></div>

            <!-- Application Settings -->
            <fieldset class="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
                <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Application</legend>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Application URL</label>
                    <input type="text" name="app_url" id="app_url" placeholder="https://example.com" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                    <p class="text-xs text-red-400 mt-1 hidden" data-error="app_url"></p>
                </div>
            </fieldset>

            <!-- Database Settings -->
            <fieldset class="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
                <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Database</legend>
                <div class="grid grid-cols-3 gap-4">
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-300 mb-1.5">Host</label>
                        <input type="text" name="db_host" id="db_host" value="127.0.0.1" placeholder="127.0.0.1" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                        <p class="text-xs text-red-400 mt-1 hidden" data-error="db_host"></p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1.5">Port</label>
                        <input type="text" name="db_port" id="db_port" value="3306" placeholder="3306" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                        <p class="text-xs text-red-400 mt-1 hidden" data-error="db_port"></p>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Database Name</label>
                    <input type="text" name="db_database" id="db_database" value="brevio" placeholder="brevio" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                    <p class="text-xs text-red-400 mt-1 hidden" data-error="db_database"></p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                        <input type="text" name="db_username" id="db_username" value="root" placeholder="root" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                        <p class="text-xs text-red-400 mt-1 hidden" data-error="db_username"></p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                        <input type="password" name="db_password" id="db_password" placeholder="Leave blank if none" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                        <p class="text-xs text-red-400 mt-1 hidden" data-error="db_password"></p>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Table Prefix</label>
                    <input type="text" name="db_prefix" id="db_prefix" placeholder="Optional, e.g. brev_" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                    <p class="text-xs text-red-400 mt-1 hidden" data-error="db_prefix"></p>
                </div>
            </fieldset>

            <!-- Admin Account -->
            <fieldset class="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
                <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Admin Account</legend>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                    <input type="text" name="admin_name" id="admin_name" placeholder="John Doe" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                    <p class="text-xs text-red-400 mt-1 hidden" data-error="admin_name"></p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <input type="email" name="admin_email" id="admin_email" placeholder="admin@example.com" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                    <p class="text-xs text-red-400 mt-1 hidden" data-error="admin_email"></p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                        <input type="password" name="admin_password" id="admin_password" placeholder="Min 8 characters" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                        <p class="text-xs text-red-400 mt-1 hidden" data-error="admin_password"></p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                        <input type="password" name="admin_password_confirmation" id="admin_password_confirmation" placeholder="Repeat password" class="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all" />
                        <p class="text-xs text-red-400 mt-1 hidden" data-error="admin_password_confirmation"></p>
                    </div>
                </div>
            </fieldset>

            <button type="submit" id="submitBtn" class="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 text-sm cursor-pointer">
                Install Brevio
            </button>
        </form>

        <!-- Progress Step (hidden) -->
        <div id="progressStep" class="hidden">
            <div class="rounded-xl bg-gray-900 border border-gray-800 p-8">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
                        <svg class="w-8 h-8 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h2 class="text-lg font-bold text-white">Installing Brevio...</h2>
                    <p class="text-sm text-gray-500 mt-1">Please wait while we set everything up.</p>
                </div>
                <div id="phaseList" class="space-y-4"></div>
            </div>
        </div>

        <!-- Success Step (hidden) -->
        <div id="successStep" class="hidden">
            <div class="rounded-xl bg-gray-900 border border-gray-800 p-8 text-center">
                <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg class="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-white mb-2">Installation Complete!</h2>
                <p class="text-sm text-gray-400 mb-8">Brevio has been successfully installed and configured.</p>
                <a id="loginLink" href="/admin/login" class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 text-sm">
                    Go to Login
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>
            </div>
        </div>

        <!-- Error Step (hidden) -->
        <div id="errorStep" class="hidden">
            <div class="rounded-xl bg-gray-900 border border-gray-800 p-8">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                        <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 class="text-lg font-bold text-white">Installation Failed</h2>
                </div>
                <div id="errorPhases" class="space-y-3 mb-6"></div>
                <div id="errorMsg" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-6 break-words"></div>
                <button onclick="showForm()" class="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all text-sm cursor-pointer">
                    Back to Configuration
                </button>
            </div>
        </div>
    </div>

<script>
    // Set default app_url from current location
    (function() {
        var pathWithoutInstall = window.location.pathname.replace(/\/install.*$/, '') || '';
        document.getElementById('app_url').value = window.location.origin + pathWithoutInstall;
    })();

    var PHASES = [
        { key: 'validate',  label: 'Validating configuration',   endpoint: '/install/validate' },
        { key: 'database',  label: 'Testing database connection', endpoint: '/install/database' },
        { key: 'migrate',   label: 'Creating database tables',    endpoint: '/install/migrate' },
        { key: 'finalize',  label: 'Creating admin account',      endpoint: '/install/finalize' },
    ];

    var basePath = window.location.pathname.replace(/\/install.*$/, '') || '';

    function getFormData() {
        return {
            app_url: document.getElementById('app_url').value,
            db_host: document.getElementById('db_host').value,
            db_port: document.getElementById('db_port').value,
            db_database: document.getElementById('db_database').value,
            db_username: document.getElementById('db_username').value,
            db_password: document.getElementById('db_password').value,
            db_prefix: document.getElementById('db_prefix').value,
            admin_name: document.getElementById('admin_name').value,
            admin_email: document.getElementById('admin_email').value,
            admin_password: document.getElementById('admin_password').value,
            admin_password_confirmation: document.getElementById('admin_password_confirmation').value,
        };
    }

    function getCsrfToken() {
        var meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : '';
    }

    function clearErrors() {
        document.querySelectorAll('[data-error]').forEach(function(el) {
            el.classList.add('hidden');
            el.textContent = '';
        });
        document.querySelectorAll('input').forEach(function(el) {
            el.classList.remove('border-red-500/50');
            el.classList.add('border-gray-800');
        });
        var ge = document.getElementById('globalError');
        ge.classList.add('hidden');
        ge.textContent = '';
    }

    function showFieldErrors(errors) {
        for (var field in errors) {
            var el = document.querySelector('[data-error="' + field + '"]');
            if (el) {
                el.textContent = errors[field][0];
                el.classList.remove('hidden');
            }
            var input = document.getElementById(field);
            if (input) {
                input.classList.remove('border-gray-800');
                input.classList.add('border-red-500/50');
            }
        }
    }

    function showForm() {
        document.getElementById('installForm').classList.remove('hidden');
        document.getElementById('progressStep').classList.add('hidden');
        document.getElementById('successStep').classList.add('hidden');
        document.getElementById('errorStep').classList.add('hidden');
    }

    function buildPhaseHTML(phases, currentIdx, completedSet, failedIdx) {
        var html = '';
        for (var i = 0; i < phases.length; i++) {
            var isCompleted = completedSet.indexOf(i) !== -1;
            var isCurrent = (i === currentIdx && !isCompleted && failedIdx === -1);
            var isFailed = (i === failedIdx);
            var isPending = (i > currentIdx && failedIdx === -1) || (failedIdx !== -1 && i > failedIdx);

            if (failedIdx !== -1 && i > failedIdx) continue;

            var bgClass = isCompleted ? 'bg-emerald-500/5' : isCurrent ? 'bg-violet-500/5' : isFailed ? 'bg-red-500/5' : '';
            var opacityClass = isPending ? 'opacity-40' : '';

            var iconBg = isCompleted ? 'bg-emerald-500/20 text-emerald-400'
                       : isCurrent ? 'bg-violet-500/20 text-violet-400'
                       : isFailed ? 'bg-red-500/20 text-red-400'
                       : 'bg-gray-800 text-gray-600';

            var icon = isCompleted
                ? '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>'
                : isCurrent
                ? '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>'
                : isFailed
                ? '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>'
                : '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/></svg>';

            var textColor = isCompleted ? 'text-emerald-400'
                          : isCurrent ? 'text-white'
                          : isFailed ? 'text-red-400'
                          : 'text-gray-600';

            var suffix = isCompleted ? ' — Done!' : isFailed ? ' — Failed' : '...';

            html += '<div class="flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ' + bgClass + ' ' + opacityClass + '">'
                  + '<div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ' + iconBg + '">' + icon + '</div>'
                  + '<span class="text-sm font-medium transition-colors duration-500 ' + textColor + '">' + phases[i].label + suffix + '</span>'
                  + '</div>';
        }
        return html;
    }

    async function runPhase(phase, formData) {
        var res = await fetch(basePath + phase.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                'Accept': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        var data = await res.json();

        if (!res.ok || !data.success) {
            if (res.status === 422 && data.errors) {
                throw { type: 'validation', errors: data.errors, message: data.message || 'Validation failed.' };
            }
            throw { type: 'error', message: data.message || 'An unknown error occurred.' };
        }

        return data;
    }

    function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        var formData = getFormData();

        // Show progress
        document.getElementById('installForm').classList.add('hidden');
        document.getElementById('progressStep').classList.remove('hidden');

        var completed = [];
        var phaseList = document.getElementById('phaseList');
        phaseList.innerHTML = buildPhaseHTML(PHASES, 0, [], -1);

        (async function() {
            for (var i = 0; i < PHASES.length; i++) {
                phaseList.innerHTML = buildPhaseHTML(PHASES, i, completed, -1);

                try {
                    await runPhase(PHASES[i], formData);
                    completed.push(i);
                    phaseList.innerHTML = buildPhaseHTML(PHASES, i + 1, completed, -1);
                } catch (err) {
                    if (err.type === 'validation') {
                        // Go back to form with field errors
                        showForm();
                        showFieldErrors(err.errors);
                        var ge = document.getElementById('globalError');
                        ge.textContent = err.message;
                        ge.classList.remove('hidden');
                        return;
                    }

                    // Show error step
                    document.getElementById('progressStep').classList.add('hidden');
                    document.getElementById('errorStep').classList.remove('hidden');
                    document.getElementById('errorPhases').innerHTML = buildPhaseHTML(PHASES, i, completed, i);
                    document.getElementById('errorMsg').textContent = err.message || 'Installation failed.';
                    return;
                }

                // Small delay for visual feedback
                await new Promise(function(r) { setTimeout(r, 400); });
            }

            // Success
            document.getElementById('progressStep').classList.add('hidden');
            document.getElementById('successStep').classList.remove('hidden');
            document.getElementById('loginLink').href = basePath + '/admin/login';
        })();

        return false;
    }
</script>
</body>
</html>
