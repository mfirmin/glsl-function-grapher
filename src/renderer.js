export class Renderer {
    constructor(element) {
        this.element = element;
        this.initializeGL();
        this.initializeScene();

        this.renderReady = false;
    }

    initializeGL() {
        try {
            this.renderer = new THREE.WebGLRenderer({
                preserveDrawingBuffer: true,
                canvas: this.element,
            });
        } catch(e) {
            throw new Error('Could not initialize WebGL');
        }
        this.renderer.setClearColor(0xffffff, 1);
    }

    initializeScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 400/400, 1, 1000);
        this.scene.add(this.camera);
        this.light = new THREE.PointLight( 0xfffffa, 1, 0 );
        this.light.position.set( 1, 20, -20 );
        this.scene.add( this.light );

        /*
        this.camera.position.x = -0;
        this.camera.position.y = -5;
        */
        this.camera.position.z = 5;

        var controls = new THREE.TrackballControls(this.camera, this.element);

        controls.rotateSpeed = 20.0;
        controls.zoomSpeed = 1.2;

        controls.noZoom = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        this.controls = controls;
    }


    setSize(w, h) {
        this.renderer.setSize(w, h);
        this.camera.aspect = w/h;
        this.camera.updateProjectionMatrix();
    }

    go() {
        const renderLoop = () => {
            this.renderer.render(this.scene, this.camera);
            if (this.controls !== undefined) {
                this.controls.update();
            }
            requestAnimationFrame(renderLoop);
        }
        requestAnimationFrame(renderLoop);
    }
}
