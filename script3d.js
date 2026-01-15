document.addEventListener('DOMContentLoaded', () => {
    const shapeTypeSelect = document.getElementById('shapeType');
    const inputsContainer = document.getElementById('inputsContainer');
    const drawBtn = document.getElementById('drawBtn');
    const errorMessage = document.getElementById('errorMessage');
    const canvas = document.getElementById('geometryCanvas3D');
    const ctx = canvas.getContext('2d');

    // State
    let currentShapeData = null; // { vertices, edges }
    let rotation = { x: 0.5, y: 0.5 }; // Initial rotation
    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    // Config
    const SHAPE_INPUTS = {
        cube: { name: '立方体', inputs: ['side'] },
        cuboid: { name: '直方体', inputs: ['width', 'height', 'depth'] },
        prism_tri: { name: '三角柱', inputs: ['baseSide', 'height'] },
        tetrahedron: { name: '正四面体', inputs: ['side'] },
        pyramid_sq: { name: '四角錐', inputs: ['baseSide', 'height'] },
        octahedron: { name: '正八面体', inputs: ['side'] },
        dodecahedron: { name: '正十二面体', inputs: ['side'] },
        icosahedron: { name: '正二十面体', inputs: ['side'] },
        cylinder: { name: '円柱', inputs: ['radius', 'height'] },
        cone: { name: '円錐', inputs: ['radius', 'height'] },
        sphere: { name: '球', inputs: ['radius'] }
    };

    const INPUT_LABELS = {
        side: '一辺の長さ',
        width: '幅', height: '高さ', depth: '奥行き',
        baseSide: '底面の辺',
        radius: '半径'
    };

    // Events
    shapeTypeSelect.addEventListener('change', updateInputs);
    drawBtn.addEventListener('click', handleDraw);

    // Mouse Events for Rotation
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        lastMouse = { x: e.clientX, y: e.clientY };

        rotation.y += dx * 0.01;
        rotation.x += dy * 0.01;

        drawFrame();
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch Events
    canvas.addEventListener('touchstart', (e) => {
        if(e.touches.length === 1) {
            isDragging = true;
            lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            e.preventDefault();
        }
    }, {passive: false});
    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const dx = touch.clientX - lastMouse.x;
        const dy = touch.clientY - lastMouse.y;
        lastMouse = { x: touch.clientX, y: touch.clientY };

        rotation.y += dx * 0.01;
        rotation.x += dy * 0.01;

        drawFrame();
    }, {passive: false});
    window.addEventListener('touchend', () => { isDragging = false; });


    function updateInputs() {
        const shape = shapeTypeSelect.value;
        inputsContainer.innerHTML = '';
        errorMessage.textContent = '';
        drawBtn.disabled = true;

        if (!shape || !SHAPE_INPUTS[shape]) return;

        const config = SHAPE_INPUTS[shape];
        config.inputs.forEach(inputId => {
            const row = document.createElement('div');
            row.className = 'input-row';

            const label = document.createElement('label');
            label.textContent = INPUT_LABELS[inputId] || inputId;

            const input = document.createElement('input');
            input.type = 'number';
            input.id = inputId;
            input.min = '0';
            input.step = 'any';
            input.value = '10'; // Default value
            input.addEventListener('input', checkValidity);

            row.appendChild(label);
            row.appendChild(input);
            inputsContainer.appendChild(row);
        });
        checkValidity();
    }

    function checkValidity() {
        const inputs = inputsContainer.querySelectorAll('input');
        let valid = true;
        inputs.forEach(inp => {
            if (!inp.value || parseFloat(inp.value) <= 0) valid = false;
        });
        drawBtn.disabled = !valid;
    }

    function handleDraw() {
        const shape = shapeTypeSelect.value;
        const inputs = {};
        inputsContainer.querySelectorAll('input').forEach(inp => {
            inputs[inp.id] = parseFloat(inp.value);
        });

        // Mapping to geometry3d calls
        let data = null;
        try {
            switch(shape) {
                case 'cube': data = Geometry3D.calculateCube(inputs); break;
                case 'cuboid': data = Geometry3D.calculateCuboid(inputs); break;
                case 'prism_tri': data = Geometry3D.calculateTriPrism(inputs); break;
                case 'tetrahedron': data = Geometry3D.calculateTetrahedron(inputs); break;
                case 'pyramid_sq': data = Geometry3D.calculatePyramidSq(inputs); break;
                case 'octahedron': data = Geometry3D.calculateOctahedron(inputs); break;
                case 'dodecahedron': data = Geometry3D.calculateDodecahedron(inputs); break;
                case 'icosahedron': data = Geometry3D.calculateIcosahedron(inputs); break;
                case 'cylinder': data = Geometry3D.calculateCylinder(inputs); break;
                case 'cone': data = Geometry3D.calculateCone(inputs); break;
                case 'sphere': data = Geometry3D.calculateSphere(inputs); break;
            }
        } catch (e) {
            errorMessage.textContent = e.message;
            return;
        }

        if (data) {
            currentShapeData = data;
            // Reset rotation? No, keep it smooth if redrawing same object
            drawFrame();
        }
    }

    function drawFrame() {
        if (!currentShapeData) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;

        // 3D Projection Settings
        // Center the camera.
        // Auto-scale?
        // Let's find max dimension.
        let maxDim = 0;
        currentShapeData.vertices.forEach(v => {
            maxDim = Math.max(maxDim, Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
        });

        // Scale to fit ~60% of canvas
        const scale = (Math.min(width, height) * 0.4) / (maxDim || 1);

        // Rotation Matrix
        // Rotate around X (pitch) and Y (yaw)
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);

        // Project vertices
        const projected = currentShapeData.vertices.map(v => {
            // Rotate Y
            let x = v.x * cosY - v.z * sinY;
            let z = v.x * sinY + v.z * cosY;
            // Rotate X
            let y = v.y * cosX - z * sinX;
            z = v.y * sinX + z * cosX;

            // Perspective? For simplicity, Orthographic or weak perspective.
            // Let's do simple orthographic scaled.
            // Z-sorting not needed for wireframe.

            return {
                x: cx + x * scale,
                y: cy - y * scale // Flip Y for screen
            };
        });

        // Draw Edges
        ctx.beginPath();
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;

        currentShapeData.edges.forEach(edge => {
            const p1 = projected[edge[0]];
            const p2 = projected[edge[1]];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        });
        ctx.stroke();

        // Draw Vertices
        ctx.fillStyle = '#dc3545';
        projected.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }
});
