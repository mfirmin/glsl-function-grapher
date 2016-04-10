/* global THREE */
import World from './world/world';
import Box from './entity/box';
import EquationElement from './equationElement';

class FunctionGrapher {
    constructor() {
        this.world = new World('raytracer', { element: '#grapher' });
        this.equationElement = new EquationElement('function', '#fndisplay');

        $('#grapher').append(this.world.panel);
        this.world.setSize();

        this.variables = {};

        this.vShader =
            'varying vec4 vPosition;\n' +
            'varying vec3 vNormal;\n' +
            'void main() {\n' +
                'vPosition = modelMatrix * vec4(position, 1.0);\n' +
                'vNormal = normal;\n' +
                'gl_Position = ' +
                    'projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
            '}';


        this.fn = '' +
                '81.*(x*x*x + y*y*y + z*z*z) - ' +
                    '189.*(x*x*y + x*x*z + y*y*x + y*y*z+ z*z*x + z*z*y) + ' +
                    '54.*(x*y*z) + 126.*(x*y+x*z+y*z) - 9.*(x*x+y*y+z*z) - 9.*(x+y+z) + 1.';

        this.fShader = this.makeFragmentShader(this.fn);

        this.uniforms = {};

        this.uniforms.lightsource = { type: 'v3', value: new THREE.Vector3(10, 10, -30) };
        // Stepsize for sampling... 1 seems a good compromise between real-time shading and quality
        // on my MBP
        this.uniforms.stepsize = { type: 'f', value: 0.01 };
        this.uniforms.opacity = { type: 'f', value: 0.5 };
        this.uniforms.surface = { type: 'f', value: 0.0 };

        this.uniforms.xBounds = { type: 'v2', value: new THREE.Vector2(-1, 1) };
        this.uniforms.yBounds = { type: 'v2', value: new THREE.Vector2(-1, 1) };
        this.uniforms.zBounds = { type: 'v2', value: new THREE.Vector2(-1, 1) };

        this.material = new THREE.ShaderMaterial({
            uniforms:       this.uniforms,
            vertexShader:   this.vShader,
            fragmentShader: this.fShader,
            side:           THREE.DoubleSide,
            shading:        THREE.SmoothShading,
        });

        this.customVarIDs = [];

        this.box = new Box('plot', [2, 2, 2], { material: this.material });

        this.world.addEntity(this.box);

        this.world.go();

        $(window).resize(() => this.world.setSize());
    }

    updateFunction(fn) {
        const eqnInfo     = this.equationElement.makeEquation(fn);
        const variables   = eqnInfo.variables;
        let extraUniforms = '';

        for (let i = 0; i < variables.length; i++) {
            const name  = variables[i].name;
            const value = variables[i].value;
            const dn    = variables[i].dragNumber;
            this.uniforms[name] = { type: 'f', value };
            dn.callback = (val) => { this.uniforms[name].value = val; };
            extraUniforms += `uniform float ${name};\n`;
        }
        const fragShader = this.makeFragmentShader(eqnInfo.eqnGLSL, extraUniforms);
        this.box.opts.material.fragmentShader = fragShader;
        this.box.opts.material.needsUpdate = true;
    }

    setOpacity(val) {
        this.uniforms.opacity.value = val;
    }

    updateBounds(val) {
        this.world.removeEntity(this.box);

        for (const entry in val) {
            if ({}.hasOwnProperty.call(val, entry)) {
                for (const coord in val[entry]) {
                    if ({}.hasOwnProperty.call(val[entry], coord)) {
                        this.uniforms[entry].value[coord] = Number(val[entry][coord]);
                    }
                }
            }
        }
        const x = this.uniforms.xBounds.value;
        const y = this.uniforms.yBounds.value;
        const z = this.uniforms.zBounds.value;
        const boxnew = new Box('plot',
                               [x.y - x.x, y.y - y.x, z.y - z.x],
                               { material: this.material }
        );

        const step = (Math.max(Math.max(x.y - x.x, y.y - y.x), z.y - z.x)) / 100.0;
        this.uniforms.stepsize.value = step;


        boxnew.mesh.position.x = (x.x + x.y) / 2.0;
        boxnew.mesh.position.y = (y.x + y.y) / 2.0;
        boxnew.mesh.position.z = (z.x + z.y) / 2.0;


        boxnew.mesh.updateMatrix();

        this.world.addEntity(boxnew);

        this.box = boxnew;
    }

    makeFragmentShader(fn, extraUniforms) {
        /* eslint indent: "off", max-len: "off" */
        extraUniforms = (extraUniforms === undefined) ? '' : extraUniforms;

        const fShader = [
            'varying vec4 vPosition;',
            'uniform vec3 lightsource;',
            'uniform float stepsize;',
            'uniform float opacity;',
            'uniform float surface;',
            'uniform vec2 xBounds;',
            'uniform vec2 yBounds;',
            'uniform vec2 zBounds;',
            extraUniforms,
            // Describe ROI as a sphere later?

            'float fn(float x, float y, float z) {',
                `return ${fn};`,
            '}',

            'vec3 ptToColor(vec3 pt) {',
                'return vec3(1.,1.,1.)*(pt.xyz/vec3( xBounds.y - xBounds.x, yBounds.y - yBounds.x, zBounds.y - zBounds.x) + .5);',
            '}',

            'void main() {',
                'vec3 ro = cameraPosition;',
                'vec3 dir = vPosition.xyz - ro;',
                'float t_entry = length(dir);',
                'vec3 rd = normalize(dir);',

                'if (t_entry < 0.) { gl_FragColor = vec4(0.,0.,0.,1.); return; }',

                'vec3 pt = ro+rd*t_entry;',

                'vec3 rskip = normalize(rd)*stepsize;',

                'vec3 I = vec3(0.,0.,0.);',
                'int intersects = 0;',

                'float last = 0.0;',
                'vec3 tols = vec3((xBounds.y - xBounds.x)*.01, (yBounds.y - yBounds.x)*.01, (zBounds.y - zBounds.x)*.01);',
                'for (int i = 0; i < 1000; i++) {',
                    // outside roi case.
                    'if (pt.z < zBounds.x-tols.z || pt.z > zBounds.y+tols.z || pt.x < xBounds.x-tols.x || pt.x > xBounds.y+tols.x || pt.y > yBounds.y+tols.y || pt.y < yBounds.x-tols.y) { break; }',
                    // plot outline
                    'float curr = 0.;',
                    'curr = fn(pt.x, pt.y, pt.z);',

                    'if (last*curr < 0.) {',
                        'vec3 grad = vec3(0.,0.,0.);',

                         // Gradient-less coloring?
                        'if (opacity >= 1.) {',
                            'gl_FragColor = vec4(ptToColor(pt.xyz), 1.);',
                            'return;',
                        '} else {',
                            'I += vec3(1.,1.,1.)*(pt.xyz/2.+.5);',
                            'intersects++;',
                        '}',

                    '}',
                    'last = curr;',
                    'pt = pt + rskip;',
                '}',

                'if ( opacity < 1.) {',
                    'if (I == vec3(0.,0.,0.)) { gl_FragColor = vec4(1.,1.,1.,1.); return; }',
                    'gl_FragColor = vec4((I/float(intersects)),1.);',
                    'return;',
                '}',
                'gl_FragColor = vec4(1.,1.,1.,1.);',

            '}'].join('\n');

        return fShader;
    }
}

export default FunctionGrapher;
