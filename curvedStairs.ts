/*
 * Copyright 2021 Stairs Generator (https://www.kitfox.com)
 * Copyright 2021 Mark McKay
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


enum StepType{
    NUM_STEPS,
    STEP_HEIGHT
}

function buildMesh(scene: BABYLON.Scene, verts: number[][], faces: number[][], uvsIn: number[][]): BABYLON.Mesh
{

    var customMesh = new BABYLON.Mesh("custom", scene);
    var positions:number[] = [];
    var indices:number[] = [];
    var normals:number[] = [];
    var uvs:number[] = [];


    var indexPtr: number = 0;
    for (var i = 0; i < faces.length; ++i)
    {
        var face = faces[i];

        var p0: BABYLON.Vector3 = new BABYLON.Vector3(verts[face[0]][0], verts[face[0]][1], verts[face[0]][2])
        var p1: BABYLON.Vector3 = new BABYLON.Vector3(verts[face[1]][0], verts[face[1]][1], verts[face[1]][2])
        var p2: BABYLON.Vector3 = new BABYLON.Vector3(verts[face[2]][0], verts[face[2]][1], verts[face[2]][2])
        var d1: BABYLON.Vector3 = p1.subtract(p0);
        var d2: BABYLON.Vector3 = p2.subtract(p0);
        var n: BABYLON.Vector3 = d1.cross(d2);
        n.normalize();

        for (var j = 0; j < face.length; ++j)
        {
            for (var k = 0; k < 3; ++k)
                positions.push(verts[face[j]][k]);

            normals.push(n.x);
            normals.push(n.y);
            normals.push(n.z);

            var uvIn = uvsIn[i];
            for (var k = 0; k < 2; ++k)
                uvs.push(uvIn[k]);            
        }

        indices.push(indexPtr);
        indices.push(indexPtr + 2);
        indices.push(indexPtr + 1);
        

        if (face.length == 4)
        {
            indices.push(indexPtr + 0);
            indices.push(indexPtr + 3);
            indices.push(indexPtr + 2);
        }

        indexPtr += face.length;
    }

    var vertexData = new BABYLON.VertexData();
    vertexData.applyToMesh(customMesh);
    vertexData.positions = positions;
    vertexData.normals = normals;
    vertexData.uvs = uvs;
    vertexData.indices = indices;   
    vertexData.applyToMesh(customMesh);

    return customMesh;
}


function createStairs(scene: BABYLON.Scene, width: number = 1, height: number = 2, depth: number = 2, stepType: StepType = StepType.NUM_STEPS, numSteps: number = 6, userStepHeight: number = .5, sides: boolean = true): BABYLON.Mesh
{
    var verts = [];
    var faces = [];
    var uvs = [];

    width /= 2;

    //Setup calculations
    var stepHeight: number;
    if (stepType == StepType.NUM_STEPS)
    {
        stepHeight = height / numSteps;
    }
    else
    {
        stepHeight = userStepHeight;
        numSteps = Math.max(Math.floor(height / userStepHeight), 1);
        height = stepHeight * numSteps;
    }

    var stepDepth = depth / numSteps;

    var f = 0;
    var uvyOffset = 0;


    //Draw steps
    for (var i = 0; i < numSteps; ++i)
    {
        verts.push([-width, i * stepHeight, i * stepDepth]);
        verts.push([width, i * stepHeight, i * stepDepth]);
        verts.push([-width, (i + 1) * stepHeight, i * stepDepth]);
        verts.push([width, (i + 1) * stepHeight, i * stepDepth]);

        if (i != 0)
        {
            faces.push([f + 0, f + 1, f - 1, f - 2]);
            uvs.push([
                [-width, uvyOffset + stepDepth],
                [-width, uvyOffset],
                [width, uvyOffset],
                [width, uvyOffset + stepDepth],
            ]);
            uvyOffset += stepDepth;
        }

        faces.push([f + 0, f + 2, f + 3, f + 1]);
        uvs.push([
            [-width, uvyOffset],
            [width, uvyOffset],
            [width, uvyOffset + stepHeight],
            [-width, uvyOffset + stepHeight],
        ]);

        uvyOffset += stepHeight;
        f += 4;
    }

    //Top of last step
    verts.push([-width, height, depth])
    verts.push([width, height, depth])
    faces.push([f + 0, f + 1, f - 1, f - 2])
    uvs.push([
        [-width, uvyOffset + stepDepth],
        [-width, uvyOffset],
        [width, uvyOffset],
        [width, uvyOffset + stepDepth],
    ]);
    
    if (sides)
    {
        verts.push([-width, 0, depth])
        verts.push([width, 0, depth])
        
        faces.push([f + 0, f + 2, f + 3, f + 1])
        uvs.push([
            [-width, height],
            [width, height],
            [width, 0],
            [-width, 0]
        ])

        
        faces.push([0, 1, f + 3, f + 2])
        uvs.push([
            [-width, depth],
            [-width, 0],
            [width, 0],
            [width, depth],
        ])

        //Side triangles
        for (var i = 0; i < numSteps; ++i)
        {
            var x = verts[i * 4 + 5][0]
            faces.push([i * 4 + 0, i * 4 + 4, i * 4 + 2])
            faces.push([i * 4 + 1, i * 4 + 3, i * 4 + 5])
            uvs.push([
                [verts[i * 4 + 0][0], verts[i * 4 + 0][2]],
                [verts[i * 4 + 4][0], verts[i * 4 + 4][2]],
                [verts[i * 4 + 2][0], verts[i * 4 + 2][2]],
            ])
            uvs.push([
                [verts[i * 4 + 1][0], verts[i * 4 + 1][2]],
                [verts[i * 4 + 3][0], verts[i * 4 + 3][2]],
                [verts[i * 4 + 5][0], verts[i * 4 + 5][2]],
            ])
        }
        
        // faces.push([0, (numSteps + 1) * 4, (numSteps + 1) * 4 + 2])
        // faces.push([1, (numSteps + 1) * 4 + 1, (numSteps + 1) * 4 + 3])
        faces.push([0, f + 2, f + 0])
        faces.push([1, f + 1, f + 3])
        uvs.push([
            [verts[0][0], verts[0][2]],
            [verts[f + 0][0], verts[f + 0][2]],
            [verts[f + 2][0], verts[f + 2][2]],
        ])
        uvs.push([
            [verts[1][0], verts[1][2]],
            [verts[f + 1][0], verts[f + 1][2]],
            [verts[f + 3][0], verts[f + 3][2]],
        ])
        
    }
    

    return buildMesh(scene, verts, faces, uvs);
}


function createStairsCurved(scene: BABYLON.Scene, height: number = 2, stepWidth: number = 1, stepType: StepType = StepType.NUM_STEPS, numSteps: number = 6, userStepHeight: number = .5, curvature: number = 60, innerRadius: number = 3, ccw: boolean = false, sides: boolean = true): BABYLON.Mesh
{
    const toRadians = Math.PI / 180;

    var verts = [];
    var faces = [];
    var uvs = [];

    //Setup calculations
    var stepHeight: number;
    if (stepType == StepType.NUM_STEPS)
    {
        stepHeight = height / numSteps;
    }
    else
    {
        stepHeight = userStepHeight;
        numSteps = Math.max(Math.floor(height / userStepHeight), 1);
        height = stepHeight * numSteps;
    }

    var deltaAngle = curvature * toRadians / numSteps;
    var stepDepth = deltaAngle * (innerRadius + stepWidth / 2) / numSteps;

    var f = 0;

    var offsetX: number;
    if (ccw)
        offsetX = -innerRadius - stepWidth / 2;
    else
        offsetX = innerRadius + stepWidth / 2;

    //Draw steps
    for (var i = 0; i < numSteps + 1; ++i)
    {
        var x: number, z: number;
        if (ccw)
        {
            x = Math.cos(i * deltaAngle);
            z = Math.sin(i * deltaAngle);
        }
        else
        {
            x = -Math.cos(i * deltaAngle);
            z = Math.sin(i * deltaAngle);
        }

        var x0 = x * innerRadius + offsetX;
        var z0 = z * innerRadius;
        var x1 = x * (innerRadius + stepWidth) + offsetX;
        var z1 = z * (innerRadius + stepWidth);

        verts.push([x0, i * stepHeight, z0]);
        verts.push([x1, i * stepHeight, z1]);
        if (i != numSteps)
        {
            verts.push([x0, (i + 1) * stepHeight, z0])
            verts.push([x1, (i + 1) * stepHeight, z1])
        }
    }

    var uvyOffset = 0;

    for (var i = 0; i < numSteps; ++i)
    {
        faces.push([f + 0, f + 1, f + 3, f + 2])
        uvs.push([[0, uvyOffset], [stepWidth, uvyOffset], [stepWidth, uvyOffset + stepHeight], [0, uvyOffset + stepHeight]]);
        uvyOffset += stepHeight;

        faces.push([f + 2, f + 3, f + 5, f + 4])
        uvs.push([[0, uvyOffset], [stepWidth, uvyOffset], [stepWidth, uvyOffset + stepDepth], [0, uvyOffset + stepDepth]]);
        uvyOffset += stepDepth;

        f += 4;
    }


    if (sides)
    {
        for (var i = 1; i < numSteps + 1; ++i)
        {
            var x: number, z: number;
            if (ccw)
            {
                x = Math.cos(i * deltaAngle);
                z = Math.sin(i * deltaAngle);
            }
            else
            {
                x = -Math.cos(i * deltaAngle);
                z = Math.sin(i * deltaAngle);
            }

            var x0 = x * innerRadius + offsetX
            var z0 = z * innerRadius
            var x1 = x * (innerRadius + stepWidth) + offsetX
            var z1 = z * (innerRadius + stepWidth)
            
            verts.push([x0, 0, z0])
            verts.push([x1, 0, z1])
        }
    }

    //Side triangles
    for (var i = 0; i < numSteps; ++i)
    {
        var g = i * 4;
        faces.push([g + 0, g + 2, g + 4]);
        uvs.push([
            [i * stepDepth, verts[g + 0][2]], 
            [i * stepDepth, verts[g + 2][2]],
            [(i + 1) * stepDepth, verts[g + 4][2]]
            ]);
            
        faces.push([g + 1, g + 5, g + 3]);
        uvs.push([
            [i * stepDepth, verts[g + 0][2]], 
            [(i + 1) * stepDepth, verts[g + 4][2]],
            [i * stepDepth, verts[g + 2][2]]
            ]);
    }

    //Side of first step of stairs
    var bottomVertIdxStart = numSteps * 4 + 2;
    faces.push([0, 4, bottomVertIdxStart]);
    uvs.push([
        [0, verts[0][2]],
        [stepDepth, verts[4][2]],
        [stepDepth, verts[bottomVertIdxStart][2]],
    ]);

    faces.push([1, bottomVertIdxStart + 1, 5]);
    uvs.push([
        [0, verts[0][2]],
        [stepDepth, verts[bottomVertIdxStart][2]],
        [stepDepth, verts[4][2]]
    ]);

    //Side slats
    for (var i = 1; i < numSteps; ++i)
    {
        var g = i * 4
        var h = numSteps * 4 + 2 + (i - 1) * 2

        faces.push([h + 0, g + 0, g + 4, h + 2])
        uvs.push([
            [i * stepDepth, verts[h + 0][2]],
            [i * stepDepth, verts[g + 0][2]],
            [(i + 1) * stepDepth, verts[g + 4][2]],
            [(i + 1) * stepDepth, verts[h + 2][2]]
        ])

        faces.push([h + 1, h + 3, g + 5, g + 1])
        uvs.push([
            [i * stepDepth, verts[h + 0][2]],
            [(i + 1) * stepDepth, verts[h + 2][2]],
            [(i + 1) * stepDepth, verts[g + 4][2]],
            [i * stepDepth, verts[g + 0][2]]
        ])
    }

    //Bottom
    faces.push([0, bottomVertIdxStart, bottomVertIdxStart + 1, 1])
    uvs.push([
        [0, 0],
        [0, stepDepth],
        [stepWidth, stepDepth],
        [stepWidth, 0]
    ])

    for (var i = 1; i < numSteps; ++i)
    {
        var h = numSteps * 4 + 2 + (i - 1) * 2;
        faces.push([h + 0, h + 2, h + 3, h + 1])
        uvs.push([
            [0, i * stepDepth],
            [0, (i + 1) * stepDepth],
            [stepWidth, (i + 1) * stepDepth],
            [stepWidth, i * stepDepth]
        ])
    }

    //Back
    faces.push([bottomVertIdxStart - 2, bottomVertIdxStart - 1, numSteps * 6 + 1, numSteps * 6])
    uvs.push([
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
    ])

    return buildMesh(scene, verts, faces, uvs);
}



class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);

        // This creates and positions a free camera (non-mesh)
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        //var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

        // Move the sphere upward 1/2 its height
        //sphere.position.y = 1;

        var stairsCurved: BABYLON.Mesh = createStairsCurved(scene);
        stairsCurved.position.x += 1;

        var stairs: BABYLON.Mesh = createStairs(scene);
        stairs.position.x -= 1;

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

        return scene;
    }
}
