import { Renderer } from './renderer';
import {
    FrontSide,
    ShaderMaterial,
    Vector2,
    Vector3,
} from './lib/three.module';

export class FunctionGrapher {
    constructor(element) {
        this.renderer = new Renderer(element);

        this.vShader = `
            varying vec3 vPosition;
            void main() {
                vPosition = (modelMatrix * vec4(position, 1.0)).xyz; // position in world coords
                gl_Position = projectionMatrix * viewMatrix * vec4(vPosition, 1.0);
            }
        `;


        // ensure we don't render anything by default
        const defaultEqn = '100000.0';

        this._xBounds = [-1, 1];
        this._yBounds = [-1, 1];
        this._zBounds = [-1, 1];

        // stepsize * number of steps should be ~4 so we can view the whole plot along the diagonal
        this._stepsize = 0.012;
        this._R = 1;
        this._opacity = 1.0;
        this._brightness = 1.0;
        this._greyscale = 1.0;

        // Stepsize for sampling... 1 seems a good compromise between real-time shading and quality
        // on my MBP

        this.setEquation(defaultEqn, {});

        this._boundsNeedsUpdate = false;

        const onRender = () => {
            if (this._boundsNeedsUpdate) {
                this.updateBounds();
            }
        };

        this.renderer.go(onRender);
    }

    // Note that the domain will always be centered around the origin.
    // Requires bounds to be up to date
    computeDomain() {
        const xRange = this._xBounds[1] - this._xBounds[0];
        const yRange = this._yBounds[1] - this._yBounds[0];
        const zRange = this._zBounds[1] - this._zBounds[0];

        const maxRangeInv = 1.0 / Math.max(xRange, Math.max(yRange, zRange));

        const scaleX = xRange * maxRangeInv;
        const scaleY = yRange * maxRangeInv;
        const scaleZ = zRange * maxRangeInv;

        return [scaleX, scaleY, scaleZ];
    }

    updateBounds() {
        const scale = this.computeDomain();

        this.renderer.setScale(scale[0], scale[1], scale[2]);

        this.material.uniforms.domain.value.set(scale[0], scale[1], scale[2]);

        this._boundsNeedsUpdate = false;
    }

    set R(val) {
        this._R = val;
        this.material.uniforms.R.value = val;
    }

    get R() {
        return this._R;
    }

    set greyscale(val) {
        this._greyscale = +val;
        this.material.uniforms.greyscale.value = +val;
    }

    get greyscale() {
        return this._greyscale > 0.5;
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
        this.material.uniforms.xBounds.value.set(val[0], val[1]);
        this._boundsNeedsUpdate = true;
    }

    get xBounds() {
        return this._xBounds;
    }

    set yBounds(val) {
        this._yBounds = val;
        this.material.uniforms.yBounds.value.set(val[0], val[1]);
        this._boundsNeedsUpdate = true;
    }

    get yBounds() {
        return this._yBounds;
    }

