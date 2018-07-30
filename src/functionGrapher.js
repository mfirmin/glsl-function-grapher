import { Renderer } from './renderer';
import {
    FrontSide,
    ShaderMaterial,
    Vector2,
} from './lib/three.module';

export class FunctionGrapher {
    constructor(element) {
        this.renderer = new Renderer(element);

        this.vShader = `
            varying vec4 vPosition;
            varying vec3 vNormal;
            void main() {
                vPosition = modelMatrix * vec4(position, 1.0);
                vNormal = normal;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;


        const defaultEqn = `
            81.0*(x*x*x + y*y*y + z*z*z) -
            189.0*(x*x*y + x*x*z + y*y*x + y*y*z+ z*z*x + z*z*y) +
            54.0*(x*y*z) + 126.0*(x*y+x*z+y*z) - 9.0*(x*x+y*y+z*z) - 9.0*(x+y+z) + 1.0;
        `;

        this._stepsize = 0.008;
        this._R = 1;
        this._opacity = 1.0;
        this._brightness = 5.0;

        this._xBounds = [-1, 1];
        this._yBounds = [-1, 1];
        this._zBounds = [-1, 1];

        // Stepsize for sampling... 1 seems a good compromise between real-time shading and quality
        // on my MBP

        this.setEquation(defaultEqn, {});

        this.renderer.go();
    }

    set R(val) {
        this._R = val;
        this.material.uniforms.R.value = val;
    }

    get R() {
        return this._R;
    }

    set brightness(val) {
        this._brightness = val;
        this.material.uniforms.brightness.value = val;
    }

    get brightness() {
        return this._brightness;
    }

    set stepsize(val) {
        this._stepsize = val;
        this.material.uniforms.stepsize.value = val;
    }

    get stepsize() {
        return this._stepsize;
    }

    set opacity(val) {
        this._opacity = val;
        this.material.uniforms.opacity.value = val;
    }

    get opacity() {
        return this._opacity;
    }

    set xBounds(val) {
        this._xBounds = val;
        this.material.uniforms.xBounds.set(val[0], val[1]);
    }

    get xBounds() {
        return this._xBounds;
    }

    set yBounds(val) {
        this._yBounds = val;
        this.material.uniforms.yBounds.set(val[0], val[1]);
    }

    get yBounds() {
        return this._yBounds;
    }

    set zBounds(val) {
        this._zBounds = val;
        this.material.uniforms.zBounds.set(val[0], val[1]);
    }

    get zBounds() {
        return this._zBounds;
    }
    // updateBounds(val) {
    //     this.renderer.removeEntity(this.box);
    //
    //     for (const entry in val) {
    //         if ({}.hasOwnProperty.call(val, entry)) {
    //             for (const coord in val[entry]) {
    //                 if ({}.hasOwnProperty.call(val[entry], coord)) {
    //                     this.uniforms[entry].value[coord] = Number(val[entry][coord]);
    //                 }
    //             }
    //         }
    //     }
    //     const x = this.uniforms.xBounds.value;
    //     const y = this.uniforms.yBounds.value;
    //     const z = this.uniforms.zBounds.value;
    //     const boxnew = new Box('plot',
    //                            [x.y - x.x, y.y - y.x, z.y - z.x],
    //                            { material: this.material }
    //     );
    //
    //     const step = (Math.max(Math.max(x.y - x.x, y.y - y.x), z.y - z.x)) / 100.0;
    //     this.uniforms.stepsize.value = step;
    //
    //
    //     boxnew.mesh.position.x = (x.x + x.y) / 2.0;
    //     boxnew.mesh.position.y = (y.x + y.y) / 2.0;
    //     boxnew.mesh.position.z = (z.x + z.y) / 2.0;
    //
    //
    //     boxnew.mesh.updateMatrix();
    //
    //     this.renderer.addEntity(boxnew);
    //
    //     this.box = boxnew;
    // }

    setEquation(glsl, coeffs) {
        const uniforms = {
            stepsize: { type: 'f', value: this.stepsize },
            R: { type: 'f', value: this.R },
            brightness: { type: 'f', value: this.brightness },
            opacity: { type: 'f', value: this.opacity },

            xBounds: { type: 'v2', value: new Vector2(this.xBounds[0], this.xBounds[1]) },
            yBounds: { type: 'v2', value: new Vector2(this.yBounds[0], this.yBounds[1]) },
            zBounds: { type: 'v2', value: new Vector2(this.zBounds[0], this.zBounds[1]) },
        };

        Object.assign(uniforms, coeffs);

        let uniformDeclarations = '';
        for (const id of Object.keys(coeffs)) {
            uniformDeclarations += `uniform float ${id};`;
        }

        const fShader = this.constructor.makeFragmentShader(glsl, uniformDeclarations);

        this.material = new ShaderMaterial({
            uniforms,
            vertexShader: this.vShader,
            fragmentShader: fShader,
            side: FrontSide,
        });

        this.renderer.setMaterial(this.material);

        window.material = this.material;
    }

    updateCoefficient(id, value) {
        if (this.material.uniforms[`var${id}`] === undefined) {
            return;
        }
        this.material.uniforms[`var${id}`].value = value;
    }

    static makeFragmentShader(eqn, extraUniforms = '') {
        /* eslint-disable indent, max-len */
        const fShader = `
            varying vec4 vPosition;
            uniform float stepsize;
            uniform float R;
            uniform float opacity;
            uniform float brightness;
            uniform vec2 xBounds;
            uniform vec2 yBounds;
            uniform vec2 zBounds;
            ${extraUniforms}
            // Describe ROI as a sphere later?

            float fn(float x, float y, float z) {
                return ${eqn};
            }

            vec3 grad(vec3 prev, vec3 pt, vec3 next) {
                float right = fn(next.x, pt.y, pt.z);
                float left = fn(prev.x, pt.y, pt.z);
                float up = fn(pt.x, next.y, pt.z);
                float down = fn(pt.x, prev.y, pt.z);
                float front = fn(pt.x, pt.y, next.z);
                float back = fn(pt.x, pt.y, prev.z);

                return vec3(0.5 * (right - left), 0.5 * up - down, 0.5 * front - back);
            }

            vec3 grad2(vec3 pt, float size) {
                float right = fn(pt.x + size, pt.y, pt.z);
                float left = fn(pt.x - size, pt.y, pt.z);
                float up = fn(pt.x, pt.y + size, pt.z);
                float down = fn(pt.x, pt.y - size, pt.z);
                float front = fn(pt.x, pt.y, pt.z + size);
                float back = fn(pt.x, pt.y, pt.z - size);

                return vec3(0.5 * (right - left), 0.5 * up - down, 0.5 * front - back);
            }

            vec3 ptToColor(vec3 pt) {
                return vec3(1.,1.,1.)*(pt.xyz/vec3( xBounds.y - xBounds.x, yBounds.y - yBounds.x, zBounds.y - zBounds.x) + .5);
            }


            void main() {
                vec3 ro = cameraPosition;
                vec3 dir = vPosition.xyz - ro;
                float t_entry = length(dir);
                vec3 rd = normalize(dir);

                vec3 lightPosition = cameraPosition;
                float isoval = 0.0;

                if (t_entry < 0.) { gl_FragColor = vec4(0.,0.,0.,1.); return; }

                vec3 rskip = rd * stepsize;

                vec3 pt = ro + rd * t_entry;

                vec3 prev = pt - rskip;
                vec3 next = pt + rskip;

                float I = 0.0;
                float transparency = 1.0;

                vec3 tols = vec3((xBounds.y - xBounds.x)*.01, (yBounds.y - yBounds.x)*.01, (zBounds.y - zBounds.x)*.01);
                for (int i = 0; i < 400; i++) {
                    // outside roi case.
                    if (pt.z < zBounds.x-tols.z || pt.z > zBounds.y+tols.z || pt.x < xBounds.x-tols.x || pt.x > xBounds.y+tols.x || pt.y > yBounds.y+tols.y || pt.y < yBounds.x-tols.y) { break; }

                    // plot outline
                    float value = fn(pt.x, pt.y, pt.z);
                    vec3 grad = grad2(pt, stepsize);
//                    vec3 grad = grad(prev, pt, next);
                    float alpha = 0.0;

                    float delta = abs(isoval - value);

                    float magGrad = length(grad);

                    if (delta <= R * magGrad) {
                        alpha = 1.0 - (delta / (R * magGrad));
                    }

                    vec3 normal = vec3(0.0);
                    if (magGrad > 0.0) {
                        normal = vec3(grad / magGrad);
                    }
                    if (dot(normal, cameraPosition - pt) < 0.0) {
                        normal = -normal;
                    }

                    vec3 L = normalize(lightPosition - pt);

                    if (dot(normal, L) > 0.0) {
                        I += transparency * stepsize * alpha * abs(dot(normal, L));
                    }

                    transparency *= exp(-alpha * stepsize);

                    prev = pt;
                    pt = next;
                    next += rskip;

                    if (transparency < 0.1) {
                        break;
                    }
                }

                I = min(1.0, I) * brightness;

                if (I < 0.1) {
                    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                } else {
                    gl_FragColor = vec4(I, I, I, 1.0);
                }
                gl_FragColor = vec4(I, I, I, 1.0);

            }
        `;

        return fShader;
        /* eslint-enable */
    }

    go() {
        this.renderer.go();
    }

    get domElement() {
        return this.renderer.renderer.domElement;
    }
}
