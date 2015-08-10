

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
        'uniform vec2 xBounds;\n'+
        'uniform vec2 yBounds;\n'+
        'uniform vec2 zBounds;\n'+
        // Describe ROI as a sphere later?

        'float fn(float x, float y, float z) {\n' +
            'return ' + 
            fn + ';\n' +
        '}\n'+

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
            'vec3 tols = vec3((xBounds.y - xBounds.x)*.001, (yBounds.y - yBounds.x)*.001, (zBounds.y - zBounds.x)*.001);\n'+ 
            'for (int i = 0; i < 1000; i++) {\n'+
                // outside roi case.
                'if (pt.z < zBounds.x-tols.z || pt.z > zBounds.y+tols.z || pt.x < xBounds.x-tols.x || pt.x > xBounds.y+tols.x || pt.y > yBounds.y+tols.y || pt.y < yBounds.x-tols.y) { break; }\n'+
                // plot outline
                'if (    (pt.z > zBounds.y-10.*tols.z && pt.y > yBounds.y-10.*tols.y) ||\n'+
                        '(pt.z > zBounds.y-10.*tols.z && pt.y < yBounds.x+10.*tols.y) ||\n'+
                        '(pt.z > zBounds.y-10.*tols.z && pt.x > xBounds.y-10.*tols.x) ||\n'+
                        '(pt.z > zBounds.y-10.*tols.z && pt.x < xBounds.x+10.*tols.x) ||\n'+

                        '(pt.z < zBounds.x+10.*tols.z && pt.y > yBounds.y-10.*tols.y) ||\n'+
                        '(pt.z < zBounds.x+10.*tols.z && pt.y < yBounds.x+10.*tols.y) ||\n'+
                        '(pt.z < zBounds.x+10.*tols.z && pt.x > xBounds.y-10.*tols.x) ||\n'+
                        '(pt.z < zBounds.x+10.*tols.z && pt.x < xBounds.x+10.*tols.x) ||\n'+

                        '(pt.x < xBounds.x+10.*tols.x && pt.y > yBounds.y-10.*tols.y) ||\n'+
                        '(pt.x < xBounds.x+10.*tols.x && pt.y < yBounds.x+10.*tols.y) ||\n'+
                        '(pt.x > xBounds.y-10.*tols.x && pt.y > yBounds.y-10.*tols.y) ||\n'+
                        '(pt.x > xBounds.y-10.*tols.x && pt.y < yBounds.x+10.*tols.y)\n'+
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
        '81.*(x*x*x + y*y*y + z*z*z) - '+ 
            '189.*(x*x*y + x*x*z + y*y*x + y*y*z+ z*z*x + z*z*y) + '+
            '54.*(x*y*z) + 126.*(x*y+x*z+y*z) - 9.*(x*x+y*y+z*z) - 9.*(x+y+z) + 1.';

var fShader = makeFragmentShader(fn);


var uniforms = {};


uniforms['lightsource'] = {type: 'v3', value: new THREE.Vector3(10, 10, -30)};
// Stepsize for sampling... 1 seems a good compromise between real-time shading and quality
// on my MBP
uniforms['stepsize'] = {type: 'f', value: .01};
uniforms['opacity'] = {type: 'f', value: 0.5};
uniforms['surface'] = {type: 'f', value: 0.};

uniforms['xBounds'] = {type: 'v2', value: new THREE.Vector2(-1, 1)};
uniforms['yBounds'] = {type: 'v2', value: new THREE.Vector2(-1, 1)};
uniforms['zBounds'] = {type: 'v2', value: new THREE.Vector2(-1, 1)};

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

function updateBounds(val) {
    world.removeEntity(box);
    for (var entry in val) {
        for (var coord in val[entry]) {
            uniforms[entry].value[coord] = val[entry][coord];
        }
    }
    var x = uniforms['xBounds'].value;
    var y = uniforms['yBounds'].value;
    var z = uniforms['zBounds'].value;
    var boxnew = new Box('plot', [x.y - x.x, y.y - y.x, z.y - z.x], {material: material});
    world.addEntity(boxnew);
}

world.go();

//window.functiongrapher = world.panel;
window.world = world;
window.updateShader = updateShader;
window.setOpacity = setOpacity;
window.updateBounds = updateBounds;


$(window).resize(function() {
    world.setSize();
});


