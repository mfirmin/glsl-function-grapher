import {
    BoxBufferGeometry,
    BufferAttribute,
    BufferGeometry,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from './lib/three.module';
// import { OrbitControls } from './lib/OrbitControls';
import { TrackballControls } from './lib/TrackballControls';

export class Renderer {
    constructor(element, options = {}) {
        this.element = element;

        this._xBounds = options.xBounds !== undefined ? options.xBounds : [-1, 1];
        this._yBounds = options.yBounds !== undefined ? options.yBounds : [-1, 1];
        this._zBounds = options.zBounds !== undefined ? options.zBounds : [-1, 1];

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

    setScale() {
        const xRange = this._xBounds[1] - this._xBounds[0];
        const yRange = this._yBounds[1] - this._yBounds[0];
        const zRange = this._zBounds[1] - this._zBounds[0];

        const halfMaxRangeInv = 1.0 / (2.0 * Math.max(xRange, Math.max(yRange, zRange)));

        const adjustedX = [-xRange * halfMaxRangeInv, xRange * halfMaxRangeInv];
        const adjustedY = [-yRange * halfMaxRangeInv, yRange * halfMaxRangeInv];
        const adjustedZ = [-zRange * halfMaxRangeInv, zRange * halfMaxRangeInv];
    }

    createBoundingBox() {
        const bbGeom = new BufferGeometry();

        const positions = new Float32Array([
            -1, -1, -1,
            1, -1, -1,
            1, -1, 1,
            -1, -1, 1,

            -1, 1, -1,
            1, 1, -1,
            1, 1, 1,
            -1, 1, 1,
        ]);

        const index = new Uint16Array([
            0, 1,
            1, 2,
            2, 3,
            3, 0,

            4, 5,
            5, 6,
            6, 7,
            7, 4,

            0, 4,
            1, 5,
            2, 6,
            3, 7,
        ]);


        bbGeom.addAttribute('position', new BufferAttribute(positions, 3));
        bbGeom.setIndex(new BufferAttribute(index, 1));

        this.boundingBox = new LineSegments(bbGeom, new MeshBasicMaterial({ color: 0xffffff }));

        this.scene.add(this.boundingBox);
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
//        controls.rotateSpeed = 2.0;
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

    go() {
        const renderLoop = () => {
            this.renderer.render(this.scene, this.camera);
            if (this.controls !== undefined) {
                this.controls.update();
            }
            if (this._boundsNeedsUpdate) {
                this.updateBounds();
            }
            requestAnimationFrame(renderLoop);
        };
        requestAnimationFrame(renderLoop);
    }

    set xBounds(x) {
        this._xBounds = x;
        this._boundsNeedsUpdate = true;
    }

    get xBounds() {
        return this._xBounds;
    }

    set yBounds(y) {
        this._yBounds = y;
        this._boundsNeedsUpdate = true;
    }

    get yBounds() {
        return this._yBounds;
    }

    set zBounds(z) {
        this._zBounds = z;
        this._boundsNeedsUpdate = true;
    }

    get zBounds() {
        return this._zBounds;
    }
}
