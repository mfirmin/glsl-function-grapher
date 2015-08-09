

var $     = require('jquery');
var World = require('./world/world');
var Box   = require('./entity/box');


var world = new World('raytracer', {element: '#grapher'});

function makeFragmentShader(fn) {

    var fShader = '' +
        'varying vec4 vPosition;\n'+
        'uniform vec3 lightsource;\n'+
        'uniform float stepsize;\n'+
        'uniform float opacity;\n'+
        'uniform float surface;\n'+
        // Describe ROI as a sphere later?

        fn +

        // Solely used for lighting..., maybe estimate the gradient somehow if we want the user
        // to be able to input their own fns.
        'vec3 gradClebsch(vec3 pt) {\n' +
            'float x = pt.x; float y = -pt.y; float z = -pt.z;\n'+
            'return vec3('+
                    '81.*(3.*x*x)-189.*(2.*x*y+2.*x*z+y*y+z*z)+54.*y*z+126.*(y+z)-9.*2.*x-9.,'+
                    '81.*(3.*y*y)-189.*(2.*x*y+2.*y*z+x*x+z*z)+54.*x*z+126.*(x+z)-9.*2.*y-9.,'+
                    '81.*(3.*z*z)-189.*(2.*z*y+2.*x*z+x*x+y*y)+54.*x*y+126.*(x+y)-9.*2.*z-9.'+
            ');\n'+
        '}\n'+
        
        // Kiss Surface.
        'float funcKiss(vec3 pt) {\n' +
            'float x = pt.x; float y = -pt.y; float z = -pt.z;\n'+
            'return z*z*z*z - z*z*z*z*z - x*x - y*y;\n'+
        '}\n' +
        'vec3 gradKiss(vec3 pt) {\n' +
            'float x = pt.x; float y = -pt.y; float z = -pt.z;\n'+
            'return vec3(-2.*x, -2.*y, 4.*z*z*z - 5.*z*z*z*z);\n'+
        '}\n'+

        'void main() {' + 
            'vec3 ro = cameraPosition;\n'+
            'vec3 dir = vPosition.xyz - ro;\n'+
            'float t_entry = length(dir);\n'+
            'vec3 rd = normalize(dir);\n'+

            'if (t_entry < 0.) { gl_FragColor = vec4(0.,0.,0.,1.); return; }\n'+

            'vec3 pt = ro+rd*t_entry;\n'+

            'vec3 rskip = normalize(rd)*stepsize;\n'+

            'float I = 0.;\n'+
            'int intersects = 0;\n'+

            'float last = 0.0;'+
            'for (int i = 0; i < 1000; i++) {\n'+
                // outside roi case.
                'if (pt.z < -1.001 || pt.z > 1.001 || pt.x < -1.001 || pt.x > 1.001 || pt.y > 1.001 || pt.y < -1.001) { break; }\n'+
                // plot outline
                'if (    (pt.z > .99 && pt.y > .99) ||\n'+
                        '(pt.z > .99 && pt.y < -.99) ||\n'+
                        '(pt.z > .99 && pt.x > .99) ||\n'+
                        '(pt.z > .99 && pt.x < -.99) ||\n'+

                        '(pt.z < -.99 && pt.y > .99) ||\n'+
                        '(pt.z < -.99 && pt.y < -.99) ||\n'+
                        '(pt.z < -.99 && pt.x > .99) ||\n'+
                        '(pt.z < -.99 && pt.x < -.99) ||\n'+

                        '(pt.x < -.99 && pt.y > .99) ||\n'+
                        '(pt.x < -.99 && pt.y < -.99) ||\n'+
                        '(pt.x > .99 && pt.y > .99) ||\n'+
                        '(pt.x > .99 && pt.y < -.99)\n'+
                        ') { \n'+
                    'gl_FragColor = vec4(0.,0.,0.,1.); return;\n'+
                '}\n'+
                'float curr = 0.;\n'+
                'if (surface == 0.) { curr = fn(pt.x, pt.y, pt.z); } else { curr = funcKiss(pt); }\n'+

                'if (last*curr < 0.) {\n'+
                    'vec3 grad = vec3(0.,0.,0.);\n'+
                    'if (surface == 0.) { grad = gradClebsch(pt); } else { grad = gradKiss(pt); }\n'+
                    'float mag = length(grad);\n'+
                    'vec3 norm = vec3(0.,0.,0.);\n'+
                    'if (mag > 0.) {\n'+
                        'norm = grad*1./mag;\n'+
                    '}\n'+
                    'if (dot(norm, cameraPosition - pt) < 0.) {\n'+
                        'norm = norm*-1.;\n'+
                    '}\n'+
                    
                    /*
                    'if (opacity >= 1.) {\n'+
                        'gl_FragColor = vec4(vec3(1.,1.,1.)*abs(dot(norm, normalize(lightsource-pt))), 1.);\n'+
                        'return;\n'+
                    '}\n'+
                    */

                     // Gradient-less coloring?
                    'if (opacity >= 1.) {\n'+
                        'gl_FragColor = vec4(vec3(1.,1.,1.)*(pt.xyz/2.+.5), 1.);\n'+
                        'return;\n'+
                    '}\n'+
                    
                    'else {\n'+
                        'I += abs(dot(norm, normalize(lightsource-pt)));\n'+
                        'intersects++;\n'+
                    '}\n'+
                        
                '}\n'+
                'last = curr;\n'+
                'pt = pt + rskip;\n'+
            '}\n'+

            'if ( opacity < 1.) {\n'+
                'gl_FragColor = vec4(vec3(1.,1.,1.)*(I/float(intersects)),1.);\n'+ 
                'return;\n'+
            '}\n'+
            'gl_FragColor = vec4(1.,1.,1.,1.);\n'+

        '}';
    return fShader;
}

