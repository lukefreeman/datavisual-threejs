
import React, { Component } from 'react';
import DatGui, { DatBoolean, DatColor, DatNumber } from 'react-dat-gui';
import {connect} from 'react-redux';
import * as THREE from 'three';
import { VignetteEffect, HueSaturationEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
const OrbitControls = require("three-orbit-controls")(THREE);
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'stats.js';
import TWEEN from '@tweenjs/tween.js';


class App extends Component {

    constructor() {
        super();

        this.scene;
        this.camera;
        this.renderer;
        this.controls;

        this.state = {
            data: {
                hue: 0,
                ambientLight: 0xd30000,
                wireframe: false
            }
        }
    }   

    handleUpdate(data) {
        this.setState({ data });
        this.HueSat.effects[0].setHue(data.hue);

        this.state.data.wireframe !== data.wireframe ? this.setWireframe() : null;
    }

    setWireframe() {
        this.scene.traverse( ( child ) => {
            if ( child.isMesh ) {
                child.material.wireframe = !this.state.data.wireframe;
            }
        });
    }

    componentDidMount(){

        var stats = new Stats();
        stats.showPanel( 0 );
        document.body.appendChild( stats.dom );
        
        const loader = new GLTFLoader();
   
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xCCCCCC );

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
       

        this.renderer = new THREE.WebGLRenderer({ alpha: false });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
      
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.mount.appendChild( this.renderer.domElement );

        loader.load( './DEM_RAST.pdf.gltf', 
            gltf => {

                const root = gltf.scene;
                const object = root;

                this.scene.add(root);

                root.traverse( function ( child ) {
                    
                    if( child.type === "Line" || child.type === "Points") {
                        child.visible = false;
                    }

                });

                object.updateMatrixWorld();
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize().length();
                const center = box.getCenter();

                object.position.x += (object.position.x - center.x);
                object.position.y += (object.position.y - center.y);
                object.position.z += (object.position.z - center.z);
                
                this.camera.position.copy(center);
                this.camera.position.x += size / 2.0;
                this.camera.position.y += size / 5.0;
                this.camera.position.z += size / 2.0;
                this.camera.near = size / 100;
                this.camera.far = size * 100;
                this.camera.updateProjectionMatrix();
                this.camera.lookAt(center);
                
                this.camera.position.x = 176270.75252929013;
                this.camera.position.y = -26073.99366690377;
                this.camera.position.z = 39148.29418709834;

                this.controls.maxDistance = size * 10;

                var t = new TWEEN.Tween({
                        x:176270.75252929013,
                        y:-26073.99366690377,
                        z:39148.29418709834
                    })
                    .to({x: 491010.04088835354, y: 317950.63986114773, z: 100720.7299043877}, 6000)
                    .easing(TWEEN.Easing.Linear.None)
                    .onUpdate((e)=> {
                        this.camera.position.set(e.x, e.y, e.z);
                });
                
                t.delay(500);
                t.start();

            },
            
            xhr => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            } 
        );

       
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

            var ambientLight = new THREE.AmbientLight( 0xd30000, 1.7 );
            this.scene.add( ambientLight );

            var directionalLight = new THREE.DirectionalLight( '0xffffff' , 2);
            this.scene.add( directionalLight );
             
                //post processing ---
				const composer = new EffectComposer(this.renderer);

                //vignette --
                const vignette = new EffectPass(this.camera, new VignetteEffect({
                    darkness: 0.4,
                    offset: 0.3,
                }));

                //HueSat
                this.HueSat = new EffectPass(this.camera, new HueSaturationEffect({
                    hue: this.state.data.hue,
                    sat: this.state.data.saturation
                }));
                
                composer.addPass(new RenderPass(this.scene, this.camera));
                composer.addPass(vignette);
                composer.addPass(this.HueSat);
                this.HueSat.renderToScreen = true;
            
            var animate =  () => {
                stats.begin();
                    TWEEN.update();
                    composer.render( this.scene, this.camera );
                    this.controls.update();
                stats.end();

            requestAnimationFrame( animate );
          
            
        
        };

        animate();

    }

    
    render() {

        const { data } = this.state;

        return (
            <div>
                <DatGui data={data} onUpdate={this.handleUpdate.bind(this)}>
                    <DatNumber path='hue' label='Colour' min={0} max={6} step={.01} />
                    <DatBoolean path='wireframe' label='Wireframe' value={this.state.data.wireframe} />
                </DatGui>
                <div ref={ref => (this.mount = ref)} />
            </div>
        );
    }  
}

function mapStateToProps(state){
	return { 
	}
}

export default connect(mapStateToProps, {  })(App);
