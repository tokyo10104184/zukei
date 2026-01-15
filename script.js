document.addEventListener('DOMContentLoaded', () => {
    const shapeTypeSelect = document.getElementById('shapeType');
    const methodGroup = document.getElementById('methodGroup');
    const constructionMethodSelect = document.getElementById('constructionMethod');
    const inputsContainer = document.getElementById('inputsContainer');
    const drawBtn = document.getElementById('drawBtn');
    const errorMessage = document.getElementById('errorMessage');
    const canvas = document.getElementById('geometryCanvas');
    const ctx = canvas.getContext('2d');

    // Configuration for shapes and inputs
    const SHAPE_CONFIG = {
        triangle: {
            name: '三角形',
            methods: {
                sss: { name: '3辺の長さ (A, B, C)', inputs: ['sideA', 'sideB', 'sideC'] },
                sas: { name: '2辺と間の角 (A, B, angleC)', inputs: ['sideA', 'sideB', 'angleC'] },
                asa: { name: '1辺と両端の角 (sideA, angleB, angleC)', inputs: ['sideA', 'angleB', 'angleC'] }
            }
        },
        quadrilateral: {
            name: '四角形',
            methods: {
                rectangle: { name: '長方形 (幅, 高さ)', inputs: ['width', 'height'] },
                square: { name: '正方形 (一辺)', inputs: ['side'] },
                parallelogram: { name: '平行四辺形 (底辺, 斜辺, 角度)', inputs: ['base', 'side', 'angle'] },
                rhombus: { name: 'ひし形 (一辺, 角度)', inputs: ['side', 'angle'] },
                trapezoid: { name: '台形 (上底, 下底, 高さ, 左下角)', inputs: ['topBase', 'bottomBase', 'height', 'angle'] }
            }
        },
        polygon: {
            name: '正多角形',
            methods: {
                regular: { name: '正N角形 (辺数, 半径)', inputs: ['sides', 'radius'] }
            }
        },
        circle: {
            name: '円・楕円',
            methods: {
                circle: { name: '円 (半径)', inputs: ['radius'] },
                ellipse: { name: '楕円 (長径, 短径)', inputs: ['majorAxis', 'minorAxis'] }
            }
        }
    };

    const INPUT_LABELS = {
        sideA: '辺 A', sideB: '辺 B', sideC: '辺 C',
        angleA: '角 A (°)', angleB: '角 B (°)', angleC: '角 C (°)',
        width: '幅', height: '高さ', side: '一辺',
        base: '底辺', angle: '角度 (°)',
        sides: '辺の数 (N)', radius: '半径',
        majorAxis: '長径 (A)', minorAxis: '短径 (B)',
        topBase: '上底', bottomBase: '下底'
    };

    // Advanced Mode Elements
    const freeDrawCheckbox = document.getElementById('freeDrawMode');
    const freeDrawControls = document.getElementById('freeDrawControls');
    const stepsContainer = document.getElementById('stepsContainer');
    const addStepBtn = document.getElementById('addStepBtn');
    const removeStepBtn = document.getElementById('removeStepBtn');

    // Event Listeners
    shapeTypeSelect.addEventListener('change', updateMethods);
    constructionMethodSelect.addEventListener('change', updateInputs);
    drawBtn.addEventListener('click', handleDraw);

    // Advanced Mode Listeners
    freeDrawCheckbox.addEventListener('change', toggleFreeDrawMode);
    addStepBtn.addEventListener('click', addFreeDrawStep);
    removeStepBtn.addEventListener('click', removeFreeDrawStep);

    function toggleFreeDrawMode() {
        const isFree = freeDrawCheckbox.checked;

        if (isFree) {
            // Disable standard controls
            shapeTypeSelect.disabled = true;
            constructionMethodSelect.disabled = true;
            inputsContainer.style.opacity = '0.5';
            inputsContainer.style.pointerEvents = 'none';
            freeDrawControls.style.display = 'block';
            drawBtn.disabled = false; // Will validate in handleDraw or real-time?
            if (stepsContainer.children.length === 0) {
                // Add initial steps
                addFreeDrawStep();
                addFreeDrawStep();
                addFreeDrawStep();
            }
        } else {
            // Enable standard controls
            shapeTypeSelect.disabled = false;
            constructionMethodSelect.disabled = false;
            inputsContainer.style.opacity = '1';
            inputsContainer.style.pointerEvents = 'auto';
            freeDrawControls.style.display = 'none';
            updateInputs(); // Re-validate
        }
    }

    function addFreeDrawStep() {
        const index = stepsContainer.children.length + 1;
        const row = document.createElement('div');
        row.className = 'step-row';

        row.innerHTML = `
            <span>#${index}</span>
            <label>長さ:</label>
            <input type="number" class="step-len" min="0" value="10">
            <label>次の角度(°):</label>
            <input type="number" class="step-ang" value="60">
        `;
        stepsContainer.appendChild(row);
    }

    function removeFreeDrawStep() {
        if (stepsContainer.lastElementChild) {
            stepsContainer.removeChild(stepsContainer.lastElementChild);
        }
    }

    function updateMethods() {
        const shape = shapeTypeSelect.value;
        constructionMethodSelect.innerHTML = '';
        inputsContainer.innerHTML = '';
        drawBtn.disabled = true;
        errorMessage.textContent = '';

        if (!shape || !SHAPE_CONFIG[shape]) {
            methodGroup.style.display = 'none';
            return;
        }

        const methods = SHAPE_CONFIG[shape].methods;
        for (const [key, config] of Object.entries(methods)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = config.name;
            constructionMethodSelect.appendChild(option);
        }

        methodGroup.style.display = 'flex';
        // Trigger input update for the first method
        updateInputs();
    }

    function updateInputs() {
        const shape = shapeTypeSelect.value;
        const method = constructionMethodSelect.value;
        inputsContainer.innerHTML = '';
        errorMessage.textContent = '';

        if (!shape || !method) return;

        const config = SHAPE_CONFIG[shape].methods[method];
        config.inputs.forEach(inputId => {
            const row = document.createElement('div');
            row.className = 'input-row';

            const label = document.createElement('label');
            label.htmlFor = inputId;
            label.textContent = INPUT_LABELS[inputId] || inputId;

            const input = document.createElement('input');
            input.type = 'number';
            input.id = inputId;
            input.min = '0';
            input.step = 'any';
            input.required = true;
            input.addEventListener('input', validateInputs);

            row.appendChild(label);
            row.appendChild(input);
            inputsContainer.appendChild(row);
        });

        validateInputs();
    }

    function validateInputs() {
        const inputs = inputsContainer.querySelectorAll('input');
        let allValid = true;
        inputs.forEach(input => {
            if (!input.value || parseFloat(input.value) <= 0) {
                allValid = false;
            }
        });
        drawBtn.disabled = !allValid;
    }

    function handleDraw() {
        if (freeDrawCheckbox.checked) {
            // Handle Free Draw
            const rows = stepsContainer.querySelectorAll('.step-row');
            const steps = [];
            rows.forEach(row => {
                const lenInput = row.querySelector('.step-len');
                const angInput = row.querySelector('.step-ang');
                steps.push({
                    length: parseFloat(lenInput.value) || 0,
                    angle: parseFloat(angInput.value) || 0
                });
            });

            try {
                const coordinates = Geometry.calculateFreePolygon(steps);
                drawShape(coordinates, 'polygon'); // Treat as generic polygon
                errorMessage.textContent = '';
            } catch (e) {
                errorMessage.textContent = e.message;
            }
            return;
        }

        const shape = shapeTypeSelect.value;
        const method = constructionMethodSelect.value;
        const inputs = {};

        inputsContainer.querySelectorAll('input').forEach(input => {
            inputs[input.id] = parseFloat(input.value);
        });

        try {
            const coordinates = calculateCoordinates(shape, method, inputs);
            drawShape(coordinates, shape);
            errorMessage.textContent = '';
        } catch (e) {
            errorMessage.textContent = e.message;
        }
    }

    // --- Geometry Calculation ---
    function calculateCoordinates(shape, method, inputs) {
        if (shape === 'triangle') {
            return Geometry.calculateTriangle(method, inputs);
        } else if (shape === 'quadrilateral') {
            return Geometry.calculateQuadrilateral(method, inputs);
        } else if (shape === 'polygon') {
            return Geometry.calculatePolygon(method, inputs);
        } else if (shape === 'circle') {
            return Geometry.calculateCircle(method, inputs);
        }
        return null;
    }

    function drawShape(coords, shapeType) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (!coords) return;

        // Auto Scaling
        // We need to find bounding box of the shape
        let minX, minY, maxX, maxY;

        if (shapeType === 'circle') {
            // Circle/Ellipse object: { type, radius|rx|ry, x, y }
            if (coords.type === 'circle') {
                const r = coords.radius;
                minX = -r; maxX = r;
                minY = -r; maxY = r;
            } else {
                minX = -coords.rx; maxX = coords.rx;
                minY = -coords.ry; maxY = coords.ry;
            }
        } else {
            // Array of points
            if (coords.length === 0) return;
            minX = Infinity; minY = Infinity; maxX = -Infinity; maxY = -Infinity;
            coords.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });
        }

        const padding = 40;
        const shapeWidth = maxX - minX;
        const shapeHeight = maxY - minY;
        const availWidth = canvas.width - padding * 2;
        const availHeight = canvas.height - padding * 2;

        if (shapeWidth === 0 && shapeHeight === 0) return; // Point?

        const scaleX = shapeWidth > 0 ? availWidth / shapeWidth : Infinity;
        const scaleY = shapeHeight > 0 ? availHeight / shapeHeight : Infinity;
        const scale = Math.min(scaleX, scaleY, 50); // Cap scale at 50x to avoid extreme zoom on small shapes

        // Center logic
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const canvasCenterX = canvas.width / 2;
        const canvasCenterY = canvas.height / 2;

        // Apply transform
        // Translate to canvas center
        // Scale
        // Translate back by shape center
        // Note: Canvas Y is down, but math Y is usually up.
        // If we want standard Cartesian (Y up), we need to flip Y.
        // scale(1, -1) and translate properly.

        ctx.translate(canvasCenterX, canvasCenterY);
        ctx.scale(scale, -scale); // Flip Y axis
        ctx.translate(-centerX, -centerY);

        // Drawing
        ctx.beginPath();
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2 / scale; // Keep line width constant relative to screen
        ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';

        if (shapeType === 'circle') {
            if (coords.type === 'circle') {
                ctx.arc(0, 0, coords.radius, 0, 2 * Math.PI);
            } else {
                ctx.ellipse(0, 0, coords.rx, coords.ry, 0, 0, 2 * Math.PI);
            }
        } else {
            ctx.moveTo(coords[0].x, coords[0].y);
            for (let i = 1; i < coords.length; i++) {
                ctx.lineTo(coords[i].x, coords[i].y);
            }
            ctx.closePath();
        }

        ctx.fill();
        ctx.stroke();

        // Draw Vertices points for polygons
        if (shapeType !== 'circle') {
             ctx.fillStyle = 'red';
             const pointSize = 4 / scale;
             coords.forEach(p => {
                 ctx.beginPath();
                 ctx.arc(p.x, p.y, pointSize, 0, 2 * Math.PI);
                 ctx.fill();
             });
        }
    }
});
