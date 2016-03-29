var FunctionGrapher = (function () {
    'use strict';

    function Entity(name, opts) {

        this.name = name;

        this.position = new THREE.Vector3();
        this.rotation = new THREE.Quaternion();
        this.mesh = null;

        this.opts = (opts === undefined) ? {} : opts;

        this.initialize();

        this.mesh.matrixAutoUpdate = false;
    }


    Entity.prototype.constructor = Entity;

    Entity.prototype.initialize = function() {
        var rot = (this.opts.default_rotation === undefined) ? [0,0,0,0] : this.opts.default_rotation;

        this.default_rotation = new THREE.Quaternion();

        this.default_rotation.w = rot[0];
        this.default_rotation.x = rot[1];
        this.default_rotation.y = rot[2];
        this.default_rotation.z = rot[3];

    }

    Entity.prototype.setMfromQandP = function(q_in,p) {

        var quat = new THREE.Quaternion();
        quat.x = q_in[1]//q_in[1];
        quat.y = q_in[2] //q_in[0];
        quat.z = q_in[3]// q_in[0];
        quat.w = q_in[0];

        quat.multiply(this.default_rotation);

        var q = {w: quat.w, v: {x: quat.x, y: quat.y, z: quat.z}};
        var pos = {x: p[0], y: p[1], z: p[2]};

        var R = new Float32Array(9);
        var M = new Float32Array(16);
        R[0] = 1 - 2*q.v.y*q.v.y - 2*q.v.z*q.v.z; R[3] = 2*q.v.x*q.v.y - 2*q.v.z*q.w;     R[6] = 2*q.v.x*q.v.z + 2*q.v.y*q.w;
        R[1] = 2*q.v.x*q.v.y + 2*q.v.z*q.w;     R[4] = 1 - 2*q.v.x*q.v.x - 2*q.v.z*q.v.z; R[7] = 2*q.v.y*q.v.z - 2*q.v.x*q.w;
        R[2] = 2*q.v.x*q.v.z - 2*q.v.y*q.w;     R[5] = 2*q.v.y*q.v.z + 2*q.v.x*q.w;     R[8] = 1 - 2*q.v.x*q.v.x - 2*q.v.y*q.v.y;

        this.mesh.matrix.elements[0] = R[0]; this.mesh.matrix.elements[4] = R[3]; this.mesh.matrix.elements[8] =  R[6];  this.mesh.matrix.elements[12] = pos.x;
        this.mesh.matrix.elements[1] = R[1]; this.mesh.matrix.elements[5] = R[4]; this.mesh.matrix.elements[9] =  R[7];  this.mesh.matrix.elements[13] = pos.y;
        this.mesh.matrix.elements[2] = R[2]; this.mesh.matrix.elements[6] = R[5]; this.mesh.matrix.elements[10] = R[8];  this.mesh.matrix.elements[14] = pos.z;
        this.mesh.matrix.elements[3] = 0;    this.mesh.matrix.elements[7] = 0;    this.mesh.matrix.elements[11] = 0;     this.mesh.matrix.elements[15] = 1;


    }

    Entity.prototype.setPosition = function(xyz) {
        this.mesh.position.x = xyz[0];
        this.mesh.position.y = xyz[1];
        this.mesh.position.z = xyz[2];

    }
    // TODO: Make this work.
    Entity.prototype.setRotation = function(q) {
        /*

        var quat = new THREE.Quaternion();
        quat.x = q[1]//q[1];
        quat.y =q[2] //q[0];
        quat.z =q[3]// q[0];
        quat.w = q[0];
        quat.normalize();
        this.mesh.quaternion = quat;
        this.mesh.updateMatrix();

        console.log(this.mesh.matrix);

    //    this.mesh.rotation.x = Math.PI/4.;
    */

    }

    Entity.prototype.getPosition = function() {
        return this.position;
    }
    Entity.prototype.getRotation = function() {
        return this.rotation;
    }

    function Box(name, sides, opts) {

        this.sides = sides;
        Entity.call(this, name, opts);
    }


    Box.prototype = Object.create(Entity.prototype);

    Box.prototype.constructor = Box;

    Box.prototype.initialize = function() {

        Entity.prototype.initialize.call(this);

        var c = (this.opts.color === undefined) ? [130,130,130] : this.opts.color;
        var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
        var color = new THREE.Color(cstring);

        var geo = new THREE.BoxGeometry(this.sides[0], this.sides[1], this.sides[2]);
        var mat;
        if (this.opts.material === undefined) {
            mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: cstring, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading } );
        } else {
            mat = this.opts.material;
        }

        var mesh = new THREE.Mesh( geo , mat );

        this.mesh = mesh;

    }

    function Cylinder(name, radius, height, opts) {

        this.radius = radius;
        this.height = height;
        Entity.call(this, name, opts);
    }

    Cylinder.prototype = Object.create(Entity.prototype);

    Cylinder.prototype.constructor = Cylinder;

    Cylinder.prototype.initialize = function() {

        Entity.prototype.initialize.call(this);

        var c = (this.opts.color === undefined) ? [130,130,130] : this.opts.color;
        var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
        var color = new THREE.Color(cstring);

        var geo = new THREE.CylinderGeometry(this.radius, this.radius, this.height);

        var mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: cstring, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );
        var mesh = new THREE.Mesh( geo , mat );

        this.mesh = mesh;

    }

    function Sphere(name, radius, height, opts) {

        this.radius = radius;
        Entity.call(this, name, opts);

    }

    Sphere.prototype = Object.create(Entity.prototype);

    Sphere.prototype.constructor = Sphere;

    Sphere.prototype.initialize = function() {

        Entity.prototype.initialize.call(this);

        var c = (this.opts.color === undefined) ? [130,130,130] : this.opts.color;
        var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
        var color = new THREE.Color(cstring);

        var geo = new THREE.SphereGeometry(this.radius);

        var mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: cstring, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );
        var mesh = new THREE.Mesh( geo , mat );

        this.mesh = mesh;

    }

    function Capsule(name, radius, height, opts) {

        this.radius = radius;
        this.height = height;
        Entity.call(this, name, opts);
    }

    Capsule.prototype = Object.create(Entity.prototype);

    Capsule.prototype.constructor = Capsule;

    Capsule.prototype.initialize = function() {

        Entity.prototype.initialize.call(this);

        var c = (this.opts.color === undefined) ? [130,130,130] : this.opts.color;
        var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
        var color = new THREE.Color(cstring);

        var capsule = new THREE.Object3D();

        var cyl_geo = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 8, 1, true);
        var sph_geo= new THREE.SphereGeometry(this.radius);
        var mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: cstring, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );

        var cyl_mesh = new THREE.Mesh( cyl_geo , mat );
        var top_mesh = new THREE.Mesh( sph_geo , mat );
        var btm_mesh = new THREE.Mesh( sph_geo , mat );

        top_mesh.position.y = this.height/2.;
        btm_mesh.position.y = -this.height/2.;

        capsule.add(cyl_mesh);
        capsule.add(top_mesh);
        capsule.add(btm_mesh);

        this.mesh = capsule;

    }

    function Plane(name, A, B, opts) {

        this.A = A;
        this.B = B;
        Entity.call(this, name, opts);
    }


    Plane.prototype = Object.create(Entity.prototype);

    Plane.prototype.constructor = Plane;

    Plane.prototype.initialize = function() {

        Entity.prototype.initialize.call(this);

        var c = (this.opts.color === undefined) ? [130,130,130] : this.opts.color;
        var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
        var color = new THREE.Color(cstring);

        var geo = new THREE.Geometry();
        var mat = new THREE.LineBasicMaterial( {color: color} );

        geo.vertices.push(
            new THREE.Vector3(this.A[0], this.A[1], this.A[2]),
            new THREE.Vector3(this.B[0], this.B[1], this.B[2])
        );
        var mesh = new THREE.Line( geo , mat );

        this.mesh = mesh;

    }

    function World(name, opts) {

        this.name = name;
        this.opts = (opts === undefined) ? {} : opts;
        this.initializeGL();
        this.initialize();
        this.initializeDiv();
        this.paused = true;

        this.entities = {};

        this.renderReady = true;
    }


    World.prototype.constructor = World;

    World.prototype.initializeGL = function() {
        try{
            this.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
            this.renderType = 'webgl';
        }catch(e){
            try{
                this.renderer = new THREE.CanvasRenderer();
                this.renderType = 'canvas';
            }catch(e2){
                this.error = true;
                return;
            }
        }
        this.error = false;

        this.renderer.setClearColor(0xffffff, 1);
    }

    World.prototype.initialize = function() {

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

        $(document).ready(function() {
    //        controls = new THREE.TrackballControls( this.camera, this.renderer.domElement);
            var controls = new THREE.TrackballControls( this.camera, (this.opts.element === undefined) ? $('body') : $(this.opts.element)[0]);

            controls.rotateSpeed = 20.0;
            controls.zoomSpeed = 1.2;

            controls.noZoom = false;

            controls.staticMoving = true;
            controls.dynamicDampingFactor = 0.3;

            this.controls = controls;
        }.bind(this));
    };

    World.prototype.initializeDiv = function() {

        this.panel = $('<div>')
            .addClass('ThreePanel')
            .attr({tabindex:0});

        this.renderer.setSize(400,400);

        this.canvas = $(this.renderer.domElement).width(400).height(400).addClass("threeCanvas");
        $(this.panel).append(this.canvas);

    };

    World.prototype.setSize = function() {

        var w = $(this.opts.element).width();
        var h = $(this.opts.element).height();

        this.canvas.width(w);
        this.canvas.height(h);

        this.renderer.setSize(w, h);

        this.camera.aspect = w/h;
        this.camera.updateProjectionMatrix();

    //    this.panel.css({width: w, height: h});
    };

    World.prototype.addEntity = function(e) {

        var name = e.name;
        if (name in this.entities) {
            console.error('Cannot add entity. Entity with name ' + name + 'already exists.');
            return -1;
        }

        this.entities[name] = e;

        this.scene.add(e.mesh);

    }

    World.prototype.removeEntity = function(e) {
        if (this.entities[e.name] === undefined) {
            return;
        }
        this.scene.remove(e.mesh);
        delete this.entities[e.name];
    }

    World.prototype.setFromJSON = function(data) {
        var entities = data.entities;
        for (var e in entities) {
            var ent = this.entities[e];
            if (ent !== undefined) {
                ent.setMfromQandP(entities[e].rot, entities[e].pos);
                /*
                ent.setPosition(entities[e].pos);
                ent.setRotation(entities[e].rot);
                */
            } else {
                console.error('attempting to set unknown entity with name ' + e);
            }
        }
    }

    World.prototype.populateFromJSON = function(data) {

        var entities = data.entities;
        for (var e in entities) {

            var name = e;
            var type = entities[e].type;
            var toAdd;
            switch (type) {
                case 'box':
                    toAdd = new Box(name, entities[e].sides,{default_rotation: [.7071,.7071,0,0]});
                    break;
                case 'sphere':
                    toAdd = new Sphere(name, entities[e].radius,{default_rotation: [.7071,.7071,0,0]});
                    break;
                case 'cylinder':
                    toAdd = new Cylinder(name, entities[e].radius, entities[e].height,{default_rotation: [.7071,.7071,0,0]});
                    break;
                case 'capsule':
                    toAdd = new Capsule(name, entities[e].radius, entities[e].height,{default_rotation: [.7071,.7071,0,0]});
                    break;
                case 'plane':
                    toAdd = new Plane(name, entities[e].A, entities[e].B,{default_rotation: [.7071,.7071,0,0]});
                    break;
                default:
                    toAdd = null;
                    console.error('Unknown Entity: ' + name + ' with type: ' + type);
                    break;
            }

            if (toAdd != null) {
                toAdd.setMfromQandP(entities[e].rot, entities[e].pos);
                /*
                toAdd.setPosition(entities[e].pos);
                toAdd.setRotation(entities[e].rot);
                */
                this.addEntity(toAdd);
            }

        }

        return;
    }

    World.prototype.go = function() {

        this.paused = false;

        var renderLoop = function() {
            this.renderer.render(this.scene, this.camera);
            if (this.controls !== undefined) {
                this.controls.update();
            }
            if (!(this.paused)) { setTimeout(renderLoop, 1000/30); }
        }.bind(this)

        renderLoop();
    }

    var FunctionGrapher = function() {

        this.init();

        $('#grapher').append(this.world.panel);
        this.world.setSize();

    };

    FunctionGrapher.prototype.constructor = FunctionGrapher;

    FunctionGrapher.prototype.init = function() {

        this.world = new World('raytracer', {element: '#grapher'});

        this.variables = {};

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

        var fShader = this.makeFragmentShader(fn);

        this.uniforms = {};

        this.uniforms['lightsource'] = {type: 'v3', value: new THREE.Vector3(10, 10, -30)};
        // Stepsize for sampling... 1 seems a good compromise between real-time shading and quality
        // on my MBP
        this.uniforms['stepsize'] = {type: 'f', value: .01};
        this.uniforms['opacity'] = {type: 'f', value: 0.5};
        this.uniforms['surface'] = {type: 'f', value: 0.};

        this.uniforms['xBounds'] = {type: 'v2', value: new THREE.Vector2(-1, 1)};
        this.uniforms['yBounds'] = {type: 'v2', value: new THREE.Vector2(-1, 1)};
        this.uniforms['zBounds'] = {type: 'v2', value: new THREE.Vector2(-1, 1)};

        this.material = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: vShader,
            fragmentShader: fShader,
            side: THREE.DoubleSide,
            shading: THREE.SmoothShading,
        });

        this.customVarIDs = [];

        this.box = new Box('plot', [2,2,2], {material: this.material});
        //var box = new Box('plot', [2,2,2] );

        this.world.addEntity(this.box);


        this.world.go();

        $(window).resize(function() {
            this.world.setSize();
        }.bind(this));
    };

    FunctionGrapher.prototype.makeVariable = function(name, defaultValue, eqnHTML) {

        var scope = this;

        eqnHTML.eqn += '<div id="'+name+'" class="equation">'+ defaultValue+'</div>';

        scope.variables[name] = {
            'value': Number(defaultValue),
            'defaultValue': Number(defaultValue),
            'dragged': false,
            'mdX': 0,
            'mdVal': Number(defaultValue),
        }

        function ret() {
            var inputdiv = $('#'+name);

            function start(evt) {
                evt.preventDefault();
                var inputdiv = $('#'+name);
                scope.variables[name].dragged = true;
                scope.variables[name].mdX = evt.pageX;
                scope.variables[name].mdVal = Number(scope.variables[name].value);
            }

            function touchstart(evt) {
                evt.preventDefault();
                var inputdiv = $('#'+name);
                scope.variables[name].dragged = true;
                scope.variables[name].mdX = evt.originalEvent.touches[0].pageX;;
                scope.variables[name].mdVal = Number(scope.variables[name].value);
            }

            inputdiv.on('mousedown', start);
            inputdiv.on('touchstart', touchstart);
        }

        function update(evt) {
            var inputdiv = $('#'+name);

            if (scope.variables[name].dragged) {
                evt.preventDefault();
                var diff = evt.pageX - scope.variables[name].mdX;
                scope.variables[name].value = scope.variables[name].mdVal + diff;

                inputdiv.html(scope.variables[name].value);

                scope.uniforms[name].value = Number(scope.variables[name].value);
            }
        }

        function touchupdate(evt) {
            var inputdiv = $('#'+name);

            if (scope.variables[name].dragged) {
                evt.preventDefault();
                var diff = evt.originalEvent.touches[0].pageX - scope.variables[name].mdX;
                scope.variables[name].value = scope.variables[name].mdVal + diff;

                inputdiv.html(scope.variables[name].value);

                scope.uniforms[name].value = Number(scope.variables[name].value);
            }
        }

        $(document).on('mousemove', update);
        $(document).on('touchmove', touchupdate);

        function end(evt) {
            var inputdiv = $('#'+name);
    //        evt.preventDefault();
            scope.variables[name].dragged = false;
        }

        $(document).on('mouseup', end);
        $(document).on('touchend', end);

        return ret;

    };

    FunctionGrapher.prototype.findVariables = function(fn) {

        var retFn = fn; // copy str.

    //    var reg = /\{\{(\w+):(\d+):(\d+):(\d+)\}\}/g;

        var reg = /-?(?:\d+\.?\d*|\d*\.\d+)/g;

        var varPart = reg.exec(fn);

        var last = reg.lastIndex;

        var extraUniforms = '';

        for (var i = 0; i < this.customVarIDs.length; i++) {
            $(this.customVarIDs[i]).remove();
        }

        var eqnHTML = {eqn: '0='};

        var idx;
        if (varPart === null) { idx = fn.length; } else { idx = varPart.index; }

        eqnHTML.eqn += fn.substring(0, idx);

        this.customVarIDs = [];

        var count = 0;

        var callbacks = [];

        while (varPart !== null) {

            var name = 'var'+String.fromCharCode(97 + count);
            retFn = retFn.replace(varPart[0], name);

            this.uniforms[name] = {type: 'f', value: varPart[0]};
            extraUniforms += 'uniform float ' + name + ';\n';

            callbacks.push(this.makeVariable(name, varPart[0], eqnHTML));

            this.customVarIDs.push('#'+name);

            var last = reg.lastIndex;

            var varPart = reg.exec(fn);

            if (varPart === null) { idx = fn.length; } else { idx = varPart.index; }
            eqnHTML.eqn += fn.substring(last, idx);

            count++;
        }

        $('#fndisplay')[0].innerHTML = eqnHTML.eqn;

        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i]();
        }


        return {retFn: retFn, extraUniforms: extraUniforms};

    }

    FunctionGrapher.prototype.updateShader = function(fn) {
        var ret = this.findVariables(fn);
        var fragShader = this.makeFragmentShader(ret.retFn, ret.extraUniforms);
        this.box.opts.material.fragmentShader = fragShader;
        this.box.opts.material.needsUpdate = true;
    }

    FunctionGrapher.prototype.setOpacity = function(val) {
        this.uniforms['opacity'].value = val;
    }

    FunctionGrapher.prototype.updateBounds = function(val) {

        this.world.removeEntity(this.box);

        for (var entry in val) {
            for (var coord in val[entry]) {
                this.uniforms[entry].value[coord] = Number(val[entry][coord]);
            }
        }
        var x = this.uniforms['xBounds'].value;
        var y = this.uniforms['yBounds'].value;
        var z = this.uniforms['zBounds'].value;
        var boxnew = new Box('plot', [x.y - x.x, y.y - y.x, z.y - z.x], {material: this.material});

        var step = (Math.max(Math.max(x.y - x.x, y.y - y.x), z.y - z.x))/100;
        this.uniforms['stepsize'].value = step;


        boxnew.mesh.position.x = (x.x + x.y)/2.
        boxnew.mesh.position.y = (y.x + y.y)/2.
        boxnew.mesh.position.z = (z.x + z.y)/2.


        boxnew.mesh.updateMatrix();

        this.world.addEntity(boxnew);

        this.box = boxnew;
    };

    FunctionGrapher.prototype.makeFragmentShader = function(fn, extraUniforms) {

        extraUniforms = (extraUniforms === undefined) ? '' : extraUniforms;

        var fShader = '' +
            'varying vec4 vPosition;\n'+
            'uniform vec3 lightsource;\n'+
            'uniform float stepsize;\n'+
            'uniform float opacity;\n'+
            'uniform float surface;\n'+
            'uniform vec2 xBounds;\n'+
            'uniform vec2 yBounds;\n'+
            'uniform vec2 zBounds;\n'+
            extraUniforms +
            // Describe ROI as a sphere later?

            'float fn(float x, float y, float z) {\n' +
                'return ' +
                fn + ';\n' +
            '}\n'+

            'vec3 ptToColor(vec3 pt) {\n'+
                'return vec3(1.,1.,1.)*(pt.xyz/vec3( xBounds.y - xBounds.x, yBounds.y - yBounds.x, zBounds.y - zBounds.x) + .5);\n'+
            '}\n' +

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
                'vec3 tols = vec3((xBounds.y - xBounds.x)*.01, (yBounds.y - yBounds.x)*.01, (zBounds.y - zBounds.x)*.01);\n'+
                'for (int i = 0; i < 1000; i++) {\n'+
                    // outside roi case.
                    'if (pt.z < zBounds.x-tols.z || pt.z > zBounds.y+tols.z || pt.x < xBounds.x-tols.x || pt.x > xBounds.y+tols.x || pt.y > yBounds.y+tols.y || pt.y < yBounds.x-tols.y) { break; }\n'+
                    // plot outline
                    'float curr = 0.;\n'+
                    'curr = fn(pt.x, pt.y, pt.z);\n'+
                    'if (i == 0) { last = curr; }\n'+

                    'if (last*curr <= 0.) {\n'+
                        'vec3 grad = vec3(0.,0.,0.);\n'+

                         // Gradient-less coloring?
                        'if (opacity >= 1.) {\n'+
                            'gl_FragColor = vec4(ptToColor(pt.xyz), 1.);\n'+
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

    return FunctionGrapher;

}());