    set zBounds(val) {
        this._zBounds = val;
        this.material.uniforms.zBounds.value.set(val[0], val[1]);
        this._boundsNeedsUpdate = true;
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
        const domain = this.computeDomain();
        const uniforms = {
            stepsize: { type: 'f', value: this._stepsize },
            R: { type: 'f', value: this._R },
            brightness: { type: 'f', value: this._brightness },
            opacity: { type: 'f', value: this._opacity },

            greyscale: { type: 'f', value: this._greyscale },

            xBounds: { type: 'v2', value: new Vector2(this.xBounds[0], this.xBounds[1]) },
            yBounds: { type: 'v2', value: new Vector2(this.yBounds[0], this.yBounds[1]) },
            zBounds: { type: 'v2', value: new Vector2(this.zBounds[0], this.zBounds[1]) },

            domain: { type: 'v3', value: new Vector3(domain[0], domain[1], domain[2]) },
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
            transparent: true,
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
            varying vec3 rawPosition;
            varying vec3 vPosition;
            uniform float stepsize;
            uniform float R;
            uniform float opacity;
            uniform float brightness;
            uniform float greyscale;
            uniform vec2 xBounds;
            uniform vec2 yBounds;
            uniform vec2 zBounds;
            uniform vec3 domain;

            const int numSteps = 300;
            ${extraUniforms}
            // Describe ROI as a sphere later?

            float fn(vec3 pt, vec3 halfDomainInv) {
                vec3 uvw = ((pt + domain) * halfDomainInv);
                float x = uvw.x * (xBounds.y - xBounds.x) + xBounds.x;
                float y = uvw.y * (yBounds.y - yBounds.x) + yBounds.x;
                float z = uvw.z * (zBounds.y - zBounds.x) + zBounds.x;
                return ${eqn};
            }

            vec3 grad(vec3 pt, float size, vec3 halfDomainInv) {
                float right = fn(vec3(pt.x + size, pt.y, pt.z), halfDomainInv);
                float left = fn(vec3(pt.x - size, pt.y, pt.z), halfDomainInv);
                float up = fn(vec3(pt.x, pt.y + size, pt.z), halfDomainInv);
                float down = fn(vec3(pt.x, pt.y - size, pt.z), halfDomainInv);
                float front = fn(vec3(pt.x, pt.y, pt.z + size), halfDomainInv);
                float back = fn(vec3(pt.x, pt.y, pt.z - size), halfDomainInv);

                return vec3(0.5 * (right - left), 0.5 * up - down, 0.5 * front - back);
            }

            vec3 ptToColor(vec3 pt) {
                return vec3(1.,1.,1.)*(pt.xyz/vec3( xBounds.y - xBounds.x, yBounds.y - yBounds.x, zBounds.y - zBounds.x) + .5);
            }


            void main() {
                vec3 ro = cameraPosition;
                vec3 dir = vPosition - ro;
                float t_entry = length(dir);
                vec3 rd = normalize(dir);
                vec3 halfDomainInv = 0.5 / domain;

                vec3 lightPosition = cameraPosition;
                float isoval = 0.0;

                if (t_entry < 0.) { gl_FragColor = vec4(0.,0.,0.,1.); return; }

                vec3 rskip = rd * stepsize;

                // Start at the far end and work our way back to the entry point
                // (back compositing)
                vec3 pt = ro + rd * (t_entry + float(numSteps) * stepsize);
                vec3 pt_plot = pt.xzy;

                vec3 I = vec3(0.0);
                float a_total = 0.0;

                for (int i = 0; i < numSteps; i++) {
                    // only process if inside the volume
                    if (pt_plot.z >= -domain.z && pt_plot.z <= domain.z && pt_plot.x >= -domain.x && pt_plot.x <= domain.x && pt_plot.y <= domain.y && pt_plot.y >= -domain.y) {
                        vec3 uvw = ((pt_plot + domain) * halfDomainInv);

                        // plot outline
                        // function evaluations are in plot space (swap z, y)
                        float value = fn(pt_plot, halfDomainInv);
                        vec3 grad = grad(pt_plot, stepsize, halfDomainInv);
                        float alpha = 0.0;

                        float delta = abs(isoval - value);

                        float magGrad = length(grad);

                        if (delta <= R * magGrad) {
                            alpha = 1.0 - (delta / (R * magGrad));
                            alpha *= opacity;
                            a_total += alpha;
                        }

                        vec3 normal = vec3(0.0);
                        if (magGrad > 0.0) {
                            normal = vec3(grad / magGrad);
                        }
                        // lighting should be in world space
                        if (dot(normal, cameraPosition.xzy - pt_plot) < 0.0) {
                            normal = -normal;
                        }

                        vec3 L = normalize(lightPosition.xzy - pt_plot);

                        if (dot(normal, L) > 0.0) {
                            // forward compositing (poor results)
                            // I += transparency * stepsize * alpha * abs(dot(normal, L));
                            // backward compositing
                            vec3 color = greyscale > 0.5 ? vec3(1.0) : uvw;
                            I = I * (1.0 - alpha) + abs(dot(normal, L)) * color * alpha;
                        }
                    }

                    pt -= rskip;
                    pt_plot = pt.xzy;
                }

                I.r = min(1.0, I.r * brightness);
                I.g = min(1.0, I.g * brightness);
                I.b = min(1.0, I.b * brightness);

                gl_FragColor = vec4(I, a_total);

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
