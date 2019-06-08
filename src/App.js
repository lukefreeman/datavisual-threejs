
import React, { Component } from 'react';
import DatGui, { DatBoolean, DatColor, DatNumber, DatString } from 'react-dat-gui';
import {connect} from 'react-redux';
import styled from 'styled-components';
import * as THREE from 'three';
import { VignetteEffect, HueSaturationEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
const OrbitControls = require("three-orbit-controls")(THREE);
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'stats.js';


class App extends Component {

    constructor() {
        super();

        this.state = {
            data: {
                hue: 0,
                package: 'react-dat-gui',
                power: 9000,
                isAwesome: true,
                feelsLike: '#2FA1D6',
            }
        }
    }   

    handleUpdate(data) {
        this.setState({ data });
       
        this.HueSat.effects[0].setHue(data.hue);
    }

    setWireframe() {
        
    }

    componentDidMount(){


        var stats = new Stats();
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( stats.dom );
        
        const loader = new GLTFLoader();
        
   
        var scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xcccccc );

        var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
       

        var renderer = new THREE.WebGLRenderer({ alpha: false });
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
      
        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        this.mount.appendChild( renderer.domElement );

        loader.load( './DEM_RAST.pdf.gltf', 
            gltf => {

                const root = gltf.scene;
                const object = root;

                scene.add(root);

                root.traverse( function ( child ) {
                    
                    if( child.type == "Line" || child.type == "Points") child.visible = false;

                    if ( child.isMesh ) {
                        //child.material.wireframe = true;
                    }
        
                });

                object.updateMatrixWorld();
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize().length();
                const center = box.getCenter();

                object.position.x += (object.position.x - center.x);
                object.position.y += (object.position.y - center.y);
                object.position.z += (object.position.z - center.z);
                this.controls.maxDistance = size * 10;
                camera.position.copy(center);
                camera.position.x += size / 2.0;
                camera.position.y += size / 5.0;
                camera.position.z += size / 2.0;
                camera.near = size / 100;
                camera.far = size * 100;
                camera.updateProjectionMatrix();
                camera.lookAt(center);

                console.log(root, 'object');

                
            },
            
            xhr => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            }
        );

            camera.position.z = 0;
            
            var ambientLight = new THREE.AmbientLight( 0xd30000, 1.6 );
            scene.add( ambientLight );

            var directionalLight = new THREE.DirectionalLight( 0xffffff , 2);
                //directionalLight.position.set(object.position.x,object.position.y+5500,object.position.z);
                scene.add( directionalLight );
            
             
                //post processing ---

				const composer = new EffectComposer(renderer);

                //vignette --
                const vignette = new EffectPass(camera, new VignetteEffect({
                    darkness: 0.4,
                    offset: 0.3,
                }));

                

                //HueSat
                this.HueSat = new EffectPass(camera, new HueSaturationEffect({
                    hue: this.state.data.hue,
                    sat: this.state.data.saturation
                }));
            
                this.HueSat.renderToScreen = true;

                composer.addPass(new RenderPass(scene, camera));

                composer.addPass(vignette);
                composer.addPass(this.HueSat);

              
               
                
                
                
            
            var animate = function () {
                stats.begin();
                    composer.render( scene, camera );
                stats.end();

            requestAnimationFrame( animate );
          
            
        
        };

        this.controls = new OrbitControls(camera, renderer.domElement);
    
        animate();

    }

    
    render() {

        const { data } = this.state;

        return (
            <div>
                <DatGui data={data} onUpdate={this.handleUpdate.bind(this)}>
                    <DatNumber path='hue' label='Colour' min={0} max={6} step={.01} />
                    <DatBoolean path='wireframe' label='Wireframe' />

                    <DatString path='package' label='Package' />
                    <DatNumber path='power' label='Power' min={9000} max={9999} step={1} />
                    <DatBoolean path='isAwesome' label='Awesome?' />
                    <DatColor path='feelsLike' label='Feels Like' />
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
