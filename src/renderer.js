import {
    BoxBufferGeometry,
    BufferAttribute,
    BufferGeometry,
    CanvasTexture,
    InstancedBufferAttribute,
    InstancedBufferGeometry,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    ShaderMaterial,
    Vector2,
    VertexColors,
    WebGLRenderer,
} from './lib/three.module';
// import { OrbitControls } from './lib/OrbitControls';
import { TrackballControls } from './lib/TrackballControls';

export class Renderer {
    constructor(element) {
        this.element = element;

        this._scale = [1, 1, 1];

        this.initializeGL();
        this.initializeScene();
        this.createBoundingBox();
        this.createAxisLabels();
        this.createGraph();

        window.addEventListener('resize', () => {
            this.setSize(this.element.offsetWidth, this.element.offsetHeight);
        });
    }

    initializeGL() {
        try {
            this.renderer = new WebGLRenderer({
                alpha: true,
            });
        } catch (e) {
            throw new Error('Could not initialize WebGL');
        }
        this.renderer.setClearColor(0x000000, 1);

        this.element.append(this.renderer.domElement);
    }

    setScale(x, y, z) {
        this._scale = [x, y, z];
        this.xAxis.scale.set(1, z, y);
        this.yAxis.scale.set(x, z, 1);
        this.zAxis.scale.set(x, 1, y);

        this.box.scale.set(x, z, y);
    }

    updateAxes() {
        const cameraPosition = this.camera.position;

        const x = cameraPosition.x < 0 ? this._scale[0] : -this._scale[0];
        const y = cameraPosition.z < 0 ? this._scale[1] : -this._scale[1];
        const z = cameraPosition.y < 0 ? this._scale[2] : -this._scale[2];

        this.xAxis.position.x = x;
        this.yAxis.position.z = y;
        this.zAxis.position.y = z;

        this.axisLabels.geometry.attributes.offset.array[1] = z + 0.1 * Math.sign(z);
        this.axisLabels.geometry.attributes.offset.array[2] = -y + 0.1 * -Math.sign(y);

        this.axisLabels.geometry.attributes.offset.array[3] = -x + 0.1 * -Math.sign(x);
        this.axisLabels.geometry.attributes.offset.array[4] = z + 0.1 * Math.sign(z);

        this.axisLabels.geometry.attributes.offset.array[6] = x + 0.1 * Math.sign(x);
        this.axisLabels.geometry.attributes.offset.array[8] = -y + 0.1 * -Math.sign(y);

        this.axisLabels.geometry.attributes.offset.needsUpdate = true;
    }

