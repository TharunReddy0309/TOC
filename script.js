document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const outputDiv = document.getElementById('output');
    const cfgInput = document.getElementById('cfgInput');

    analyzeBtn.addEventListener('click', () => {
        const rawInput = cfgInput.value.trim();

        outputDiv.classList.remove('hidden');
        outputDiv.className = '';
        outputDiv.innerHTML = '<strong>Analyzing grammar...</strong>';

        analyzeBtn.disabled = true;

        setTimeout(() => {
            try {
                const parsedGrammar = parseGrammar(rawInput);
                if (parsedGrammar.error) {
                    showError(parsedGrammar.error);
                    return;
                }

                const result = detectAmbiguity(parsedGrammar);
                displayResult(result, parsedGrammar);

            } catch (err) {
                showError("Error: " + err.message);
            } finally {
                analyzeBtn.disabled = false;
            }
        }, 50);
    });

    // ================= PARSER =================
    function parseGrammar(input) {
        const rules = {};
        const nts = new Set();
        let startSymbol = null;

        const lines = input.split('\n');

        for (let line of lines) {
            if (!line.includes('->')) continue;
            let lhs = line.split('->')[0].trim();
            if (lhs) {
                nts.add(lhs);
                if (!startSymbol) startSymbol = lhs;
            }
        }

        if (!startSymbol) {
            return { error: "Invalid grammar format." };
        }

        const ntArr = Array.from(nts).sort((a, b) => b.length - a.length);

        for (let line of lines) {
            if (!line.includes('->')) continue;

            let [lhs, rhsPart] = line.split('->');
            lhs = lhs.trim();
            let options = rhsPart.split('|');

            if (!rules[lhs]) rules[lhs] = [];

            for (let opt of options) {
                opt = opt.trim();

                if (opt === 'ε' || opt === '' || opt === 'epsilon') {
                    rules[lhs].push([]);
                    continue;
                }

                let tokens = [];
                let parts = opt.split(/\s+/);

                for (let part of parts) {
                    let i = 0;
                    while (i < part.length) {
                        let matched = null;

                        for (let nt of ntArr) {
                            if (part.startsWith(nt, i)) {
                                matched = nt;
                                break;
                            }
                        }

                        if (matched) {
                            tokens.push({ type: 'nt', val: matched });
                            i += matched.length;
                        } else {
                            tokens.push({ type: 't', val: part[i] });
                            i++;
                        }
                    }
                }

                rules[lhs].push(tokens);
            }
        }

        return { rules, startSymbol, nts };
    }

    // ================= AMBIGUITY DETECTION =================
    function detectAmbiguity(parsed) {
        const { rules, startSymbol } = parsed;

        const MAX_DEPTH = 15;
        const MAX_QUEUE = 20000;
        const MAX_LEN = 15;

        let queue = [{
            symbols: [{ type: 'nt', val: startSymbol }],
            path: [startSymbol]
        }];

        let results = {};
        let iterations = 0;

        while (queue.length && iterations < 50000) {
            iterations++;
            let curr = queue.shift();

            let ntIndex = curr.symbols.findIndex(s => s.type === 'nt');

            if (ntIndex === -1) {
                let str = curr.symbols.map(s => s.val).join('') || 'ε';

                if (!results[str]) results[str] = [];

                let signature = curr.path.join('=>');
                if (!results[str].some(p => p.join('=>') === signature)) {
                    results[str].push(curr.path);
                }

                if (results[str].length >= 2) {
                    return {
                        ambiguous: true,
                        string: str,
                        derivations: results[str],
                        iterations
                    };
                }
                continue;
            }

            let nt = curr.symbols[ntIndex].val;
            let productions = rules[nt] || [];

            for (let prod of productions) {
                let newSymbols = [
                    ...curr.symbols.slice(0, ntIndex),
                    ...prod,
                    ...curr.symbols.slice(ntIndex + 1)
                ];

                if (newSymbols.length > MAX_LEN) continue;
                if (curr.path.length > MAX_DEPTH) continue;

                let newStr = newSymbols.map(s => s.val).join('') || 'ε';

                queue.push({
                    symbols: newSymbols,
                    path: [...curr.path, newStr]
                });
            }

            if (queue.length > MAX_QUEUE) {
                queue.splice(MAX_QUEUE);
            }
        }

        return {
            ambiguous: false,
            message: "Grammar appears unambiguous within tested limits.",
            iterations
        };
    }

    // ================= LANGUAGE TYPE =================
    function detectLanguageType(rules) {
        let isRegular = true;

        for (let lhs in rules) {
            for (let prod of rules[lhs]) {

                if (prod.length === 0) continue;

                if (prod.length === 1) {
                    if (prod[0].type !== 't') isRegular = false;
                } else if (prod.length === 2) {
                    if (!(prod[0].type === 't' && prod[1].type === 'nt')) {
                        isRegular = false;
                    }
                } else {
                    isRegular = false;
                }
            }
        }

        return isRegular ? "Regular Language" : "Context-Free Language (Not Regular)";
    }

    // ================= AMBIGUITY TYPE =================
    function checkRemovableAmbiguity(rules) {
        let operatorPattern = false;

        for (let lhs in rules) {
            for (let prod of rules[lhs]) {
                let str = prod.map(s => s.val).join('');

                if (/[+\-*]/.test(str) && /[A-Z].*[+\-*].*[A-Z]/.test(str)) {
                    operatorPattern = true;
                }
            }
        }

        if (operatorPattern) {
            return {
                type: "Removable Ambiguity",
                message: "Likely due to operator precedence or associativity."
            };
        }

        return {
            type: "Possibly Inherent Ambiguity",
            message: "No clear fix pattern detected."
        };
    }

    // ================= DISPLAY =================
    function formatDerivation(path) {
        return path.map((step, i) =>
            i === 0 ? `<div><strong>${step}</strong></div>` :
                `<div>⇒ ${step}</div>`
        ).join('');
    }

    function displayResult(result, parsed) {
        const { rules } = parsed;
        let langType = detectLanguageType(rules);

        outputDiv.className = '';

        if (result.ambiguous) {
            let amb = checkRemovableAmbiguity(rules);

            outputDiv.classList.add('status-ambiguous');
            outputDiv.innerHTML = `
                <h3>⚠️ Grammar is Ambiguous</h3>

                <p><strong>Language Type:</strong> ${langType}</p>

                <p><strong>Ambiguity Type:</strong> ${amb.type}</p>
                <p>${amb.message}</p>

                <p><strong>Ambiguous String:</strong> ${result.string}</p>

                <h4>Derivation 1:</h4>
                <div class="derivation-box">${formatDerivation(result.derivations[0])}</div>

                <h4>Derivation 2:</h4>
                <div class="derivation-box">${formatDerivation(result.derivations[1])}</div>
            `;
        } else {
            outputDiv.classList.add('status-success');
            outputDiv.innerHTML = `
                <h3>✅ ${result.message}</h3>

                <p><strong>Language Type:</strong> ${langType}</p>
            `;
        }
    }

    function showError(msg) {
        outputDiv.className = 'status-error';
        outputDiv.innerHTML = `<strong>Error:</strong> ${msg}`;
    }
});