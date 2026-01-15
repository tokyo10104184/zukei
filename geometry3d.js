(function(root) {
    const Geometry3D = {
        // Returns { vertices: [{x,y,z}], edges: [[i1, i2], ...] }

        calculateCube: function(inputs) {
            const s = inputs.side / 2;
            const vertices = [
                {x: -s, y: -s, z: -s}, {x: s, y: -s, z: -s}, {x: s, y: s, z: -s}, {x: -s, y: s, z: -s}, // Back face
                {x: -s, y: -s, z: s},  {x: s, y: -s, z: s},  {x: s, y: s, z: s},  {x: -s, y: s, z: s}   // Front face
            ];
            const edges = [
                [0,1], [1,2], [2,3], [3,0], // Back
                [4,5], [5,6], [6,7], [7,4], // Front
                [0,4], [1,5], [2,6], [3,7]  // Connecting
            ];
            return { vertices, edges };
        },

        calculateCuboid: function(inputs) {
            const w = inputs.width / 2;
            const h = inputs.height / 2;
            const d = inputs.depth / 2;
            const vertices = [
                {x: -w, y: -h, z: -d}, {x: w, y: -h, z: -d}, {x: w, y: h, z: -d}, {x: -w, y: h, z: -d},
                {x: -w, y: -h, z: d},  {x: w, y: -h, z: d},  {x: w, y: h, z: d},  {x: -w, y: h, z: d}
            ];
            const edges = [
                [0,1], [1,2], [2,3], [3,0],
                [4,5], [5,6], [6,7], [7,4],
                [0,4], [1,5], [2,6], [3,7]
            ];
            return { vertices, edges };
        },

        calculateTriPrism: function(inputs) {
            // Equilateral triangle base for simplicity, or user defined?
            // Let's assume Equilateral triangle base side and height (length of prism).
            const s = inputs.baseSide;
            const h = inputs.height / 2;
            const r = s * Math.sqrt(3) / 6; // Distance from center to edge center? No, Center to vertex = s / sqrt(3).
            // Height of triangle = s * sqrt(3) / 2.
            // Center is at 1/3 of height from base? Centroid.
            // Distance from center to vertex: R = s / sqrt(3).
            const R = s / Math.sqrt(3);
            const r_inner = R / 2; // Distance from center to edge midpoint.

            // Vertices: 3 at top (+y?), 3 at bottom (-y?).
            // Let's orient prism along Y axis.
            // Triangle in XZ plane.

            // Top Triangle (y = h)
            const t1 = { x: 0, y: h, z: -R }; // Top vertex pointing back?
            // Rotate 120 deg
            // x = R * sin(120), z = R * cos(120) ? No.
            // Let's standard: Vertex 1 at (0, R). Vertex 2, 3 at ...
            // Let's do:
            // V1: (0, R) in 2D.
            // V2: (R * sin(120), R * cos(120)) -> (R * 0.866, -0.5 R)
            // V3: (-R * 0.866, -0.5 R)

            // Map to X, Z
            const top = [
                {x: 0, y: h, z: -R},
                {x: s/2, y: h, z: r_inner},
                {x: -s/2, y: h, z: r_inner}
            ];

            // Bottom Triangle (y = -h)
            const bot = [
                {x: 0, y: -h, z: -R},
                {x: s/2, y: -h, z: r_inner},
                {x: -s/2, y: -h, z: r_inner}
            ];

            const vertices = [...top, ...bot];
            const edges = [
                [0,1], [1,2], [2,0], // Top
                [3,4], [4,5], [5,3], // Bottom
                [0,3], [1,4], [2,5]  // Sides
            ];

            return { vertices, edges };
        },

        calculateTetrahedron: function(inputs) {
            const s = inputs.side;
            // Regular tetrahedron.
            // Vertices: (1,1,1), (1,-1,-1), (-1,1,-1), (-1,-1,1) scaled.
            const k = s / Math.sqrt(8); // Distance from origin? Edge length of cube (1,1,1) to (1,-1,-1) is sqrt(0^2 + 2^2 + 2^2) = sqrt(8).
            // So if we want side s, we scale by s / sqrt(8).

            const vertices = [
                {x: k, y: k, z: k},
                {x: k, y: -k, z: -k},
                {x: -k, y: k, z: -k},
                {x: -k, y: -k, z: k}
            ];
            const edges = [
                [0,1], [0,2], [0,3],
                [1,2], [1,3], [2,3]
            ];
            return { vertices, edges };
        },

        calculatePyramidSq: function(inputs) {
            const b = inputs.baseSide / 2;
            const h = inputs.height;
            // Base centered at y = -h/2
            // Apex at y = h/2 ? Or Base at y=0, Apex y=h.
            // Let's Center at Origin approx.
            // Base at y = -h/2? No, let's put Center of mass at origin? Or just simple geometry.
            // Base at y = -h/3, Apex at y = 2h/3?
            // Simple: Base at y = 0. Apex at y = h. Then center.
            // Let's do: Base at y = -h/2. Apex at y = h/2.

            const vertices = [
                {x: -b, y: -h/2, z: -b}, {x: b, y: -h/2, z: -b},
                {x: b, y: -h/2, z: b},   {x: -b, y: -h/2, z: b},
                {x: 0, y: h/2, z: 0} // Apex
            ];
            const edges = [
                [0,1], [1,2], [2,3], [3,0], // Base
                [0,4], [1,4], [2,4], [3,4]  // Sides
            ];
            return { vertices, edges };
        },

        calculateOctahedron: function(inputs) {
            const s = inputs.side;
            // Dual of Cube. Vertices on axes.
            // Distance from origin d = s / sqrt(2).
            const d = s / Math.sqrt(2);

            const vertices = [
                {x: d, y: 0, z: 0}, {x: -d, y: 0, z: 0},
                {x: 0, y: d, z: 0}, {x: 0, y: -d, z: 0},
                {x: 0, y: 0, z: d}, {x: 0, y: 0, z: -d}
            ];
            // Edges connect nearest neighbors.
            const edges = [
                [0,2], [0,4], [0,3], [0,5], // From +X
                [1,2], [1,4], [1,3], [1,5], // From -X
                [2,4], [4,3], [3,5], [5,2]  // Rim (Square in YZ/XZ?) No.
                // Wait. 0(+x) connects to 2(+y), 4(+z), 3(-y), 5(-z). Correct.
                // 1(-x) connects to 2(+y), 4(+z), 3(-y), 5(-z). Correct.
                // 12 edges total.
            ];
            return { vertices, edges };
        },

        // Icosahedron (20 faces, 12 vertices)
        calculateIcosahedron: function(inputs) {
            const s = inputs.side;
            // Golden ratio phi
            const phi = (1 + Math.sqrt(5)) / 2;
            // Vertices are cyclic permutations of (0, ±1, ±phi)
            // Scale factor: Edge length in unit icosahedron (0,1,phi) is 2.
            // Wait. dist((0,1,phi), (0,-1,phi)) = 2.
            // So if side is s, we multiply unit coords by s/2.
            const k = s / 2;

            const verts = [];
            // Rect 1 (YZ plane)
            verts.push({x:0, y:k, z:k*phi}, {x:0, y:-k, z:k*phi}, {x:0, y:k, z:-k*phi}, {x:0, y:-k, z:-k*phi}); // 0,1,2,3
            // Rect 2 (XZ plane)
            verts.push({x:k, y:k*phi, z:0}, {x:-k, y:k*phi, z:0}, {x:k, y:-k*phi, z:0}, {x:-k, y:-k*phi, z:0}); // 4,5,6,7
            // Rect 3 (XY plane)
            verts.push({x:k*phi, y:0, z:k}, {x:-k*phi, y:0, z:k}, {x:k*phi, y:0, z:-k}, {x:-k*phi, y:0, z:-k}); // 8,9,10,11

            // Edges: Length check logic is expensive at runtime?
            // Just hardcode is better, but tricky indices.
            // Or simple distance check for all pairs. 12 vertices -> 66 pairs. Fast enough.
            const edges = [];
            const threshold = s * 1.01; // tolerance
            const minThreshold = s * 0.99;

            for (let i = 0; i < verts.length; i++) {
                for (let j = i + 1; j < verts.length; j++) {
                    const dx = verts[i].x - verts[j].x;
                    const dy = verts[i].y - verts[j].y;
                    const dz = verts[i].z - verts[j].z;
                    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    if (dist > minThreshold && dist < threshold) {
                        edges.push([i, j]);
                    }
                }
            }
            return { vertices: verts, edges: edges };
        },

        // Dodecahedron (12 faces, 20 vertices)
        calculateDodecahedron: function(inputs) {
            const s = inputs.side;
            // Dual of Icosahedron.
            // Vertices are:
            // (±1, ±1, ±1)
            // (0, ±1/phi, ±phi)
            // (±1/phi, ±phi, 0)
            // (±phi, 0, ±1/phi)
            // Edge length of (1,1,1) to (phi, 0, 1/phi)?
            // (phi-1)^2 + 1 + (1-1/phi)^2 ... algebra.
            // Let's use simple distance check again.

            const phi = (1 + Math.sqrt(5)) / 2;
            const invPhi = 1 / phi;

            // Need to scale. Let's create unit first then scale.
            let unitVerts = [];

            // Cube part
            for(let x of [-1,1]) for(let y of [-1,1]) for(let z of [-1,1])
                unitVerts.push({x, y, z});

            // Rects
            for(let i of [-1,1]) for(let j of [-1,1]) {
                unitVerts.push({x:0, y:i*invPhi, z:j*phi});
                unitVerts.push({x:i*invPhi, y:j*phi, z:0});
                unitVerts.push({x:i*phi, y:0, z:j*invPhi});
            }

            // Determine scale. Distance between nearest neighbors should be s.
            // (1,1,1) neighbor is (phi, 0, 1/phi).
            // d^2 = (phi-1)^2 + 1 + (1/phi - 1)^2
            // phi approx 1.618.
            // 0.618^2 + 1 + (-0.382)^2 = 0.382 + 1 + 0.146 = 1.528 approx.
            // sqrt(1.528) = 1.236.
            // Actually edge length is 2/phi * sqrt(3) ?? No.
            // Distance is sqrt(5) - 1.
            const unitDist = Math.sqrt(Math.pow(phi-1, 2) + 1 + Math.pow(invPhi-1, 2));
            const scale = s / unitDist;

            const vertices = unitVerts.map(v => ({x: v.x*scale, y: v.y*scale, z: v.z*scale}));

            const edges = [];
            const threshold = s * 1.01;
            const minThreshold = s * 0.99;

            for (let i = 0; i < vertices.length; i++) {
                for (let j = i + 1; j < vertices.length; j++) {
                    const dx = vertices[i].x - vertices[j].x;
                    const dy = vertices[i].y - vertices[j].y;
                    const dz = vertices[i].z - vertices[j].z;
                    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    if (dist > minThreshold && dist < threshold) {
                        edges.push([i, j]);
                    }
                }
            }
            return { vertices, edges };
        },

        calculateCylinder: function(inputs) {
            const r = inputs.radius;
            const h = inputs.height;
            const segments = 24; // Resolution

            const vertices = [];
            // Top circle y = h/2
            // Bottom circle y = -h/2
            for (let i = 0; i < segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);
                vertices.push({x, y: h/2, z}); // Top
                vertices.push({x, y: -h/2, z}); // Bottom
            }

            const edges = [];
            for (let i = 0; i < segments; i++) {
                const topIdx = i * 2;
                const botIdx = i * 2 + 1;
                const nextTop = ((i + 1) % segments) * 2;
                const nextBot = ((i + 1) % segments) * 2 + 1;

                edges.push([topIdx, nextTop]); // Top rim
                edges.push([botIdx, nextBot]); // Bottom rim
                // Connect vertical lines occasionally? Or all?
                // Wireframe cylinder usually has top/bot rings and some verticals.
                if (i % 3 === 0) { // Every 3rd segment
                    edges.push([topIdx, botIdx]);
                }
            }
            return { vertices, edges };
        },

        calculateCone: function(inputs) {
            const r = inputs.radius;
            const h = inputs.height;
            const segments = 24;

            const vertices = [];
            const apex = {x: 0, y: h/2, z: 0};
            vertices.push(apex); // 0

            // Base circle y = -h/2
            for (let i = 0; i < segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);
                vertices.push({x, y: -h/2, z});
            }

            const edges = [];
            for (let i = 0; i < segments; i++) {
                const current = i + 1;
                const next = ((i + 1) % segments) + 1;

                edges.push([current, next]); // Base rim
                if (i % 3 === 0) {
                    edges.push([0, current]); // Slant lines
                }
            }
            return { vertices, edges };
        },

        calculateSphere: function(inputs) {
            const r = inputs.radius;
            const latSegments = 12; // Latitude lines
            const lonSegments = 12; // Longitude lines

            const vertices = [];
            const edges = [];

            // We just need to draw rings.
            // Latitudes
            for (let i = 1; i < latSegments; i++) {
                const phi = (i / latSegments) * Math.PI; // 0 to PI
                const y = r * Math.cos(phi); // y up
                const ringR = r * Math.sin(phi);

                const ringStartIdx = vertices.length;
                for (let j = 0; j < lonSegments; j++) {
                    const theta = (j / lonSegments) * Math.PI * 2;
                    vertices.push({
                        x: ringR * Math.cos(theta),
                        y: y,
                        z: ringR * Math.sin(theta)
                    });
                }

                // Add ring edges
                for (let j = 0; j < lonSegments; j++) {
                    const curr = ringStartIdx + j;
                    const next = ringStartIdx + ((j + 1) % lonSegments);
                    edges.push([curr, next]);
                }
            }

            // Longitudes (Great circles) - Actually just vertical lines connecting rings?
            // A standard wireframe sphere is lat/lon grid.
            // We need to connect vertices vertically.
            // North Pole (0, r, 0) and South Pole (0, -r, 0) need special handling or just implied?
            // Let's add Poles.
            const northPole = {x: 0, y: r, z: 0};
            const southPole = {x: 0, y: -r, z: 0};
            const northIdx = vertices.length;
            vertices.push(northPole);
            const southIdx = vertices.length;
            vertices.push(southPole);

            // Connect North Pole to first ring
            const firstRingStart = 0;
            for (let j = 0; j < lonSegments; j++) {
                edges.push([northIdx, firstRingStart + j]);
            }

            // Connect rings
            for (let i = 1; i < latSegments - 1; i++) {
                const upperRingStart = (i - 1) * lonSegments;
                const lowerRingStart = i * lonSegments;
                for (let j = 0; j < lonSegments; j++) {
                    edges.push([upperRingStart + j, lowerRingStart + j]);
                }
            }

            // Connect last ring to South Pole
            const lastRingStart = (latSegments - 2) * lonSegments;
            for (let j = 0; j < lonSegments; j++) {
                edges.push([lastRingStart + j, southIdx]);
            }

            return { vertices, edges };
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Geometry3D;
    } else {
        root.Geometry3D = Geometry3D;
    }

})(this);
