import {
    BoxBufferGeometry,
    BufferAttribute,
    BufferGeometry,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
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
        this.xAxis.scale.set(1, y, z);
        this.yAxis.scale.set(x, 1, z);
        this.zAxis.scale.set(x, y, 1);

        this.box.scale.set(x, y, z);
    }

    updateAxes() {
        const cameraPosition = this.camera.position;
        const x = cameraPosition.x < 0 ? this._scale[0] : -this._scale[0];
        const y = cameraPosition.y < 0 ? this._scale[1] : -this._scale[1];
        const z = cameraPosition.z < 0 ? this._scale[2] : -this._scale[2];
        this.xAxis.position.x = x;
        this.yAxis.position.y = y;
        this.zAxis.position.z = z;
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
            yAxisPositions[i + 0] = xAxisPositions[i + 1];
            yAxisPositions[i + 1] = xAxisPositions[i + 0];
            yAxisPositions[i + 2] = xAxisPositions[i + 2];

            zAxisPositions[i + 0] = xAxisPositions[i + 2];
            zAxisPositions[i + 1] = xAxisPositions[i + 1];
            zAxisPositions[i + 2] = xAxisPositions[i + 0];
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
