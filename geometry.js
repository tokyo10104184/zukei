(function(root) {
    const Geometry = {
        toRadians: function(degrees) {
            return degrees * Math.PI / 180;
        },

        calculateTriangle: function(method, inputs) {
            let p1, p2, p3;

            if (method === 'sss') {
                const { sideA: a, sideB: b, sideC: c } = inputs;
                if (a + b <= c || a + c <= b || b + c <= a) {
                    throw new Error("三角形が成立しません（辺の長さが不適切です）");
                }

                // Law of Cosines to find angle opposite to side A (Angle A) ??
                // Wait, usually we align side C on X axis.
                // Let p1 = (0, 0) corresponding to Vertex A?
                // Let's adopt standard: Vertex A, B, C.
                // Side c is AB. Side b is AC. Side a is BC.
                // Let A = (0, 0).
                // Let B = (c, 0).
                // Find C = (x, y).
                // Distance AC = b. Distance BC = a.
                // x^2 + y^2 = b^2
                // (x-c)^2 + y^2 = a^2 => x^2 - 2cx + c^2 + y^2 = a^2
                // substitute x^2+y^2=b^2 => b^2 - 2cx + c^2 = a^2
                // 2cx = b^2 + c^2 - a^2
                // x = (b^2 + c^2 - a^2) / (2c)
                // y = sqrt(b^2 - x^2)

                const x = (b * b + c * c - a * a) / (2 * c);
                const ySq = b * b - x * x;
                if (ySq < 0) throw new Error("計算エラー"); // Should be covered by inequality check
                const y = Math.sqrt(ySq);

                p1 = { x: 0, y: 0 }; // Vertex A
                p2 = { x: c, y: 0 }; // Vertex B
                p3 = { x: x, y: y }; // Vertex C

            } else if (method === 'sas') {
                // Inputs: sideA, sideB, angleC.
                // Side a (BC), Side b (AC), Angle C (between a and b).
                // Let C = (0, 0).
                // Let A be on X axis => A = (b, 0). (Since b is length AC)
                // Let B be at angle C => B = (a * cos(C), a * sin(C)).

                const { sideA: a, sideB: b, angleC: angleDeg } = inputs;
                const angleRad = Geometry.toRadians(angleDeg);

                if (angleDeg <= 0 || angleDeg >= 180) {
                    throw new Error("角度は0度より大きく180度未満である必要があります");
                }

                p1 = { x: b, y: 0 }; // Vertex A
                p2 = { x: a * Math.cos(angleRad), y: a * Math.sin(angleRad) }; // Vertex B
                p3 = { x: 0, y: 0 }; // Vertex C

            } else if (method === 'asa') {
                // Inputs: sideA, angleB, angleC.
                // Side a (BC) is the base.
                // Let C = (0, 0).
                // Let B = (a, 0).
                // Angle at C is angleC. Angle at B is angleB.
                // Vertex A is intersection.
                // Line from C: y = tan(angleC) * x  (Wait, angle C is inside triangle)
                // If C is origin, and B is on X axis, the interior angle C is measured from CB (X-axis) counter-clockwise?
                // Yes. Line AC makes angle C with CB.
                // Line from B: Angle B is interior. So line BA makes angle (180 - B) with BC (X-axis neg direction? No).
                // Vector BC is (a, 0). Vector BA should make angle (180 - B) with positive X axis.

                const { sideA: a, angleB: degB, angleC: degC } = inputs;

                if (degB + degC >= 180) {
                    throw new Error("2つの角の和が180度未満である必要があります");
                }

                const radC = Geometry.toRadians(degC);
                const radB = Geometry.toRadians(degB);

                // C = (0, 0)
                // B = (a, 0)
                // Line from C: y = x * tan(C)
                // Line from B: y = (x - a) * tan(180 - B) = (x - a) * (-tan(B))
                // x * tan(C) = (x - a) * (-tan(B))
                // x * tan(C) = -x * tan(B) + a * tan(B)
                // x (tan(C) + tan(B)) = a * tan(B)
                // x = a * tan(B) / (tan(C) + tan(B))
                // y = x * tan(C)

                const tanB = Math.tan(radB);
                const tanC = Math.tan(radC);

                const x = (a * tanB) / (tanC + tanB);
                const y = x * tanC;

                p1 = { x: x, y: y }; // Vertex A
                p2 = { x: a, y: 0 }; // Vertex B
                p3 = { x: 0, y: 0 }; // Vertex C
            }

            return [p1, p2, p3];
        },

        calculateQuadrilateral: function(method, inputs) {
            let p1, p2, p3, p4;

            if (method === 'rectangle') {
                const { width, height } = inputs;
                p1 = { x: 0, y: height };
                p2 = { x: width, y: height };
                p3 = { x: width, y: 0 };
                p4 = { x: 0, y: 0 };

            } else if (method === 'square') {
                const { side } = inputs;
                p1 = { x: 0, y: side };
                p2 = { x: side, y: side };
                p3 = { x: side, y: 0 };
                p4 = { x: 0, y: 0 };

            } else if (method === 'parallelogram') {
                const { base, side, angle } = inputs;
                if (angle <= 0 || angle >= 180) throw new Error("角度は0〜180度の間である必要があります");
                const rad = Geometry.toRadians(angle);
                const dx = side * Math.cos(rad);
                const dy = side * Math.sin(rad);

                // p4 at (0,0)
                // p3 at (base, 0)
                // p1 at (dx, dy)
                // p2 at (base + dx, dy)
                p1 = { x: dx, y: dy };
                p2 = { x: base + dx, y: dy };
                p3 = { x: base, y: 0 };
                p4 = { x: 0, y: 0 };

            } else if (method === 'rhombus') {
                const { side, angle } = inputs;
                if (angle <= 0 || angle >= 180) throw new Error("角度は0〜180度の間である必要があります");
                const rad = Geometry.toRadians(angle);
                const dx = side * Math.cos(rad);
                const dy = side * Math.sin(rad);

                p1 = { x: dx, y: dy };
                p2 = { x: side + dx, y: dy };
                p3 = { x: side, y: 0 };
                p4 = { x: 0, y: 0 };

            } else if (method === 'trapezoid') {
                const { topBase, bottomBase, height, angle } = inputs;
                if (angle <= 0 || angle >= 180) throw new Error("角度は0〜180度の間である必要があります");
                // P4 (bottom-left) at (0,0) ? No, usually we want standard orientation.
                // Let's put P4 at (0,0). P3 at (bottomBase, 0).
                // P1 (top-left) depends on angle.
                // dx = height / tan(angle)
                // P1 = (dx, height).
                // P2 = (dx + topBase, height).

                const rad = Geometry.toRadians(angle);
                const dx = height / Math.tan(rad);

                p1 = { x: dx, y: height };
                p2 = { x: dx + topBase, y: height };
                p3 = { x: bottomBase, y: 0 };
                p4 = { x: 0, y: 0 };
            }

            return [p1, p2, p3, p4];
        },

        calculatePolygon: function(method, inputs) {
            // Regular Polygon
            if (method === 'regular') {
                const { sides, radius } = inputs;
                if (sides < 3) throw new Error("辺の数は3以上である必要があります");
                const points = [];
                // Start from top (90 degrees? or 0 degrees?)
                // Usually regular polygon starts at (r, 0) or (0, r).
                // Let's start at angle -PI/2 (top) so it looks "upright" for odd sides?
                // Or just start at 0.
                const startAngle = -Math.PI / 2;
                for (let i = 0; i < sides; i++) {
                    const angle = startAngle + (i * 2 * Math.PI / sides);
                    points.push({
                        x: radius * Math.cos(angle),
                        y: radius * Math.sin(angle)
                    });
                }
                return points;
            }
            return [];
        },

        calculateCircle: function(method, inputs) {
             if (method === 'circle') {
                 const { radius } = inputs;
                 return { type: 'circle', radius: radius, x: 0, y: 0 };
             } else if (method === 'ellipse') {
                 const { majorAxis, minorAxis } = inputs;
                 return { type: 'ellipse', rx: majorAxis, ry: minorAxis, x: 0, y: 0 };
             }
             return null;
         },

         calculateFreePolygon: function(steps) {
             // steps: Array of { length, angle }
             // angle: interior angle relative to previous line segment?
             // Or relative change in direction?
             // Let's assume input is "Interior Angle" because user said "Angle A = 60".
             // Start at (0,0). Direction 0 (East).
             // First Line: Draw Length. End Point (L, 0).
             // At End Point, turn. If Interior Angle is A, turn direction is (180 - A) (Left turn) or -(180-A) (Right turn)?
             // Usually polygons are drawn counter-clockwise (CCW).
             // Interior angle A means we turn left by (180 - A).

             const points = [{ x: 0, y: 0 }];
             let currentX = 0;
             let currentY = 0;
             let currentDir = 0; // Radians. 0 is East.

             for (let i = 0; i < steps.length; i++) {
                 const step = steps[i];
                 const len = step.length;
                 const angleDeg = step.angle; // Interior angle

                 // For the first line, we just move "Length" in current direction (0).
                 // For subsequent lines, we first turn, then move.
                 // BUT: The "Angle" usually belongs to the vertex we just arrived at.
                 // So:
                 // Step 1: Length L1. (Angle is ignored or is the starting angle? Let's say Angle is for the *next* turn, or we group Length+Angle).
                 // Let's group: Move Length, then Turn Angle (prepare for next).
                 // NO, "Angle A" is usually between Side 1 and Side 2.
                 // So Input: L1, Angle1 (between L1 and L2), L2, Angle2, ...

                 // Implementation:
                 // Move L.
                 // Turn (180 - Angle).

                 currentX += len * Math.cos(currentDir);
                 currentY += len * Math.sin(currentDir);
                 points.push({ x: currentX, y: currentY });

                 if (typeof angleDeg === 'number') {
                     const turnAngle = 180 - angleDeg;
                     currentDir += Geometry.toRadians(turnAngle);
                 }
             }

             return points;
        }
    };

    // Export mechanism
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Geometry;
    } else {
        root.Geometry = Geometry;
    }

})(this);
