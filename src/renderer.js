import {
    BoxBufferGeometry,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from './lib/three.module';
// import { OrbitControls } from './lib/OrbitControls';
import { TrackballControls } from './lib/TrackballControls';

export class Renderer {
    constructor(element) {
        this.element = element;
        this.initializeGL();
        this.initializeScene();

        window.addEventListener('resize', () => {
            this.setSize(this.element.offsetWidth, this.element.offsetHeight);
        });
    }

    initializeGL() {
        try {
            this.renderer = new WebGLRenderer({
                preserveDrawingBuffer: true,
            });
        } catch (e) {
            throw new Error('Could not initialize WebGL');
        }
        this.renderer.setClearColor(0xffffff, 1);

        this.element.append(this.renderer.domElement);
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

        const boxGeom = new BoxBufferGeometry(2, 2, 2);
        this.box = new Mesh(boxGeom, new MeshBasicMaterial({ color: 0xff0000 }));
        this.scene.add(this.box);

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
            requestAnimationFrame(renderLoop);
        };
        requestAnimationFrame(renderLoop);
    }
}
