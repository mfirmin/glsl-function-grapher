

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

        'void main() {' + 
            'vec3 ro = cameraPosition;\n'+
            'vec3 dir = vPosition.xyz - ro;\n'+
            'float t_entry = length(dir);\n'+
            'vec3 rd = normalize(dir);\n'+

            'if (t_entry < 0.) { gl_FragColor = vec4(0.,0.,0.,1.); return; }\n'+

            'vec3 pt = ro+rd*t_entry;\n'+

            'vec3 rskip = normalize(rd)*stepsize;\n'+

            'vec3 I = vec3(0.,0.,0.);\n'+
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
                'curr = fn(pt.x, pt.y, pt.z);\n'+

                'if (last*curr < 0.) {\n'+
                    'vec3 grad = vec3(0.,0.,0.);\n'+

                     // Gradient-less coloring?
                    'if (opacity >= 1.) {\n'+
                        'gl_FragColor = vec4(vec3(1.,1.,1.)*(pt.xyz/2.+.5), 1.);\n'+
                        'return;\n'+
                    '} else {\n'+
                        'I += vec3(1.,1.,1.)*(pt.xyz/2.+.5);\n'+
                        'intersects++;\n'+
                    '}\n'+
                        
                '}\n'+
                'last = curr;\n'+
                'pt = pt + rskip;\n'+
            '}\n'+

            'if ( opacity < 1.) {\n'+
                'if (I == vec3(0.,0.,0.)) { gl_FragColor = vec4(1.,1.,1.,1.); return; }\n'+
                'gl_FragColor = vec4((I/float(intersects)),1.);\n'+ 
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
uniforms['opacity'] = {type: 'f', value: 0.5};
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
    box.opts.material.fragmentShader = fragShader;
    box.opts.material.needsUpdate = true;
}

function setOpacity(val) {
    uniforms['opacity'].value = val;
}

world.go();

//window.functiongrapher = world.panel;
window.world = world;
window.updateShader = updateShader;
window.setOpacity = setOpacity;


$(window).resize(function() {
    world.setSize();
});