var vShader = 
    'varying vec4 vPosition;\n'+
    'varying vec3 vNormal;\n'+
    'void main() {\n' +
        'vPosition = modelMatrix * vec4(position, 1.0);\n' +
        'vNormal = normal;\n' +
        'gl_Position = ' +
            'projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
    '}';


var fn = '' + 
    'float fn(float x, float y, float z) {\n' +
        'return 81.*(x*x*x + y*y*y + z*z*z) - '+ 
            '189.*(x*x*y + x*x*z + y*y*x + y*y*z+ z*z*x + z*z*y) + '+
            '54.*(x*y*z) + 126.*(x*y+x*z+y*z) - 9.*(x*x+y*y+z*z) - 9.*(x+y+z) + 1.;\n' +
    '}\n';

var fShader = makeFragmentShader(fn);


var uniforms = {};


uniforms['lightsource'] = {type: 'v3', value: new THREE.Vector3(10, 10, -30)};
// Stepsize for sampling... 1 seems a good compromise between real-time shading and quality
// on my MBP
uniforms['stepsize'] = {type: 'f', value: .01};
uniforms['opacity'] = {type: 'f', value: 1.};
uniforms['surface'] = {type: 'f', value: 0.};

var material = new THREE.ShaderMaterial( { 
    uniforms: uniforms, 
    vertexShader: vShader, 
    fragmentShader: fShader,
    side: THREE.DoubleSide,
    shading: THREE.SmoothShading,
});


var box = new Box('plot', [2,2,2], {material: material});
//var box = new Box('plot', [2,2,2] );

world.addEntity(box);

function updateShader(fn) {
    var fragShader = makeFragmentShader(fn);
    console.log(fragShader);
    box.opts.material.fragmentShader = fragShader;
    box.opts.material.needsUpdate = true;
}

world.go();

window.functiongrapher = world.panel;
window.updateShader = updateShader;


$(window).resize(function() {
    world.setSize();
});