    createAxisLabels() {
        const canvasWidth = 128;
        const canvasHeight = 128;
        const textHeight = 30;
        const fontSize = 18;

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const context = canvas.getContext('2d');
        context.textBaseline = 'bottom';
        context.fillStyle = 'lightgrey';

        context.font = `${textHeight}px Arial`;
        const xWidth = context.measureText('X').width;
        const yWidth = context.measureText('Y').width;
        const zWidth = context.measureText('Z').width;

        context.fillText('X', 0, 1.0 * textHeight);
        context.fillText('Y', 0, 2.0 * textHeight);
        context.fillText('Z', 0, 3.0 * textHeight);

        const resolution = [this.element.offsetWidth, this.element.offsetHeight];

        const labelPositions = new Float32Array([
            -1, -1, 0,
            1, -1, 0,
            1, 1, 0,
            -1, -1, 0,
            1, 1, 0,
            -1, 1, 0,
        ]);

        const uv = new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 0,
            1, 1,
            0, 1,
        ]);

        const uX = xWidth / canvasWidth;
        const uY = yWidth / canvasWidth;
        const uZ = zWidth / canvasWidth;
        const vX = 1 - (textHeight / canvasHeight);
        const vY = 1 - 2 * (textHeight / canvasHeight);
        const vZ = 1 - 3 * (textHeight / canvasHeight);

        const iUv = new Float32Array([
            0, vX, uX, 1,
            0, vY, uY, vX,
            0, vZ, uZ, vY,
        ]);

        const axisLabelsGeom = new InstancedBufferGeometry();
        axisLabelsGeom.addAttribute('position', new BufferAttribute(labelPositions, 3));
        axisLabelsGeom.addAttribute('offset', new InstancedBufferAttribute(new Float32Array([
            0, -1.1, 1.1,
            1.1, -1.1, 0,
            -1.1, 0, 1.1,
        ]), 3, 1));
        axisLabelsGeom.addAttribute('fontRatio', new InstancedBufferAttribute(new Float32Array([
            xWidth / textHeight,
            yWidth / textHeight,
            zWidth / textHeight,
        ]), 1, 1));
        axisLabelsGeom.addAttribute('uv', new BufferAttribute(uv, 2));
        axisLabelsGeom.addAttribute('iUv', new InstancedBufferAttribute(iUv, 4, 1));

        axisLabelsGeom.maxInstancedCount = 3;

        const material = new ShaderMaterial({
            uniforms: {
                fontSize: { type: 'f', value: fontSize },
                resolution: { type: 'v2', value: new Vector2(resolution[0], resolution[1]) },
                map: { type: 't', value: new CanvasTexture(canvas) },
            },
            vertexShader: `
                attribute vec3 offset;
                attribute vec4 iUv;
                attribute float fontRatio;

                uniform vec2 resolution;
                uniform float fontSize;

                varying vec2 vUv;

                void main() {
                    vUv.x = mix(iUv.x, iUv.z, uv.x);
                    vUv.y = mix(iUv.y, iUv.w, uv.y);
                    vec4 billboardOffset = projectionMatrix * modelViewMatrix * vec4(offset, 1.0);
                    vec2 scaledPosition = position.xy * (vec2(fontSize * fontRatio, fontSize) / resolution.xy);
                    billboardOffset /= billboardOffset.w;
                    billboardOffset.xy += scaledPosition;

                    gl_Position = billboardOffset;
                }
            `,
            fragmentShader: `
                uniform sampler2D map;

                varying vec2 vUv;

                void main() {
                    vec4 color = texture2D(map, vUv);
                    if (color.a < 0.5) {
                        discard;
                    }
                    gl_FragColor = color;
                }
            `,
        });


        this.axisLabels = new Mesh(axisLabelsGeom, material);
        this.scene.add(this.axisLabels);
    }

    createBoundingBox() {
        const xAxisGeom = new BufferGeometry();
        const yAxisGeom = new BufferGeometry();
        const zAxisGeom = new BufferGeometry();

        const xAxisPositions = new Float32Array([
            0, -1, -1,
            0, -0.5, -1,
            0, -0, -1,
            0, 0.5, -1,
            0, 1, -1,

            0, -1, -0.5,
            0, 1, -0.5,

            0, -1, 0.0,
            0, 1, 0.0,

            0, -1, 0.5,
            0, 1, 0.5,

            0, -1, 1,
            0, -0.5, 1,
            0, -0, 1,
            0, 0.5, 1,
            0, 1, 1,
        ]);

        const white = [1, 1, 1];
        const grey = [0.5, 0.5, 0.5];

        const color = new BufferAttribute(new Float32Array([
            ...white,
            ...grey,
            ...grey,
            ...grey,
            ...white,

            ...grey,
            ...grey,
            ...grey,
            ...grey,
            ...grey,
            ...grey,

            ...white,
            ...grey,
            ...grey,
            ...grey,
            ...white,
        ]), 3);

        const yAxisPositions = new Float32Array(xAxisPositions.length);
        const zAxisPositions = new Float32Array(xAxisPositions.length);
        for (let i = 0; i < xAxisPositions.length; i += 3) {
            yAxisPositions[i + 0] = xAxisPositions[i + 2];
            yAxisPositions[i + 1] = xAxisPositions[i + 1];
            yAxisPositions[i + 2] = xAxisPositions[i + 0];

            zAxisPositions[i + 0] = xAxisPositions[i + 1];
            zAxisPositions[i + 1] = xAxisPositions[i + 0];
            zAxisPositions[i + 2] = xAxisPositions[i + 2];
        }


        const index = new BufferAttribute(new Uint16Array([
            0, 11,
            1, 12,
            2, 13,
            3, 14,
            4, 15,

            0, 4,
            5, 6,
            7, 8,
            9, 10,
            11, 15,
        ]), 1);


        xAxisGeom.addAttribute('position', new BufferAttribute(xAxisPositions, 3));
        xAxisGeom.addAttribute('color', color, 3);
        xAxisGeom.setIndex(index);

        yAxisGeom.addAttribute('position', new BufferAttribute(yAxisPositions, 3));
        yAxisGeom.addAttribute('color', color, 3);
        yAxisGeom.setIndex(index);

        zAxisGeom.addAttribute('position', new BufferAttribute(zAxisPositions, 3));
        zAxisGeom.addAttribute('color', color, 3);
        zAxisGeom.setIndex(index);

        const material = new MeshBasicMaterial({ vertexColors: VertexColors });

        this.xAxis = new LineSegments(xAxisGeom, material);
        this.yAxis = new LineSegments(yAxisGeom, material);
        this.zAxis = new LineSegments(zAxisGeom, material);

        this.scene.add(this.xAxis);
        this.scene.add(this.yAxis);
        this.scene.add(this.zAxis);
    }

    createGraph() {
        const boxGeom = new BoxBufferGeometry(2, 2, 2);
        this.box = new Mesh(boxGeom, new MeshBasicMaterial({ color: 0xff0000 }));
        this.scene.add(this.box);
    }

    initializeScene() {
        const w = this.element.offsetWidth;
        const h = this.element.offsetHeight;

        this.scene = new Scene();
        this.camera = new PerspectiveCamera(45, w / h, 1, 10);
        this.scene.add(this.camera);

        this.camera.position.z = 5;

        const controls = new TrackballControls(this.camera, this.element);

        // Use for orbit controls
        controls.rotateSpeed = 5.0;
        controls.zoomSpeed = 1.2;

        controls.noZoom = false;
        controls.noPan = true;

        controls.minDistance = 3;
        controls.maxDistance = 8;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        this.controls = controls;

        this.setSize(w, h);
    }

    setMaterial(m) {
        this.box.material = m;
    }

    setSize(w, h) {
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();

        if (this.axisLabels) {
            this.axisLabels.material.uniforms.resolution.value.set(w, h);
        }
    }

    go(onRender = null) {
        const renderLoop = () => {
            if (this.controls !== undefined) {
                this.controls.update();
            }
            this.updateAxes();
            if (onRender !== null) {
                onRender();
            }
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(renderLoop);
        };
        requestAnimationFrame(renderLoop);
    }
}
