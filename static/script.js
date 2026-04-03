document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ttgForm');
    const generateBtn = document.getElementById('generateBtn');
    const resultSection = document.getElementById('resultSection');
    const errorMsg = document.getElementById('error-message');
    const thead = document.getElementById('tableHeadRow');
    const tbody = document.getElementById('tableBody');
    const copyBtn = document.getElementById('copyBtn');
    
    let currentData = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const variables = document.getElementById('variables').value;
        const propositions = document.getElementById('propositions').value;
        const ints = document.getElementById('ints').checked;
        const ascending = document.getElementById('ascending').checked;

        // Reset state
        errorMsg.classList.add('hide');
        resultSection.classList.add('hide');
        
        // UI loading
        generateBtn.querySelector('.btn-text').style.display = 'none';
        generateBtn.querySelector('.spinner').style.display = 'block';
        generateBtn.disabled = true;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    variables,
                    propositions,
                    ints,
                    ascending
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'An error occurred while generating the table');
            }

            renderTable(data, ints);
            currentData = data;
            
            // Show table
            resultSection.classList.remove('hide');
            // Scroll to table smoothly
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            
        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.classList.remove('hide');
        } finally {
            generateBtn.querySelector('.btn-text').style.display = 'block';
            generateBtn.querySelector('.spinner').style.display = 'none';
            generateBtn.disabled = false;
        }
    });

    function renderTable(data, ints) {
        // Clear previous
        thead.innerHTML = '';
        tbody.innerHTML = '';

        // Render headers
        data.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            thead.appendChild(th);
        });

        // Render body
        data.data.forEach(row => {
            const tr = document.createElement('tr');
            
            data.columns.forEach(col => {
                const td = document.createElement('td');
                const val = row[col];
                
                td.textContent = val;
                
                // Add styling class for visual emphasis
                if (ints) {
                    if (val === 1) td.classList.add('true-val');
                    if (val === 0) td.classList.add('false-val');
                } else {
                    if (val === true || val === 'True') td.classList.add('true-val');
                    if (val === false || val === 'False') td.classList.add('false-val');
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
    }

    copyBtn.addEventListener('click', () => {
        if (!currentData) return;
        
        let cvsStr = currentData.columns.join(',') + '\n';
        currentData.data.forEach(row => {
            let rowVals = currentData.columns.map(col => row[col]);
            cvsStr += rowVals.join(',') + '\n';
        });

        navigator.clipboard.writeText(cvsStr).then(() => {
            const icon = copyBtn.querySelector('i');
            icon.className = 'fa-solid fa-check text-success';
            setTimeout(() => {
                icon.className = 'fa-solid fa-copy';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
});
